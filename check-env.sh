#!/bin/bash

echo "🔍 CHECKING DEPLOYMENT READINESS..."
echo "=================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Check for private key
if grep -q "YOUR_PRIVATE_KEY_HERE" .env; then
    echo "❌ Private key not set in .env file"
    echo "📝 Please edit .env and add your real private key"
    echo "💡 See PRIVATE_KEY_SETUP_GUIDE.md for instructions"
    exit 1
fi

if grep -q "DEPLOYER_PRIVATE_KEY=" .env; then
    echo "✅ Private key found in .env"
else
    echo "❌ DEPLOYER_PRIVATE_KEY not found in .env"
    exit 1
fi

# Check for BSCScan API key
if grep -q "BSCSCAN_API_KEY=" .env; then
    echo "✅ BSCScan API key found"
else
    echo "❌ BSCScan API key missing"
    exit 1
fi

echo "✅ Environment setup looks good!"
echo "🚀 Ready to deploy with: npm run deploy:correct"
