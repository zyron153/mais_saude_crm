# Mais Saúde 360 — Deployment Guide

> **Version:** 1.0 · **Date:** June 2026
> Covers: local development, staging, and production environments.

---

## 1. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20 LTS | Backend + frontend runtime |
| Docker | 24+ | Containerised services |
| Docker Compose | 2.20+ | Local multi-service setup |
| kubectl | 1.28+ | K8s cluster management |
| Helm | 3.12+ | K8s chart deployments |
| GitHub Actions | — | CI/CD pipeline |
| Prisma CLI | 5+ | DB migrations |

---

## 2. Repository Structure

```
maissaude-360/
├── apps/
│   ├── web/              # Next.js web app
│   ├── api/              # NestJS API server
│   ├── whatsapp-hub/     # WhatsApp webhook + bot service
│   └── mobile/           # React Native app (Expo)
├── packages/
│   ├── database/         # Prisma schema + migrations
│   ├── shared-types/     # TypeScript types shared across apps
│   └── ui/               # Shared React component library
├── infrastructure/
│   ├── docker/           # Dockerfiles
│   ├── k8s/              # Kubernetes manifests
│   └── nginx/            # NGINX config
├── .github/
│   └── workflows/        # GitHub Actions CI/CD
└── docker-compose.yml    # Local development
```

---

## 3. Local Development

### 3.1 Initial Setup

```bash
# Clone repo
git clone https://github.com/maissaude/maissaude-360.git
cd maissaude-360

# Install dependencies (pnpm workspaces)
pnpm install

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/whatsapp-hub/.env.example apps/whatsapp-hub/.env

# Start infrastructure (PostgreSQL, Redis, Keycloak)
docker compose up -d postgres redis keycloak

# Run DB migrations
cd packages/database
pnpm prisma migrate dev

# Seed development data
pnpm prisma db seed

# Start all apps (hot-reload)
pnpm dev
```

### 3.2 docker-compose.yml (development services)

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: maissaude360
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass redispassword

  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    command: start-dev --import-realm
    volumes:
      - ./infrastructure/keycloak/realm-export.json:/opt/keycloak/data/import/realm.json
    ports:
      - "8080:8080"

volumes:
  postgres_data:
```

### 3.3 Dev URLs

| Service | URL |
|---|---|
| Web App | http://localhost:3000 |
| API | http://localhost:3001 |
| WhatsApp Hub | http://localhost:3002 |
| Keycloak | http://localhost:8080 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## 4. Database Migrations

```bash
# Create a new migration
cd packages/database
pnpm prisma migrate dev --name add_exam_results_table

# Apply migrations to staging/prod
pnpm prisma migrate deploy

# Reset dev DB (caution!)
pnpm prisma migrate reset

# Open Prisma Studio (dev only)
pnpm prisma studio
```

Migrations run automatically in the CI/CD pipeline before deployment.

---

## 5. CI/CD Pipeline (GitHub Actions)

### 5.1 On Push to `develop`

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [develop, staging, main]
  pull_request:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
      redis:
        image: redis:7-alpine
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
      - run: pnpm test
      - run: pnpm lint
      - run: pnpm type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker images
        run: |
          docker build -t ghcr.io/maissaude/api:${{ github.sha }} ./apps/api
          docker build -t ghcr.io/maissaude/web:${{ github.sha }} ./apps/web
          docker build -t ghcr.io/maissaude/whatsapp-hub:${{ github.sha }} ./apps/whatsapp-hub
      - name: Push to GitHub Container Registry
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/maissaude/api:${{ github.sha }}
          docker push ghcr.io/maissaude/web:${{ github.sha }}
          docker push ghcr.io/maissaude/whatsapp-hub:${{ github.sha }}
```

### 5.2 On Push to `staging`

Automatically deploys to staging environment after CI passes.

### 5.3 On Push to `main` (Production)

Requires:
1. CI passes
2. Manual approval from lead developer
3. Automated smoke tests pass on staging

Then:
1. Runs DB migrations on production
2. Rolling update in K8s (zero downtime)
3. Smoke tests run against production
4. Rollback automatically triggered if smoke tests fail

---

## 6. Kubernetes Deployment

### 6.1 Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: maissaude-prod
```

### 6.2 API Deployment (example)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: maissaude-prod
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: ghcr.io/maissaude/api:latest
          ports:
            - containerPort: 3001
          envFrom:
            - secretRef:
                name: api-secrets
          readinessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 10
            periodSeconds: 5
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

### 6.3 Ingress (NGINX)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: maissaude-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
    - hosts:
        - api.maissaudecv.com
        - app.maissaudecv.com
      secretName: maissaude-tls
  rules:
    - host: api.maissaudecv.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 3001
    - host: app.maissaudecv.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 3000
```

---

## 7. Backup Strategy

### 7.1 PostgreSQL

```bash
# Automated daily backup (CronJob in K8s)
pg_dump $DATABASE_URL | gzip | \
  aws s3 cp - s3://maissaude-backups/postgres/$(date +%Y-%m-%d).sql.gz \
  --sse AES256

# Retention: 30 days
# Backup window: 02:00 UTC daily
```

### 7.2 Verification

Weekly backup restoration test to a staging database:
```bash
aws s3 cp s3://maissaude-backups/postgres/latest.sql.gz - | \
  gunzip | psql $STAGING_DATABASE_URL
```

### 7.3 Redis

Redis is used for ephemeral data (sessions, bot state, queues). No long-term backup required. BullMQ jobs are durable via Redis persistence (AOF mode enabled).

---

## 8. Health Checks

Each service exposes `GET /health`:

```json
{
  "status": "ok",
  "database": "ok",
  "redis": "ok",
  "uptime": 86400
}
```

Kubernetes readiness and liveness probes poll `/health` every 10 seconds.

---

## 9. Rollback Procedure

```bash
# Rollback API to previous image
kubectl rollout undo deployment/api -n maissaude-prod

# Rollback DB migration (if needed — use with caution)
cd packages/database
pnpm prisma migrate resolve --rolled-back <migration_name>

# Verify rollback
kubectl rollout status deployment/api -n maissaude-prod
```

---

## 10. Environment Variables (Production Secrets)

All secrets stored in **Kubernetes Secrets** (backed by Vault in production):

```bash
# Create secrets from .env file
kubectl create secret generic api-secrets \
  --from-env-file=apps/api/.env.production \
  -n maissaude-prod
```

Never commit `.env.production` to the repository. Use `1Password` or `Vault` for team secret sharing.

---

*Mais Saúde 360 · Deployment Guide v1.0 · June 2026*
