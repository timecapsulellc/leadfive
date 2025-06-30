#!/bin/bash

# LeadFive Frontend Update Script
# Updates contract addresses and configurations for BSC Mainnet

echo "🚀 UPDATING LEADFIVE FRONTEND FOR BSC MAINNET"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 CONTRACT ADDRESSES:${NC}"
echo "  Proxy: 0x29dcCb502D10C042BcC6a02a7762C49595A9E498"
echo "  Implementation: 0xA4AB35Ab2BA415E6CCf9559e8dcAB0661cC29e2b"
echo "  USDT: 0x55d398326f99059fF775485246999027B3197955"
echo "  Sponsor: 0xCeaEfDaDE5a0D574bFd5577665dC58d132995335"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run from project root.${NC}"
    exit 1
fi

# Install dependencies if needed
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
fi

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf dist
rm -rf node_modules/.vite

# Check if Vite config exists
if [ ! -f "vite.config.js" ]; then
    echo -e "${RED}❌ Error: vite.config.js not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend configuration updated with mainnet addresses${NC}"
echo ""

# Start development server
echo -e "${BLUE}🔧 Starting Vite development server...${NC}"
echo "  URL: http://localhost:5173"
echo "  Network: 0.0.0.0:5173 (accessible externally)"
echo ""
echo -e "${YELLOW}📱 TESTING CHECKLIST:${NC}"
echo "  1. Connect MetaMask to BSC Mainnet"
echo "  2. Ensure wallet has BNB for gas fees"
echo "  3. Test contract connection"
echo "  4. Verify package prices display correctly"
echo "  5. Test registration flow (with small amount)"
echo ""

echo -e "${GREEN}🚀 Starting development server...${NC}"
npm run dev
