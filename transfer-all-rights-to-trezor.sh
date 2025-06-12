#!/bin/bash
# filepath: /Users/dadou/Orphi CrowdFund/transfer-all-rights-to-trezor.sh
# TRANSFER ALL ADMIN RIGHTS TO TREZOR WALLET SCRIPT
# This script ensures that ALL admin rights are assigned to the Trezor wallet

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
TREZOR_WALLET="0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29"
NETWORK="testnet"  # Change to "mainnet" for production

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}🔒 TRANSFERRING ALL ADMIN RIGHTS TO TREZOR WALLET${NC}"
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}Trezor Wallet: ${TREZOR_WALLET}${NC}"
echo -e "${GREEN}Network: ${NETWORK}${NC}"
echo ""

# Step 1: Check current ownership
echo -e "${YELLOW}📋 Step 1: Checking current ownership...${NC}"
npm run check:ownership

echo ""
echo -e "${YELLOW}📋 Step 2: Choose deployment option:${NC}"
echo "1. Deploy NEW contract with Trezor as owner from start"
echo "2. Transfer existing contract ownership to Trezor"
echo ""
read -p "Select option (1 or 2): " choice

case $choice in
    1)
        echo -e "${GREEN}🚀 Deploying NEW contract with Trezor ownership...${NC}"
        if [ "$NETWORK" = "testnet" ]; then
            npm run deploy:final:testnet
        else
            npm run deploy:final:mainnet
        fi
        ;;
    2)
        echo -e "${GREEN}🔄 Transferring existing contract ownership...${NC}"
        node transfer-existing-to-trezor.cjs $NETWORK
        ;;
    *)
        echo -e "${RED}❌ Invalid option selected${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}📋 Step 3: Verifying final ownership...${NC}"
npm run check:ownership

echo ""
echo -e "${GREEN}✅ Process completed!${NC}"
echo -e "${BLUE}============================================================${NC}"
