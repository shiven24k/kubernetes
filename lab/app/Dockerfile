# ---- base: shared by every stage -------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json ./
COPY server.js ./
COPY public ./public

# ---- dev: used by Tilt for live development (auto-restarts on file change) --
FROM base AS dev
ENV APP_VERSION=dev
CMD ["node", "--watch", "server.js"]

# ---- prod: the default, small and running as a non-root user ---------------
FROM base AS prod
ARG APP_VERSION=1.0
ENV APP_VERSION=${APP_VERSION} NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "server.js"]
