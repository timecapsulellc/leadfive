#!/bin/bash
# Size optimization script - temporarily move unused contracts

echo "🔧 Moving unused contracts for size optimization..."

# Create temp backup directory
mkdir -p temp_exclude

# Move unused contracts
mv contracts/OrphiCrowdFundAdvanced.sol temp_exclude/ 2>/dev/null || true
mv contracts/OrphiCrowdFundComplete.sol temp_exclude/ 2>/dev/null || true
mv contracts/OrphiCrowdFundEnhanced.sol temp_exclude/ 2>/dev/null || true
mv contracts/OrphiCrowdFundFixed.sol temp_exclude/ 2>/dev/null || true
mv contracts/OrphiCrowdFundModular.sol temp_exclude/ 2>/dev/null || true
mv contracts/OrphiCrowdFundPlatformEnhanced.sol temp_exclude/ 2>/dev/null || true
mv contracts/OrphiCrowdFundTestnet.sol temp_exclude/ 2>/dev/null || true
mv contracts/OrphiCrowdFundV2.sol temp_exclude/ 2>/dev/null || true
mv contracts/InternalAdminManager.sol temp_exclude/ 2>/dev/null || true
mv contracts/MatrixPlacementLib.sol temp_exclude/ 2>/dev/null || true
mv contracts/backup_OrphiCrowdFund_Old.sol temp_exclude/ 2>/dev/null || true
mv contracts/libraries/CommissionLib.sol temp_exclude/ 2>/dev/null || true
mv contracts/libraries/PoolDistribution.sol temp_exclude/ 2>/dev/null || true

echo "✅ Unused contracts moved to temp_exclude/"
echo "📏 Compiling and checking size..."

# Clean and compile
npx hardhat clean
npx hardhat compile --force
npx hardhat size-contracts | grep -E "(OrphiCrowdFund|Warning.*24.*KiB)"

echo "🔄 To restore files: mv temp_exclude/* contracts/ && mv temp_exclude/libraries/* contracts/libraries/ 2>/dev/null || true && rmdir temp_exclude/libraries temp_exclude"
