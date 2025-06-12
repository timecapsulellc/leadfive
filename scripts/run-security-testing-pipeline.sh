#!/bin/bash

# OrphiCrowdFund Security Testing Deployment & Validation Script
# This script deploys the enhanced contract and runs comprehensive security tests

echo "🚀 ORPHI CROWDFUND SECURITY TESTING PIPELINE"
echo "=============================================="
echo "📅 Date: $(date)"
echo "🔧 Environment: BSC Testnet"
echo ""

# Step 1: Check if we need to deploy new contract with security features
echo "📋 STEP 1: Checking Contract Status"
echo "-----------------------------------"

# Check if we have a deployed contract with all security features
if [ -f "testnet-deployment-info.json" ]; then
    echo "✅ Found deployment info file"
    CONTRACT_ADDRESS=$(grep -o '"contractAddress": "[^"]*"' testnet-deployment-info.json | cut -d'"' -f4)
    echo "📍 Contract Address: $CONTRACT_ADDRESS"
else
    echo "❌ No deployment info found"
    echo "🔧 Will need to deploy new contract"
fi

# Step 2: Deploy enhanced contract with all security features
echo ""
echo "📋 STEP 2: Deploying Enhanced Security Contract"
echo "----------------------------------------------"

# Create a temporary hardhat.config.js with test private key for deployment
echo "⚙️ Setting up test environment..."

# Create temporary test config
cat > hardhat.test-security.config.js << 'EOF'
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomicfoundation/hardhat-chai-matchers");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

// Test private key (never use in production)
const TEST_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

module.exports = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        count: 10,
      },
    },
    bsc_testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: [TEST_PRIVATE_KEY],
      gasPrice: 20000000000,
    },
  },
  gasReporter: {
    enabled: true,
  },
};
EOF

echo "✅ Test configuration created"

# Step 3: Deploy optimized security contract
echo ""
echo "📋 STEP 3: Deploying Security-Enhanced Contract"
echo "-----------------------------------------------"

# Run deployment with test config
npx hardhat run scripts/deploy-testnet-security.js --network bsc_testnet --config hardhat.test-security.config.js

# Step 4: Run comprehensive security tests
echo ""
echo "📋 STEP 4: Running Comprehensive Security Tests"
echo "-----------------------------------------------"

if [ -f "testnet-deployment-info.json" ]; then
    echo "✅ Deployment successful, running security tests..."
    npx hardhat run scripts/test-security-features.js --network bsc_testnet --config hardhat.test-security.config.js
else
    echo "❌ Deployment failed, cannot run tests"
    exit 1
fi

# Step 5: Run basic functionality tests
echo ""
echo "📋 STEP 5: Running Basic Functionality Tests"
echo "--------------------------------------------"

npx hardhat test test/OrphiCrowdFund-BasicSecurity.test.cjs --config hardhat.test-security.config.js

# Step 6: Generate comprehensive report
echo ""
echo "📋 STEP 6: Generating Security Test Report"
echo "------------------------------------------"

echo "🎉 SECURITY TESTING COMPLETED"
echo "=============================="

if [ -f "testnet-security-test-report.json" ]; then
    echo "📄 Security test report generated: testnet-security-test-report.json"
    
    # Show summary
    echo ""
    echo "📊 TEST SUMMARY:"
    echo "----------------"
    cat testnet-test-summary.txt
else
    echo "❌ Security test report not found"
fi

# Cleanup
echo ""
echo "🧹 Cleaning up temporary files..."
rm -f hardhat.test-security.config.js

echo ""
echo "✅ Security testing pipeline completed!"
echo "📋 Next steps:"
echo "   1. Review security test results"
echo "   2. Fix any failed tests"
echo "   3. Proceed to mainnet only if all tests pass"
echo ""
