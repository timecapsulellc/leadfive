#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════════════════╗
# ║                  🔐 DIRECT TREZOR DEPLOYMENT LAUNCHER 🔐                              ║
# ║                                                                                       ║
# ║  Deploy OrphiCrowdFund contracts directly from Trezor hardware wallet                ║
# ║  with zero private key exposure. Maximum security deployment.                         ║
# ║                                                                                       ║
# ╚═══════════════════════════════════════════════════════════════════════════════════════╝

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
TREZOR_ADDRESS="0xeB652c4523f3Cf615D3F3694b14E551145953aD0"

print_header() {
    echo ""
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                  🔐 DIRECT TREZOR DEPLOYMENT LAUNCHER 🔐                              ║${NC}"
    echo -e "${PURPLE}║                                                                                       ║${NC}"
    echo -e "${PURPLE}║  Zero Private Keys • Maximum Security • Hardware Wallet Only                         ║${NC}"
    echo -e "${PURPLE}║  Trezor Address: ${TREZOR_ADDRESS}           ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

check_prerequisites() {
    echo -e "${CYAN}🔍 Checking prerequisites...${NC}"
    
    # Check if we're in the right directory
    if [[ ! -f "hardhat.config.js" && ! -f "hardhat.config.cjs" ]]; then
        echo -e "${RED}❌ Error: Not in OrphiCrowdFund project directory${NC}"
        echo -e "${YELLOW}Please run this script from the OrphiCrowdFund project root${NC}"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found. Please install Node.js${NC}"
        exit 1
    fi
    
    # Check npm packages
    if [[ ! -d "node_modules" ]]; then
        echo -e "${YELLOW}⚠️  Installing npm packages...${NC}"
        npm install
    fi
    
    # Check Trezor packages
    if ! node -e "require('@trezor/connect')" &> /dev/null; then
        echo -e "${YELLOW}⚠️  Installing Trezor packages...${NC}"
        npm install @trezor/connect @trezor/connect-web
    fi
    
    # Check contract artifacts
    if [[ ! -d "artifacts" ]]; then
        echo -e "${YELLOW}⚠️  Compiling contracts...${NC}"
        npx hardhat compile
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
    echo ""
}

check_trezor_connection() {
    echo -e "${CYAN}🔐 Checking Trezor connection...${NC}"
    echo -e "${YELLOW}Please ensure:${NC}"
    echo -e "   • Trezor device is connected via USB"
    echo -e "   • Trezor is unlocked with PIN"
    echo -e "   • Trezor Bridge or Trezor Suite is running"
    echo -e "   • Trezor has BSC (BNB Smart Chain) enabled"
    echo ""
    
    read -p "Is your Trezor connected and ready? (y/N): " trezor_ready
    if [[ $trezor_ready != [yY] ]]; then
        echo -e "${RED}❌ Please connect and prepare your Trezor device${NC}"
        echo ""
        echo -e "${CYAN}Trezor Setup Instructions:${NC}"
        echo -e "1. Connect Trezor via USB"
        echo -e "2. Open Trezor Suite or ensure Trezor Bridge is running"
        echo -e "3. Unlock device with PIN"
        echo -e "4. Enable BSC/Ethereum app on Trezor"
        echo -e "5. Ensure device shows address: ${TREZOR_ADDRESS}"
        exit 1
    fi
}

show_deployment_options() {
    echo -e "${CYAN}🚀 Choose your deployment method:${NC}"
    echo ""
    echo -e "${GREEN}1. 🔐 Direct Trezor Node.js Deployment (Recommended)${NC}"
    echo -e "   • Pure Node.js script with Trezor Connect"
    echo -e "   • No browser required"
    echo -e "   • Fastest and most reliable"
    echo -e "   • Every transaction confirmed on Trezor device"
    echo ""
    echo -e "${BLUE}2. 🌐 Web Interface Trezor Deployment${NC}"
    echo -e "   • Browser-based interface"
    echo -e "   • Visual deployment progress"
    echo -e "   • Good for monitoring deployment steps"
    echo ""
    echo -e "${PURPLE}3. 📋 Manual Trezor Setup Guide${NC}"
    echo -e "   • Step-by-step instructions"
    echo -e "   • Custom deployment methods"
    echo -e "   • Advanced configuration options"
    echo ""
    echo -e "${YELLOW}4. 🔍 Pre-deployment System Check${NC}"
    echo -e "   • Verify all requirements"
    echo -e "   • Test Trezor connectivity"
    echo -e "   • Check contract compilation"
    echo ""
    echo -e "${RED}5. Exit${NC}"
    echo ""
}

deploy_nodejs_trezor() {
    echo -e "${GREEN}🔐 Starting Direct Trezor Node.js Deployment...${NC}"
    echo ""
    echo -e "${CYAN}Deployment Overview:${NC}"
    echo -e "• Method: Direct Trezor Connect via Node.js"
    echo -e "• Security: Zero private keys exposed"
    echo -e "• Deployment Address: ${TREZOR_ADDRESS}"
    echo -e "• Network: BSC Mainnet"
    echo -e "• Contracts: OrphiCrowdFund + InternalAdminManager"
    echo ""
    
    echo -e "${YELLOW}⚠️  Important Notes:${NC}"
    echo -e "   • Each transaction requires physical confirmation on Trezor"
    echo -e "   • Keep Trezor connected throughout deployment"
    echo -e "   • Deployment may take 10-15 minutes"
    echo -e "   • Do not disconnect or interrupt the process"
    echo ""
    
    read -p "Proceed with Direct Trezor deployment? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        echo -e "${YELLOW}Deployment cancelled${NC}"
        return
    fi
    
    echo -e "${CYAN}🔥 Executing Direct Trezor deployment...${NC}"
    echo ""
    
    # Run the direct Trezor deployment
    if node scripts/deploy-pure-trezor.mjs; then
        echo ""
        echo -e "${GREEN}🎉 DIRECT TREZOR DEPLOYMENT SUCCESSFUL!${NC}"
        echo ""
        echo -e "${CYAN}📋 Next Steps:${NC}"
        echo -e "1. ${YELLOW}Verify contracts on BSCScan${NC}"
        echo -e "2. ${YELLOW}Update frontend with new contract addresses${NC}"
        echo -e "3. ${YELLOW}Test admin functions with Trezor wallet${NC}"
        echo -e "4. ${YELLOW}Update documentation${NC}"
        echo ""
        
        if [[ -f "DIRECT_TREZOR_DEPLOYMENT_"*.json ]]; then
            local results_file=$(ls -t DIRECT_TREZOR_DEPLOYMENT_*.json | head -n1)
            echo -e "${CYAN}📄 Deployment details saved to: ${results_file}${NC}"
        fi
        
    else
        echo ""
        echo -e "${RED}❌ DIRECT TREZOR DEPLOYMENT FAILED${NC}"
        echo -e "${YELLOW}Please check the error messages above and try again${NC}"
        echo ""
        echo -e "${CYAN}Common Issues:${NC}"
        echo -e "• Trezor device disconnected during deployment"
        echo -e "• User cancelled transaction on Trezor"
        echo -e "• Insufficient BNB balance for gas fees"
        echo -e "• Network connectivity issues"
    fi
}

deploy_web_interface() {
    echo -e "${BLUE}🌐 Starting Web Interface Trezor Deployment...${NC}"
    echo ""
    
    # Check if the HTML file exists
    if [[ ! -f "direct-trezor-deployment.html" ]]; then
        echo -e "${RED}❌ Web interface file not found${NC}"
        return
    fi
    
    echo -e "${CYAN}Opening Trezor deployment interface in browser...${NC}"
    
    # Try to open in default browser
    if command -v open &> /dev/null; then
        open "direct-trezor-deployment.html"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "direct-trezor-deployment.html"
    else
        echo -e "${YELLOW}Please manually open: direct-trezor-deployment.html${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}📋 Web Interface Instructions:${NC}"
    echo -e "1. Browser should open with Trezor deployment interface"
    echo -e "2. Click 'Connect Trezor Device' button"
    echo -e "3. Confirm address on Trezor matches expected address"
    echo -e "4. Follow the step-by-step deployment process"
    echo -e "5. Confirm each transaction on your Trezor device"
    echo ""
}

show_manual_guide() {
    echo -e "${PURPLE}📋 Manual Trezor Setup Guide${NC}"
    echo ""
    echo -e "${YELLOW}Available Documentation:${NC}"
    echo -e "   • TREZOR_DEPLOYMENT_INSTRUCTIONS.md"
    echo -e "   • FINAL_DEPLOYMENT_GUIDE.md"
    echo -e "   • hardhat.config.trezor.js (Hardhat config)"
    echo ""
    
    if command -v open &> /dev/null; then
        read -p "Open documentation files? (y/N): " open_docs
        if [[ $open_docs == [yY] ]]; then
            if [[ -f "TREZOR_DEPLOYMENT_INSTRUCTIONS.md" ]]; then
                open "TREZOR_DEPLOYMENT_INSTRUCTIONS.md"
            fi
            if [[ -f "FINAL_DEPLOYMENT_GUIDE.md" ]]; then
                open "FINAL_DEPLOYMENT_GUIDE.md"
            fi
        fi
    else
        echo -e "${YELLOW}Please manually open the documentation files listed above${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}Manual Deployment Options:${NC}"
    echo -e "1. Use Hardhat with Trezor configuration"
    echo -e "2. Use custom deployment scripts"
    echo -e "3. Use Trezor Suite integration"
    echo -e "4. Use web3.js with Trezor Connect"
    echo ""
}

run_system_check() {
    echo -e "${YELLOW}🔍 Running comprehensive system check...${NC}"
    echo ""
    
    local all_checks_passed=true
    
    # Check Node.js version
    echo -e "${CYAN}📦 Checking Node.js version...${NC}"
    local node_version=$(node --version)
    echo -e "   Node.js version: ${node_version}"
    
    # Check npm packages
    echo -e "${CYAN}📦 Checking npm packages...${NC}"
    if npm list @trezor/connect &> /dev/null; then
        echo -e "   ✅ @trezor/connect installed"
    else
        echo -e "   ❌ @trezor/connect missing"
        all_checks_passed=false
    fi
    
    if npm list @trezor/connect-web &> /dev/null; then
        echo -e "   ✅ @trezor/connect-web installed"
    else
        echo -e "   ❌ @trezor/connect-web missing"
        all_checks_passed=false
    fi
    
    # Check contract compilation
    echo -e "${CYAN}📋 Checking contract compilation...${NC}"
    if [[ -f "artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json" ]]; then
        echo -e "   ✅ OrphiCrowdFund compiled"
    else
        echo -e "   ❌ OrphiCrowdFund not compiled"
        all_checks_passed=false
    fi
    
    if [[ -f "artifacts/contracts/modules/InternalAdminManager.sol/InternalAdminManager.json" ]]; then
        echo -e "   ✅ InternalAdminManager compiled"
    else
        echo -e "   ❌ InternalAdminManager not compiled"
        all_checks_passed=false
    fi
    
    # Check network connectivity
    echo -e "${CYAN}🌐 Checking BSC network connectivity...${NC}"
    if curl -s --max-time 5 https://bsc-dataseed.binance.org/ > /dev/null; then
        echo -e "   ✅ BSC Mainnet accessible"
    else
        echo -e "   ❌ BSC Mainnet connection failed"
        all_checks_passed=false
    fi
    
    # Test Trezor Connect initialization
    echo -e "${CYAN}🔐 Testing Trezor Connect...${NC}"
    if node -e "
        const TrezorConnect = require('@trezor/connect').default;
        TrezorConnect.init({
            lazyLoad: true,
            manifest: { email: 'test@example.com', appUrl: 'https://test.com' }
        }).then(() => {
            console.log('   ✅ Trezor Connect initialization successful');
            process.exit(0);
        }).catch(error => {
            console.log('   ❌ Trezor Connect initialization failed:', error.message);
            process.exit(1);
        });
    " 2>/dev/null; then
        true # Success message already printed
    else
        echo -e "   ❌ Trezor Connect test failed"
        all_checks_passed=false
    fi
    
    echo ""
    if $all_checks_passed; then
        echo -e "${GREEN}✅ ALL SYSTEM CHECKS PASSED${NC}"
        echo -e "${GREEN}✅ System ready for Trezor deployment${NC}"
    else
        echo -e "${RED}❌ SOME SYSTEM CHECKS FAILED${NC}"
        echo -e "${YELLOW}Please fix the issues above before deployment${NC}"
        echo ""
        echo -e "${CYAN}Quick fixes:${NC}"
        echo -e "• Run: npm install @trezor/connect @trezor/connect-web"
        echo -e "• Run: npx hardhat compile"
        echo -e "• Check internet connection"
    fi
}

main() {
    print_header
    check_prerequisites
    check_trezor_connection
    
    while true; do
        show_deployment_options
        read -p "Enter your choice (1-5): " choice
        echo ""
        
        case $choice in
            1)
                deploy_nodejs_trezor
                ;;
            2)
                deploy_web_interface
                ;;
            3)
                show_manual_guide
                ;;
            4)
                run_system_check
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

# Run the main function
main
