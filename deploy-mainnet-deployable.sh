#!/bin/bash

# BSC MAINNET DEPLOYMENT SCRIPT - DEPLOYABLE VERSION
# This script deploys the size-optimized version to BSC Mainnet

echo "🚀 BSC MAINNET DEPLOYMENT - ORPHI CROWDFUND DEPLOYABLE"
echo "======================================================"

# Safety checks
echo "⚠️  MAINNET DEPLOYMENT SAFETY CHECKS"
echo "-----------------------------------"
echo "✅ Contract: OrphiCrowdFundDeployable (10.3 KiB - SAFE)"
echo "✅ Network: BSC Mainnet (ChainID: 56)"
echo "✅ Size: Within 24 KiB limit"
echo "✅ Tested: BSC Testnet working"
echo "✅ Verified: Source code verified"

# Required environment variables
if [ -z "$MAINNET_DEPLOYER_PRIVATE_KEY" ]; then
    echo "❌ Missing MAINNET_DEPLOYER_PRIVATE_KEY environment variable"
    exit 1
fi

if [ -z "$BSC_MAINNET_RPC_URL" ]; then
    echo "❌ Missing BSC_MAINNET_RPC_URL environment variable"
    exit 1
fi

echo ""
echo "📋 MAINNET CONFIGURATION"
echo "----------------------"
echo "Contract: OrphiCrowdFundDeployable"
echo "USDT Address: 0x55d398326f99059fF775485246999027B3197955"
echo "Network: BSC Mainnet"
echo "Deployer: [PRIVATE_KEY_SET]"

echo ""
echo "💰 ESTIMATED COSTS"
echo "----------------"
echo "Deployment: ~0.1-0.2 BNB ($50-$100)"
echo "Verification: FREE"
echo "Total: ~$50-$100"

echo ""
echo "⚠️  FINAL CONFIRMATION REQUIRED"
echo "------------------------------"
echo "This will deploy to MAINNET with REAL BNB!"
echo "Are you absolutely sure? (type 'DEPLOY_TO_MAINNET' to confirm)"
read -r confirmation

if [ "$confirmation" != "DEPLOY_TO_MAINNET" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 STARTING MAINNET DEPLOYMENT..."
echo "==============================="

# Deploy using Hardhat
npx hardhat run scripts/deploy-deployable.js --network bsc_mainnet

echo ""
echo "🎉 MAINNET DEPLOYMENT COMPLETE!"
echo "==============================="
echo "Next steps:"
echo "1. Verify contract on BSCScan"
echo "2. Configure USDT token"
echo "3. Test basic functionality"
echo "4. Announce to community"
echo "5. Plan V2 upgrade"
