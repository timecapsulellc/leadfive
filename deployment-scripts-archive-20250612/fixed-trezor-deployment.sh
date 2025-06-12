#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════════════════╗
# ║                 🔐 FIXED TREZOR DEPLOYMENT - ALL METHODS 🔐                           ║
# ║                                                                                       ║
# ║  Multiple deployment methods with all module system issues resolved                   ║
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
    echo -e "${PURPLE}║                 🔐 FIXED TREZOR DEPLOYMENT - ALL METHODS 🔐                           ║${NC}"
    echo -e "${PURPLE}║                                                                                       ║${NC}"
    echo -e "${PURPLE}║  All module system issues resolved • Multiple deployment options                      ║${NC}"
    echo -e "${PURPLE}║  Trezor Address: ${TREZOR_ADDRESS}           ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

show_deployment_methods() {
    echo -e "${CYAN}🚀 Choose your deployment method:${NC}"
    echo ""
    echo -e "${GREEN}1. 🔥 ESM Trezor Deployment (RECOMMENDED - Fixed)${NC}"
    echo -e "   • Pure ESM module system"
    echo -e "   • Direct Trezor Connect integration"
    echo -e "   • No CommonJS conflicts"
    echo -e "   • Fast and reliable"
    echo ""
    echo -e "${BLUE}2. ⚡ Hardhat Trezor Deployment${NC}"
    echo -e "   • Uses Hardhat with Trezor config"
    echo -e "   • Built-in verification"
    echo -e "   • Professional deployment flow"
    echo ""
    echo -e "${YELLOW}3. 🌐 Web Interface Deployment${NC}"
    echo -e "   • Browser-based deployment"
    echo -e "   • Visual progress tracking"
    echo -e "   • Good for first-time users"
    echo ""
    echo -e "${PURPLE}4. 🔧 Legacy Launcher (Original)${NC}"
    echo -e "   • Uses the original launcher script"
    echo -e "   • Multiple sub-options"
    echo ""
    echo -e "${RED}5. Exit${NC}"
    echo ""
}

deploy_esm_trezor() {
    echo -e "${GREEN}🔥 Starting ESM Trezor Deployment...${NC}"
    echo ""
    echo -e "${CYAN}✅ MULTIPLE ESM OPTIONS:${NC}"
    echo -e "   1. ${GREEN}Working ESM Script${NC} (Latest - Tested and working)"
    echo -e "   2. ${GREEN}ESM Fixed Script${NC} (Previous - Good compatibility)"
    echo -e "   3. ${YELLOW}ESM Original Script${NC} (Original version)"
    echo ""
    
    read -p "Choose ESM script (1 for Working, 2 for Fixed, 3 for Original): " esm_choice
    
    local script_name
    case $esm_choice in
        1)
            script_name="deploy-trezor-working.mjs"
            echo -e "${GREEN}Using Working ESM Script (Latest)${NC}"
            ;;
        2)
            script_name="deploy-trezor-esm-fixed.mjs"
            echo -e "${GREEN}Using ESM Fixed Script${NC}"
            ;;
        3)
            script_name="deploy-pure-trezor.mjs"
            echo -e "${YELLOW}Using ESM Original Script${NC}"
            ;;
        *)
            script_name="deploy-trezor-working.mjs"
            echo -e "${GREEN}Using Working ESM Script (Default)${NC}"
            ;;
    esac
    
    echo ""
    echo -e "${CYAN}✅ FIXED ISSUES:${NC}"
    echo -e "   • ✅ ES Module system compatibility"
    echo -e "   • ✅ TrezorConnect import handling"
    echo -e "   • ✅ Dynamic import fallbacks"
    echo -e "   • ✅ No CommonJS conflicts"
    echo ""
    
    echo -e "${YELLOW}📱 Ensure your Trezor is:${NC}"
    echo -e "   • Connected via USB"
    echo -e "   • Unlocked with PIN"
    echo -e "   • Ethereum app enabled"
    echo -e "   • Trezor Bridge/Suite running"
    echo ""
    
    read -p "Proceed with ESM deployment? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo -e "${YELLOW}Deployment cancelled${NC}"
        return
    fi
    
    echo -e "${CYAN}🚀 Executing ESM Trezor deployment...${NC}"
    echo ""
    
    # Check if script exists
    if [[ ! -f "scripts/$script_name" ]]; then
        echo -e "${RED}❌ Script not found: scripts/$script_name${NC}"
        return
    fi
    
    # Run the ESM deployment
    if node "scripts/$script_name"; then
        echo ""
        echo -e "${GREEN}🎉 ESM TREZOR DEPLOYMENT SUCCESSFUL!${NC}"
        echo ""
        echo -e "${CYAN}📋 Next Steps:${NC}"
        echo -e "1. ${YELLOW}Check deployment results file${NC}"
        echo -e "2. ${YELLOW}Verify contracts on BSCScan${NC}"
        echo -e "3. ${YELLOW}Update frontend configuration${NC}"
        echo -e "4. ${YELLOW}Test admin functions with Trezor${NC}"
        echo ""
    else
        echo ""
        echo -e "${RED}❌ ESM DEPLOYMENT FAILED${NC}"
        echo -e "${YELLOW}Try the other ESM script or web interface${NC}"
    fi
}

deploy_hardhat_trezor() {
    echo -e "${BLUE}⚡ Starting Hardhat Trezor Deployment...${NC}"
    echo ""
    echo -e "${CYAN}Using Hardhat with Trezor configuration${NC}"
    echo ""
    
    read -p "Proceed with Hardhat deployment? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo -e "${YELLOW}Deployment cancelled${NC}"
        return
    fi
    
    echo -e "${CYAN}🚀 Executing Hardhat deployment...${NC}"
    echo ""
    
    # Run Hardhat deployment with explicit config
    if npx hardhat run scripts/deploy-secure-with-trezor-transfer.cjs --config hardhat.config.cjs --network bsc; then
        echo ""
        echo -e "${GREEN}🎉 HARDHAT DEPLOYMENT SUCCESSFUL!${NC}"
    else
        echo ""
        echo -e "${RED}❌ HARDHAT DEPLOYMENT FAILED${NC}"
        echo -e "${YELLOW}Check error messages above${NC}"
    fi
}

deploy_web_interface() {
    echo -e "${YELLOW}🌐 Starting Web Interface Deployment...${NC}"
    echo ""
    
    if [[ -f "direct-trezor-deployment.html" ]]; then
        echo -e "${CYAN}Opening web interface...${NC}"
        open "direct-trezor-deployment.html" 2>/dev/null || echo "Please manually open: direct-trezor-deployment.html"
        echo ""
        echo -e "${CYAN}📋 Web Interface Instructions:${NC}"
        echo -e "1. Click 'Connect Trezor Device' in the browser"
        echo -e "2. Confirm address matches: ${TREZOR_ADDRESS}"
        echo -e "3. Follow deployment steps in browser"
        echo -e "4. Confirm each transaction on Trezor device"
    else
        echo -e "${RED}❌ Web interface file not found${NC}"
    fi
}

deploy_legacy_launcher() {
    echo -e "${PURPLE}🔧 Starting Legacy Launcher...${NC}"
    echo ""
    
    if [[ -f "direct-trezor-launcher.sh" ]]; then
        ./direct-trezor-launcher.sh
    else
        echo -e "${RED}❌ Legacy launcher not found${NC}"
    fi
}

check_balance() {
    echo -e "${BLUE}💰 Checking Trezor wallet balance...${NC}"
    local balance=$(curl -s "https://api.bscscan.com/api?module=account&action=balance&address=${TREZOR_ADDRESS}&tag=latest&apikey=2BJRP9B7BQB6YTHHHM4FJGH48BK3QN732Q" | grep -o '"result":"[^"]*"' | cut -d'"' -f4 | awk '{printf "%.6f", $1/1000000000000000000}' 2>/dev/null || echo "0")
    
    if [[ -n "$balance" && "$balance" != "0" ]]; then
        echo -e "${GREEN}✅ Balance: ${balance} BNB${NC}"
        if (( $(echo "$balance >= 0.1" | bc -l 2>/dev/null || echo 0) )); then
            echo -e "${GREEN}✅ Sufficient for deployment${NC}"
        else
            echo -e "${YELLOW}⚠️  Low balance - need at least 0.1 BNB${NC}"
        fi
    else
        echo -e "${RED}❌ Unable to check balance or zero balance${NC}"
    fi
    echo ""
}

main() {
    print_header
    check_balance
    
    while true; do
        show_deployment_methods
        read -p "Enter your choice (1-5): " choice
        echo ""
        
        case $choice in
            1)
                deploy_esm_trezor
                ;;
            2)
                deploy_hardhat_trezor
                ;;
            3)
                deploy_web_interface
                ;;
            4)
                deploy_legacy_launcher
                ;;
            5)
                echo -e "${GREEN}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid choice. Please enter 1-5.${NC}"
                echo ""
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
        echo ""
    done
}

# Run main function
main
