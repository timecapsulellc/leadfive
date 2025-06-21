#!/bin/bash

# 🚀 LEADFIVE MAINNET DEPLOYMENT SCRIPT
# Quick deployment automation

echo "🚀 LEADFIVE MAINNET DEPLOYMENT"
echo "==============================="

# Check if we're in the right directory
if [ ! -f "hardhat.config.cjs" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with:"
    echo "DEPLOYER_PRIVATE_KEY=your_private_key"
    echo "BSCSCAN_API_KEY=your_bscscan_api_key"
    exit 1
fi

echo "✅ Environment check passed"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile contracts
echo "🔨 Compiling contracts..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed"
    exit 1
fi

echo "✅ Compilation successful"

# Check network connectivity
echo "🌐 Checking BSC Mainnet connectivity..."
npx hardhat console --network bsc_mainnet --non-interactive 2>/dev/null

if [ $? -ne 0 ]; then
    echo "❌ Cannot connect to BSC Mainnet"
    echo "Please check your RPC URL and network configuration"
    exit 1
fi

echo "✅ Network connectivity confirmed"

# Check deployer balance
echo "💰 Checking deployer balance..."

# Deploy to mainnet
echo "🚀 Starting mainnet deployment..."
echo "⚠️  This will deploy to BSC MAINNET with real BNB!"
echo ""
read -p "Are you sure you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo "🔄 Deploying to BSC Mainnet..."
npx hardhat run scripts/deploy-mainnet.cjs --network bsc_mainnet

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "========================"
    echo ""
    echo "🔄 NEXT STEPS:"
    echo "1. 🔐 Transfer ownership to Trezor wallet:"
    echo "   - Update scripts/transfer-ownership.cjs with your Trezor address"
    echo "   - Run: npx hardhat run scripts/transfer-ownership.cjs --network bsc_mainnet"
    echo ""
    echo "2. 🔍 Verify contract on BSCScan"
    echo "3. 🔑 Rotate your private key and API key"
    echo "4. 🔗 Update frontend configuration"
    echo "5. 📊 Set up monitoring"
    echo ""
    echo "📄 Check mainnet-deployment.json for deployment details"
    echo ""
    echo "⚠️  SECURITY REMINDER:"
    echo "- IMMEDIATELY transfer ownership to your Trezor wallet"
    echo "- IMMEDIATELY rotate your exposed credentials"
else
    echo "❌ DEPLOYMENT FAILED"
    echo "Check the error messages above"
    exit 1
fi
