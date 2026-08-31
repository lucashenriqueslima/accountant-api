#!/usr/bin/env bash
#
# Deploy de produção do Forte Contabilidade.
#
# Instalado em /srv/forte/bin/deploy.sh e chamado pelo GitHub Actions via
# AWS SSM Run Command (que executa como root). Baixa os artefatos que o
# pipeline subiu no S3, publica em /srv/forte, roda as migrations e recarrega
# o pm2 — com rollback do código se o healthcheck não passar.
#
# Uso: deploy.sh <bucket-de-artefatos> <sha>
#
set -Eeuo pipefail

BUCKET="${1:?uso: deploy.sh <bucket> <sha>}"
SHA="${2:?uso: deploy.sh <bucket> <sha>}"

APP_USER="${APP_USER:-ec2-user}"
ROOT="${ROOT:-/srv/forte}"
PM2_APP="${PM2_APP:-forte-api}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3333/api/health}"
HEALTH_RETRIES="${HEALTH_RETRIES:-30}"

# Snapshot do RDS antes de aplicar migrations pendentes. Desligado por padrão:
# exige rds:CreateDBSnapshot na role da instância (ver infra/README.md).
SNAPSHOT_BEFORE_MIGRATE="${SNAPSHOT_BEFORE_MIGRATE:-false}"
RDS_INSTANCE_ID="${RDS_INSTANCE_ID:-forte-db}"

# O SSM já roda como root, mas permite chamar o script na mão para testar.
# O sentinela evita um loop de exec caso o sudo não eleve de fato.
if [[ $EUID -ne 0 ]]; then
  if [[ -n "${DEPLOY_REEXEC:-}" ]]; then
    echo "erro: não consegui rodar como root" >&2
    exit 1
  fi
  export DEPLOY_REEXEC=1
  exec sudo -E "$0" "$@"
fi

BACKUP="$ROOT/.deploy-backup"
WORK="$(mktemp -d /tmp/forte-deploy.XXXXXX)"
SWAP_INICIADO=0

log() { printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }

# Comandos que precisam do ambiente do usuário do app (nvm/pnpm/pm2 vêm do
# profile, que só é carregado num shell de login).
as_app() { sudo -u "$APP_USER" -H bash -lc "$1"; }

rollback() {
  log "!! falha no deploy — restaurando a versão anterior"
  if [[ -d "$BACKUP/api-dist" ]]; then
    rm -rf "$ROOT/api/dist"
    cp -a "$BACKUP/api-dist" "$ROOT/api/dist"
  fi
  if [[ -d "$BACKUP/app-dist" ]]; then
    rm -rf "$ROOT/app/dist"
    cp -a "$BACKUP/app-dist" "$ROOT/app/dist"
  fi
  chown -R "$APP_USER:$APP_USER" "$ROOT/api/dist" "$ROOT/app/dist" 2>/dev/null || true
  as_app "pm2 reload $PM2_APP --update-env" || true
  log "código restaurado. ATENÇÃO: migrations já aplicadas NÃO são revertidas —"
  log "confira o banco antes de tentar de novo."
}

finish() {
  local rc=$?
  rm -rf "$WORK"
  if (( rc != 0 && SWAP_INICIADO == 1 )); then
    rollback
  elif (( rc != 0 )); then
    log "!! falhou antes de tocar em $ROOT — nada foi alterado"
  fi
  exit "$rc"
}
trap finish EXIT

log "deploy $SHA — bucket $BUCKET"

log "1/8 baixando artefatos do S3"
aws s3 cp "s3://$BUCKET/$SHA/api.tar.gz" "$WORK/api.tar.gz" --only-show-errors
aws s3 cp "s3://$BUCKET/$SHA/app.tar.gz" "$WORK/app.tar.gz" --only-show-errors

log "2/8 extraindo"
mkdir -p "$WORK/api-stage" "$WORK/app-stage"
tar -xzf "$WORK/api.tar.gz" -C "$WORK/api-stage"
tar -xzf "$WORK/app.tar.gz" -C "$WORK/app-stage"

log "3/8 backup da versão atual"
rm -rf "$BACKUP"
mkdir -p "$BACKUP"
if [[ -d "$ROOT/api/dist" ]]; then
  cp -a "$ROOT/api/dist" "$BACKUP/api-dist"
fi
if [[ -d "$ROOT/app/dist" ]]; then
  cp -a "$ROOT/app/dist" "$BACKUP/app-dist"
fi

log "4/8 publicando código da API"
SWAP_INICIADO=1
mkdir -p "$ROOT/api/dist" "$ROOT/api/prisma" "$ROOT/app/dist"
# -I (--ignore-times) porque o atalho padrão do rsync é "mesmo tamanho + mesmo
# mtime = pular", e dois builds podem gerar arquivos idênticos nesses dois
# campos com conteúdo diferente. Aqui são poucos MB em disco local.
rsync -aI --delete "$WORK/api-stage/api/dist/" "$ROOT/api/dist/"
rsync -aI --delete "$WORK/api-stage/api/prisma/" "$ROOT/api/prisma/"
install -m 644 "$WORK/api-stage/api/package.json"    "$ROOT/api/package.json"
install -m 644 "$WORK/api-stage/app/package.json"    "$ROOT/app/package.json"
install -m 644 "$WORK/api-stage/package.json"        "$ROOT/package.json"
install -m 644 "$WORK/api-stage/pnpm-lock.yaml"      "$ROOT/pnpm-lock.yaml"
install -m 644 "$WORK/api-stage/pnpm-workspace.yaml" "$ROOT/pnpm-workspace.yaml"
install -m 644 "$WORK/api-stage/.npmrc"              "$ROOT/.npmrc"
chown -R "$APP_USER:$APP_USER" "$ROOT/api/dist" "$ROOT/api/prisma" "$ROOT/api/package.json" \
  "$ROOT/app/package.json" "$ROOT/package.json" "$ROOT/pnpm-lock.yaml" \
  "$ROOT/pnpm-workspace.yaml" "$ROOT/.npmrc"

log "5/8 dependências"
# O TypeScript é compilado no runner (x86), mas os engines do Prisma são
# binários ARM64 — por isso install e generate rodam aqui, não no CI.
HASH_NOVO="$(sha256sum "$ROOT/pnpm-lock.yaml" | cut -d' ' -f1)"
HASH_ATUAL="$(cat "$ROOT/.deploy-lock-hash" 2>/dev/null || true)"
if [[ "$HASH_NOVO" != "$HASH_ATUAL" ]]; then
  log "lockfile mudou — rodando pnpm install"
  # CI=true: sem TTY, o pnpm trava numa confirmação ("o diretório de módulos
  # será removido e reinstalado do zero") e não instala nada.
  as_app "cd '$ROOT' && CI=true pnpm install --filter @forte/api --frozen-lockfile"
  printf '%s\n' "$HASH_NOVO" > "$ROOT/.deploy-lock-hash"
  chown "$APP_USER:$APP_USER" "$ROOT/.deploy-lock-hash"
else
  log "lockfile inalterado — pulando install"
fi

log "6/8 prisma generate"
as_app "cd '$ROOT/api' && pnpm exec prisma generate"

log "7/8 migrations"
if as_app "cd '$ROOT/api' && pnpm exec prisma migrate status" >/dev/null 2>&1; then
  log "nenhuma migration pendente"
else
  log "há migrations pendentes"
  if [[ "$SNAPSHOT_BEFORE_MIGRATE" == "true" ]]; then
    SNAP_ID="$RDS_INSTANCE_ID-predeploy-$(date +%Y%m%d%H%M%S)"
    log "criando snapshot $SNAP_ID"
    aws rds create-db-snapshot \
      --db-instance-identifier "$RDS_INSTANCE_ID" \
      --db-snapshot-identifier "$SNAP_ID" >/dev/null
  fi
  as_app "cd '$ROOT/api' && pnpm exec prisma migrate deploy"
fi

log "8/8 publicando front e recarregando a API"
rsync -aI --delete "$WORK/app-stage/" "$ROOT/app/dist/"
chown -R "$APP_USER:$APP_USER" "$ROOT/app/dist"
as_app "pm2 reload $PM2_APP --update-env"

log "healthcheck em $HEALTH_URL"
OK=0
for _ in $(seq 1 "$HEALTH_RETRIES"); do
  if curl -fsS --max-time 3 "$HEALTH_URL" >/dev/null 2>&1; then
    OK=1
    break
  fi
  sleep 2
done
if (( OK != 1 )); then
  log "healthcheck não respondeu depois de $((HEALTH_RETRIES * 2))s"
  as_app "pm2 logs $PM2_APP --lines 40 --nostream" || true
  exit 1
fi

printf '%s\n' "$SHA" > "$ROOT/.deploy-sha"
log "deploy $SHA concluído"
