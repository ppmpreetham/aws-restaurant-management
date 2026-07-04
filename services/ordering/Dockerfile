FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
# we use pnpm to install dependencies if available, else fallback to npm
RUN npm install -g pnpm && pnpm install

COPY tsconfig.json ./
COPY src ./src
RUN pnpm run build

FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install -g pnpm && pnpm install --prod

COPY --from=build /app/dist ./dist

EXPOSE 8003
CMD ["node", "dist/server.js"]
