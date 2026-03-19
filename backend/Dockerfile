# Royal Gold Traders — Backend Dockerfile
# Multi-stage build for production

# Stage 1: Build
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* yarn.lock* ./

# Install dependencies
RUN npm install --include=dev

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

# Copy package files
COPY package.json package-lock.json* yarn.lock* ./

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma schema (for db operations at runtime)
COPY prisma ./prisma

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Generate the Prisma database client for the final image
RUN npx prisma generate

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 4000) + '/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Default environment
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Start application
CMD ["node", "dist/src/index.js"]
