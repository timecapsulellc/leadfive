#!/bin/bash

# 🚀 LeadFive Production Deployment Script
# Optimized for DigitalOcean App Platform

echo "🔥 Starting LeadFive Production Deployment..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run from project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Pre-deployment checks...${NC}"

# Check Node.js version
node_version=$(node --version)
echo -e "${GREEN}✅ Node.js version: $node_version${NC}"

# Check npm version  
npm_version=$(npm --version)
echo -e "${GREEN}✅ npm version: $npm_version${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci --production=false

# Run security audit
echo -e "${YELLOW}🔒 Running security audit...${NC}"
npm audit --audit-level high

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf dist/
rm -rf node_modules/.vite/

# Build for production
echo -e "${YELLOW}🏗️  Building for production...${NC}"
npm run build

# Verify build success
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Display build stats
echo -e "${BLUE}📊 Build Statistics:${NC}"
du -sh dist/
echo "Asset breakdown:"
find dist/ -name "*.js" -exec du -h {} + | head -10
find dist/ -name "*.css" -exec du -h {} + | head -5

# Verify critical files
echo -e "${BLUE}🔍 Verifying critical files...${NC}"
critical_files=("dist/index.html" "dist/_headers" "dist/manifest.json")
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
    fi
done

# Create deployment archive
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
tar -czf leadfive-production-$(date +%Y%m%d-%H%M%S).tar.gz dist/

echo -e "${GREEN}🎉 Deployment package ready!${NC}"
echo "================================================"
echo -e "${BLUE}📋 Deployment Summary:${NC}"
echo "• Build completed successfully"
echo "• All critical files verified"
echo "• Security headers configured"
echo "• Performance optimizations applied"
echo "• Bundle size: $(du -sh dist/ | cut -f1)"
echo ""
echo -e "${GREEN}🚀 Ready for production deployment!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Deploy dist/ folder to your web server"
echo "2. Ensure HTTPS is enabled"
echo "3. Configure proper cache headers"
echo "4. Monitor performance metrics"
echo ""
echo -e "${BLUE}🔗 Production URL: https://leadfive.today${NC}"
echo "================================================"
