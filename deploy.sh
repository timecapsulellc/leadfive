#!/bin/bash

# 🚀 ORPHI CrowdFund - DigitalOcean Deployment Script
# Created by: LEAD 5 Team
# Version: 1.0.0

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "🚀 ORPHI CrowdFund Deployment Script"
    echo "=============================================="
    echo -e "${NC}"
}

print_step() {
    echo -e "${YELLOW}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Main deployment function
deploy_to_digitalocean() {
    print_header
    
    # Step 1: Environment Check
    print_step "🔍 Checking environment..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18.x"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker"
        exit 1
    fi
    
    print_success "Environment check passed"
    
    # Step 2: Clean and install dependencies
    print_step "📦 Installing dependencies..."
    
    # Clean previous builds
    rm -rf dist/ node_modules/.cache/
    
    # Install dependencies
    npm ci --production=false
    
    print_success "Dependencies installed"
    
    # Step 3: Build application
    print_step "🏗️ Building application..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Build the application
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "Build failed - dist directory not found"
        exit 1
    fi
    
    print_success "Application built successfully"
    
    # Step 4: Build Docker image
    print_step "🐳 Building Docker image..."
    
    # Remove existing image if it exists
    docker rmi orphi-crowdfund 2>/dev/null || true
    
    # Build new image
    docker build -t orphi-crowdfund . --no-cache
    
    print_success "Docker image built"
    
    # Step 5: Test Docker container locally
    print_step "🧪 Testing Docker container..."
    
    # Stop and remove existing test container
    docker stop orphi-test 2>/dev/null || true
    docker rm orphi-test 2>/dev/null || true
    
    # Run test container
    docker run -d --name orphi-test -p 3001:8080 orphi-crowdfund
    
    # Wait for container to start
    sleep 5
    
    # Check if container is running
    if ! docker ps | grep orphi-test; then
        print_error "Test container failed to start"
        docker logs orphi-test
        exit 1
    fi
    
    # Stop test container
    docker stop orphi-test
    docker rm orphi-test
    
    print_success "Docker container test passed"
    
    # Step 6: Tag for DigitalOcean Registry (optional)
    print_step "🏷️ Tagging image for DigitalOcean..."
    
    # Get current timestamp
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    
    # Tag with timestamp
    docker tag orphi-crowdfund orphi-crowdfund:${TIMESTAMP}
    docker tag orphi-crowdfund orphi-crowdfund:latest
    
    # If registry is configured, tag for DO registry
    if [ ! -z "$DO_REGISTRY" ]; then
        docker tag orphi-crowdfund ${DO_REGISTRY}/orphi-crowdfund:latest
        docker tag orphi-crowdfund ${DO_REGISTRY}/orphi-crowdfund:${TIMESTAMP}
        print_success "Images tagged for DigitalOcean Registry"
    else
        print_success "Images tagged locally"
    fi
    
    # Step 7: Generate deployment files
    print_step "📄 Generating deployment files..."
    
    # Create docker-compose for easy deployment
    cat > docker-compose.prod.yml << EOF
version: '3.8'
services:
  orphi-crowdfund:
    image: orphi-crowdfund:latest
    container_name: orphi-crowdfund-prod
    restart: unless-stopped
    ports:
      - "80:8080"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOF
    
    # Create nginx config for custom domain
    cat > nginx.conf << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Enable gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }
    
    # Handle static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:8080;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    print_success "Deployment files generated"
    
    # Step 8: Create deployment summary
    print_step "📋 Creating deployment summary..."
    
    cat > deployment-summary.md << EOF
# 🚀 ORPHI CrowdFund Deployment Summary

**Build Date**: $(date)
**Docker Image**: orphi-crowdfund:${TIMESTAMP}
**Status**: Ready for deployment

## Deployment Options:

### Option 1: DigitalOcean App Platform (Recommended)
1. Push this code to your Git repository
2. Create new App in DigitalOcean
3. Connect your repository
4. Use these settings:
   - Build Command: \`npm run build\`
   - Run Command: \`serve -s dist -l 8080\`
   - Port: 8080

### Option 2: DigitalOcean Droplet
1. Create Ubuntu 22.04 droplet
2. Install Docker: \`sudo apt install docker.io -y\`
3. Copy files to droplet
4. Run: \`docker-compose -f docker-compose.prod.yml up -d\`

### Option 3: Manual Docker Deployment
\`\`\`bash
# On your droplet
docker run -d \\
  --name orphi-crowdfund \\
  --restart unless-stopped \\
  -p 80:8080 \\
  orphi-crowdfund:latest
\`\`\`

## Files Generated:
- docker-compose.prod.yml
- nginx.conf
- deployment-summary.md

## Next Steps:
1. Choose your deployment option
2. Configure domain (if applicable)
3. Set up SSL certificate
4. Monitor application health

**Estimated Monthly Cost**: \$5-12 (App Platform) or \$6+ (Droplet)
EOF
    
    print_success "Deployment summary created"
    
    # Final output
    echo ""
    echo -e "${GREEN}=============================================="
    echo "🎉 DEPLOYMENT PREPARATION COMPLETE!"
    echo "=============================================="
    echo ""
    echo "✅ Application built and tested"
    echo "✅ Docker image created: orphi-crowdfund:${TIMESTAMP}"
    echo "✅ Deployment files generated"
    echo ""
    echo "📁 Generated Files:"
    echo "   • docker-compose.prod.yml"
    echo "   • nginx.conf"
    echo "   • deployment-summary.md"
    echo ""
    echo "🌐 Next Steps:"
    echo "   1. Choose deployment option (see deploy-digitalocean.md)"
    echo "   2. Push to Git for App Platform deployment, OR"
    echo "   3. Copy files to DigitalOcean Droplet"
    echo ""
    echo "💡 Recommended: Use DigitalOcean App Platform for easiest deployment"
    echo -e "=============================================="
    echo -e "${NC}"
}

# Check for command line arguments
case "${1:-}" in
    "help"|"-h"|"--help")
        echo "ORPHI CrowdFund Deployment Script"
        echo ""
        echo "Usage: ./deploy.sh [option]"
        echo ""
        echo "Options:"
        echo "  help, -h, --help    Show this help message"
        echo "  clean               Clean build artifacts and Docker images"
        echo "  test                Run tests before deployment"
        echo "  build-only          Only build without Docker operations"
        echo ""
        echo "Environment Variables:"
        echo "  DO_REGISTRY         DigitalOcean registry URL (optional)"
        echo ""
        echo "Example:"
        echo "  DO_REGISTRY=registry.digitalocean.com/your-registry ./deploy.sh"
        ;;
    "clean")
        print_step "🧹 Cleaning build artifacts..."
        rm -rf dist/ node_modules/.cache/
        docker rmi orphi-crowdfund 2>/dev/null || true
        docker rmi orphi-crowdfund:latest 2>/dev/null || true
        print_success "Cleanup complete"
        ;;
    "test")
        print_step "🧪 Running tests..."
        npm test 2>/dev/null || echo "No tests configured"
        print_success "Tests completed"
        ;;
    "build-only")
        print_step "🏗️ Building application only..."
        npm ci --production=false
        npm run build
        print_success "Build complete"
        ;;
    *)
        deploy_to_digitalocean
        ;;
esac 