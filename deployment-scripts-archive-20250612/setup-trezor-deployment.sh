#!/bin/bash

# 🔐 TREZOR DEPLOYMENT SETUP SCRIPT
# This script prepares your environment for secure Trezor deployment

echo "🔐 Setting up Trezor deployment environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                           🔐 TREZOR DEPLOYMENT SETUP                                 ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}📋 PREREQUISITES CHECKLIST:${NC}"
echo "   ✅ Trezor device connected and unlocked"
echo "   ✅ MetaMask installed with Trezor connected"
echo "   ✅ BSC Mainnet added to MetaMask"
echo "   ✅ Sufficient BNB for gas fees (~0.01 BNB)"
echo "   ✅ Trezor address selected in MetaMask"

echo -e "\n${BLUE}🔍 Expected Trezor Address: 0xeB652c4523f3Cf615D3F3694b14E551145953aD0${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
    npm install
else
    echo -e "\n${GREEN}✅ Dependencies already installed${NC}"
fi

# Create a .env.trezor file for Trezor deployment
echo -e "\n${YELLOW}📄 Creating Trezor deployment configuration...${NC}"

cat > .env.trezor << 'EOF'
# 🔐 TREZOR DEPLOYMENT CONFIGURATION
# This file contains configuration for deploying with Trezor hardware wallet

# BSC Mainnet RPC (using public endpoint)
BSC_MAINNET_RPC_URL=https://bsc-dataseed.binance.org/

# BSCScan API Key for contract verification (optional)
BSCSCAN_API_KEY=

# Deployment settings
DEPLOYMENT_MODE=trezor
EXPECTED_DEPLOYER=0xeB652c4523f3Cf615D3F3694b14E551145953aD0

# Security addresses (all pointing to Trezor for initial setup)
TREASURY_ADDRESS=0xeB652c4523f3Cf615D3F3694b14E551145953aD0
EMERGENCY_ADDRESS=0xeB652c4523f3Cf615D3F3694b14E551145953aD0
POOL_MANAGER_ADDRESS=0xeB652c4523f3Cf615D3F3694b14E551145953aD0

# BSC Mainnet USDT token
USDT_TOKEN_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# Gas settings for BSC Mainnet
GAS_PRICE=5000000000
GAS_LIMIT=8000000
EOF

echo -e "${GREEN}✅ Created .env.trezor configuration file${NC}"

# Create Hardhat config for Trezor
echo -e "\n${YELLOW}⚙️ Creating Trezor-specific Hardhat configuration...${NC}"

cat > hardhat.config.trezor.js << 'EOF'
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomicfoundation/hardhat-chai-matchers");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config({ path: '.env.trezor' });
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
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
    bsc_mainnet_trezor: {
      url: process.env.BSC_MAINNET_RPC_URL || "https://bsc-dataseed.binance.org/",
      chainId: 56,
      // For Trezor deployment, accounts will be provided by MetaMask
      // No private keys needed here - MetaMask will handle Trezor signing
      gasPrice: parseInt(process.env.GAS_PRICE) || 5000000000, // 5 Gwei
      gas: parseInt(process.env.GAS_LIMIT) || 8000000,
      timeout: 60000,
    },
  },
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: false, // Disabled for deployment
  },
  mocha: {
    timeout: 40000,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
EOF

echo -e "${GREEN}✅ Created hardhat.config.trezor.js${NC}"

# Create deployment instruction file
echo -e "\n${YELLOW}📋 Creating deployment instructions...${NC}"

cat > TREZOR_DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# 🔐 TREZOR DEPLOYMENT INSTRUCTIONS

## 📋 Prerequisites

1. **Hardware Setup:**
   - Trezor device connected and unlocked
   - Latest Trezor firmware installed
   - Trezor Bridge or Trezor Suite running

2. **Browser Setup:**
   - MetaMask extension installed
   - Trezor connected to MetaMask ("Connect Hardware Wallet")
   - BSC Mainnet network added to MetaMask
   - Your Trezor account selected in MetaMask

3. **Network Configuration:**
   - BSC Mainnet should be the active network
   - Expected deployer address: `0xeB652c4523f3Cf615D3F3694b14E551145953aD0`
   - Minimum 0.01 BNB for gas fees

## 🚀 Deployment Steps

### Step 1: Verify Setup
```bash
# Check that your Trezor address has sufficient BNB
echo "Check balance at: https://bscscan.com/address/0xeB652c4523f3Cf615D3F3694b14E551145953aD0"
```

### Step 2: Deploy with Trezor
```bash
# Deploy using the Trezor configuration
npx hardhat run scripts/deploy-with-trezor.js --network bsc_mainnet_trezor --config hardhat.config.trezor.js
```

### Step 3: Confirm on Trezor
- When prompted, review the transaction details on your Trezor screen
- Verify the contract deployment transaction
- Confirm on your Trezor device

### Step 4: Verify Deployment
- Check the new contract address on BSCScan
- Verify ownership points to your Trezor address
- Save the deployment details from `NEW_SECURE_DEPLOYMENT.json`

## 🔍 Troubleshooting

**Issue: "Account not found" or wrong address**
- Solution: Ensure the correct Trezor account is selected in MetaMask

**Issue: Transaction rejected**
- Solution: Check Trezor screen and confirm the transaction

**Issue: Gas estimation failed**
- Solution: Ensure sufficient BNB balance for gas fees

**Issue: RPC errors**
- Solution: Try different BSC RPC endpoints if needed

## 🛡️ Security Notes

- Your private keys never leave the Trezor device
- All transactions must be physically confirmed on Trezor
- The new contract will be owned by your Trezor address
- Never share your Trezor device or PIN with anyone

## 📱 Next Steps After Deployment

1. Update frontend configuration with new contract address
2. Verify contract on BSCScan (optional)
3. Communicate new contract address to users
4. Set up migration plan from old contract
5. Monitor the new contract for proper functionality
EOF

echo -e "${GREEN}✅ Created TREZOR_DEPLOYMENT_INSTRUCTIONS.md${NC}"

echo -e "\n${GREEN}🎉 Trezor deployment environment setup complete!${NC}"

echo -e "\n${BLUE}📋 NEXT STEPS:${NC}"
echo "1. Connect your Trezor to MetaMask"
echo "2. Select BSC Mainnet in MetaMask"
echo "3. Ensure your Trezor address is selected"
echo "4. Run: ${YELLOW}npx hardhat run scripts/deploy-with-trezor.js --network bsc_mainnet_trezor --config hardhat.config.trezor.js${NC}"

echo -e "\n${RED}⚠️  IMPORTANT SECURITY REMINDERS:${NC}"
echo "• Your Trezor device must be physically present for signing"
echo "• Verify all transaction details on the Trezor screen"
echo "• Never use the compromised deployer wallet again"
echo "• The new contract will be completely secure and under your control"

echo -e "\n${GREEN}Ready for secure deployment! 🔐${NC}"
EOF
