# Auth service (Fastify). Build from the repo root:
#   docker build -t auth .

# ---- build: compile TypeScript to dist/ ----
FROM node:24-slim AS build

WORKDIR /app

# Dependencies first, so code changes don't invalidate this layer.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- runtime: production deps + compiled output only ----
FROM node:24-slim

ENV NODE_ENV=production \
    WEBSERVER_HOST=0.0.0.0 \
    WEBSERVER_PORT=3000

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
# Public key only - the private key comes in at runtime via PRIVATE_KEY_PEM.
COPY keys/public.pem ./keys/public.pem

# The node image ships an unprivileged "node" user.
USER node

EXPOSE 3000
# Not "npm start": that loads .env from disk, the container gets its env from the runtime.
CMD ["node", "dist/index.js"]
