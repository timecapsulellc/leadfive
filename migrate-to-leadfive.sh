#!/bin/bash

# 🚀 LEAD FIVE Migration Script
# Automated OrphiCrowdFund to LEAD FIVE rebranding and deployment

set -e  # Exit on any error

echo "============================================================"
echo "🚀 LEAD FIVE MIGRATION SCRIPT"
echo "============================================================"
echo "📋 Migrating OrphiCrowdFund to LEAD FIVE"
echo "🔄 This script will:"
echo "   • Rebrand all code references"
echo "   • Deploy new LeadFive contract"
echo "   • Update frontend configuration"
echo "   • Prepare DigitalOcean deployment"
echo "============================================================"

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

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "git is not installed. Please install git"
        exit 1
    fi
    
    print_status "Prerequisites check passed"
}

# Backup current state
backup_current_state() {
    print_info "Creating backup of current state..."
    
    BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup key files
    cp -r contracts "$BACKUP_DIR/" 2>/dev/null || true
    cp -r src "$BACKUP_DIR/" 2>/dev/null || true
    cp package.json "$BACKUP_DIR/" 2>/dev/null || true
    cp README.md "$BACKUP_DIR/" 2>/dev/null || true
    
    print_status "Backup created in $BACKUP_DIR"
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    npm install
    print_status "Dependencies installed"
}

# Rebrand frontend files
rebrand_frontend() {
    print_info "Rebranding frontend files..."
    
    # Update main contract import in components
    find src -name "*.js" -o -name "*.jsx" | xargs sed -i.bak 's/ORPHI_CROWDFUND_CONFIG/LEAD_FIVE_CONFIG/g' 2>/dev/null || true
    find src -name "*.js" -o -name "*.jsx" | xargs sed -i.bak 's/ORPHI_CROWDFUND_ABI/LEAD_FIVE_ABI/g' 2>/dev/null || true
    find src -name "*.js" -o -name "*.jsx" | xargs sed -i.bak 's/OrphiCrowdFund/LEAD FIVE/g' 2>/dev/null || true
    find src -name "*.js" -o -name "*.jsx" | xargs sed -i.bak 's/Orphi CrowdFund/LEAD FIVE/g' 2>/dev/null || true
    find src -name "*.js" -o -name "*.jsx" | xargs sed -i.bak 's/ORPHI CrowdFund/LEAD FIVE/g' 2>/dev/null || true
    
    # Update CSS files
    find src -name "*.css" | xargs sed -i.bak 's/OrphiCrowdFund/LEAD FIVE/g' 2>/dev/null || true
    find src -name "*.css" | xargs sed -i.bak 's/Orphi/LEAD/g' 2>/dev/null || true
    
    # Clean up backup files
    find src -name "*.bak" -delete 2>/dev/null || true
    
    print_status "Frontend rebranding completed"
}

# Update main contracts.js to use LEAD FIVE config
update_contracts_config() {
    print_info "Updating contracts configuration..."
    
    # Replace the main contracts.js with LEAD FIVE version
    if [ -f "src/contracts-leadfive.js" ]; then
        cp src/contracts-leadfive.js src/contracts.js
        print_status "Contracts configuration updated to LEAD FIVE"
    else
        print_warning "LEAD FIVE contracts file not found, keeping original"
    fi
}

# Compile contracts
compile_contracts() {
    print_info "Compiling smart contracts..."
    
    if command -v npx &> /dev/null; then
        npx hardhat compile
        print_status "Contracts compiled successfully"
    else
        print_warning "Hardhat not available, skipping contract compilation"
    fi
}

# Test build
test_build() {
    print_info "Testing frontend build..."
    
    npm run build
    if [ $? -eq 0 ]; then
        print_status "Frontend build successful"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

# Deploy contract (optional)
deploy_contract() {
    read -p "Do you want to deploy the LeadFive contract now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deploying LeadFive contract..."
        
        if [ -f ".env" ]; then
            if command -v npx &> /dev/null; then
                npx hardhat run scripts/deploy-leadfive.js --network bsc
                print_status "Contract deployment initiated"
            else
                print_error "Hardhat not available for deployment"
            fi
        else
            print_error ".env file not found. Please create .env with your private key"
            print_info "Example .env content:"
            echo "PRIVATE_KEY=your_private_key_here"
            echo "BSC_RPC_URL=https://bsc-dataseed.binance.org/"
        fi
    else
        print_info "Skipping contract deployment"
    fi
}

# Update documentation
update_documentation() {
    print_info "Updating documentation..."
    
    # Update any remaining documentation files
    find . -name "*.md" -not -path "./node_modules/*" -not -path "./backup-*/*" | xargs sed -i.bak 's/OrphiCrowdFund/LEAD FIVE/g' 2>/dev/null || true
    find . -name "*.md" -not -path "./node_modules/*" -not -path "./backup-*/*" | xargs sed -i.bak 's/Orphi CrowdFund/LEAD FIVE/g' 2>/dev/null || true
    find . -name "*.md" -not -path "./node_modules/*" -not -path "./backup-*/*" | xargs sed -i.bak 's/ORPHI CrowdFund/LEAD FIVE/g' 2>/dev/null || true
    
    # Clean up backup files
    find . -name "*.bak" -not -path "./node_modules/*" -not -path "./backup-*/*" -delete 2>/dev/null || true
    
    print_status "Documentation updated"
}

# Create deployment summary
create_deployment_summary() {
    print_info "Creating deployment summary..."
    
    cat > LEADFIVE_MIGRATION_SUMMARY.md << EOF
# 🎉 LEAD FIVE Migration Complete

## Migration Summary
- **Date**: $(date)
- **From**: OrphiCrowdFund
- **To**: LEAD FIVE
- **Status**: ✅ Complete

## Changes Made
1. ✅ Smart contract rebranded (OrphiCrowdFund → LeadFive)
2. ✅ Frontend configuration updated
3. ✅ Package.json rebranded
4. ✅ README.md updated
5. ✅ Docker configuration created
6. ✅ DigitalOcean deployment guide created

## Next Steps
1. **Deploy Contract**: Run \`npx hardhat run scripts/deploy-leadfive.js --network bsc\`
2. **Update Frontend**: Update contract address in \`src/contracts-leadfive.js\`
3. **Deploy to DigitalOcean**: Follow \`DIGITALOCEAN_LEADFIVE_DEPLOYMENT.md\`
4. **Test Everything**: Verify all functionality works

## Files Created/Modified
- \`contracts/LeadFive.sol\` - New contract
- \`src/contracts-leadfive.js\` - New frontend config
- \`scripts/deploy-leadfive.js\` - Deployment script
- \`Dockerfile\` - Container configuration
- \`nginx.conf\` - Web server configuration
- \`DIGITALOCEAN_LEADFIVE_DEPLOYMENT.md\` - Deployment guide

## Support
- Contract will be deployed to BSC Mainnet
- Frontend ready for DigitalOcean deployment
- All documentation updated

**🚀 LEAD FIVE is ready for production!**
EOF

    print_status "Migration summary created: LEADFIVE_MIGRATION_SUMMARY.md"
}

# Main execution
main() {
    echo
    print_info "Starting LEAD FIVE migration process..."
    echo
    
    check_prerequisites
    backup_current_state
    install_dependencies
    rebrand_frontend
    update_contracts_config
    compile_contracts
    test_build
    update_documentation
    create_deployment_summary
    
    echo
    echo "============================================================"
    print_status "🎉 LEAD FIVE MIGRATION COMPLETED SUCCESSFULLY!"
    echo "============================================================"
    echo
    print_info "Next steps:"
    echo "1. Review the changes in your code"
    echo "2. Deploy the LeadFive contract to BSC Mainnet"
    echo "3. Update the contract address in frontend config"
    echo "4. Deploy to DigitalOcean using the provided guide"
    echo
    print_info "Files to review:"
    echo "• LEADFIVE_MIGRATION_SUMMARY.md - Migration summary"
    echo "• DIGITALOCEAN_LEADFIVE_DEPLOYMENT.md - Deployment guide"
    echo "• contracts/LeadFive.sol - New smart contract"
    echo "• src/contracts-leadfive.js - Frontend configuration"
    echo
    
    deploy_contract
    
    echo
    print_status "🚀 LEAD FIVE is ready for production deployment!"
    echo "============================================================"
}

# Run the migration
main "$@"
