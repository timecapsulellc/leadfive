// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "./Errors.sol";

/**
 * @title CoreOptimized
 * @dev Optimized core operations for LeadFive contract
 * Combines multiple libraries into one to reduce imports and contract size
 */
library CoreOptimized {
    
    // ========== CONSTANTS ==========
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant EARNINGS_MULTIPLIER = 4; // 4x earnings cap as per business plan
    uint256 public constant ADMIN_FEE_RATE = 500; // 5%
    uint256 public constant BATCH_SIZE = 50;
    uint256 public constant MAX_MATRIX_DEPTH = 100;
    
    // ========== OPTIMIZED STRUCTS ==========
    
    // Packed struct to save storage slots
    struct PackedUser {
        uint8 flags;              // bit 0: registered, bit 1: blacklisted, bit 2: eligible for help pool
        uint8 packageLevel;       // 1-4
        uint8 rank;              // User rank
        uint8 withdrawalRate;    // Withdrawal rate percentage
        uint32 directReferrals;  // Number of direct referrals
        uint32 teamSize;         // Total team size
        uint32 registrationTime; // Registration timestamp
        uint32 lastWithdrawal;   // Last withdrawal timestamp
        uint32 matrixLevel;      // Matrix level
        uint32 matrixCycles;     // Matrix cycles completed
        address referrer;        // Referrer address
        uint96 balance;          // User balance (up to 2^96-1)
        uint96 totalInvestment;  // Total investment
        uint96 totalEarnings;    // Total earnings
        uint96 totalWithdrawn;   // Total amount withdrawn
        uint96 earningsCap;      // Maximum earnings allowed
        uint96 leftLegVolume;    // Binary left leg volume
        uint96 rightLegVolume;   // Binary right leg volume
    }
    
    struct PackedPackage {
        uint96 price;
        uint16 directBonus;
        uint16 levelBonus;
        uint16 uplineBonus;
        uint16 leaderBonus;
        uint16 helpBonus;
        uint16 clubBonus;
    }
    
    struct PackedPool {
        uint96 balance;
        uint32 lastDistribution;
        uint32 interval;
        uint96 totalDistributed;
    }
    
    struct MatrixPosition {
        address sponsor;
        address[] downline;
        uint8 level;
        uint32 cycleCount;
        bool isComplete;
        uint256 totalEarnings;
    }
    
    // ========== PACKED USER OPERATIONS ==========
    
    function isRegistered(PackedUser storage user) internal view returns (bool) {
        return (user.flags & 1) != 0;
    }
    
    function setRegistered(PackedUser storage user, bool value) internal {
        if (value) {
            user.flags |= 1;
        } else {
            user.flags &= ~uint8(1);
        }
    }
    
    function isBlacklisted(PackedUser storage user) internal view returns (bool) {
        return (user.flags & 2) != 0;
    }
    
    function setBlacklisted(PackedUser storage user, bool value) internal {
        if (value) {
            user.flags |= 2;
        } else {
            user.flags &= ~uint8(2);
        }
    }
    
    function isEligibleForHelpPool(PackedUser storage user) internal view returns (bool) {
        return (user.flags & 4) != 0;
    }
    
    function setEligibleForHelpPool(PackedUser storage user, bool value) internal {
        if (value) {
            user.flags |= 4;
        } else {
            user.flags &= ~uint8(4);
        }
    }
    
    // ========== BUSINESS LOGIC FUNCTIONS ==========
    
    function calculateWithdrawalRate(
        uint32 directReferrals,
        uint32 teamSize,
        uint8 packageLevel
    ) internal pure returns (uint8) {
        uint8 baseRate = 40;
        
        // Direct referral bonuses
        if (directReferrals >= 10) baseRate += 20;
        else if (directReferrals >= 5) baseRate += 15;
        else if (directReferrals >= 2) baseRate += 10;
        
        // Team size bonuses
        if (teamSize >= 100) baseRate += 15;
        else if (teamSize >= 50) baseRate += 10;
        else if (teamSize >= 20) baseRate += 5;
        
        // Package level bonuses
        baseRate += packageLevel * 5;
        
        return baseRate > 90 ? 90 : baseRate;
    }
    
    function calculateBonusDistributions(
        uint96 amount,
        uint16 directBonus,
        uint16 levelBonus,
        uint16 leaderBonus,
        uint16 helpBonus,
        uint16 clubBonus
    ) internal pure returns (
        uint96 directAmount,
        uint96 levelAmount,
        uint96 leaderAmount,
        uint96 helpAmount,
        uint96 clubAmount,
        uint96 adminAmount
    ) {
        directAmount = uint96((uint256(amount) * directBonus) / BASIS_POINTS);
        levelAmount = uint96((uint256(amount) * levelBonus) / BASIS_POINTS);
        leaderAmount = uint96((uint256(amount) * leaderBonus) / BASIS_POINTS);
        helpAmount = uint96((uint256(amount) * helpBonus) / BASIS_POINTS);
        clubAmount = uint96((uint256(amount) * clubBonus) / BASIS_POINTS);
        adminAmount = uint96((uint256(amount) * ADMIN_FEE_RATE) / BASIS_POINTS);
    }
    
    function addEarningsWithCap(
        mapping(address => PackedUser) storage users,
        address userAddress,
        uint96 amount
    ) internal returns (bool success) {
        PackedUser storage user = users[userAddress];
        if (amount == 0) return false;
        
        // Check earnings cap with overflow protection
        if (user.totalEarnings > type(uint96).max - amount) return false;
        
        uint96 allowedAmount = amount;
        if (user.totalEarnings + amount > user.earningsCap) {
            if (user.totalEarnings >= user.earningsCap) return false;
            allowedAmount = user.earningsCap - user.totalEarnings;
        }
        
        user.balance += allowedAmount;
        user.totalEarnings += allowedAmount;
        
        return true;
    }
    
    // ========== MATRIX OPERATIONS (Fixed Recursion) ==========
    
    function placeInMatrixIterative(
        address user,
        address referrer,
        mapping(address => address[2]) storage binaryMatrix
    ) internal {
        address current = referrer;
        uint256 depth = 0;
        
        while (depth < MAX_MATRIX_DEPTH) {
            if (binaryMatrix[current][0] == address(0)) {
                binaryMatrix[current][0] = user;
                return;
            } else if (binaryMatrix[current][1] == address(0)) {
                binaryMatrix[current][1] = user;
                return;
            } else {
                // Spillover to left child
                current = binaryMatrix[current][0];
                depth++;
            }
        }
        
        revert Errors.MatrixPlacementFailed(user, MAX_MATRIX_DEPTH);
    }
    
    // ========== TEAM SIZE CALCULATION (Fixed Recursion) ==========
    
    function calculateTeamSizeIterative(
        address user,
        mapping(address => address[]) storage directReferrals
    ) internal view returns (uint32) {
        uint32 totalSize = 0;
        address[] memory queue = new address[](1000);
        uint256 front = 0;
        uint256 rear = 1;
        queue[0] = user;
        
        while (front < rear && front < 1000) {
            address current = queue[front++];
            address[] memory refs = directReferrals[current];
            
            for (uint256 i = 0; i < refs.length && rear < 1000; i++) {
                queue[rear++] = refs[i];
                totalSize++;
            }
        }
        
        return totalSize;
    }
    
    // ========== BATCH PROCESSING (Fixed DoS) ==========
    
    function processBatchDistribution(
        address[] memory eligibleUsers,
        mapping(address => PackedUser) storage users,
        uint96 poolBalance,
        uint256 startIndex,
        uint256 batchSize
    ) internal returns (uint256 processed, uint96 distributed) {
        if (eligibleUsers.length == 0 || poolBalance == 0) return (0, 0);
        
        uint256 endIndex = startIndex + batchSize;
        if (endIndex > eligibleUsers.length) {
            endIndex = eligibleUsers.length;
        }
        
        uint96 perUser = poolBalance / uint96(eligibleUsers.length);
        distributed = 0;
        
        for (uint256 i = startIndex; i < endIndex; i++) {
            address user = eligibleUsers[i];
            PackedUser storage userData = users[user];
            
            if (isRegistered(userData) && !isBlacklisted(userData)) {
                if (addEarningsWithCap(users, user, perUser)) {
                    distributed += perUser;
                }
            }
        }
        
        processed = endIndex - startIndex;
    }
    

    
    // ========== PRICE VALIDATION ==========
    
    function validatePrice(
        int256 price,
        int256 minPrice,
        int256 maxPrice
    ) internal pure returns (bool) {
        return price > 0 && price >= minPrice && price <= maxPrice;
    }
    
    // ========== REINVESTMENT PROCESSING (Fixed Recursion) ==========
    
    function processReinvestmentIterative(
        PackedUser storage user,
        uint96 amount,
        mapping(uint8 => PackedPackage) storage packages
    ) internal returns (uint96 remaining) {
        remaining = amount;
        
        while (remaining > 0 && user.packageLevel < 4) {
            uint8 nextLevel = user.packageLevel + 1;
            uint96 nextPrice = packages[nextLevel].price;
            
            if (remaining < nextPrice) break;
            
            user.packageLevel = nextLevel;
            user.totalInvestment += nextPrice;
            user.earningsCap += uint96(uint256(nextPrice) * EARNINGS_MULTIPLIER);
            
            remaining -= nextPrice;
        }
    }
    
    // ========== HELPER FUNCTIONS ==========
    
    function getPackagePrice(uint8 level) internal pure returns (uint96) {
        if (level == 1) return 30e18;
        if (level == 2) return 50e18;
        if (level == 3) return 100e18;
        if (level == 4) return 200e18;
        return 0;
    }
    
    function distributeMultiLevelBonuses(
        mapping(address => PackedUser) storage users,
        address user,
        uint96 levelAmount
    ) internal {
        address current = users[user].referrer;
        uint8 level = 1;
        
        while (current != address(0) && level <= 10) {
            uint96 bonus = uint96((uint256(levelAmount) * (11 - level)) / 55); // Decreasing bonus
            addEarningsWithCap(users, current, bonus);
            
            current = users[current].referrer;
            level++;
        }
    }
    
    function distributeHelpPoolBatch(
        mapping(address => PackedUser) storage users,
        PackedPool storage pool,
        uint256 distributionIndex
    ) internal {
        // Simplified batch distribution - just mark as distributed
        if (pool.balance > 0) {
            uint96 distributed = pool.balance / 10; // 10% distribution
            pool.balance -= distributed;
            pool.totalDistributed += distributed;
        }
    }
}
