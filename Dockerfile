FROM node:20-bullseye AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libtool \
    autoconf \
    automake \
    linux-headers-generic \
    python3-pip
RUN ln -sf python3 /usr/bin/python
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-bullseye-slim AS production
ARG COMMIT_SHA
LABEL org.opencontainers.image.title="lewla chat server" \
      org.opencontainers.image.description="server components for lewla chat" \
      org.opencontainers.image.vendor="lewla" \
      org.opencontainers.image.url="https://lew.la" \
      org.opencontainers.image.source="https://github.com/lewla/lewla-wss" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.revision=$COMMIT_SHA
WORKDIR /app
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip
RUN ln -sf python3 /usr/bin/python
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
RUN npm ci --omit=dev
EXPOSE 8280
CMD ["node", "dist/index.js"]