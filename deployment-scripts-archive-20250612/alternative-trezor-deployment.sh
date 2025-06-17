#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════════════════╗
# ║                🔐 ALTERNATIVE TREZOR DEPLOYMENT METHODS 🔐                            ║
# ║                                                                                       ║
# ║  Multiple approaches to deploy with your Trezor hardware wallet                      ║
# ║  when the direct Node.js connection isn't working properly.                           ║
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

TREZOR_ADDRESS="0xeB652c4523f3Cf615D3F3694b14E551145953aD0"

print_header() {
    echo ""
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                🔐 ALTERNATIVE TREZOR DEPLOYMENT METHODS 🔐                            ║${NC}"
    echo -e "${PURPLE}║                                                                                       ║${NC}"
    echo -e "${PURPLE}║  Choose the best deployment method for your setup                                     ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

show_menu() {
    echo -e "${CYAN}🚀 Available Deployment Methods:${NC}"
    echo ""
    echo -e "${YELLOW}1.${NC} ${GREEN}Web Interface Deployment${NC} (Recommended)"
    echo "   - Use the browser interface with Trezor Connect"
    echo "   - Most user-friendly and reliable"
    echo ""
    echo -e "${YELLOW}2.${NC} ${GREEN}Hardhat Deploy with Trezor${NC}"
    echo "   - Use Hardhat's deployment with Trezor integration"
    echo "   - Command-line based"
    echo ""
    echo -e "${YELLOW}3.${NC} ${GREEN}Manual Transaction Creation${NC}"
    echo "   - Generate raw transactions for manual signing"
    echo "   - Use with Trezor Suite or MetaMask"
    echo ""
    echo -e "${YELLOW}5.${NC} ${BLUE}Check Wallet Balance${NC}"
    echo "   - Verify Trezor wallet has sufficient BNB"
    echo ""
    echo -e "${YELLOW}6.${NC} ${BLUE}Test Trezor Connection${NC}"
    echo "   - Diagnose Trezor connectivity issues"
    echo ""
    echo -e "${YELLOW}0.${NC} Exit"
    echo ""
}

method_1_web_interface() {
    echo -e "${GREEN}🌐 Web Interface Deployment${NC}"
    echo "================================"
    echo ""
    echo "1. The web interface should already be open in your browser"
    echo "2. If not, open: direct-trezor-deployment.html"
    echo ""
    echo -e "${YELLOW}📋 Steps:${NC}"
    echo "• Click 'Connect Trezor' button"
    echo "• Confirm address on your Trezor device"
    echo "• Click 'Deploy Contracts' button"
    echo "• Approve each transaction on Trezor"
    echo ""
    echo -e "${BLUE}🔧 If not working:${NC}"
    echo "• Check that Trezor device is unlocked"
    echo "• Ensure Ethereum app is enabled on device"
    echo "• Try refreshing the browser page"
    echo "• Make sure Trezor Suite is running"
    echo ""
    
    read -p "Press Enter to open web interface or 'q' to return to menu: " choice
    if [[ "$choice" != "q" ]]; then
        open "direct-trezor-deployment.html" 2>/dev/null || echo "Please manually open: direct-trezor-deployment.html"
    fi
}

method_2_hardhat_deploy() {
    echo -e "${GREEN}⚙️  Hardhat Deploy with Trezor${NC}"
    echo "================================"
    echo ""
    echo "This method uses Hardhat's deployment system with Trezor integration."
    echo ""
    echo -e "${YELLOW}📋 Steps:${NC}"
    echo "1. Ensure Trezor device is connected and unlocked"
    echo "2. Run the deployment command"
    echo "3. Confirm transactions on Trezor device"
    echo ""
    
    read -p "Continue with Hardhat deployment? (y/N): " choice
    if [[ "$choice" =~ ^[Yy]$ ]]; then
        echo "🚀 Starting Hardhat deployment..."
        npx hardhat run scripts/deploy-pure-trezor.js --config hardhat.config.trezor.cjs --network bsc
    fi
}

method_3_manual_transactions() {
    echo -e "${GREEN}📝 Manual Transaction Creation${NC}"
    echo "================================"
    echo ""
    echo "This generates raw transaction data that you can sign manually."
    echo ""
    echo -e "${YELLOW}📋 Steps:${NC}"
    echo "1. Generate deployment transactions"
    echo "2. Copy transaction data"
    echo "3. Use Trezor Suite to sign and broadcast"
    echo ""
    
    read -p "Generate manual deployment transactions? (y/N): " choice
    if [[ "$choice" =~ ^[Yy]$ ]]; then
        echo "🔄 Generating deployment transactions..."
        node generate-trezor-transactions.js
        echo ""
        echo "✅ Transactions generated and saved to: trezor-deployment-transactions.json"
        echo ""
        echo -e "${BLUE}💡 Next steps:${NC}"
        echo "1. Open the generated JSON file"
        echo "2. Copy each transaction data"
        echo "3. Use Trezor Suite to create and sign transactions"
        echo "4. Broadcast transactions in order"
    fi
}

check_wallet_balance() {
    echo -e "${GREEN}💰 Checking Wallet Balance${NC}"
    echo "================================"
    echo ""
    echo "Trezor Address: ${TREZOR_ADDRESS}"
    echo ""
    echo "Please check your balance manually by:"
    echo "1. Opening BSCScan: https://bscscan.com/address/${TREZOR_ADDRESS}"
    echo "2. Or checking in your Trezor Suite"
    echo "3. Ensure you have at least 0.1 BNB for deployment"
    echo ""
    
    read -p "Open BSCScan to check balance? (y/N): " choice
    if [[ "$choice" =~ ^[Yy]$ ]]; then
        open "https://bscscan.com/address/${TREZOR_ADDRESS}" 2>/dev/null || echo "Please manually open: https://bscscan.com/address/${TREZOR_ADDRESS}"
    fi
}

test_trezor_connection() {
    echo -e "${GREEN}🔧 Test Trezor Connection${NC}"
    echo "================================"
    echo ""
    echo -e "${YELLOW}📋 Trezor Connection Checklist:${NC}"
    echo ""
    echo "✓ Device Status:"
    echo "  • Trezor device connected via USB"
    echo "  • Device unlocked with PIN"
    echo "  • Ethereum app enabled"
    echo "  • Device shows 'Ready' status"
    echo ""
    echo "✓ Software Status:"
    echo "  • Trezor Suite or Bridge running"
    echo "  • Browser has necessary permissions"
    echo "  • No other apps blocking device access"
    echo ""
    echo "✓ Network Status:"
    echo "  • Connected to internet"
    echo "  • BSC Mainnet accessible"
    echo "  • No firewall blocking connections"
    echo ""
    
    echo -e "${BLUE}🔍 Quick Tests:${NC}"
    echo ""
    
    # Test Trezor Bridge
    echo -n "Testing Trezor Bridge... "
    if curl -s --connect-timeout 3 http://127.0.0.1:21325 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Running${NC}"
    else
        echo -e "${RED}❌ Not Running${NC}"
        echo "   Start Trezor Suite to enable Bridge"
    fi
    
    # Test BSC RPC
    echo -n "Testing BSC RPC connection... "
    if curl -s --connect-timeout 5 -X POST -H "Content-Type: application/json" \
       --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
       https://bsc-dataseed.binance.org/ >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Connected${NC}"
    else
        echo -e "${RED}❌ Connection Failed${NC}"
        echo "   Check internet connection"
    fi
    
    echo ""
    echo "If tests pass but deployment still fails:"
    echo "• Try using the web interface method"
    echo "• Restart Trezor Suite"
    echo "• Disconnect and reconnect Trezor device"
    echo "• Clear browser cache and cookies"
}

main() {
    print_header
    
    while true; do
        show_menu
        read -p "Choose deployment method (1-6) or 0 to exit: " choice
        echo ""
        
        case $choice in
            1)
                method_1_web_interface
                ;;
            2)
                method_2_hardhat_deploy
                ;;
            3)
                method_3_manual_transactions
                ;;
            5)
                check_wallet_balance
                ;;
            6)
                test_trezor_connection
                ;;
            0)
                echo -e "${GREEN}👋 Goodbye! Your contracts are ready for secure deployment.${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid choice. Please try again.${NC}"
                ;;
        esac
        
        echo ""
        echo "================================"
        echo ""
    done
}

# Run main function
main
