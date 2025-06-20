#!/bin/bash

# ==================== QUICK DIGITALOCEAN DEPLOYMENT ====================
# One-command deployment for LeadFive on DigitalOcean
# Usage: curl -fsSL https://raw.githubusercontent.com/timecapsulellc/LeadFive/main/quick-deploy.sh | bash

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 LeadFive DigitalOcean Quick Deploy${NC}"
echo -e "${GREEN}=====================================${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   echo "Please run: sudo su - then run this script again"
   exit 1
fi

# Ask for domain name
echo -e "${YELLOW}📍 Enter your domain name (e.g., leadfive.today):${NC}"
read -p "Domain: " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Domain name is required${NC}"
    exit 1
fi

# Ask for email
echo -e "${YELLOW}📧 Enter your email for SSL certificates:${NC}"
read -p "Email: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}❌ Email is required for SSL${NC}"
    exit 1
fi

# Export variables for the deployment script
export DOMAIN="$DOMAIN"
export EMAIL="$EMAIL"

echo -e "${GREEN}✅ Starting deployment with:${NC}"
echo -e "   🌐 Domain: $DOMAIN"
echo -e "   📧 Email: $EMAIL"
echo ""

# Download and run the main deployment script
echo -e "${BLUE}📥 Downloading deployment script...${NC}"
curl -fsSL https://raw.githubusercontent.com/timecapsulellc/LeadFive/main/deploy-digitalocean.sh -o /tmp/deploy-leadfive.sh

# Make executable and run
chmod +x /tmp/deploy-leadfive.sh
/tmp/deploy-leadfive.sh

# Cleanup
rm -f /tmp/deploy-leadfive.sh

echo -e "${GREEN}🎉 Quick deployment completed!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "   1. Point your domain DNS to this server's IP"
echo -e "   2. Wait for DNS propagation (5-30 minutes)"
echo -e "   3. Visit https://$DOMAIN to see your application"
echo ""
echo -e "${GREEN}✨ Happy deploying!${NC}"
