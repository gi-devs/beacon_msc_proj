FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

COPY apps/server ./apps/server
COPY packages/utils ./packages/utils
COPY packages/validation ./packages/validation
COPY packages/types ./packages/types

RUN pnpm install

WORKDIR /app/apps/server
RUN pnpm build


FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/prisma ./prisma
COPY --from=builder /app/apps/server/package.json ./package.json

#remove the workspaces field from package.json to avoid npm errors
RUN sed -i '/workspace:\*/d' package.json \
  && npm install --omit=dev

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/server.js"]
