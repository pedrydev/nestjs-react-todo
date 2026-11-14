FROM node:24-alpine AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
COPY package.json package-lock.json ./

FROM base AS build
RUN npm ci --no-audit --no-fund --fetch-retries=5 --fetch-retry-maxtimeout=120000
COPY . .
RUN npm run build

FROM base AS production
RUN npm ci --omit=dev --no-audit --no-fund --fetch-retries=5 --fetch-retry-maxtimeout=120000 \
    && npm cache clean --force
COPY --from=build /app/dist ./dist
ENV PORT=3000
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
