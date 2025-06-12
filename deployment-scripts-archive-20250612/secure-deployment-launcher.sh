#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════════════════╗
# ║                    🔐 SECURE DEPLOYMENT LAUNCHER 🔐                                  ║
# ║                                                                                       ║
# ║  This script provides multiple secure deployment options for your                     ║
# ║  OrphiCrowdFund contracts with maximum security.                                      ║
# ║                                                                                       ║
# ╚═══════════════════════════════════════════════════════════════════════════════════════╝

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    🔐 SECURE DEPLOYMENT LAUNCHER 🔐                                  ║${NC}"
echo -e "${PURPLE}║                                                                                       ║${NC}"
echo -e "${PURPLE}║  Choose your preferred deployment method with maximum security                        ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${CYAN}🔐 DEPLOYMENT OPTIONS:${NC}"
echo ""
echo -e "${GREEN}1. 💻 Command Line + Temporary Private Key${NC}"
echo -e "   • Uses temporary private key (destroys after deployment)"
echo -e "   • All ownership immediately transferred to Trezor"
echo -e "   • Fast and automated"
echo -e "   • Requires 0.1 BNB in temporary wallet"
echo ""
echo -e "${GREEN}2. 🌐 Web Interface + MetaMask + Trezor${NC}"
echo -e "   • Maximum security with hardware wallet"
echo -e "   • No private keys ever stored"
echo -e "   • Requires MetaMask connected to Trezor"
echo -e "   • Manual confirmation for each transaction"
echo ""
echo -e "${GREEN}3. 📋 Manual Deployment Instructions${NC}"
echo -e "   • Step-by-step guide for custom setup"
echo -e "   • Use your own tools and methods"
echo -e "   • Maximum flexibility"
echo ""

# Function to check if MetaMask is available (for option 2)
check_metamask() {
    if command -v google-chrome &> /dev/null || command -v brave &> /dev/null || command -v firefox &> /dev/null; then
        return 0
    else
        echo -e "${YELLOW}⚠️  No supported browser found for MetaMask${NC}"
        return 1
    fi
}

# Function to check if private key is ready (for option 1)
check_private_key() {
    if grep -q "b367d8109b082413d2a23d69add6192d783d0f73bbfb3538f58cc5c28f7cd239" .env 2>/dev/null; then
        return 0
    else
        echo -e "${YELLOW}⚠️  Temporary private key not configured in .env${NC}"
        return 1
    fi
}

# Function to check wallet balance
check_balance() {
    local address="0x1AA54a6FaC73cdB09D7313Ef03060424662b26b1"
    echo -e "${BLUE}💰 Checking wallet balance...${NC}"
    
    # Use a simple curl command to check balance (BSC API)
    local balance_wei=$(curl -s "https://api.bscscan.com/api?module=account&action=balance&address=${address}&apikey=YourApiKeyToken" | grep -o '"result":"[^"]*' | cut -d'"' -f4)
    
    if [ ! -z "$balance_wei" ] && [ "$balance_wei" != "0" ]; then
        # Convert wei to BNB (divide by 10^18)
        local balance_bnb=$(echo "scale=4; $balance_wei / 1000000000000000000" | bc 2>/dev/null || echo "0")
        echo -e "${GREEN}✅ Wallet balance: ${balance_bnb} BNB${NC}"
        return 0
    else
        echo -e "${RED}❌ Wallet has insufficient balance${NC}"
        return 1
    fi
}

echo -e "${CYAN}Please choose an option (1-3):${NC}"
read -p "Enter your choice: " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}🔐 Option 1: Command Line Deployment${NC}"
        echo -e "${BLUE}═══════════════════════════════════════${NC}"
        echo ""
        
        # Check if temporary private key is configured
        if check_private_key; then
            echo -e "${GREEN}✅ Temporary private key configured${NC}"
            
            # Check balance
            if check_balance; then
                echo ""
                echo -e "${YELLOW}⚠️  This deployment will:${NC}"
                echo -e "   • Use temporary private key for initial deployment"
                echo -e "   • Transfer ALL ownership to your Trezor immediately"
                echo -e "   • Destroy the temporary key after deployment"
                echo -e "   • Cost ~0.05 BNB in gas fees"
                echo ""
                read -p "Do you want to proceed? (y/N): " confirm
                
                if [[ $confirm =~ ^[Yy]$ ]]; then
                    echo ""
                    echo -e "${GREEN}🚀 Starting secure deployment...${NC}"
                    
                    # Run pre-deployment checklist
                    echo -e "${BLUE}🔍 Running pre-deployment checklist...${NC}"
                    if ./pre-deployment-checklist.sh; then
                        echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"
                        
                        # Execute deployment
                        echo ""
                        echo -e "${GREEN}📦 Deploying contracts...${NC}"
                        npx hardhat run --network mainnet scripts/deploy-secure-with-trezor-transfer.cjs
                        
                        if [ $? -eq 0 ]; then
                            echo ""
                            echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
                            echo ""
                            echo -e "${YELLOW}📝 IMPORTANT: Next Steps${NC}"
                            echo -e "   1. Remove the temporary private key from .env"
                            echo -e "   2. Check SECURE_DEPLOYMENT_SUCCESS.json for contract addresses"
                            echo -e "   3. Verify contracts on BSCScan"
                            echo -e "   4. Test admin functions with your Trezor"
                            echo ""
                            
                            # Offer to clean up private key
                            read -p "Do you want to remove the temporary private key from .env now? (Y/n): " cleanup
                            if [[ ! $cleanup =~ ^[Nn]$ ]]; then
                                sed -i '' 's/DEPLOYER_PRIVATE_KEY=.*/DEPLOYER_PRIVATE_KEY=REMOVED_AFTER_DEPLOYMENT/' .env
                                echo -e "${GREEN}✅ Temporary private key removed from .env${NC}"
                            fi
                        else
                            echo -e "${RED}❌ Deployment failed. Check the logs above.${NC}"
                        fi
                    else
                        echo -e "${RED}❌ Pre-deployment checks failed${NC}"
                    fi
                else
                    echo -e "${YELLOW}Deployment cancelled.${NC}"
                fi
            else
                echo -e "${RED}❌ Please fund the temporary wallet with 0.1 BNB:${NC}"
                echo -e "${YELLOW}   Address: 0x1AA54a6FaC73cdB09D7313Ef03060424662b26b1${NC}"
            fi
        else
            echo -e "${RED}❌ Temporary private key not found in .env${NC}"
            echo -e "${YELLOW}   The temporary key was generated earlier. Please check your .env file.${NC}"
        fi
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}🌐 Option 2: Web Interface Deployment${NC}"
        echo -e "${BLUE}═══════════════════════════════════════${NC}"
        echo ""
        
        if check_metamask; then
            echo -e "${GREEN}✅ Browser detected${NC}"
            echo ""
            echo -e "${YELLOW}📋 Setup Instructions:${NC}"
            echo -e "   1. Install MetaMask browser extension if not installed"
            echo -e "   2. Connect your Trezor to MetaMask"
            echo -e "   3. Switch to BSC Mainnet in MetaMask"
            echo -e "   4. Ensure your Trezor has 0.1 BNB"
            echo ""
            read -p "Press Enter to open the web interface..."
            
            # Open the web interface
            if command -v open &> /dev/null; then
                open trezor-deployment-interface.html
            elif command -v xdg-open &> /dev/null; then
                xdg-open trezor-deployment-interface.html
            else
                echo -e "${YELLOW}Please manually open: trezor-deployment-interface.html${NC}"
            fi
            
            echo ""
            echo -e "${GREEN}🔐 Web interface opened! Follow the steps in your browser.${NC}"
        else
            echo -e "${RED}❌ No supported browser found${NC}"
            echo -e "${YELLOW}Please install Chrome, Brave, or Firefox to use MetaMask${NC}"
        fi
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}📋 Option 3: Manual Deployment${NC}"
        echo -e "${BLUE}═══════════════════════════════════════${NC}"
        echo ""
        echo -e "${GREEN}📖 Opening deployment guides...${NC}"
        
        # Show available guides
        echo ""
        echo -e "${CYAN}Available Documentation:${NC}"
        echo -e "   • TREZOR_DEPLOYMENT_INSTRUCTIONS.md"
        echo -e "   • TREZOR_DEPLOYMENT_OPTIONS.md"
        echo -e "   • FINAL_DEPLOYMENT_GUIDE.md"
        echo ""
        
        if command -v open &> /dev/null; then
            open TREZOR_DEPLOYMENT_INSTRUCTIONS.md
        elif command -v code &> /dev/null; then
            code TREZOR_DEPLOYMENT_INSTRUCTIONS.md
        else
            echo -e "${YELLOW}Please manually open: TREZOR_DEPLOYMENT_INSTRUCTIONS.md${NC}"
        fi
        ;;
        
    *)
        echo ""
        echo -e "${RED}❌ Invalid option. Please run the script again and choose 1, 2, or 3.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}                    🔐 SECURE DEPLOYMENT LAUNCHER COMPLETE 🔐${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════════════════${NC}"
