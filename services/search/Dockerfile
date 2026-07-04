FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

COPY . .

EXPOSE 8004
CMD ["node", "app.js"]
