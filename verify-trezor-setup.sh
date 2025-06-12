#!/bin/bash

# 🔍 TREZOR SETUP VERIFICATION SCRIPT
# This script helps verify your Trezor is ready for secure deployment

echo "🔍 TREZOR DEPLOYMENT READINESS CHECK"
echo "════════════════════════════════════════════════════════════"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TREZOR_ADDRESS="0xeB652c4523f3Cf615D3F3694b14E551145953aD0"

echo -e "\n${BLUE}📋 VERIFICATION CHECKLIST:${NC}"

# Check 1: Node modules
echo -e "\n1. Checking project dependencies..."
if [ -d "node_modules" ]; then
    echo -e "   ${GREEN}✅ Node modules installed${NC}"
else
    echo -e "   ${RED}❌ Node modules missing${NC}"
    echo -e "   ${YELLOW}   Run: npm install${NC}"
fi

# Check 2: Contract files
echo -e "\n2. Checking contract files..."
if [ -f "contracts/OrphiCrowdFund.sol" ]; then
    echo -e "   ${GREEN}✅ OrphiCrowdFund.sol found${NC}"
else
    echo -e "   ${RED}❌ OrphiCrowdFund.sol missing${NC}"
fi

# Check 3: Hardhat config
echo -e "\n3. Checking Hardhat configuration..."
if [ -f "hardhat.mainnet.trezor.config.js" ]; then
    echo -e "   ${GREEN}✅ Trezor config found${NC}"
else
    echo -e "   ${RED}❌ Trezor config missing${NC}"
fi

# Check 4: Deployment script
echo -e "\n4. Checking deployment script..."
if [ -f "scripts/emergency-deploy-secure.js" ]; then
    echo -e "   ${GREEN}✅ Emergency deployment script ready${NC}"
else
    echo -e "   ${RED}❌ Deployment script missing${NC}"
fi

# Check 5: Network connectivity
echo -e "\n5. Checking BSC network connectivity..."
BSC_CHECK=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://bsc-dataseed.binance.org/ | grep -o '"result":"[^"]*"')

if [ ! -z "$BSC_CHECK" ]; then
    echo -e "   ${GREEN}✅ BSC Mainnet accessible${NC}"
else
    echo -e "   ${RED}❌ BSC Mainnet connection failed${NC}"
fi

# Check 6: Trezor address balance
echo -e "\n6. Checking Trezor address balance..."
echo -e "   Address: ${TREZOR_ADDRESS}"

# Use BSCScan API to check balance
BALANCE_WEI=$(curl -s "https://api.bscscan.com/api?module=account&action=balance&address=${TREZOR_ADDRESS}&tag=latest" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$BALANCE_WEI" ] && [ "$BALANCE_WEI" != "0" ]; then
    # Convert from wei to BNB (divide by 10^18)
    BALANCE_BNB=$(echo "scale=6; $BALANCE_WEI / 1000000000000000000" | bc 2>/dev/null || echo "Error calculating")
    echo -e "   ${GREEN}✅ Balance: ${BALANCE_BNB} BNB${NC}"
    
    # Check if balance is sufficient (minimum 0.01 BNB)
    MIN_BALANCE="10000000000000000"  # 0.01 BNB in wei
    if [ "$BALANCE_WEI" -gt "$MIN_BALANCE" ]; then
        echo -e "   ${GREEN}✅ Sufficient balance for deployment${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Low balance - consider adding more BNB${NC}"
    fi
else
    echo -e "   ${RED}❌ Could not fetch balance or balance is 0${NC}"
    echo -e "   ${YELLOW}   Check: https://bscscan.com/address/${TREZOR_ADDRESS}${NC}"
fi

echo -e "\n${BLUE}🔗 USEFUL LINKS:${NC}"
echo -e "📊 Balance Check: https://bscscan.com/address/${TREZOR_ADDRESS}"
echo -e "💱 Get BNB: https://www.binance.com/"
echo -e "🔗 BSC Network: https://docs.binance.org/smart-chain/wallet/metamask.html"

echo -e "\n${BLUE}🛠️  METAMASK SETUP REQUIREMENTS:${NC}"
echo "1. Install MetaMask browser extension"
echo "2. Connect your Trezor to MetaMask:"
echo "   - Click 'Connect Hardware Wallet'"
echo "   - Select 'Trezor'"
echo "   - Choose your account: ${TREZOR_ADDRESS}"
echo "3. Add BSC Mainnet to MetaMask:"
echo "   - Network Name: BSC Mainnet"
echo "   - RPC URL: https://bsc-dataseed.binance.org/"
echo "   - Chain ID: 56"
echo "   - Symbol: BNB"
echo "   - Block Explorer: https://bscscan.com"

echo -e "\n${BLUE}🚀 READY TO DEPLOY?${NC}"
echo -e "If all checks above are ${GREEN}✅ green${NC}, you can proceed with deployment:"
echo -e "\n${YELLOW}npx hardhat run scripts/emergency-deploy-secure.js --network bscMainnet --config hardhat.mainnet.trezor.config.js${NC}"

echo -e "\n${RED}⚠️  SECURITY REMINDERS:${NC}"
echo "• Your Trezor device must be connected and unlocked"
echo "• Verify ALL transaction details on the Trezor screen"
echo "• Never share your Trezor PIN or recovery seed"
echo "• The new contract will be completely secure"

echo -e "\n${GREEN}🔐 Ready for secure deployment!${NC}"
