# -------------------
# Stage 1: Builder
# -------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy monorepo manifests
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy server and packages
COPY apps/server ./apps/server
COPY packages/utils ./packages/utils
COPY packages/validation ./packages/validation
COPY packages/types ./packages/types

# Install all deps (dev + prod) so tsup, prisma, etc. are available
RUN pnpm install

# Build server (just like pnpm --filter server build)
WORKDIR /app/apps/server
RUN pnpm build


# -------------------
# Stage 2: Runner
# -------------------
FROM node:20-alpine
WORKDIR /app

# Copy built server dist + prisma schema + package.json
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/prisma ./prisma
COPY --from=builder /app/apps/server/package.json ./package.json

# Install only production dependencies (no dev deps or workspaces)
RUN sed -i '/workspace:\*/d' package.json \
  && npm install --omit=dev

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Start the compiled server
CMD ["node", "dist/server.js"]
