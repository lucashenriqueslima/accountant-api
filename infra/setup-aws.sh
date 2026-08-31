#!/usr/bin/env bash
#
# Provisionamento único do CD. Rode da raiz do repositório, com um perfil AWS
# que tenha permissão de IAM e S3 na conta 098231071265.
#
#   bash infra/setup-aws.sh
#
# É seguro rodar de novo: cada passo detecta o que já existe e pula.
#
set -euo pipefail

CONTA=098231071265
REGIAO=us-east-1
BUCKET="forte-deploy-artifacts-$CONTA"
ROLE_DEPLOY=forte-github-deploy
ROLE_EC2=forte-ec2-role
INSTANCIA=i-0c7db7dd0fff23ad9
OIDC_ARN="arn:aws:iam::$CONTA:oidc-provider/token.actions.githubusercontent.com"

ok() { printf '  ✓ %s\n' "$*"; }

echo "1/5 OIDC provider do GitHub"
if aws iam get-open-id-connect-provider --open-id-connect-provider-arn "$OIDC_ARN" >/dev/null 2>&1; then
  ok "já existe"
else
  # A AWS valida esse provider contra as CAs dela e ignora o thumbprint na
  # prática, mas a API continua exigindo o parâmetro.
  aws iam create-open-id-connect-provider \
    --url https://token.actions.githubusercontent.com \
    --client-id-list sts.amazonaws.com \
    --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 >/dev/null
  ok "criado"
fi

echo "2/5 role $ROLE_DEPLOY"
if aws iam get-role --role-name "$ROLE_DEPLOY" >/dev/null 2>&1; then
  aws iam update-assume-role-policy --role-name "$ROLE_DEPLOY" \
    --policy-document file://infra/iam/github-deploy-trust-policy.json
  ok "já existia — trust policy atualizada"
else
  aws iam create-role --role-name "$ROLE_DEPLOY" \
    --description "Deploy do Forte pelo GitHub Actions (OIDC)" \
    --assume-role-policy-document file://infra/iam/github-deploy-trust-policy.json >/dev/null
  ok "criada"
fi
aws iam put-role-policy --role-name "$ROLE_DEPLOY" \
  --policy-name "$ROLE_DEPLOY" \
  --policy-document file://infra/iam/github-deploy-permissions.json
ok "permissões aplicadas"

echo "3/5 bucket $BUCKET"
if aws s3api head-bucket --bucket "$BUCKET" >/dev/null 2>&1; then
  ok "já existe"
else
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGIAO" >/dev/null
  ok "criado"
fi
aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-bucket-lifecycle-configuration --bucket "$BUCKET" \
  --lifecycle-configuration '{"Rules":[{"ID":"expirar-artefatos","Status":"Enabled","Filter":{},"Expiration":{"Days":30}}]}'
ok "acesso público bloqueado, artefatos expiram em 30 dias"

echo "4/5 permissões da instância ($ROLE_EC2)"
aws iam attach-role-policy --role-name "$ROLE_EC2" \
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
aws iam put-role-policy --role-name "$ROLE_EC2" \
  --policy-name forte-deploy \
  --policy-document file://infra/iam/ec2-role-deploy-additions.json
ok "SSM + leitura dos artefatos + snapshot do RDS"

echo "5/5 esperando a instância aparecer no SSM"
# O agente já roda no AL2023; ele pega as credenciais novas pelo IMDS sozinho,
# o que costuma levar alguns minutos.
for i in $(seq 1 30); do
  PING=$(aws ssm describe-instance-information \
    --filters "Key=InstanceIds,Values=$INSTANCIA" \
    --query 'InstanceInformationList[0].PingStatus' --output text 2>/dev/null || echo None)
  if [[ "$PING" == "Online" ]]; then
    ok "instância online no SSM"
    break
  fi
  printf '  ... ainda não registrada (%s/30)\n' "$i"
  sleep 20
done

if [[ "${PING:-None}" != "Online" ]]; then
  echo
  echo "A instância não registrou no SSM. Vale conferir se o agente está de pé:"
  echo "  sudo systemctl status amazon-ssm-agent"
  exit 1
fi

echo
echo "Pronto. Falta só criar o environment 'production' em"
echo "Settings → Environments no repositório do GitHub."
