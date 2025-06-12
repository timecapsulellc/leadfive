#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════════════════╗
# ║                                                                                       ║
# ║    🔐 ORPHI CROWDFUND - TREZOR SUITE WEB DEPLOYMENT PACKAGE                          ║
# ║                                                                                       ║
# ║    This script prepares everything needed for deployment via authentic                ║
# ║    Trezor Suite Web at: https://suite.trezor.io/web/                                 ║
# ║                                                                                       ║
# ╚═══════════════════════════════════════════════════════════════════════════════════════╝

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
TREZOR_ADDRESS="0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29"
USDT_TESTNET="0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684"
BSC_TESTNET_RPC="https://data-seed-prebsc-1-s1.binance.org:8545/"
BSC_TESTNET_EXPLORER="https://testnet.bscscan.com"
TREZOR_SUITE_URL="https://suite.trezor.io/web/"

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                                       ║"
echo "║    🔐 ORPHI CROWDFUND - TREZOR SUITE WEB DEPLOYMENT                                  ║"
echo "║                                                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${CYAN}🎯 DEPLOYMENT TARGET:${NC}"
echo -e "   • Contract: OrphiCrowdFund"
echo -e "   • Network: BSC Testnet (Chain ID: 97)"
echo -e "   • Trezor Address: ${TREZOR_ADDRESS}"
echo -e "   • All Admin Roles: Secured by Trezor hardware wallet"
echo ""

echo -e "${YELLOW}📋 CHECKING PREREQUISITES...${NC}"

# Check if contract is compiled
if [ ! -f "./artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json" ]; then
    echo -e "${YELLOW}   📦 Compiling contract...${NC}"
    npx hardhat compile
fi

echo -e "${GREEN}   ✅ Contract compiled and ready${NC}"

# Check balance
echo -e "${YELLOW}   💰 Checking Trezor balance...${NC}"
BALANCE_OUTPUT=$(node check-testnet-balance.cjs 2>/dev/null | grep "Test BNB Balance" || echo "Balance check failed")
echo -e "${GREEN}   ✅ ${BALANCE_OUTPUT}${NC}"

echo ""
echo -e "${BLUE}🚀 TREZOR SUITE WEB DEPLOYMENT STEPS:${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"

echo -e "${YELLOW}"
echo "STEP 1: OPEN TREZOR SUITE WEB"
echo "────────────────────────────────"
echo -e "${NC}"
echo "🌐 Open your browser and navigate to:"
echo -e "${CYAN}   ${TREZOR_SUITE_URL}${NC}"
echo ""
echo "📱 Connect your Trezor device:"
echo "   • Connect via USB"
echo "   • Unlock with PIN"
echo "   • Allow Trezor Suite Web to connect"
echo ""

echo -e "${YELLOW}"
echo "STEP 2: CONFIGURE BSC TESTNET"
echo "────────────────────────────────"
echo -e "${NC}"
echo "⚙️ Add BSC Testnet network in Trezor Suite Web:"
echo "   • Go to Settings → Coins → Add Network"
echo "   • Enter network details:"
echo ""
echo -e "${CYAN}     Network Name: BSC Testnet${NC}"
echo -e "${CYAN}     RPC URL: ${BSC_TESTNET_RPC}${NC}"
echo -e "${CYAN}     Chain ID: 97${NC}"
echo -e "${CYAN}     Symbol: BNB${NC}"
echo -e "${CYAN}     Explorer: ${BSC_TESTNET_EXPLORER}${NC}"
echo ""

echo -e "${YELLOW}"
echo "STEP 3: VERIFY SETUP"
echo "───────────────────────"
echo -e "${NC}"
echo "📍 Confirm your Trezor address matches:"
echo -e "${CYAN}   ${TREZOR_ADDRESS}${NC}"
echo ""
echo "💰 Verify you have test BNB balance"
echo "🔗 Check on explorer:"
echo -e "${CYAN}   ${BSC_TESTNET_EXPLORER}/address/${TREZOR_ADDRESS}${NC}"
echo ""

echo -e "${YELLOW}"
echo "STEP 4: DEPLOY CONTRACT"
echo "─────────────────────────"
echo -e "${NC}"
echo "🚀 In Trezor Suite Web, create contract deployment:"
echo "   • Go to 'Send' or 'Apps' section"
echo "   • Look for 'Smart Contract' or 'Advanced' options"
echo "   • Create contract deployment transaction:"
echo ""
echo -e "${CYAN}     To: (leave empty for contract creation)${NC}"
echo -e "${CYAN}     Value: 0 BNB${NC}"
echo -e "${CYAN}     Gas Limit: 3,000,000${NC}"
echo -e "${CYAN}     Contract Data: [Use bytecode from contract-data.js]${NC}"
echo ""
echo "📱 Confirm transaction on your Trezor device"
echo "⏳ Wait for deployment confirmation"
echo "📝 Note the contract address from the transaction receipt"
echo ""

echo -e "${YELLOW}"
echo "STEP 5: INITIALIZE CONTRACT"
echo "──────────────────────────────"
echo -e "${NC}"
echo "⚡ Initialize the deployed contract:"
echo "   • Create another transaction to the contract address"
echo "   • Call 'initialize' function with parameters:"
echo ""
echo -e "${CYAN}     Function: initialize${NC}"
echo -e "${CYAN}     _usdtToken: ${USDT_TESTNET}${NC}"
echo -e "${CYAN}     _treasuryAddress: ${TREZOR_ADDRESS}${NC}"
echo -e "${CYAN}     _emergencyAddress: ${TREZOR_ADDRESS}${NC}"
echo -e "${CYAN}     _poolManagerAddress: ${TREZOR_ADDRESS}${NC}"
echo ""
echo "📱 Confirm initialization on your Trezor device"
echo ""

echo -e "${YELLOW}"
echo "STEP 6: VERIFY DEPLOYMENT"
echo "────────────────────────────"
echo -e "${NC}"
echo "✅ Verify successful deployment:"
echo "   • Check contract on BSC Testnet explorer"
echo "   • Verify all admin roles assigned to your Trezor"
echo "   • Test that admin functions require Trezor signature"
echo ""

echo -e "${GREEN}"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "═══════════════════════"
echo -e "${NC}"
echo "After successful deployment, you will have:"
echo -e "${GREEN}   ✅ OrphiCrowdFund contract deployed on BSC Testnet${NC}"
echo -e "${GREEN}   ✅ All admin roles secured by your Trezor device${NC}"
echo -e "${GREEN}   ✅ Zero software wallet access to admin functions${NC}"
echo -e "${GREEN}   ✅ Hardware-secured platform administration${NC}"
echo ""

echo -e "${BLUE}🔗 HELPFUL LINKS:${NC}"
echo -e "   • Trezor Suite Web: ${TREZOR_SUITE_URL}"
echo -e "   • BSC Testnet Explorer: ${BSC_TESTNET_EXPLORER}"
echo -e "   • Your Address: ${BSC_TESTNET_EXPLORER}/address/${TREZOR_ADDRESS}"
echo -e "   • BSC Testnet Faucet: https://testnet.binance.org/faucet-smart"
echo ""

echo -e "${PURPLE}🛡️ SECURITY REMINDERS:${NC}"
echo -e "   • Only use the official Trezor Suite Web"
echo -e "   • Verify all transaction details on your Trezor screen"
echo -e "   • Your private keys never leave the hardware device"
echo -e "   • All admin operations require Trezor confirmation"
echo ""

echo -e "${CYAN}📋 CONTRACT DATA READY:${NC}"
echo -e "   • Contract bytecode: Available in artifacts/"
echo -e "   • ABI data: Available in public/contract-data.js"
echo -e "   • Initialization parameters: Pre-configured above"
echo ""

echo -e "${GREEN}🎯 READY TO DEPLOY!${NC}"
echo -e "Open ${TREZOR_SUITE_URL} and follow the steps above."
echo ""

# Open Trezor Suite Web automatically
if command -v open &> /dev/null; then
    echo -e "${YELLOW}🌐 Opening Trezor Suite Web...${NC}"
    open "${TREZOR_SUITE_URL}"
elif command -v xdg-open &> /dev/null; then
    echo -e "${YELLOW}🌐 Opening Trezor Suite Web...${NC}"
    xdg-open "${TREZOR_SUITE_URL}"
else
    echo -e "${YELLOW}🌐 Please manually open: ${TREZOR_SUITE_URL}${NC}"
fi

echo ""
echo -e "${PURPLE}✨ Authentic Trezor Suite Web deployment ready!${NC}"
