# 🚀 ORPHI CrowdFund - Production Dockerfile
# Optimized for DigitalOcean deployment

# Use Node.js 18 Alpine for smaller image size and better security
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --only=production=false && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine as production

# Add labels for better organization
LABEL maintainer="LEAD 5 Team" \
      description="ORPHI CrowdFund Frontend" \
      version="1.0.0"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S orphi -u 1001

# Set working directory
WORKDIR /app

# Install serve globally and curl for health checks
RUN npm install -g serve@14.2.4 && \
    apk add --no-cache curl && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=orphi:nodejs /app/dist ./dist
COPY --from=builder --chown=orphi:nodejs /app/package.json ./

# Switch to non-root user
USER orphi

# Expose port 8080
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080 || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "8080", "--no-clipboard"] 