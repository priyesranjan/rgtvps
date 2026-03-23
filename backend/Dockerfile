# Royal Gold Traders — Backend Dockerfile
# Multi-stage build for production

# Stage 1: Build
FROM node:20-alpine AS builder

# Ensure devDependencies are installed even if ARG NODE_ENV=production is injected
ENV NODE_ENV=development

RUN apk add --no-cache openssl

WORKDIR /app

# Configure npm for resilience
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDeps for build)
RUN npm ci

# Copy Prisma schema and source
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./

# Generate Prisma Client
RUN npm run generate

# Build TypeScript
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

# Install openssl for Prisma and curl for healthcheck
RUN apk add --no-cache openssl curl

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Configure npm for resilience
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Copy package files
COPY package.json package-lock.json* yarn.lock* ./

# Install production dependencies
RUN npm ci --omit=dev --ignore-scripts

# Copy Prisma schema
COPY prisma ./prisma

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy PRE-GENERATED prisma client and engines from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Health check using curl (more standard for Coolify)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

EXPOSE 4000

# Run migrations and then start the application
CMD npx prisma migrate deploy && node dist/src/index.js
