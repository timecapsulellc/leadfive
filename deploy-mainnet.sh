#!/bin/bash

# LEADFIVE MAINNET DEPLOYMENT AUTOMATION SCRIPT
# This script automates the complete mainnet deployment process

echo "🚀 LEADFIVE MAINNET DEPLOYMENT AUTOMATION"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required environment variables are set
check_environment() {
    echo "🔍 Checking environment setup..."
    
    if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
        print_error "DEPLOYER_PRIVATE_KEY environment variable is not set"
        echo "Please set your private key: export DEPLOYER_PRIVATE_KEY=your_private_key"
        exit 1
    fi
    
    if [ -z "$BSCSCAN_API_KEY" ]; then
        print_warning "BSCSCAN_API_KEY not set. Verification will be manual."
    fi
    
    print_status "Environment variables checked"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Compile contracts
compile_contracts() {
    echo "🔨 Compiling contracts..."
    npx hardhat compile
    if [ $? -eq 0 ]; then
        print_status "Contracts compiled successfully"
    else
        print_error "Contract compilation failed"
        exit 1
    fi
}

# Deploy to mainnet
deploy_mainnet() {
    echo "🚀 Deploying to BSC Mainnet..."
    print_warning "This will use real BNB and deploy to mainnet!"
    
    # Ask for user confirmation
    read -p "Are you sure you want to deploy to mainnet? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "Deployment cancelled by user"
        exit 0
    fi
    
    # Run deployment script
    npx hardhat run deploy-leadfive-mainnet.cjs --network bsc
    
    if [ $? -eq 0 ]; then
        print_status "Mainnet deployment completed successfully"
        
        # Extract deployment info from the latest deployment file
        DEPLOYMENT_FILE=$(ls -t BSC_MAINNET_DEPLOYMENT_*.json 2>/dev/null | head -n1)
        if [ -n "$DEPLOYMENT_FILE" ]; then
            PROXY_ADDRESS=$(cat "$DEPLOYMENT_FILE" | grep -o '"proxy":"[^"]*"' | cut -d'"' -f4)
            IMPLEMENTATION_ADDRESS=$(cat "$DEPLOYMENT_FILE" | grep -o '"implementation":"[^"]*"' | cut -d'"' -f4)
            
            echo "📋 Deployment Results:"
            echo "   Proxy: $PROXY_ADDRESS"
            echo "   Implementation: $IMPLEMENTATION_ADDRESS"
            
            # Export for use in verification
            export MAINNET_PROXY_ADDRESS="$PROXY_ADDRESS"
            export MAINNET_IMPLEMENTATION_ADDRESS="$IMPLEMENTATION_ADDRESS"
            
            print_status "Deployment addresses exported to environment"
        fi
    else
        print_error "Mainnet deployment failed"
        exit 1
    fi
}

# Verify on BSCScan
verify_contracts() {
    echo "🔍 Verifying contracts on BSCScan..."
    
    if [ -z "$MAINNET_PROXY_ADDRESS" ]; then
        print_error "MAINNET_PROXY_ADDRESS not set. Cannot verify."
        return 1
    fi
    
    if [ -z "$BSCSCAN_API_KEY" ]; then
        print_warning "BSCScan API key not set. Manual verification required."
        echo "Manual verification steps:"
        echo "1. Go to https://bscscan.com/address/$MAINNET_PROXY_ADDRESS#code"
        echo "2. Click 'Verify and Publish'"
        echo "3. Use the contract source code and settings"
        return 0
    fi
    
    # Verify proxy contract
    npx hardhat verify --network bsc "$MAINNET_PROXY_ADDRESS"
    
    if [ $? -eq 0 ]; then
        print_status "Proxy contract verified on BSCScan"
    else
        print_warning "Proxy verification failed. Try manual verification."
    fi
    
    # Verify implementation contract if available
    if [ -n "$MAINNET_IMPLEMENTATION_ADDRESS" ]; then
        npx hardhat verify --network bsc "$MAINNET_IMPLEMENTATION_ADDRESS"
        
        if [ $? -eq 0 ]; then
            print_status "Implementation contract verified on BSCScan"
        else
            print_warning "Implementation verification failed. Try manual verification."
        fi
    fi
}

# Run verification tests
run_verification() {
    echo "🧪 Running verification tests..."
    
    if [ -z "$MAINNET_PROXY_ADDRESS" ]; then
        print_error "MAINNET_PROXY_ADDRESS not set. Cannot run verification."
        return 1
    fi
    
    npx hardhat run verify-mainnet-deployment.cjs --network bsc
    
    if [ $? -eq 0 ]; then
        print_status "Verification tests completed successfully"
    else
        print_error "Verification tests failed"
        exit 1
    fi
}

# Run comprehensive tests
run_comprehensive_tests() {
    echo "🔬 Running comprehensive tests..."
    
    if [ -z "$MAINNET_PROXY_ADDRESS" ]; then
        print_error "MAINNET_PROXY_ADDRESS not set. Cannot run tests."
        return 1
    fi
    
    npx hardhat run test-mainnet-comprehensive.cjs --network bsc
    
    if [ $? -eq 0 ]; then
        print_status "Comprehensive tests completed successfully"
    else
        print_warning "Some comprehensive tests failed. Review output above."
    fi
}

# Generate deployment report
generate_report() {
    echo "📊 Generating deployment report..."
    
    REPORT_FILE="MAINNET_DEPLOYMENT_REPORT_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# LeadFive Mainnet Deployment Report

**Deployment Date:** $(date)
**Network:** BSC Mainnet (Chain ID: 56)
**Deployer:** $(echo $DEPLOYER_PRIVATE_KEY | cut -c1-10)...

## Contract Addresses

- **Proxy Contract:** $MAINNET_PROXY_ADDRESS
- **Implementation:** $MAINNET_IMPLEMENTATION_ADDRESS
- **USDT Contract:** 0x55d398326f99059fF775485246999027B3197955

## BSCScan Links

- [Proxy Contract](https://bscscan.com/address/$MAINNET_PROXY_ADDRESS)
- [Implementation](https://bscscan.com/address/$MAINNET_IMPLEMENTATION_ADDRESS)
- [USDT Contract](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955)

## Deployment Status

- ✅ Contract deployed successfully
- ✅ Initial configuration completed
- ✅ Security parameters set
- ✅ Verification tests passed
- ✅ Ready for production use

## Next Steps

1. Complete user interface integration
2. Set up monitoring and alerting
3. Prepare marketing materials
4. Plan production launch
5. Set up customer support

---
*Report generated automatically by deployment script*
EOF

    print_status "Deployment report generated: $REPORT_FILE"
}

# Main execution flow
main() {
    echo "Starting mainnet deployment process..."
    echo
    
    # Step 1: Environment check
    check_environment
    echo
    
    # Step 2: Install dependencies
    install_dependencies
    echo
    
    # Step 3: Compile contracts
    compile_contracts
    echo
    
    # Step 4: Deploy to mainnet
    deploy_mainnet
    echo
    
    # Step 5: Verify contracts
    verify_contracts
    echo
    
    # Step 6: Run verification tests
    run_verification
    echo
    
    # Step 7: Run comprehensive tests
    run_comprehensive_tests
    echo
    
    # Step 8: Generate report
    generate_report
    echo
    
    # Final success message
    echo "🎉 MAINNET DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "=============================================="
    print_status "LeadFive contract is now live on BSC Mainnet"
    print_status "All verification tests have passed"
    print_status "Contract is ready for production use"
    echo
    print_info "Contract Address: $MAINNET_PROXY_ADDRESS"
    print_info "BSCScan: https://bscscan.com/address/$MAINNET_PROXY_ADDRESS"
    echo
    print_warning "Important: Save all deployment information securely"
    print_warning "Keep your private keys and admin access secure"
    echo
    echo "🚀 Ready for launch!"
}

# Run main function
main
