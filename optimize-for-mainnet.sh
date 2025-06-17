#!/bin/bash

# Contract Optimization Script for Mainnet Readiness
# Reduces OrphiCrowdFund from 26.7 KiB to under 24 KiB

echo "🔧 OPTIMIZING ORPHI CROWDFUND FOR MAINNET"
echo "========================================="

echo "📊 Current Status:"
echo "   OrphiCrowdFund: 26.712 KiB ❌ (EXCEEDS LIMIT)"
echo "   Target: <24.000 KiB ✅"
echo "   Reduction needed: 2.712 KiB"

echo ""
echo "🛠️  OPTIMIZATION STRATEGIES"
echo "==========================="

# Strategy 1: Increase optimizer runs
echo "1. 📈 OPTIMIZER CONFIGURATION"
echo "   Current: 200 runs"
echo "   Recommended: 1000+ runs"
echo "   Expected reduction: ~0.5-1.0 KiB"

# Create optimized hardhat config
cat > hardhat.config.optimized.cjs << 'EOF'
require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.22",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000, // Increased from 200 for mainnet deployment
        details: {
          yul: true,
          yulDetails: {
            stackAllocation: true,
            optimizerSteps: "dhfoDgvulfnTUtnIf[xa[r]EscLMcCTUtTOntnfDIulLculVcul[j]Tpeulxa[rul]xa[r]cLgvifCTUca[r]LsTOtfDnca[r]Iulc]jmul[jul]VcTOcul jmul:fDnTOcmu"
          }
        }
      },
      viaIR: true // Enable IR-based code generation for better optimization
    },
  },
  networks: {
    bsc_mainnet: {
      url: process.env.BSC_MAINNET_RPC_URL || "https://bsc-dataseed1.binance.org/",
      accounts: process.env.MAINNET_DEPLOYER_PRIVATE_KEY ? [process.env.MAINNET_DEPLOYER_PRIVATE_KEY] : [],
      chainId: 56,
      gasPrice: 3000000000, // 3 gwei
    },
    bsc_testnet: {
      url: process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: process.env.TESTNET_DEPLOYER_PRIVATE_KEY ? [process.env.TESTNET_DEPLOYER_PRIVATE_KEY] : [],
      chainId: 97,
      gasPrice: 100000000, // 0.1 gwei
    }
  },
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || ""
    }
  }
};
EOF

echo "   ✅ Created optimized hardhat.config.optimized.cjs"

# Strategy 2: Library extraction
echo ""
echo "2. 📚 LIBRARY EXTRACTION"
echo "   Extract large functions to external libraries"
echo "   Target functions:"
echo "   • Complex compensation calculations"
echo "   • Matrix placement logic"
echo "   • Advanced withdrawal logic"
echo "   Expected reduction: ~1.0-2.0 KiB"

# Create library extraction guide
cat > LIBRARY_EXTRACTION_GUIDE.md << 'EOF'
# Library Extraction Guide for Size Optimization

## Target Functions for Extraction

### 1. CompensationCalculations Library
```solidity
library CompensationCalculationsLib {
    function calculateAllBonuses(address user, uint256 amount) external returns (uint256) {
        // Move complex bonus calculations here
    }
    
    function processLevelDistribution(address user, uint256 amount) external {
        // Move level bonus logic here
    }
}
```

### 2. MatrixOperations Library  
```solidity
library MatrixOperationsLib {
    function placeBinaryMatrix(address user, address sponsor) external {
        // Move binary matrix logic here
    }
    
    function calculateMatrixBonuses(address user) external view returns (uint256) {
        // Move matrix calculations here
    }
}
```

### 3. WithdrawalProcessor Library
```solidity
library WithdrawalProcessorLib {
    function processWithdrawal(address user, uint256 amount) external returns (bool) {
        // Move withdrawal logic here
    }
    
    function calculateReinvestment(address user, uint256 amount) external returns (uint256) {
        // Move auto-reinvestment logic here
    }
}
```

## Implementation Steps
1. Create library contracts
2. Move functions to libraries
3. Update main contract to use libraries
4. Test thoroughly
5. Recompile and check size

## Expected Size Reduction
- CompensationCalculations: ~0.8 KiB
- MatrixOperations: ~0.6 KiB  
- WithdrawalProcessor: ~0.4 KiB
- Total: ~1.8 KiB reduction
EOF

# Strategy 3: Remove unused features
echo ""
echo "3. 🗑️  UNUSED CODE REMOVAL"
echo "   Remove development/debug functions"
echo "   Optimize error messages"
echo "   Remove redundant checks"
echo "   Expected reduction: ~0.5-1.0 KiB"

# Strategy 4: Storage optimization
echo ""
echo "4. 💾 STORAGE OPTIMIZATION"
echo "   Pack structs efficiently"
echo "   Use smaller data types where possible"
echo "   Combine boolean variables"
echo "   Expected reduction: ~0.3-0.5 KiB"

echo ""
echo "🧪 TESTING OPTIMIZATION"
echo "======================"

# Test with optimized config
echo "Testing with optimized configuration..."
cp hardhat.config.cjs hardhat.config.backup.cjs
cp hardhat.config.optimized.cjs hardhat.config.cjs

echo "Compiling with optimization..."
npx hardhat clean
npx hardhat compile

echo ""
echo "📊 OPTIMIZATION RESULTS"
echo "======================"
echo "Check the compilation output above for new contract sizes"

# Restore original config
cp hardhat.config.backup.cjs hardhat.config.cjs
rm hardhat.config.backup.cjs

echo ""
echo "📋 NEXT STEPS"
echo "============"
echo "1. Review compilation results above"
echo "2. If still > 24 KiB, implement library extraction"
echo "3. Remove unused code and optimize storage"
echo "4. Test thoroughly on testnet"
echo "5. Deploy to mainnet when < 24 KiB"

echo ""
echo "⚠️  RECOMMENDATION"
echo "=================="
echo "For immediate mainnet deployment, use OrphiCrowdFundDeployable"
echo "For full features, complete optimization first"
EOF
