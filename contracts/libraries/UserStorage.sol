// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title UserStorage
 * @dev Library for user data storage and utilities
 */
library UserStorage {
    
    /**
     * @dev Optimized User struct for gas efficiency
     * Total: ~22 storage slots (includes matrix fields)
     */
    struct User {
        // Slot 0 (32 bytes total)
        uint96 totalInvested;        // 12 bytes - supports up to ~79B USDT
        uint96 totalEarnings;        // 12 bytes - supports up to ~79B USDT  
        uint32 registrationTime;     // 4 bytes - good until year 2106
        uint32 teamSize;             // 4 bytes - supports 4B team members
        
        // Slot 1 (32 bytes total)
        uint96 withdrawableAmount;   // 12 bytes - supports up to ~79B USDT
        uint96 totalWithdrawn;       // 12 bytes - supports up to ~79B USDT
        uint32 lastActivity;         // 4 bytes - timestamp
        uint32 lastWithdrawal;       // 4 bytes - timestamp
        
        // Slot 2 (32 bytes total)
        address sponsor;             // 20 bytes
        uint64 packageTierValue;     // 8 bytes - package tier info
        uint32 matrixPosition;       // 4 bytes
        
        // Slot 3 (32 bytes total)
        uint16 directReferrals;      // 2 bytes - supports up to 65K direct referrals
        uint16 totalReferrals;       // 2 bytes - supports up to 65K total referrals
        uint8 leaderRank;            // 1 byte - 0-255 leader levels
        uint8 suspensionLevel;       // 1 byte - suspension status
        bool isCapped;               // 1 byte - earnings cap reached
        bool isActive;               // 1 byte - account active status
        bool isBlacklisted;          // 1 byte - blacklist status
        uint8 unused1;               // 1 byte - reserved
        uint32 currentLevel;         // 4 bytes - matrix level
        uint32 leftLegCount;         // 4 bytes - left leg team count
        uint32 rightLegCount;        // 4 bytes - right leg team count
        uint144 unused2;             // 18 bytes - reserved for future use
        
        // Slot 4 (32 bytes total) - Matrix structure
        address leftChild;           // 20 bytes - left matrix child
        uint96 unused3;              // 12 bytes - reserved
        
        // Slot 5 (32 bytes total) - Matrix structure
        address rightChild;          // 20 bytes - right matrix child
        uint96 unused4;              // 12 bytes - reserved
    }

    /**
     * @dev Maximum earnings cap constant (4x investment)
     */
    uint256 internal constant EARNINGS_CAP_MULTIPLIER = 4;

    /**
     * @dev Check if user has reached earnings cap
     */
    function isCapped(User storage user) internal view returns (bool) {
        if (user.totalInvested == 0) return false;
        uint256 maxEarnings = user.totalInvested * EARNINGS_CAP_MULTIPLIER;
        return user.totalEarnings >= maxEarnings;
    }

    /**
     * @dev Check if user is active (registered and not suspended)
     */
    function isActiveUser(User storage user) internal view returns (bool) {
        return user.registrationTime > 0 && 
               user.isActive && 
               !user.isBlacklisted && 
               user.suspensionLevel == 0;
    }

    /**
     * @dev Set user active status
     */
    function setIsActive(User storage user, bool active) internal {
        user.isActive = active;
    }

    /**
     * @dev Update user's last activity timestamp
     */
    function updateActivity(User storage user) internal {
        user.lastActivity = uint32(block.timestamp);
    }

    /**
     * @dev Add earnings to user account (respecting cap)
     */
    function addEarnings(User storage user, uint256 amount) internal returns (uint256 actualAmount) {
        if (user.totalInvested == 0) return 0;
        
        uint256 maxEarnings = user.totalInvested * EARNINGS_CAP_MULTIPLIER;
        uint256 currentEarnings = user.totalEarnings;
        
        if (currentEarnings >= maxEarnings) {
            user.isCapped = true;
            return 0;
        }
        
        uint256 remainingCap = maxEarnings - currentEarnings;
        actualAmount = amount > remainingCap ? remainingCap : amount;
        
        user.totalEarnings += uint96(actualAmount);
        user.withdrawableAmount += uint96(actualAmount);
        
        if (user.totalEarnings >= maxEarnings) {
            user.isCapped = true;
            user.isActive = false;
        }
        
        updateActivity(user);
        return actualAmount;
    }

    /**
     * @dev Process withdrawal (updates counters)
     */
    function processWithdrawal(User storage user, uint256 amount) internal {
        require(user.withdrawableAmount >= amount, "Insufficient withdrawable amount");
        
        user.withdrawableAmount -= uint96(amount);
        user.totalWithdrawn += uint96(amount);
        user.lastWithdrawal = uint32(block.timestamp);
        
        updateActivity(user);
    }

    /**
     * @dev Get user's current package tier
     */
    function getPackageTier(User storage user) internal view returns (uint8) {
        if (user.packageTierValue >= 2000 * 1e6) return 4; // PACKAGE_8 ($2000)
        if (user.packageTierValue >= 1000 * 1e6) return 3; // PACKAGE_7 ($1000)
        if (user.packageTierValue >= 500 * 1e6) return 2;  // PACKAGE_6 ($500)
        if (user.packageTierValue >= 300 * 1e6) return 1;  // PACKAGE_5 ($300)
        return 0; // NONE
    }

    /**
     * @dev Calculate maximum possible earnings (4x investment)
     */
    function getMaxEarnings(User storage user) internal view returns (uint256) {
        return user.totalInvested * EARNINGS_CAP_MULTIPLIER;
    }

    /**
     * @dev Get user registration status
     */
    function isRegistered(User storage user) internal view returns (bool) {
        return user.registrationTime > 0;
    }
}
