
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build TypeScript and resolve path aliases
RUN pnpm run build

EXPOSE 6700

CMD ["pnpm", "start"]
