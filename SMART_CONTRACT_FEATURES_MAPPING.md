# Orphi Crowd Fund Smart Contract Features Mapping

## Contract Overview
- **Contract Name**: "Orphi Crowd Fund" (verified via `getContractName()`)
- **Version**: 2.0.0
- **Admin Wallet**: 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29 (Trezor - hardcoded)
- **Mathematical Compliance**: ✅ 100% allocation (40% + 10% + 10% + 10% + 30% = 100%)

## 🎯 CORE FRONTEND FUNCTIONS

### 1. **User Registration & Contribution**
```solidity
function contribute(address sponsor, uint8 packageTier) external
```
- **Package Tiers**: 1=$30, 2=$50, 3=$100, 4=$200 USDT
- **Events**: `ContributionMade(contributor, sponsor, amount, packageTier, timestamp)`
- **Features**: Matrix placement, commission distribution, sponsor validation

### 2. **Withdrawal System**
```solidity
function withdrawFunds() external returns (uint256 withdrawAmount, uint256 reinvestAmount)
```
- **Withdrawal Rates**: 70% (0-4 referrals), 75% (5-9), 80% (10+ referrals)
- **Auto-Reinvestment**: Remainder automatically reinvested
- **Events**: `FundsWithdrawn(user, withdrawAmount, reinvestmentAmount, timestamp)`

### 3. **Rewards Claiming**
```solidity
function claimRewards(string calldata rewardType) external returns (uint256)
```
- **Reward Types**: "sponsor", "level", "global", "leader", "help_pool"
- **Events**: `RewardsClaimed(user, amount, rewardType, timestamp)`

## 📊 VIEW FUNCTIONS FOR FRONTEND

### 1. **User Information**
```solidity
function getUserInfo(address user) external view returns (
    uint256 totalInvested,
    uint256 registrationTime,
    uint256 teamSize,
    uint256 totalEarnings,
    uint256 withdrawableAmount,
    PackageTier packageTier,
    LeaderRank leaderRank,
    bool isCapped,
    bool isActive,
    uint256 directReferralsCount
)
```

### 2. **Global Statistics**
```solidity
function getGlobalStats() external view returns (
    uint256 totalUsers,
    uint256 totalVolume,
    uint256[5] poolBalances,
    uint256 globalHelpPool,
    uint256 leaderBonusPool
)
```

### 3. **Package Configuration**
```solidity
function getPackageAmounts() external pure returns (uint256[4] memory)
```
- Returns: [30e6, 50e6, 100e6, 200e6] (USDT has 6 decimals)

### 4. **User Registration Check**
```solidity
function isUserRegistered(address user) external view returns (bool)
```

## 💰 COMMISSION SYSTEM

### Commission Distribution (100% Total)
1. **Sponsor Commission**: 40% to direct sponsor
2. **Level Bonus**: 10% distributed across 10 levels
   - Level 1: 3%
   - Levels 2-6: 1% each
   - Levels 7-10: 0.5% each
3. **Global Upline Bonus**: 10% to upline chain
4. **Leader Bonus Pool**: 10% for bi-monthly distribution
5. **Global Help Pool**: 30% for weekly distribution

### Earnings Cap System
- **4x Return Cap**: Users capped at 4x their total investment
- **Progressive Withdrawal**: Rates increase with referral count

## 🏆 RANKING SYSTEM

### LeaderRank Enum
- **NONE**: Default rank
- **BRONZE**: Shining Star (250+ team, 10+ direct referrals)
- **SILVER**: Silver Star (500+ team members)
- **GOLD**: Reserved for future implementation

## 🔒 SECURITY FEATURES

### Access Control
- **Trezor Admin Only**: Critical functions restricted to hardcoded wallet
- **Role-Based Access**: TREASURY_ROLE, EMERGENCY_ROLE, POOL_MANAGER_ROLE
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Pausable**: Emergency pause/unpause functionality

### MEV Protection
```solidity
modifier mevProtection()
```
- Prevents same-block transactions
- Anti-MEV (Maximal Extractable Value) protection

### Upgrade Security
- **48-hour Timelock**: All upgrades require 48-hour delay
- **Trezor-Only Authorization**: Only admin wallet can authorize upgrades

## 🔄 MATRIX SYSTEM

### Binary Tree Structure
- **2×∞ Matrix**: Dual-branch infinite depth placement
- **BFS Algorithm**: Breadth-First Search for optimal placement
- **Automatic Spillover**: Overflow handling for balanced tree growth

## 📅 DISTRIBUTION SCHEDULES

### Global Help Pool
- **Frequency**: Weekly (every 7 days)
- **Minimum Payout**: 25% of pool balance
- **Distribution**: Based on team performance and activity

### Leader Bonus Pool
- **Frequency**: Bi-monthly (1st and 16th of each month)
- **Eligibility**: Bronze/Silver/Gold ranked leaders only
- **Distribution**: Proportional to team size and rank

## 🛠 ADMIN FUNCTIONS (Trezor Wallet Only)

### Emergency Controls
```solidity
function emergencyPause() external onlyTrezorAdmin
function emergencyUnpause() external onlyTrezorAdmin
```

### Treasury Management
```solidity
function setTreasury(address _treasury) external onlyTrezorAdmin
```
- Treasury address must be Trezor wallet (hardcoded validation)

### Upgrade Management
```solidity
function proposeUpgrade(address newImplementation) external onlyTrezorAdmin
```
- Implements timelock mechanism for security

## 📡 EVENT SYSTEM FOR FRONTEND

### Core Events (All Indexed)
```solidity
event ContributionMade(address indexed contributor, address indexed sponsor, uint256 indexed amount, PackageTier packageTier, uint256 timestamp);
event FundsWithdrawn(address indexed user, uint256 indexed amount, uint256 indexed reinvestmentAmount, uint256 timestamp);
event RewardsClaimed(address indexed user, uint256 indexed amount, string indexed rewardType, uint256 timestamp);
event UpgradeProposed(address indexed newImplementation, uint256 unlockTime);
```

## 🔍 CONTRACT VERIFICATION

### Name Verification
```solidity
function getContractName() external pure returns (string memory)
```
- Returns: "Orphi Crowd Fund" (exact match required)

### Version Check
```solidity
function version() external pure returns (string memory)
```
- Returns: "2.0.0"

## 📋 FRONTEND INTEGRATION CHECKLIST

### ✅ COMPLETED FEATURES
- [x] Platform fee removed (100% allocation restored)
- [x] Contract name standardized to "Orphi Crowd Fund"
- [x] Trezor admin wallet hardcoded
- [x] All core functions implemented
- [x] Event system for real-time updates
- [x] Security measures implemented
- [x] Commission calculation verified

### 🔄 DEPLOYMENT REQUIREMENTS
- [ ] Deploy to BSC Testnet
- [ ] Verify ABI generation
- [ ] Test frontend integration
- [ ] Confirm commission distributions
- [ ] Validate admin controls

## 🎨 RECOMMENDED FRONTEND STRUCTURE

### Dashboard Components
1. **User Stats Card**: Total invested, earnings, team size, rank
2. **Withdrawal Interface**: Available balance, withdrawal rates, reinvestment preview
3. **Referral System**: Referral link, direct referrals list, commission tracking
4. **Matrix Visualization**: Binary tree placement, upline/downline view
5. **Rewards Center**: Claimable rewards by type, distribution history

### Navigation Structure
```
├── Dashboard
├── Contribute
│   ├── Package Selection ($30/$50/$100/$200)
│   └── Sponsor Validation
├── Earnings
│   ├── Withdrawals
│   ├── Rewards History
│   └── Commission Breakdown
├── Team
│   ├── Direct Referrals
│   ├── Matrix View
│   └── Team Statistics
├── Pools
│   ├── Global Help Pool
│   └── Leader Bonus Pool
└── Profile
    ├── Account Info
    └── Security Settings
```

### Real-Time Features
- **Live Statistics**: Contract stats auto-update
- **Event Notifications**: Real-time transaction alerts
- **Commission Tracking**: Live commission calculations
- **Matrix Updates**: Real-time placement visualization

## 🚀 NEXT STEPS

1. **Deploy Contract**: Use prepared deployment script
2. **Generate ABI**: Export for frontend integration
3. **Test Functions**: Verify all frontend functions work
4. **Commission Testing**: Validate 100% allocation math
5. **Security Audit**: Final security verification

---

**Contract Address**: TBD (after deployment)
**Network**: BSC Testnet → BSC Mainnet
**Admin Wallet**: 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29 (Trezor)
