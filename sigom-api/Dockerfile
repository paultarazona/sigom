# syntax=docker/dockerfile:1
#
# NOTE: sigom-api has no package-lock.json of its own — dependencies are
# locked at the monorepo root (npm workspaces: ["sigom-api"]). This Dockerfile
# must therefore be built with the REPO ROOT as the build context, e.g.:
#   docker build -f sigom-api/Dockerfile .
# In Dokploy: set "Docker Build Context" to the repo root and
# "Dockerfile Path" to sigom-api/Dockerfile.

# ---- Stage: builder ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY sigom-api/package.json ./sigom-api/package.json
COPY sigom-api/prisma ./sigom-api/prisma

RUN npm ci

RUN npx prisma generate --schema=sigom-api/prisma/schema.prisma

COPY sigom-api ./sigom-api

RUN npm run build --workspace=sigom-api

RUN npm ci --omit=dev

# ---- Stage: runner ----
FROM node:20-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/sigom-api/dist ./sigom-api/dist
COPY --from=builder /app/sigom-api/prisma ./sigom-api/prisma
COPY --from=builder /app/sigom-api/package.json ./sigom-api/package.json

COPY sigom-api/entrypoint.sh ./sigom-api/entrypoint.sh
RUN chmod +x ./sigom-api/entrypoint.sh

WORKDIR /app/sigom-api

# uploads is served from ./uploads (relative to process.cwd(), which is
# /app/sigom-api at runtime) — mount a persistent volume at
# /app/sigom-api/uploads in Dokploy so files survive redeploys.

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
