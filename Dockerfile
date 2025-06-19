# ==================== LEADFIVE PRODUCTION DOCKERFILE ====================
# Multi-stage build for optimized production deployment
# Target domain: leadfive.today

# ==================== STAGE 1: BUILD ENVIRONMENT ====================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ==================== STAGE 2: PRODUCTION ENVIRONMENT ====================
FROM node:18-alpine AS production

# Set environment variables
ENV NODE_ENV=production
ENV VITE_APP_ENV=production

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S leadfive -u 1001

# Set working directory
WORKDIR /app

# Install production dependencies and utilities
RUN apk add --no-cache \
    curl \
    wget \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Copy built application from builder stage
COPY --from=builder --chown=leadfive:nodejs /app/dist ./dist
COPY --from=builder --chown=leadfive:nodejs /app/package*.json ./
COPY --from=builder --chown=leadfive:nodejs /app/node_modules ./node_modules

# Copy vite config
COPY --chown=leadfive:nodejs vite.config.js ./

# Create necessary directories
RUN mkdir -p /app/data /app/logs && \
    chown -R leadfive:nodejs /app

# Create health check endpoint
RUN echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body><h1>LeadFive is running</h1><p>Status: OK</p></body></html>' > /app/dist/index.html

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health.html || exit 1

# Switch to non-root user
USER leadfive

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]

# ==================== STAGE 3: DEVELOPMENT ENVIRONMENT ====================
FROM node:18-alpine AS development

# Set environment variables
ENV NODE_ENV=development
ENV VITE_APP_ENV=development

# Set working directory
WORKDIR /app

# Install development dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    curl

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY . .

# Expose port for development
EXPOSE 5173

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5173 || exit 1

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ==================== LABELS ====================
LABEL maintainer="LeadFive Team"
LABEL version="1.0.0"
LABEL description="LeadFive MLM Platform - Production Ready"
LABEL domain="leadfive.today"
LABEL repository="https://github.com/timecapsulellc/LeadFive"

# ==================== BUILD INSTRUCTIONS ====================
# Development build:
# docker build --target development -t leadfive:dev .
# docker run -p 5173:5173 -v $(pwd):/app leadfive:dev

# Production build:
# docker build --target production -t leadfive:prod .
# docker run -p 3000:3000 leadfive:prod

# Multi-platform build:
# docker buildx build --platform linux/amd64,linux/arm64 --target production -t leadfive:latest .
