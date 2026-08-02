#!/usr/bin/env bash
# Collect Azure + app variables for K8s manifest generation.
# Usage:
#   export RG=calendly-rg AKS=calendly-aks ACR=youracrname
#   export PG_ADMIN_PASSWORD='your-password'
#   ./scripts/dump-k8s-vars.sh
#
# Optional secrets (skip if not ready — fill in YAML later):
#   export SMTP_PASS=... GOOGLE_CLIENT_ID=... etc.

set -euo pipefail

: "${RG:?Set RG (e.g. export RG=calendly-rg)}"
: "${AKS:?Set AKS (e.g. export AKS=calendly-aks)}"

# ACR — from env or first registry in resource group
ACR="${ACR:-$(az acr list -g "$RG" --query '[0].name' -o tsv 2>/dev/null || true)}"
if [[ -z "$ACR" ]]; then
  echo "ERROR: Set ACR or create a container registry in $RG" >&2
  exit 1
fi

PG_SERVER="${PG_SERVER:-$(az postgres flexible-server list -g "$RG" --query '[0].name' -o tsv 2>/dev/null || true)}"
if [[ -z "$PG_SERVER" ]]; then
  echo "ERROR: Set PG_SERVER or ensure Postgres exists in $RG" >&2
  exit 1
fi

PG_HOST="${PG_HOST:-$(az postgres flexible-server show -g "$RG" -n "$PG_SERVER" --query fullyQualifiedDomainName -o tsv)}"
PG_ADMIN_USER="${PG_ADMIN_USER:-$(az postgres flexible-server show -g "$RG" -n "$PG_SERVER" --query administratorLogin -o tsv)}"
LOCATION="${LOCATION:-$(az aks show -g "$RG" -n "$AKS" --query location -o tsv 2>/dev/null || az group show -n "$RG" --query location -o tsv)}"

IMAGE_TAG="${IMAGE_TAG:-v1}"
IMAGE_API="${IMAGE_API:-${ACR}.azurecr.io/calendly-api:${IMAGE_TAG}}"
IMAGE_WORKER="${IMAGE_WORKER:-${ACR}.azurecr.io/calendly-worker:${IMAGE_TAG}}"

# AKS outbound IP (for Postgres firewall verification)
AKS_OUTBOUND_IP=""
OUTBOUND_ID=$(az aks show -g "$RG" -n "$AKS" \
  --query "networkProfile.loadBalancerProfile.effectiveOutboundIPs[0].id" -o tsv 2>/dev/null || true)
if [[ -n "$OUTBOUND_ID" && "$OUTBOUND_ID" != "null" ]]; then
  AKS_OUTBOUND_IP=$(az resource show --ids "$OUTBOUND_ID" --query properties.ipAddress -o tsv 2>/dev/null || true)
fi

# Build DATABASE_URL if password provided
DATABASE_URL=""
if [[ -n "${PG_ADMIN_PASSWORD:-}" ]]; then
  DATABASE_URL="postgresql://${PG_ADMIN_USER}:${PG_ADMIN_PASSWORD}@${PG_HOST}:5432/calendly?sslmode=require"
fi

cat <<EOF
# === Paste this entire block into chat for K8s YAML generation ===

RG=$RG
LOCATION=$LOCATION
AKS=$AKS
ACR=$ACR
NAMESPACE=calendly

PG_SERVER=$PG_SERVER
PG_HOST=$PG_HOST
PG_ADMIN_USER=$PG_ADMIN_USER
PG_ADMIN_PASSWORD=${PG_ADMIN_PASSWORD:-<FILL_ME>}
DATABASE_URL=${DATABASE_URL:-<FILL_ME>}

TEMPORAL_POSTGRES_USER=$PG_ADMIN_USER
TEMPORAL_POSTGRES_PWD=${PG_ADMIN_PASSWORD:-<FILL_ME>}
TEMPORAL_POSTGRES_SEEDS=$PG_HOST

IMAGE_TAG=$IMAGE_TAG
IMAGE_API=$IMAGE_API
IMAGE_WORKER=$IMAGE_WORKER

AKS_OUTBOUND_IP=${AKS_OUTBOUND_IP:-<unknown>}

# App config
TEMPORAL_ADDRESS=temporal:7233
TEMPORAL_NAMESPACE=default
TEMPORAL_TASK_QUEUE=calendly-tasks
API_REPLICAS=2
WORKER_REPLICAS=1

# Email (optional — use Mailhog locally, real SMTP in prod)
SMTP_HOST=${SMTP_HOST:-smtp.sendgrid.net}
SMTP_PORT=${SMTP_PORT:-587}
SMTP_USER=${SMTP_USER:-<FILL_ME>}
SMTP_PASS=${SMTP_PASS:-<FILL_ME>}
EMAIL_FROM=${EMAIL_FROM:-Calendly <noreply@example.com>}

# Google Calendar (optional)
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-<FILL_ME>}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-<FILL_ME>}
GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI:-http://<API_IP>/api/integrations/google/callback}
GOOGLE_SENDER_EMAIL=${GOOGLE_SENDER_EMAIL:-info@example.com}
GOOGLE_REFRESH_TOKEN=${GOOGLE_REFRESH_TOKEN:-<FILL_ME>}
GOOGLE_CALENDAR_ID=${GOOGLE_CALENDAR_ID:-primary}

# === End ===
EOF
