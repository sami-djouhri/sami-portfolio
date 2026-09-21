# syntax=docker/dockerfile:1.7

# Basis node:24-alpine, nicht node:20: Node 20 ist seit April 2026 EOL und bekommt
# keine Sicherheitsfixes mehr. 24 traegt ausserdem Alpine 3.24 statt 3.23 (neueres
# openssl). Next 16 verlangt >= 20.9, 24 ist damit abgedeckt.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install --no-audit --no-fund; fi

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app

# Zwei Aufraeumschritte, bevor irgendetwas kopiert wird. Beide haben KEINE
# Entsprechung in package.json, ein Abhaengigkeits-Update erreicht sie nicht:
#
# 1) openssl gezielt nachziehen. Das Basis-Image bringt libssl3/libcrypto3 in dem
#    Stand mit, der beim Bau des node-Image aktuell war; das Alpine-Repo ist
#    regelmaessig weiter. Gezielt statt "apk upgrade" ueber alles, damit der
#    Bau nicht von unbeteiligten Paketwechseln abhaengt.
# 2) npm entfernen. Die Laufzeit startet ausschliesslich "node server.js" und hat
#    fuer npm keine Verwendung. Mitgeliefert wird es trotzdem, samt gebuendeltem
#    tar/pacote/sigstore/glob/minimatch, die zusammen den groessten Teil der
#    Verwundbarkeiten dieses Image stellten (Messung 2026-09-13: 21 von 25, darunter
#    die einzige CRITICAL neben next). Diese Pakete lassen sich nicht patchen,
#    weil sie niemand als Abhaengigkeit deklariert hat, nur wegwerfen.
RUN apk upgrade --no-cache libssl3 libcrypto3 && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# CMS-Daten-Verzeichnis (beschreibbares Volume; Container-Root ist read_only).
ENV PORTFOLIO_DATA_DIR=/data

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# --chown, damit der nextjs-User alle public-Assets lesen kann, auch solche, die
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
