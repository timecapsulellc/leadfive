// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "./Errors.sol";
import "./DataStructures.sol";

/**
 * @title LeadFiveCore
 * @dev Core optimized library with packed structs and essential functions
 * Saves significant bytecode by consolidating operations
 */
library LeadFiveCore {
    using Errors for *;

    // Optimized packed user data - fits in 3 storage slots
    struct PackedUser {
        // Slot 1 (32 bytes)
        uint8 flags;           // bit 0: isRegistered, bit 1: isBlacklisted, bit 2: isActive, bit 3: isEligibleForHelpPool
        uint8 packageLevel;    // 1-4
        uint8 rank;           // user rank
        uint8 leaderRank;     // leader rank
        uint32 registrationTime;
        uint32 directReferrals;
        uint32 teamSize;
        uint32 matrixLevel;
        uint32 matrixCycles;
        uint32 lastWithdrawal;
        uint32 lastHelpPoolClaim;
        
        // Slot 2 (32 bytes)
        uint96 balance;
        uint96 totalInvestment;
        uint32 matrixPosition;
        
        // Slot 3 (32 bytes)
        uint96 totalEarnings;
        uint96 earningsCap;
        uint32 withdrawalRate;
        uint32 pendingRewards;
        
        // Slot 4 (32 bytes)
        uint96 leftLegVolume;
        uint96 rightLegVolume;
        uint64 reserved; // For future use
        
        // Separate storage for referrer and referral code
        address referrer;
        string referralCode;
    }

    // Optimized package struct - fits in 1 slot
    struct PackedPackage {
        uint96 price;
        uint16 directBonus;    // basis points
        uint16 levelBonus;     // basis points
        uint16 uplineBonus;    // basis points
        uint16 leaderBonus;    // basis points
        uint16 helpBonus;      // basis points
        uint16 clubBonus;      // basis points
    }

    // Pool struct - fits in 1 slot
    struct PackedPool {
        uint96 balance;
        uint32 lastDistribution;
        uint32 interval;
        uint96 totalDistributed;
    }

    // Constants to save gas
    uint256 constant EARNINGS_MULTIPLIER = 3;
    uint256 constant BASIS_POINTS = 10000;
    uint256 constant ADMIN_FEE_RATE = 500; // 5%
    uint256 constant MAX_DEPTH = 100;
    uint256 constant BATCH_SIZE = 50;

    /**
     * @dev Check if user is registered using bit flags
     */
    function isRegistered(PackedUser storage user) internal view returns (bool) {
        return (user.flags & 1) != 0;
    }

    /**
     * @dev Check if user is blacklisted using bit flags
     */
    function isBlacklisted(PackedUser storage user) internal view returns (bool) {
        return (user.flags & 2) != 0;
    }

    /**
     * @dev Set user registration flag
     */
    function setRegistered(PackedUser storage user, bool registered) internal {
        if (registered) {
            user.flags |= 1;
        } else {
            user.flags &= ~uint8(1);
        }
    }

    /**
     * @dev Set user blacklist flag
     */
    function setBlacklisted(PackedUser storage user, bool blacklisted) internal {
        if (blacklisted) {
            user.flags |= 2;
        } else {
            user.flags &= ~uint8(2);
        }
    }

    /**
     * @dev Calculate BNB required with overflow protection
     */
    function calculateBNBRequired(
        uint96 usdAmount,
        int256 bnbPrice
    ) internal pure returns (uint96) {
        if (bnbPrice <= 0) revert Errors.InvalidOraclePrice(bnbPrice);
        
        // Convert price to 18 decimals and calculate
        uint256 bnbAmount = (uint256(usdAmount) * 1e18) / (uint256(bnbPrice) * 1e10);
        
        if (bnbAmount > type(uint96).max) revert Errors.InvalidAmount(bnbAmount);
        
        return uint96(bnbAmount);
    }

    /**
     * @dev Calculate bonus distributions in one function to save gas
     */
    function calculateBonusDistributions(
        uint96 amount,
        PackedPackage memory pkg
    ) internal pure returns (
        uint96 directAmount,
        uint96 levelAmount,
        uint96 leaderAmount,
        uint96 helpAmount,
        uint96 clubAmount,
        uint96 adminAmount
    ) {
        unchecked {
            directAmount = uint96((amount * pkg.directBonus) / BASIS_POINTS);
            levelAmount = uint96((amount * pkg.levelBonus) / BASIS_POINTS);
            leaderAmount = uint96((amount * pkg.leaderBonus) / BASIS_POINTS);
            helpAmount = uint96((amount * pkg.helpBonus) / BASIS_POINTS);
            clubAmount = uint96((amount * pkg.clubBonus) / BASIS_POINTS);
            adminAmount = uint96((amount * ADMIN_FEE_RATE) / BASIS_POINTS);
        }
    }

    /**
     * @dev Add earnings with cap protection - optimized version
     */
    function addEarningsWithCap(
        PackedUser storage user,
        uint96 amount,
        uint8 bonusType
    ) internal returns (uint96 added) {
        if (amount == 0) return 0;
        if (!isRegistered(user)) revert Errors.UserNotRegistered(address(0));
        if (isBlacklisted(user)) revert Errors.UserBlacklisted(address(0));

        // Check earnings cap
        uint96 availableEarnings = user.earningsCap > user.totalEarnings ? 
            user.earningsCap - user.totalEarnings : 0;
        
        added = amount > availableEarnings ? availableEarnings : amount;
        
        if (added > 0) {
            user.balance += added;
            user.totalEarnings += added;
        }
    }

    /**
     * @dev Calculate withdrawal rate based on performance - optimized
     */
    function calculateWithdrawalRate(
        uint32 directReferrals,
        uint32 teamSize,
        uint8 packageLevel
    ) internal pure returns (uint8) {
        unchecked {
            uint8 baseRate = 40; // 40% base
            
            // Bonus for direct referrals (max 20%)
            uint8 directBonus = directReferrals > 10 ? 20 : uint8(directReferrals * 2);
            
            // Bonus for team size (max 15%)
            uint8 teamBonus = teamSize > 100 ? 15 : uint8((teamSize * 15) / 100);
            
            // Bonus for package level (max 15%)
            uint8 packageBonus = packageLevel * 3; // 3% per level
            
            uint16 totalRate = uint16(baseRate) + directBonus + teamBonus + packageBonus;
            
            return totalRate > 90 ? 90 : uint8(totalRate); // Max 90%
        }
    }

    /**
     * @dev Iterative team size calculation to prevent recursion
     */
    function calculateTeamSizeIterative(
        address user,
        mapping(address => address[]) storage directReferrals
    ) internal view returns (uint32) {
        uint32 totalSize = 0;
        address[MAX_DEPTH] memory queue;
        uint256 front = 0;
        uint256 rear = 1;
        queue[0] = user;
        
        while (front < rear && front < MAX_DEPTH) {
            address current = queue[front++];
            address[] storage refs = directReferrals[current];
            
            for (uint i = 0; i < refs.length && rear < MAX_DEPTH; i++) {
                queue[rear++] = refs[i];
                totalSize++;
            }
        }
        
        return totalSize;
    }

    /**
     * @dev Safe matrix placement without recursion
     */
    function placeInMatrixIterative(
        address user,
        address referrer,
        mapping(address => address[2]) storage binaryMatrix
    ) internal {
        address current = referrer;
        uint256 depth = 0;
        
        while (depth < MAX_DEPTH) {
            if (binaryMatrix[current][0] == address(0)) {
                binaryMatrix[current][0] = user;
                return;
            } else if (binaryMatrix[current][1] == address(0)) {
                binaryMatrix[current][1] = user;
                return;
            } else {
                current = binaryMatrix[current][0]; // Spillover to left
                depth++;
            }
        }
        
        revert Errors.MatrixPlacementFailed(user, depth);
    }

    /**
     * @dev Batch process function for pool distributions
     */
    function processBatchDistribution(
        address[] storage eligibleUsers,
        mapping(address => PackedUser) storage users,
        uint96 totalAmount,
        uint256 startIndex,
        uint256 batchSize
    ) internal returns (uint256 processed, uint96 distributed) {
        uint256 endIndex = startIndex + batchSize;
        if (endIndex > eligibleUsers.length) {
            endIndex = eligibleUsers.length;
        }
        
        if (endIndex <= startIndex || totalAmount == 0) {
            return (0, 0);
        }
        
        uint96 perUser = totalAmount / uint96(eligibleUsers.length);
        
        for (uint256 i = startIndex; i < endIndex; i++) {
            address user = eligibleUsers[i];
            PackedUser storage userData = users[user];
            
            if (isRegistered(userData) && !isBlacklisted(userData)) {
                uint96 added = addEarningsWithCap(userData, perUser, 4);
                distributed += added;
                userData.lastHelpPoolClaim = uint32(block.timestamp);
            }
            processed++;
        }
    }

    /**
     * @dev Validate oracle price with bounds checking
     */
    function validateOraclePrice(
        int256 price,
        uint256 updatedAt,
        int256 minPrice,
        int256 maxPrice
    ) internal view {
        if (price <= 0) revert Errors.InvalidOraclePrice(price);
        if (block.timestamp - updatedAt > 1800) revert Errors.OracleDataStale(updatedAt); // 30 min max
        if (price < minPrice || price > maxPrice) revert Errors.PriceOutOfBounds(price, minPrice, maxPrice);
    }

    /**
     * @dev Get median price from array (for multi-oracle system)
     */
    function getMedianPrice(int256[] memory prices, uint256 validCount) internal pure returns (int256) {
        if (validCount == 0) revert Errors.InsufficientOracleData(0, 2);
        
        // Simple bubble sort for small arrays
        for (uint256 i = 0; i < validCount - 1; i++) {
            for (uint256 j = 0; j < validCount - i - 1; j++) {
                if (prices[j] > prices[j + 1]) {
                    int256 temp = prices[j];
                    prices[j] = prices[j + 1];
                    prices[j + 1] = temp;
                }
            }
        }
        
        return validCount % 2 == 0 ? 
            (prices[validCount / 2 - 1] + prices[validCount / 2]) / 2 :
            prices[validCount / 2];
    }
}
