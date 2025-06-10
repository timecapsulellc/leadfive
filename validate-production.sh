#!/bin/bash

# OrphiCrowdFund Production Validation Script
# This script performs final checks before mainnet deployment

echo "🔍 OrphiCrowdFund Production Readiness Validation"
echo "================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track validation results
VALIDATION_PASSED=true

# Function to print status
print_status() {
    if [ "$2" = "PASS" ]; then
        echo -e "✅ ${GREEN}$1${NC}"
    elif [ "$2" = "FAIL" ]; then
        echo -e "❌ ${RED}$1${NC}"
        VALIDATION_PASSED=false
    elif [ "$2" = "WARN" ]; then
        echo -e "⚠️  ${YELLOW}$1${NC}"
    else
        echo -e "ℹ️  ${BLUE}$1${NC}"
    fi
}

echo -e "\n${BLUE}1. Environment Configuration Check${NC}"
echo "------------------------------------"

# Check if .env file exists
if [ -f ".env" ]; then
    print_status "Environment file (.env) exists" "PASS"
    
    # Check required variables
    if grep -q "REACT_APP_ORPHI_WS_URL" .env; then
        print_status "REACT_APP_ORPHI_WS_URL configured" "PASS"
    else
        print_status "REACT_APP_ORPHI_WS_URL missing" "FAIL"
    fi
    
    if grep -q "DEPLOYER_PRIVATE_KEY" .env; then
        print_status "DEPLOYER_PRIVATE_KEY configured" "PASS"
    else
        print_status "DEPLOYER_PRIVATE_KEY missing" "FAIL"
    fi
    
    if grep -q "BSCSCAN_API_KEY" .env; then
        print_status "BSCSCAN_API_KEY configured" "PASS"
    else
        print_status "BSCSCAN_API_KEY missing" "FAIL"
    fi
else
    print_status "Environment file (.env) missing" "FAIL"
fi

echo -e "\n${BLUE}2. Dependencies and Security Check${NC}"
echo "-----------------------------------"

# Check for node_modules
if [ -d "node_modules" ]; then
    print_status "Dependencies installed" "PASS"
else
    print_status "Dependencies not installed" "FAIL"
fi

# Check package.json for required dependencies
if npm list ethers > /dev/null 2>&1; then
    print_status "ethers.js dependency available" "PASS"
else
    print_status "ethers.js dependency missing" "FAIL"
fi

if npm list react > /dev/null 2>&1; then
    print_status "React dependency available" "PASS"
else
    print_status "React dependency missing" "FAIL"
fi

echo -e "\n${BLUE}3. Build and Code Quality Check${NC}"
echo "--------------------------------"

# Check if build directory exists
if [ -d "build" ]; then
    print_status "Production build exists" "PASS"
    
    # Check build size
    BUILD_SIZE=$(du -sh build | cut -f1)
    print_status "Build size: $BUILD_SIZE" "INFO"
else
    print_status "Production build missing - running build..." "WARN"
    npm run build
    if [ $? -eq 0 ]; then
        print_status "Production build successful" "PASS"
    else
        print_status "Production build failed" "FAIL"
    fi
fi

# Check for TypeScript errors (if any .ts files exist)
if find src -name "*.ts" -o -name "*.tsx" | head -1 | grep -q .; then
    echo "Checking TypeScript compilation..."
    npx tsc --noEmit > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_status "TypeScript compilation clean" "PASS"
    else
        print_status "TypeScript compilation has errors" "WARN"
    fi
fi

echo -e "\n${BLUE}4. Smart Contract Validation${NC}"
echo "------------------------------"

# Check if contracts directory exists
if [ -d "contracts" ]; then
    print_status "Smart contracts directory exists" "PASS"
    
    # Check for main contract file
    if [ -f "contracts/OrphiCrowdFund.sol" ]; then
        print_status "OrphiCrowdFund contract found" "PASS"
    else
        print_status "OrphiCrowdFund contract missing" "FAIL"
    fi
else
    print_status "Contracts directory missing" "FAIL"
fi

# Check Hardhat configuration
if [ -f "hardhat.config.js" ]; then
    print_status "Hardhat configuration exists" "PASS"
else
    print_status "Hardhat configuration missing" "FAIL"
fi

echo -e "\n${BLUE}5. Deployment Scripts Check${NC}"
echo "----------------------------"

# Check deployment scripts
if [ -f "scripts/deploy-mainnet.js" ]; then
    print_status "Mainnet deployment script ready" "PASS"
else
    print_status "Mainnet deployment script missing" "FAIL"
fi

if [ -f ".env.mainnet" ]; then
    print_status "Mainnet environment template exists" "PASS"
else
    print_status "Mainnet environment template missing" "WARN"
fi

echo -e "\n${BLUE}6. Frontend Configuration Check${NC}"
echo "--------------------------------"

# Check for critical frontend files
if [ -f "src/OrphiDashboard.jsx" ]; then
    print_status "Main dashboard component exists" "PASS"
    
    # Check for Vite vs CRA environment variable usage
    if grep -q "import.meta.env" src/OrphiDashboard.jsx; then
        print_status "Found Vite environment variables (should be process.env)" "FAIL"
    else
        print_status "Environment variables correctly configured for CRA" "PASS"
    fi
else
    print_status "Main dashboard component missing" "FAIL"
fi

if [ -f "src/App.js" ] || [ -f "src/App.jsx" ]; then
    print_status "Main App component exists" "PASS"
else
    print_status "Main App component missing" "FAIL"
fi

echo -e "\n${BLUE}7. Performance and Bundle Check${NC}"
echo "-----------------------------------"

# Check bundle size if build exists
if [ -d "build/static" ]; then
    JS_SIZE=$(find build/static/js -name "*.js" -exec du -ch {} + | grep total | cut -f1)
    CSS_SIZE=$(find build/static/css -name "*.css" -exec du -ch {} + | grep total | cut -f1)
    print_status "JavaScript bundle size: $JS_SIZE" "INFO"
    print_status "CSS bundle size: $CSS_SIZE" "INFO"
    
    # Check if main JS bundle is under 500KB
    MAIN_JS_SIZE=$(find build/static/js -name "main.*.js" -exec stat -f%z {} \; 2>/dev/null || find build/static/js -name "main.*.js" -exec stat -c%s {} \; 2>/dev/null)
    if [ ! -z "$MAIN_JS_SIZE" ] && [ "$MAIN_JS_SIZE" -lt 512000 ]; then
        print_status "Main bundle size under 500KB limit" "PASS"
    else
        print_status "Main bundle size may be too large" "WARN"
    fi
fi

echo -e "\n${BLUE}8. Security and Best Practices${NC}"
echo "-----------------------------------"

# Check for common security issues
if grep -r "console.log" src/ > /dev/null 2>&1; then
    print_status "Found console.log statements (should be removed for production)" "WARN"
else
    print_status "No console.log statements found" "PASS"
fi

# Check for TODO comments
TODO_COUNT=$(grep -r "TODO\|FIXME" src/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$TODO_COUNT" -gt 0 ]; then
    print_status "Found $TODO_COUNT TODO/FIXME comments" "WARN"
else
    print_status "No pending TODO items found" "PASS"
fi

# Check if .env is in .gitignore
if grep -q "\.env" .gitignore 2>/dev/null; then
    print_status ".env file properly excluded from git" "PASS"
else
    print_status ".env file should be added to .gitignore" "WARN"
fi

echo -e "\n${BLUE}Summary${NC}"
echo "======="

if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "🎉 ${GREEN}All critical validations passed!${NC}"
    echo -e "${GREEN}✅ Project is ready for production deployment${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure .env with your actual mainnet values"
    echo "2. Run: npx hardhat run scripts/deploy-mainnet.js --network bscMainnet"
    echo "3. Update REACT_APP_CONTRACT_ADDRESS in .env"
    echo "4. Run: npm run build"
    echo "5. Deploy to your hosting platform"
else
    echo -e "❌ ${RED}Some validations failed!${NC}"
    echo -e "${RED}Please fix the issues above before deploying to production${NC}"
    exit 1
fi

echo -e "\n📋 ${BLUE}Production Deployment Checklist:${NC}"
echo "□ Run this validation script"
echo "□ Configure mainnet environment variables"
echo "□ Deploy smart contract to BSC Mainnet"
echo "□ Update frontend with contract address"
echo "□ Build and deploy frontend"
echo "□ Test all functionality on mainnet"
echo "□ Set up monitoring and alerts"
echo ""
echo "🚀 Ready for launch!"
