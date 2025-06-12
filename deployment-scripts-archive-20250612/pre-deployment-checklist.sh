#!/bin/bash

# 🔐 Pre-Deployment Checklist Script
# Run this before executing the secure deployment

echo "🔍 PRE-DEPLOYMENT SECURITY CHECKLIST"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "hardhat.config.trezor.cjs" ]; then
    echo "❌ Error: Run this script from the OrphiCrowdFund directory"
    exit 1
fi

echo "✅ Working directory: $(pwd)"

# Check .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

echo "✅ .env file found"

# Check if placeholder private key is still there
if grep -q "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" .env; then
    echo "❌ CRITICAL: Placeholder private key still in .env file!"
    echo "   You must replace DEPLOYER_PRIVATE_KEY with a real temporary private key"
    echo "   This wallet needs ~0.1 BNB for gas fees"
    exit 1
fi

echo "✅ Private key has been updated (no placeholder detected)"

# Check if Trezor address is configured
if grep -q "0xeB652c4523f3Cf615D3F3694b14E551145953aD0" scripts/deploy-secure-with-trezor-transfer.cjs; then
    echo "✅ Trezor address configured in deployment script"
else
    echo "❌ Error: Trezor address not found in deployment script"
    exit 1
fi

# Check if deployment script exists
if [ ! -f "scripts/deploy-secure-with-trezor-transfer.cjs" ]; then
    echo "❌ Error: Deployment script not found"
    exit 1
fi

echo "✅ Deployment script ready"

# Check if hardhat config for Trezor exists
if [ ! -f "hardhat.config.trezor.cjs" ]; then
    echo "❌ Error: Trezor hardhat config not found"
    exit 1
fi

echo "✅ Trezor hardhat configuration ready"

# Check for node_modules
if [ ! -d "node_modules" ]; then
    echo "⚠️  Warning: node_modules not found. Run 'npm install' first"
fi

# Final confirmation
echo ""
echo "🔐 SECURITY VERIFICATION:"
echo "✅ All preparation files ready"
echo "✅ Configuration updated for Trezor deployment"
echo "✅ No placeholder keys detected"
echo ""
echo "⚠️  FINAL CHECKS BEFORE DEPLOYMENT:"
echo "1. Verify your temporary wallet has ~0.1 BNB"
echo "2. Confirm you're connected to BSC Mainnet"
echo "3. Have your Trezor wallet ready for post-deployment testing"
echo ""
echo "🚀 Ready to deploy? Run:"
echo "npx hardhat run scripts/deploy-secure-with-trezor-transfer.cjs --network bsc_mainnet --config hardhat.config.trezor.cjs"
echo ""
echo "⚠️  REMEMBER: Remove the temporary private key from .env immediately after deployment!"
