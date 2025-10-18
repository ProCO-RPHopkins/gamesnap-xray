# -----------------------------------------------------------------------------
# GameSnap X-Ray • Next.js 15 (App Router) - Production image
# Multi-stage build: install → build → minimal runtime (non-root)
# Requires next.config.ts { output: "standalone" }
# -----------------------------------------------------------------------------

FROM node:22-bullseye-slim AS base
WORKDIR /app
ENV NODE_ENV=production

# --- Dependencies stage -------------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- Build stage --------------------------------------------------------------
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Runtime stage ------------------------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Prepare writable tmp (do this as root), then hand it to node user
RUN mkdir -p /app/tmp/uploads && chown -R node:node /app/tmp

# Copy app (give ownership to node now)
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/.next/standalone ./
COPY --chown=node:node --from=builder /app/.next/static ./.next/static

# Drop privileges
USER node

# Persist uploads via bind mount at runtime
VOLUME ["/app/tmp"]

EXPOSE 3000
CMD ["node", "server.js"]
