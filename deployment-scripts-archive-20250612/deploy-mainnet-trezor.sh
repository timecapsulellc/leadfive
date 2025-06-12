#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════════════════╗
# ║                                                                                       ║
# ║    ██████╗ ██████╗ ██████╗ ██╗  ██╗██╗     ██████╗██╗  ██╗ █████╗ ██╗███╗   ██╗    ║
# ║   ██╔═══██╗██╔══██╗██╔══██╗██║  ██║██║    ██╔════╝██║  ██║██╔══██╗██║████╗  ██║    ║
# ║   ██║   ██║██████╔╝██████╔╝███████║██║    ██║     ███████║███████║██║██╔██╗ ██║    ║
# ║   ██║   ██║██╔══██╗██╔═══╝ ██╔══██║██║    ██║     ██╔══██║██╔══██║██║██║╚██╗██║    ║
# ║   ╚██████╔╝██║  ██║██║     ██║  ██║██║    ╚██████╗██║  ██║██║  ██║██║██║ ╚████║    ║
# ║    ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝     ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝    ║
# ║                                                                                       ║
# ║                    ◆ TREZOR MAINNET DEPLOYMENT SCRIPT ◆                              ║
# ║                  ◇ Gas-Optimized Hardware Wallet Deployment ◇                       ║
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

# Configuration
CONTRACT_NAME="OrphichainCrowdfundPlatformUpgradeable"
NETWORK="bscMainnet"
CONFIG_FILE="hardhat.mainnet.trezor.config.js"
ENV_FILE=".env.mainnet.production"

# Functions
print_header() {
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                                                                                      ║${NC}"
    echo -e "${PURPLE}║                    🚀 ORPHICHAIN MAINNET DEPLOYMENT 🚀                              ║${NC}"
    echo -e "${PURPLE}║                          Trezor Hardware Wallet                                     ║${NC}"
    echo -e "${PURPLE}║                                                                                      ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}📋 $1${NC}"
    echo -e "${BLUE}────────────────────────────────────────────────────────────────────────────────────${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_requirements() {
    print_step "CHECKING REQUIREMENTS"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v16 or higher."
        exit 1
    fi
    print_success "Node.js is installed: $(node --version)"
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    print_success "npm is installed: $(npm --version)"
    
    # Check if hardhat is available
    if ! npx hardhat --version &> /dev/null; then
        print_error "Hardhat is not available. Please run 'npm install' first."
        exit 1
    fi
    print_success "Hardhat is available"
    
    # Check if config file exists
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Configuration file $CONFIG_FILE not found."
        exit 1
    fi
    print_success "Configuration file found: $CONFIG_FILE"
    
    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file $ENV_FILE not found."
        exit 1
    fi
    print_success "Environment file found: $ENV_FILE"
    
    echo ""
}

run_pre_deployment_checks() {
    print_step "PRE-DEPLOYMENT SECURITY CHECKS"
    
    echo -e "${YELLOW}Running comprehensive security validation...${NC}"
    if npx hardhat pre-deploy-check --config "$CONFIG_FILE"; then
        print_success "All pre-deployment checks passed!"
    else
        print_error "Pre-deployment checks failed. Please resolve issues before continuing."
        exit 1
    fi
    echo ""
}

estimate_gas_costs() {
    print_step "GAS COST ESTIMATION"
    
    echo -e "${YELLOW}Analyzing current gas prices and estimating deployment costs...${NC}"
    if npx hardhat estimate-gas --contract "$CONTRACT_NAME" --config "$CONFIG_FILE"; then
        print_success "Gas estimation completed!"
    else
        print_warning "Gas estimation failed, but continuing with deployment..."
    fi
    echo ""
}

compile_contracts() {
    print_step "CONTRACT COMPILATION"
    
    echo -e "${YELLOW}Compiling contracts with gas optimization...${NC}"
    if npx hardhat compile --config "$CONFIG_FILE"; then
        print_success "Contracts compiled successfully!"
    else
        print_error "Contract compilation failed."
        exit 1
    fi
    echo ""
}

confirm_deployment() {
    print_step "DEPLOYMENT CONFIRMATION"
    
    echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
    echo -e "   • Contract: ${GREEN}$CONTRACT_NAME${NC}"
    echo -e "   • Network: ${GREEN}$NETWORK${NC}"
    echo -e "   • Config: ${GREEN}$CONFIG_FILE${NC}"
    echo -e "   • Environment: ${GREEN}$ENV_FILE${NC}"
    echo ""
    
    echo -e "${YELLOW}🔐 Hardware Wallet Requirements:${NC}"
    echo -e "   • Trezor device connected and unlocked"
    echo -e "   • Sufficient BNB balance (minimum 0.2 BNB)"
    echo -e "   • Transaction confirmation on device"
    echo ""
    
    echo -e "${RED}⚠️  IMPORTANT WARNINGS:${NC}"
    echo -e "   • This will deploy to BSC MAINNET with real funds"
    echo -e "   • Ensure your Trezor device is secure and authentic"
    echo -e "   • Double-check all transaction details on device screen"
    echo -e "   • Keep your recovery seed phrase secure"
    echo ""
    
    read -p "$(echo -e ${YELLOW}Are you ready to proceed with mainnet deployment? [y/N]: ${NC})" -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled by user."
        exit 0
    fi
    echo ""
}

deploy_contract() {
    print_step "MAINNET DEPLOYMENT"
    
    echo -e "${YELLOW}🚀 Starting deployment to BSC Mainnet...${NC}"
    echo -e "${YELLOW}📱 Please confirm the transaction on your Trezor device when prompted.${NC}"
    echo ""
    
    # Run the deployment
    if npx hardhat deploy-trezor \
        --contract "$CONTRACT_NAME" \
        --verify true \
        --network "$NETWORK" \
        --config "$CONFIG_FILE"; then
        print_success "Contract deployed successfully!"
    else
        print_error "Deployment failed. Check the error messages above."
        exit 1
    fi
    echo ""
}

post_deployment_tasks() {
    print_step "POST-DEPLOYMENT TASKS"
    
    echo -e "${YELLOW}📋 Recommended next steps:${NC}"
    echo -e "   1. ✅ Verify contract on BSCScan (if not done automatically)"
    echo -e "   2. 🔄 Update frontend configuration with new contract address"
    echo -e "   3. 🧪 Run integration tests against mainnet contract"
    echo -e "   4. 🛡️  Transfer admin rights to multi-signature wallet"
    echo -e "   5. 📊 Set up monitoring and alerts"
    echo -e "   6. 🚀 Begin user onboarding and marketing"
    echo ""
    
    echo -e "${YELLOW}🔒 Security reminders:${NC}"
    echo -e "   • Keep your Trezor device secure"
    echo -e "   • Backup deployment information"
    echo -e "   • Monitor contract activity"
    echo -e "   • Set up emergency procedures"
    echo ""
    
    print_success "Deployment process completed!"
}

show_help() {
    echo "ORPHICHAIN TREZOR MAINNET DEPLOYMENT SCRIPT"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -c, --contract NAME     Contract name to deploy (default: $CONTRACT_NAME)"
    echo "  -n, --network NAME      Network to deploy to (default: $NETWORK)"
    echo "  --config FILE           Hardhat config file (default: $CONFIG_FILE)"
    echo "  --env FILE              Environment file (default: $ENV_FILE)"
    echo "  --skip-checks           Skip pre-deployment checks (not recommended)"
    echo "  --skip-gas-estimate     Skip gas estimation"
    echo "  --auto-confirm          Skip deployment confirmation (dangerous)"
    echo ""
    echo "Examples:"
    echo "  $0                      # Standard deployment"
    echo "  $0 --skip-gas-estimate  # Skip gas estimation"
    echo "  $0 --help               # Show this help"
    echo ""
}

# Parse command line arguments
SKIP_CHECKS=false
SKIP_GAS_ESTIMATE=false
AUTO_CONFIRM=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--contract)
            CONTRACT_NAME="$2"
            shift 2
            ;;
        -n|--network)
            NETWORK="$2"
            shift 2
            ;;
        --config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        --env)
            ENV_FILE="$2"
            shift 2
            ;;
        --skip-checks)
            SKIP_CHECKS=true
            shift
            ;;
        --skip-gas-estimate)
            SKIP_GAS_ESTIMATE=true
            shift
            ;;
        --auto-confirm)
            AUTO_CONFIRM=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information."
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_header
    
    check_requirements
    
    if [ "$SKIP_CHECKS" = false ]; then
        run_pre_deployment_checks
    else
        print_warning "Skipping pre-deployment checks (not recommended)"
    fi
    
    if [ "$SKIP_GAS_ESTIMATE" = false ]; then
        estimate_gas_costs
    else
        print_warning "Skipping gas estimation"
    fi
    
    compile_contracts
    
    if [ "$AUTO_CONFIRM" = false ]; then
        confirm_deployment
    else
        print_warning "Auto-confirming deployment (dangerous)"
    fi
    
    deploy_contract
    
    post_deployment_tasks
    
    echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${NC}"
    echo -e "${PURPLE}Your OrphiChain CrowdFund Platform is now live on BSC Mainnet!${NC}"
}

# Run main function
main "$@"
