FROM node:20-alpine AS base

RUN npm install -g pnpm

# Build stage
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/database/package.json ./packages/database/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

WORKDIR /app/packages/database
RUN pnpm run db:generate

WORKDIR /app
RUN pnpm turbo run build --filter=@cms/api

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001
CMD ["node", "dist/main.js"]
