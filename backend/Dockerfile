
FROM node:20-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build TypeScript and resolve path aliases
RUN pnpm run build

EXPOSE 6700

CMD ["pnpm", "start"]
