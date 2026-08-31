# Deploy contínuo

Push na `main` → o GitHub Actions compila, sobe os artefatos no S3 e dispara o
deploy no EC2 via AWS SSM. Sem porta 22 aberta e sem credencial de longa duração
guardada no GitHub: o runner assume uma role por OIDC.

```
push na main
  └─ job build (runner x86)
       ├─ install · prisma generate · lint · build da API · build do front
       └─ empacota api.tar.gz + app.tar.gz + deploy.sh
  └─ job deploy (environment: production)
       ├─ OIDC → role forte-github-deploy
       ├─ artefatos → s3://forte-deploy-artifacts-098231071265/<sha>/
       └─ ssm send-command → /srv/forte/bin/deploy.sh
            ├─ baixa e extrai os artefatos
            ├─ backup do dist atual (rollback)
            ├─ pnpm install (só se o lockfile mudou) · prisma generate
            ├─ prisma migrate deploy (se houver migration pendente)
            ├─ publica o front · pm2 reload forte-api
            └─ healthcheck; falhou → restaura o backup
```

O TypeScript é compilado no runner, mas `pnpm install` e `prisma generate` rodam
no servidor: os engines do Prisma são binários ARM64 e o runner é x86. Compilar
no t4g.micro (1 vCPU, 1 GB) é que seria arriscado, e o pipeline evita isso.

## Setup — uma vez só

Os passos 1 a 5 estão automatizados em `infra/setup-aws.sh`, que é idempotente:

```bash
bash infra/setup-aws.sh
```

O que ele faz está detalhado abaixo, caso prefira rodar na mão. Tudo é na conta
`098231071265`, região `us-east-1`, a partir da raiz do repositório. Em
2026-08-11 nenhum desses recursos existia ainda.

### 1. OIDC provider do GitHub

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

A AWS valida esse provider contra as CAs dela e ignora o thumbprint na prática,
mas a API continua exigindo o parâmetro.

### 2. Role que o GitHub Actions assume

```bash
aws iam create-role \
  --role-name forte-github-deploy \
  --description "Deploy do Forte pelo GitHub Actions (OIDC)" \
  --assume-role-policy-document file://infra/iam/github-deploy-trust-policy.json

aws iam put-role-policy \
  --role-name forte-github-deploy \
  --policy-name forte-github-deploy \
  --policy-document file://infra/iam/github-deploy-permissions.json
```

A trust policy aceita **só** o repositório `lucashenriqueslima/accountant-api`
rodando no environment `production`. É por isso que o job `deploy` declara
`environment: production` — quando um job usa environment, a claim `sub` do
token vira `repo:<owner>/<repo>:environment:<nome>` em vez do branch. Se um dia
você tirar o environment do workflow, a trust policy precisa mudar junto para
`repo:lucashenriqueslima/accountant-api:ref:refs/heads/main`.

### 3. Bucket de artefatos

```bash
aws s3api create-bucket --bucket forte-deploy-artifacts-098231071265 --region us-east-1

aws s3api put-public-access-block \
  --bucket forte-deploy-artifacts-098231071265 \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws s3api put-bucket-lifecycle-configuration \
  --bucket forte-deploy-artifacts-098231071265 \
  --lifecycle-configuration '{"Rules":[{"ID":"expirar-artefatos","Status":"Enabled","Filter":{},"Expiration":{"Days":30}}]}'
```

### 4. Permissões da instância

A `forte-ec2-role` hoje só tem a policy inline `forte-s3-uploads` — falta o SSM,
e é por isso que a instância ainda **não aparece** em
`aws ssm describe-instance-information`.

```bash
aws iam attach-role-policy \
  --role-name forte-ec2-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

aws iam put-role-policy \
  --role-name forte-ec2-role \
  --policy-name forte-deploy \
  --policy-document file://infra/iam/ec2-role-deploy-additions.json
```

O agente SSM já vem instalado e ativo no AL2023; ele pega as credenciais novas
pelo IMDS sozinho. Confirme depois de alguns minutos — sem precisar de SSH:

```bash
aws ssm describe-instance-information \
  --filters "Key=InstanceIds,Values=i-0c7db7dd0fff23ad9" \
  --query 'InstanceInformationList[].{Ping:PingStatus,Agent:AgentVersion}' --output table
```

### 5. Dependência do servidor

O `deploy.sh` usa `rsync`, que pode não estar na imagem. Assim que o SSM
responder, dá para instalar por ele mesmo:

```bash
aws ssm send-command \
  --instance-ids i-0c7db7dd0fff23ad9 \
  --document-name AWS-RunShellScript \
  --parameters 'commands=["rsync --version >/dev/null 2>&1 || dnf install -y rsync"]'
```

### 6. Environment no GitHub

Em **Settings → Environments**, crie o environment `production` (o nome precisa
bater exatamente com a trust policy). Se quiser aprovação manual antes de cada
ida para produção, adicione um *required reviewer* aí.

## Rodando

O deploy dispara sozinho no push para `main`. Para subir na mão — ou para
**voltar para uma versão anterior** — vá em **Actions → Deploy produção → Run
workflow** e escolha o branch ou tag desejado: o workflow recompila a partir
daquele ref e publica.

Para voltar a um commit específico, crie uma tag nele e rode o workflow apontando
para a tag:

```bash
git tag rollback-<data> <sha> && git push origin rollback-<data>
```

## O que não é automático

- **Migrations não têm rollback.** Se o healthcheck falhar, o script restaura o
  código anterior, mas o que o `prisma migrate deploy` já aplicou continua
  aplicado. Migrations aditivas são seguras; `DROP`/rename precisam ser feitos em
  duas etapas (uma migration que adiciona, deploy, depois a que remove).
- **Snapshot do RDS antes de migrar** existe no script mas vem desligado. Para
  ligar, exporte `SNAPSHOT_BEFORE_MIGRATE=true` no ambiente do script — a
  permissão `rds:CreateDBSnapshot` já está no
  `infra/iam/ec2-role-deploy-additions.json`.
- **O `.env` de produção** (`/srv/forte/api/.env`) não é tocado pelo deploy.
  Mudança de variável continua sendo manual. Migrar para o SSM Parameter Store é
  uma melhoria natural depois.
- **Seed nunca roda no pipeline.** `pnpm db:seed` começa com `deleteMany()` em
  todas as tabelas. O aditivo é o `prisma/seed-boards.ts`, rodado à mão quando
  precisar.
