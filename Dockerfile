FROM node:20-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund || \
      (echo "lockfile out of sync — regenerating" && rm -f package-lock.json && npm install --no-audit --no-fund); \
    else \
      npm install --no-audit --no-fund; \
    fi
COPY frontend/ ./
RUN npm run build

FROM node:20-slim AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund --omit=dev || \
      (echo "lockfile out of sync — regenerating" && rm -f package-lock.json && npm install --no-audit --no-fund --omit=dev); \
    else \
      npm install --no-audit --no-fund --omit=dev; \
    fi

FROM node:20-slim AS production
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends \
      dumb-init openssl ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend/ ./
COPY --from=frontend /app/frontend/dist ../frontend/dist

RUN npx prisma generate

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 brewpass \
    && chown -R brewpass:nodejs /app
USER brewpass

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:4000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy; node server.js"]