# syntax=docker/dockerfile:1.7

FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install --no-audit --no-fund; fi

FROM node:26-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# CMS-Daten-Verzeichnis (beschreibbares Volume; Container-Root ist read_only).
ENV PORTFOLIO_DATA_DIR=/data

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# --chown, damit der nextjs-User alle public-Assets lesen kann — auch solche, die
# mit restriktiver umask erzeugt wurden (sonst 400 auf z. B. /pgp-key.asc).
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Daten-Volume vorab anlegen + dem nextjs-User geben, damit ein frisches Named
# Volume die richtigen Schreibrechte erbt (read_only-Root erlaubt nur Volumes/tmpfs).
RUN mkdir -p /data/media && chown -R nextjs:nodejs /data

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
