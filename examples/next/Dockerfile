FROM node:22-alpine AS deps
WORKDIR /workspace

COPY package.json package-lock.json ./
COPY examples/next/package.json ./examples/next/package.json
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /workspace
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /workspace/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
COPY examples/next ./examples/next

RUN npm run build
RUN npm --workspace examples/next run build

FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /workspace/examples/next/.next/standalone ./
COPY --from=builder /workspace/examples/next/.next/static ./examples/next/.next/static

EXPOSE 3000

CMD ["node", "examples/next/server.js"]
