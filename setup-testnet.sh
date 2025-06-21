#!/bin/bash

echo "🧪 LEADFIVE TESTNET DEPLOYMENT SETUP GUIDE"
echo "=================================================="

echo ""
echo "📋 STEP 1: Create a Test Wallet for Testnet"
echo "You need to create a test wallet and get its private key."
echo ""
echo "Option A - Use MetaMask:"
echo "1. Create a new account in MetaMask (NOT your main wallet!)"
echo "2. Export the private key (Account Details → Export Private Key)"
echo "3. Copy the private key (64 characters)"
echo ""
echo "Option B - Use Node.js to generate one:"
node -e "
const crypto = require('crypto');
const privateKey = crypto.randomBytes(32).toString('hex');
console.log('🔑 Generated test private key:');
console.log('0x' + privateKey);
console.log('');
console.log('⚠️  This is for TESTNET ONLY - DO NOT use for mainnet!');
"

echo ""
echo "📋 STEP 2: Get Testnet BNB"
echo "1. Go to: https://testnet.binance.org/faucet-smart"
echo "2. Enter your test wallet address"
echo "3. Get 1 BNB for testnet (free)"
echo ""
echo "📋 STEP 3: Update .env file"
echo "Replace DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE with your actual private key"
echo ""
echo "Example:"
echo "DEPLOYER_PRIVATE_KEY=0x1234567890abcdef..."
echo ""
echo "📋 STEP 4: Deploy to testnet"
echo "npm run deploy:testnet"
echo ""
echo "⚠️  SECURITY REMINDER:"
echo "- Use a SEPARATE wallet for testnet (not your main wallet)"
echo "- Never share your private key"
echo "- Remove private key from .env after deployment"
