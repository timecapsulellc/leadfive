#!/bin/bash

# BSC Mainnet Contract Verification Script
# Contract: 0x8F826B18096Dcf7AF4515B06Cb563475d189ab50

echo "🚀 BSC Mainnet Contract Verification"
echo "===================================="
echo ""
echo "Contract: 0x8F826B18096Dcf7AF4515B06Cb563475d189ab50"
echo "Network: BSC Mainnet (Chain ID: 56)"
echo ""

# Check if .env.custom file exists
if [ ! -f .env.custom ]; then
    echo "⚠️  Creating .env.custom file..."
    echo "# BSC Mainnet Configuration" > .env.custom
    echo "BSC_MAINNET_RPC_URL=https://bsc-dataseed.binance.org/" >> .env.custom
    echo "BSCSCAN_API_KEY=your_api_key_here" >> .env.custom
    echo "DEPLOYER_PRIVATE_KEY=your_private_key_here" >> .env.custom
    echo ""
    echo "📝 Please update .env.custom file with your actual values:"
    echo "   - Get BSCScan API key from: https://bscscan.com/apis"
    echo "   - Add your deployer private key"
    echo ""
else
    echo "✅ Found .env.custom file"
fi

echo "🔍 Step 1: Running diagnostic script..."
npx hardhat run scripts/verify-mainnet-contract.js --network bsc

echo ""
echo "🔧 Step 2: Attempting direct verification..."
echo "Trying with USDT constructor argument..."

# Try verification with USDT address
npx hardhat verify --network bsc 0x8F826B18096Dcf7AF4515B06Cb563475d189ab50 "0x55d398326f99059fF775485246999027B3197955"

echo ""
echo "📋 Manual Verification Instructions:"
echo "===================================="
echo ""
echo "If automatic verification failed, follow these steps:"
echo ""
echo "1. Go to: https://bscscan.com/address/0x8F826B18096Dcf7AF4515B06Cb563475d189ab50#code"
echo "2. Click 'Verify and Publish'"
echo "3. Fill in these details:"
echo "   - Compiler Type: Solidity (Single file)"
echo "   - Compiler Version: v0.8.22+commit.4fc1097e"
echo "   - License: MIT"
echo "   - Optimization: Yes (200 runs)"
echo "4. Upload source code from: contracts/OrphiCrowdFund.sol"
echo "5. Constructor Arguments: [\"0x55d398326f99059fF775485246999027B3197955\"]"
echo ""
echo "🎯 After verification, your contract will show all write functions!"
echo ""
echo "📞 Need help? Check BSC_MAINNET_VERIFICATION_SOLUTION.md for detailed instructions."
