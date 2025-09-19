# Base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/web/package.json ./packages/web/
COPY packages/shared/package.json ./packages/shared/
RUN npm install -g pnpm
RUN pnpm install

# Copy code
COPY packages/web ./packages/web
COPY packages/shared ./packages/shared

# Expose port
EXPOSE 5173

# Start dev server
CMD ["pnpm", "--filter", "@mini-payrun/web", "dev"]
