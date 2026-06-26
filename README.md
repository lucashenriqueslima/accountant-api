# Forte Contabilidade

Kanban voltado para escritórios de contabilidade. Organize obrigações fiscais, contábeis e
do departamento pessoal por cliente, em quadros estilo kanban com colunas, cartões, prazos,
responsáveis e prioridades.

Monorepo gerenciado com **pnpm workspaces**, 100% **TypeScript**.

## Estrutura

```
forte-contabilidade/
├── api/   # Backend  — Node + NestJS + Prisma ORM
└── app/   # Frontend — React + Vite + TanStack (Query/Table) + shadcn/ui + TailwindCSS
```

## Pré-requisitos

- Node.js >= 20
- pnpm >= 10 (`corepack enable` recomendado)
- Docker + Docker Compose (para o MySQL) — ou um MySQL 8 próprio

## Setup

```bash
# 1. Instalar dependências de todo o workspace
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env          # usado pelo docker-compose (DB_DATABASE, DB_PORT)
cp api/.env.example api/.env  # DATABASE_URL do Prisma
cp app/.env.example app/.env

# 3. Subir o banco MySQL via Docker
docker compose up -d

# 4. Banco de dados (gera client, roda migration e popula com dados de exemplo)
pnpm db:migrate
pnpm db:seed

# 5. Subir backend + frontend em paralelo
pnpm dev
```

> O `docker-compose.yml` sobe um **MySQL 8** (`root` sem senha, base `forte_contabilidade`)
> e o **MailHog** (servidor SMTP de testes). A `DATABASE_URL` e o `MAIL_HOST` padrão em
> `api/.env.example` já apontam para eles.

- API: http://localhost:3333 (Swagger em `/docs`)
- App: http://localhost:5173
- MailHog (e-mails de dev): http://localhost:8025

### Acesso (usuários do seed)

Todos usam a senha `Forte@123`:

| E-mail                              | Papel       |
| ----------------------------------- | ----------- |
| admin@fortecontabilidade.com.br     | Administrador |
| ana@fortecontabilidade.com.br       | Gestor      |
| bruno@fortecontabilidade.com.br     | Colaborador |

## Autenticação e papéis

- **JWT** (Passport) no backend; token guardado no `localStorage` e enviado via `Authorization: Bearer`.
- Guards globais: toda rota exige token (exceto `@Public()`); `@Roles()` + `RolesGuard` aplicam o RBAC.
- **Recuperação de senha**: `POST /auth/forgot-password` gera um token (hash salvo no banco, expira em 1h)
  e envia o link por e-mail. Em dev cai no MailHog; em produção use **AWS SES** via SMTP (veja `api/.env.example`).

| Papel         | Permissões |
| ------------- | ---------- |
| **Administrador** | Acesso total: usuários (CRUD + papéis), quadros/colunas, clientes, todas as tarefas (inclui **excluir**). |
| **Gestor**    | Vê os boards da equipe, cria/edita/atribui/move tarefas de todos e tem o board próprio. Gerencia clientes e documentos. |
| **Colaborador** | Vê apenas o próprio board e só **move** (executa) as tarefas atribuídas a ele. |

## Tarefas e clientes

- **Tarefas (cards)**: CRUD em `/tarefas` (admin/gestor). A exclusão é **soft delete** e exclusiva do admin.
  A tela de detalhe mostra o **histórico de atividades** (quem, quando, o quê) — criação, edição, atribuição,
  movimentação e exclusão são registradas em `CardActivity`.
- **Clientes**: CRUD em `/clientes`. Na edição é possível **anexar documentos**. Os arquivos vão para o
  **AWS S3** (URLs presigned) quando `AWS_S3_BUCKET` está configurado; em dev, sem S3, são gravados em
  `api/storage` e servidos por `GET /api/files/<key>`. Veja `api/.env.example`.

- API: http://localhost:3333 (Swagger em `/docs`)
- App: http://localhost:5173

## Scripts úteis (raiz)

| Script              | Descrição                                        |
| ------------------- | ------------------------------------------------ |
| `pnpm dev`          | Sobe `api` e `app` em paralelo                   |
| `pnpm dev:api`      | Sobe apenas o backend                            |
| `pnpm dev:app`      | Sobe apenas o frontend                           |
| `pnpm build`        | Build de produção de ambos                       |
| `pnpm db:migrate`   | Aplica migrations do Prisma                      |
| `pnpm db:seed`      | Popula o banco com dados de exemplo              |
| `pnpm db:studio`    | Abre o Prisma Studio                             |
| `pnpm lint`         | Lint em todos os pacotes                         |

## Domínio

- **User** — membros do escritório (admin, gestor, colaborador).
- **Client** — empresas/pessoas atendidas pelo escritório (CNPJ/CPF, regime tributário).
- **Board** — quadro kanban, geralmente por departamento (Fiscal, Contábil, Pessoal…).
- **Column** — etapas do fluxo (A fazer, Em andamento, Revisão, Concluído…).
- **Card** — tarefa/obrigação, vinculada a um cliente e responsável, com prazo e prioridade.
- **Label** — etiquetas para classificar cartões.

Veja o schema completo em [`api/prisma/schema.prisma`](api/prisma/schema.prisma).
