# syntax=docker/dockerfile:1

# Meridian landing page — AC-038, AC-039.
#
# Three stages so the shipped image carries neither the source nor the build
# toolchain: only `.next/standalone`, which is the server plus exactly the
# node_modules it traced as reachable.
#
# node:20-alpine per the constitution's tooling table.

# ── deps ─────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
# Only the manifests, so this layer is cached until a dependency actually
# changes rather than on every source edit.
COPY package.json package-lock.json ./
RUN npm ci

# ── build ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# next/font downloads and self-hosts the faces at build time, so this stage
# needs network access and the running container does not.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── runtime ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# AC-039. Honoured rather than hardcoded: the reverse proxy decides the port.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# AC-038. A non-root user created here rather than relying on the image's own
# `node` user, so the uid is stable and the ownership below is explicit.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# `standalone` does not include public/ or the static chunks — they are copied
# beside it, and this is the step people miss when the page loads with no CSS
# and no 3D model.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

# AC-040. The probe the health route exists for.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
