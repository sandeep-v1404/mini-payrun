# Use Node 22
FROM node:22-alpine

WORKDIR /app

# Copy package files for pnpm workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages ./packages

# Install pnpm
RUN npm install -g pnpm

# Install all dependencies (including devDependencies)
RUN pnpm install

# Build shared types first
RUN pnpm shared:types

# Expose API port
EXPOSE 4000

CMD ["sh", "-c", "pnpm prisma:generate && pnpm api:dev"]
