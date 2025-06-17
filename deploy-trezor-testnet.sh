#!/bin/bash

# Trezor Testnet Deployment Script
# This script deploys OrphiCrowdFund to BSC Testnet with Trezor wallet ownership

echo "🚀 Starting Trezor Testnet Deployment"
echo "======================================"

# Check if .env.trezor exists
if [ ! -f ".env.trezor" ]; then
    echo "❌ Error: .env.trezor file not found"
    echo "Please ensure your Trezor configuration file exists"
    exit 1
fi

# Check if required files exist
if [ ! -f "hardhat.config.trezor-testnet.cjs" ]; then
    echo "❌ Error: hardhat.config.trezor-testnet.cjs not found"
    exit 1
fi

if [ ! -f "deploy-trezor-testnet.cjs" ]; then
    echo "❌ Error: deploy-trezor-testnet.cjs not found"
    exit 1
fi

echo "✅ Configuration files found"

# Load environment variables
echo "🔧 Loading Trezor configuration..."
source .env.trezor

# Verify Trezor wallet address
if [ -z "$TREZOR_WALLET" ]; then
    echo "❌ Error: TREZOR_WALLET not set in .env.trezor"
    exit 1
fi

echo "🏦 Trezor Wallet: $TREZOR_WALLET"

# Clean compile
echo "🔨 Compiling contracts..."
npx hardhat compile --config hardhat.config.trezor-testnet.cjs

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed"
    exit 1
fi

echo "✅ Compilation successful"

# Deploy with Trezor configuration
echo "🚀 Deploying to BSC Testnet..."
echo "⚠️  This will use the temporary deployer key and immediately transfer ownership to Trezor"

npx hardhat run deploy-trezor-testnet.cjs --config hardhat.config.trezor-testnet.cjs --network bsc_testnet_trezor

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "================================"
    echo "✅ Contract deployed with Trezor ownership"
    echo "✅ Compromised wallet completely removed"
    echo "✅ All admin roles assigned to Trezor wallet"
    echo ""
    echo "📄 Deployment details saved to: trezor-testnet-deployment.json"
    echo ""
    echo "🔗 Next steps:"
    echo "1. Check deployment details in trezor-testnet-deployment.json"
    echo "2. Verify contract on BSCScan Testnet"
    echo "3. Connect Trezor wallet for contract management"
    echo "4. Test contract functions"
else
    echo "❌ Deployment failed"
    echo "Check the error messages above for details"
    exit 1
fi
