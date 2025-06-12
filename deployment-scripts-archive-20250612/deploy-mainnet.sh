#!/bin/bash

# ORPHI CROWDFUND - MAINNET DEPLOYMENT SCRIPT
# ==========================================
# 
# This script executes the complete mainnet deployment process
# with comprehensive validation and error handling

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate environment
validate_environment() {
    print_status "Validating deployment environment..."
    
    # Check required commands
    if ! command_exists node; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command_exists npx; then
        print_error "npx is not installed"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run from project root directory."
        exit 1
    fi
    
    if [ ! -f "hardhat.mainnet.config.js" ]; then
        print_error "hardhat.mainnet.config.js not found"
        exit 1
    fi
    
    if [ ! -f ".env.mainnet.production" ]; then
        print_warning ".env.mainnet.production not found. Please configure environment variables."
    fi
    
    print_success "Environment validation completed"
}

# Function to check network connectivity
check_network() {
    print_status "Checking BSC Mainnet connectivity..."
    
    # Test network connection
    if ! curl -s --max-time 10 https://bsc-dataseed1.binance.org/ > /dev/null; then
        print_error "Cannot connect to BSC Mainnet RPC"
        exit 1
    fi
    
    print_success "BSC Mainnet connectivity confirmed"
}

# Function to validate deployer wallet
validate_wallet() {
    print_status "Validating deployer wallet..."
    
    # Check wallet balance using hardhat
    npx hardhat run scripts/get-wallet-address.js --network bscMainnet --config hardhat.mainnet.config.js
    
    if [ $? -ne 0 ]; then
        print_error "Wallet validation failed"
        exit 1
    fi
    
    print_success "Deployer wallet validated"
}

# Function to compile contracts
compile_contracts() {
    print_status "Compiling contracts for mainnet..."
    
    npx hardhat compile --config hardhat.mainnet.config.js
    
    if [ $? -ne 0 ]; then
        print_error "Contract compilation failed"
        exit 1
    fi
    
    print_success "Contracts compiled successfully"
}

# Function to run pre-deployment tests
run_tests() {
    print_status "Running final pre-deployment validation..."
    
    # Run the perfect testing script one more time to ensure everything is working
    npx hardhat run scripts/perfect-automated-testing-100-percent.js --network bscTestnet --config hardhat.bsc-testnet.config.js
    
    if [ $? -ne 0 ]; then
        print_error "Pre-deployment tests failed"
        exit 1
    fi
    
    print_success "Pre-deployment validation completed with 100% success"
}

# Function to deploy to mainnet
deploy_mainnet() {
    print_status "🚀 DEPLOYING TO BSC MAINNET..."
    print_warning "This will use REAL BNB for gas fees!"
    
    # Confirmation prompt
    read -p "Are you sure you want to deploy to mainnet? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_warning "Deployment cancelled by user"
        exit 0
    fi
    
    # Execute deployment
    npx hardhat run scripts/deploy-mainnet-production.js --network bscMainnet --config hardhat.mainnet.config.js
    
    if [ $? -ne 0 ]; then
        print_error "Mainnet deployment failed"
        exit 1
    fi
    
    print_success "🎉 MAINNET DEPLOYMENT COMPLETED!"
}

# Function to verify contract
verify_contract() {
    print_status "Verifying contract on BSCScan..."
    
    # Get contract address from deployment output
    if [ -z "$CONTRACT_ADDRESS" ]; then
        read -p "Enter the deployed contract address: " CONTRACT_ADDRESS
    fi
    
    if [ -z "$CONTRACT_ADDRESS" ]; then
        print_warning "Contract address not provided. Skipping verification."
        return
    fi
    
    # Verify contract
    npx hardhat run scripts/verify-mainnet-contract.js --network bscMainnet "$CONTRACT_ADDRESS"
    
    if [ $? -ne 0 ]; then
        print_warning "Contract verification failed, but deployment was successful"
    else
        print_success "Contract verified on BSCScan"
    fi
}

# Function to update frontend configuration
update_frontend() {
    print_status "Updating frontend configuration..."
    
    if [ -z "$CONTRACT_ADDRESS" ]; then
        read -p "Enter the deployed contract address for frontend update: " CONTRACT_ADDRESS
    fi
    
    if [ -z "$CONTRACT_ADDRESS" ]; then
        print_warning "Contract address not provided. Please update frontend manually."
        return
    fi
    
    # Update contracts.js if it exists
    if [ -f "src/contracts.js" ]; then
        print_status "Updating src/contracts.js with mainnet contract address..."
        # This would need to be customized based on your frontend structure
        print_warning "Please manually update src/contracts.js with address: $CONTRACT_ADDRESS"
    fi
    
    print_success "Frontend configuration update instructions provided"
}

# Function to generate deployment report
generate_report() {
    print_status "Generating deployment report..."
    
    REPORT_FILE="MAINNET_DEPLOYMENT_REPORT_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# ORPHI CROWDFUND - MAINNET DEPLOYMENT REPORT

## Deployment Information
- **Date:** $(date)
- **Network:** BSC Mainnet (Chain ID: 56)
- **Contract Address:** ${CONTRACT_ADDRESS:-"To be filled"}
- **Deployer:** $(npx hardhat run scripts/get-wallet-address.js --network bscMainnet --config hardhat.mainnet.config.js 2>/dev/null | grep "Address:" | cut -d' ' -f2 || echo "Unknown")

## Deployment Status
- ✅ Environment validated
- ✅ Network connectivity confirmed
- ✅ Wallet validated
- ✅ Contracts compiled
- ✅ Pre-deployment tests passed (100% success)
- ✅ Mainnet deployment completed
- ✅ Contract verification attempted
- ✅ Frontend update instructions provided

## Next Steps
1. 🔍 Verify contract on BSCScan: https://bscscan.com/address/${CONTRACT_ADDRESS:-"CONTRACT_ADDRESS"}
2. 🌐 Update frontend with new contract address
3. 🧪 Run mainnet validation tests
4. 📢 Announce mainnet launch
5. 🛡️  Set up monitoring and alerts

## Important Links
- **BSCScan:** https://bscscan.com/address/${CONTRACT_ADDRESS:-"CONTRACT_ADDRESS"}
- **Verified Code:** https://bscscan.com/address/${CONTRACT_ADDRESS:-"CONTRACT_ADDRESS"}#code
- **USDT Token:** https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955

## Security Reminders
- 🔐 Secure your deployer private key
- 🔒 Consider transferring ownership to multisig
- 📋 Document all admin functions
- 🛡️  Set up monitoring and alerts

---
*Generated by OrphiCrowdFund Mainnet Deployment Script*
EOF

    print_success "Deployment report generated: $REPORT_FILE"
}

# Main execution function
main() {
    echo "🚀 ORPHI CROWDFUND - MAINNET DEPLOYMENT"
    echo "======================================"
    echo ""
    
    # Execute deployment steps
    validate_environment
    check_network
    validate_wallet
    compile_contracts
    run_tests
    deploy_mainnet
    verify_contract
    update_frontend
    generate_report
    
    echo ""
    echo "🎉 MAINNET DEPLOYMENT PROCESS COMPLETED!"
    echo "========================================"
    echo ""
    print_success "Your OrphiCrowdFund platform is now live on BSC Mainnet!"
    
    if [ ! -z "$CONTRACT_ADDRESS" ]; then
        echo ""
        echo "📍 Contract Address: $CONTRACT_ADDRESS"
        echo "🔗 BSCScan: https://bscscan.com/address/$CONTRACT_ADDRESS"
        echo "📝 Verified Code: https://bscscan.com/address/$CONTRACT_ADDRESS#code"
    fi
    
    echo ""
    echo "🎯 IMMEDIATE NEXT STEPS:"
    echo "1. 🔍 Verify contract deployment on BSCScan"
    echo "2. 🌐 Update frontend configuration"
    echo "3. 🧪 Run comprehensive mainnet testing"
    echo "4. 📢 Announce mainnet launch to community"
    echo "5. 🛡️  Set up monitoring and alerts"
    echo ""
    echo "🚨 SECURITY REMINDERS:"
    echo "- Secure your deployer private key"
    echo "- Consider using multisig for admin functions"
    echo "- Set up monitoring and alerts"
    echo "- Document all procedures"
    echo ""
    print_success "Deployment completed successfully! 🎉"
}

# Execute main function
main "$@"
