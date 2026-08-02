#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Applying namespace and secrets..."
kubectl apply -f "$ROOT/k8s/namespace.yaml"
kubectl apply -f "$ROOT/k8s/secret.yaml"

echo "Applying Temporal..."
kubectl apply -f "$ROOT/k8s/temporal/configmap.yaml"
kubectl apply -f "$ROOT/k8s/temporal/temporal-server.yaml"
echo "Waiting for Temporal to be ready (up to 5 min)..."
kubectl wait --for=condition=ready pod -l app=temporal -n calendly --timeout=300s
kubectl apply -f "$ROOT/k8s/temporal/temporal-ui.yaml"

echo "Applying API and worker..."
kubectl apply -f "$ROOT/k8s/api-deployment.yaml"
kubectl apply -f "$ROOT/k8s/worker-deployment.yaml"

echo ""
echo "Done. Check status:"
kubectl get pods,svc -n calendly
