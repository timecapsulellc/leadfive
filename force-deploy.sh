#!/bin/bash

# ==================== FORCE TRIGGER DIGITALOCEAN DEPLOYMENT ====================
# This script will force trigger the DigitalOcean deployment by creating an empty commit

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Force Triggering DigitalOcean Deployment${NC}"
echo -e "${GREEN}=========================================${NC}"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Warning: You're on branch '$CURRENT_BRANCH', not 'main'${NC}"
    echo -e "${YELLOW}   Switching to main branch...${NC}"
    git checkout main
fi

# Pull latest changes
echo -e "${BLUE}📥 Pulling latest changes...${NC}"
git pull origin main

# Create empty commit to trigger deployment
echo -e "${BLUE}🚀 Creating deployment trigger commit...${NC}"
git commit --allow-empty -m "🚀 Force trigger DigitalOcean deployment - $(date '+%Y-%m-%d %H:%M:%S')"

# Push to trigger deployment
echo -e "${BLUE}📤 Pushing to trigger deployment...${NC}"
git push origin main

echo -e "${GREEN}✅ Deployment trigger sent!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "1. 🌐 Go to: https://github.com/timecapsulellc/leadfive/actions"
echo -e "2. 👀 Watch for 'Deploy to DigitalOcean' workflow to start"
echo -e "3. ⏱️  Wait 2-5 minutes for deployment to complete"
echo -e "4. 🎉 Check your live site: https://leadfive.today"
echo ""
echo -e "${GREEN}🎯 Deployment should start automatically within 30 seconds!${NC}"