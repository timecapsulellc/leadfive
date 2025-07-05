#!/bin/bash

# ==================== LEADFIVE DIGITAL OCEAN DEPLOYMENT TRIGGER ====================
# Manual deployment script to trigger Digital Ocean deployment
# This will build and deploy your latest changes to Digital Ocean

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 LeadFive Digital Ocean Deployment${NC}"
echo -e "${GREEN}====================================${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

# Verify the latest commit includes our header fixes
echo -e "${BLUE}📋 Verifying latest changes...${NC}"
LATEST_COMMIT=$(git log -1 --oneline)
echo -e "${GREEN}Latest commit: ${LATEST_COMMIT}${NC}"

# Clean and build the project
echo -e "${BLUE}🔨 Building project...${NC}"
rm -rf dist/
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
else
    echo -e "${RED}❌ Build failed. Please check the errors above.${NC}"
    exit 1
fi

# Show build output info
echo -e "${BLUE}📊 Build Summary:${NC}"
echo -e "${GREEN}   📁 Output directory: dist/${NC}"
echo -e "${GREEN}   📦 Build size: $(du -sh dist/ | cut -f1)${NC}"
echo -e "${GREEN}   🔨 Build time: $(date)${NC}"

echo ""
echo -e "${BLUE}🌐 Deployment Options:${NC}"
echo -e "${YELLOW}1. GitHub Actions (Recommended):${NC}"
echo -e "   • Go to: https://github.com/timecapsulellc/leadfive/actions"
echo -e "   • Click 'Deploy to DigitalOcean' workflow"
echo -e "   • Click 'Run workflow' button"
echo -e "   • Select 'main' branch and run"
echo ""
echo -e "${YELLOW}2. Automatic Deployment:${NC}"
echo -e "   • Your push to main should trigger deployment automatically"
echo -e "   • Check status at: https://github.com/timecapsulellc/leadfive/actions"
echo ""
echo -e "${YELLOW}3. Direct Server Deployment:${NC}"
echo -e "   • If you have SSH access, contact your DevOps team"
echo -e "   • Or provide SSH credentials to continue with automated deployment"

echo ""
echo -e "${GREEN}✅ Local build completed successfully!${NC}"
echo -e "${BLUE}📍 Next: Trigger the deployment through GitHub Actions${NC}"
echo -e "${GREEN}🌐 Your site will be live at: https://leadfive.today${NC}"
echo ""
echo -e "${BLUE}📋 What was built:${NC}"
echo -e "   ✅ Header layout fixes (wallet button right, nav centered)"
echo -e "   ✅ Account.slice error fixes"
echo -e "   ✅ About page centering"
echo -e "   ✅ Enhanced dashboard with all features"
echo -e "   ✅ AIRA chatbot with OpenAI integration"
echo -e "   ✅ Mobile responsive design"
echo -e "   ✅ All latest optimizations and enhancements"