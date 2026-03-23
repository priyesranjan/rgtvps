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

RUN apk add --no-cache openssl

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Configure npm for resilience in runtime stage as well
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Copy package files
COPY package.json package-lock.json* yarn.lock* ./

# Install production dependencies only
# We use --omit=dev and ignore-scripts to avoid redundant Prisma engine downloads if we copy them
RUN npm ci --omit=dev --ignore-scripts

# Copy Prisma schema
COPY prisma ./prisma

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy PRE-GENERATED prisma client and engines from builder to avoid network hits
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 4000) + '/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 4000

# Start application
CMD ["node", "dist/src/index.js"]
