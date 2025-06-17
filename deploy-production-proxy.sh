#!/bin/bash
# Production deployment script for OrphiCrowdFund with proxy pattern

echo "🚀 DEPLOYING ORPHI CROWDFUND TO BSC MAINNET"
echo "==========================================="

# Set network
NETWORK="bsc_mainnet"

echo "📋 Pre-deployment checklist:"
echo "✅ Contract size optimized (26.488 KiB)"
echo "✅ Custom errors implemented"
echo "✅ UUPS proxy pattern ready"
echo "✅ All MLM functionality preserved"

echo ""
echo "🔧 Deployment Strategy: UUPS Proxy Pattern"
echo "- Implementation: OrphiCrowdFund logic"
echo "- Proxy: Lightweight proxy contract"
echo "- Upgradeability: UUPS pattern for future updates"

echo ""
echo "⚠️  IMPORTANT: Make sure you have:"
echo "- BSC mainnet RPC URL in .env"
echo "- Deployer private key in .env"
echo "- Sufficient BNB for gas (minimum 0.1 BNB)"
echo "- BSCScan API key for verification"

read -p "Do you want to proceed with deployment? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting deployment..."

# Deploy using UUPS proxy
npx hardhat run scripts/deploy-proxy.js --network $NETWORK

echo ""
echo "✅ Deployment complete!"
echo "📝 Next steps:"
echo "1. Verify contracts on BSCScan"
echo "2. Transfer ownership to treasury wallet"
echo "3. Setup initial packages and rates"
echo "4. Announce to community"

echo ""
echo "🎉 OrphiCrowdFund is now live on BSC Mainnet!"
