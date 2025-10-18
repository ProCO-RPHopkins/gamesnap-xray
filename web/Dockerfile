# -----------------------------------------------------------------------------
# GameSnap X-Ray • Next.js 15 (App Router) - Production image
# Multi-stage build: install → build → minimal runtime (non-root)
# Requires next.config.ts { output: "standalone" }
# -----------------------------------------------------------------------------

# Base image for all stages
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

# Run as non-root for security
USER node

# Copy the standalone server and static assets produced by Next build
# .next/standalone contains server.js and a pruned node_modules set.
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/.next/standalone ./
COPY --chown=node:node --from=builder /app/.next/static ./.next/static

# Ensure local dev uploads path exists; mount /app/tmp at runtime for persistence
RUN mkdir -p /app/tmp/uploads
VOLUME ["/app/tmp"]

EXPOSE 3000
CMD ["node", "server.js"]
