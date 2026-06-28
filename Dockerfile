FROM node:22-alpine AS client-deps
WORKDIR /app/komo-client
COPY komo-client/package*.json ./
RUN npm ci

FROM client-deps AS client-build
COPY komo-client/ ./
RUN npm run build

FROM node:22-alpine AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM node:22-alpine
WORKDIR /app/server

ENV NODE_ENV=production \
    PORT=5001

COPY --from=server-deps /app/server/node_modules ./node_modules
COPY server/package*.json ./
COPY server/index.js ./
COPY --from=client-build /app/komo-client/dist ./public

USER node
EXPOSE 5001
CMD ["node", "index.js"]
