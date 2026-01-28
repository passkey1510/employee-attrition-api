FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3030

# Run dev server
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
