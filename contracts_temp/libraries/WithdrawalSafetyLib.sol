// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title WithdrawalSafetyLib
 * @dev Library for withdrawal safety mechanisms: limits, cooldowns, reserve protection
 */
library WithdrawalSafetyLib {
    using DataStructures for DataStructures.User;
    
    struct UserWithdrawalStats {
        uint256 dailyWithdrawn;
        uint256 weeklyWithdrawn;
        uint256 monthlyWithdrawn;
        uint256 lastWithdrawalTime;
        uint256 lastDayReset;
        uint256 lastWeekReset;
        uint256 lastMonthReset;
        uint256 totalWithdrawals;
        uint256 withdrawalCount;
    }
    
    struct WithdrawalLimits {
        uint256 dailyLimit;
        uint256 weeklyLimit;
        uint256 monthlyLimit;
        uint256 minimumInterval; // Cooldown between withdrawals
        uint256 minimumAmount;
        uint256 maximumAmount;
    }
    
    // Events
    event WithdrawalLimitsUpdated(address indexed user, uint256 dailyLimit, uint256 weeklyLimit, uint256 monthlyLimit);
    event WithdrawalDenied(address indexed user, string reason, uint256 amount);
    event ReserveProtectionTriggered(uint256 contractBalance, uint256 withdrawalAmount);
    event CooldownEnforced(address indexed user, uint256 remainingTime);
    
    /**
     * @dev Initialize withdrawal limits based on user package level
     */
    function initializeUserLimits(
        uint8 packageLevel
    ) external pure returns (WithdrawalLimits memory limits) {
        // Base limits
        uint256 baseDailyLimit = 100 * 10**18; // $100 daily
        uint256 baseWeeklyLimit = 500 * 10**18; // $500 weekly  
        uint256 baseMonthlyLimit = 2000 * 10**18; // $2000 monthly
        
        // Scale limits based on package level
        uint256 multiplier = packageLevel; // 1x, 2x, 3x, 4x
        
        limits = WithdrawalLimits({
            dailyLimit: baseDailyLimit * multiplier,
            weeklyLimit: baseWeeklyLimit * multiplier,
            monthlyLimit: baseMonthlyLimit * multiplier,
            minimumInterval: 3600, // 1 hour cooldown
            minimumAmount: 10 * 10**18, // $10 minimum
            maximumAmount: baseMonthlyLimit * multiplier // Same as monthly limit
        });
        
        return limits;
    }
    
    /**
     * @dev Check if withdrawal is allowed based on all safety conditions
     */
    function checkWithdrawalAllowed(
        UserWithdrawalStats storage stats,
        WithdrawalLimits storage limits,
        uint256 amount,
        uint256 contractBalance
    ) external returns (bool allowed, string memory reason) {
        // Update time-based counters
        updateTimeBasedLimits(stats);
        
        // Check minimum amount
        if (amount < limits.minimumAmount) {
            return (false, "Amount below minimum");
        }
        
        // Check maximum amount
        if (amount > limits.maximumAmount) {
            return (false, "Amount exceeds maximum");
        }
        
        // Check cooldown period
        if (block.timestamp < stats.lastWithdrawalTime + limits.minimumInterval) {
            uint256 remainingTime = (stats.lastWithdrawalTime + limits.minimumInterval) - block.timestamp;
            emit CooldownEnforced(msg.sender, remainingTime);
            return (false, "Cooldown period active");
        }
        
        // Check daily limit
        if (stats.dailyWithdrawn + amount > limits.dailyLimit) {
            return (false, "Daily limit exceeded");
        }
        
        // Check weekly limit
        if (stats.weeklyWithdrawn + amount > limits.weeklyLimit) {
            return (false, "Weekly limit exceeded");
        }
        
        // Check monthly limit
        if (stats.monthlyWithdrawn + amount > limits.monthlyLimit) {
            return (false, "Monthly limit exceeded");
        }
        
        // Check contract balance protection (reserve 10% minimum)
        uint256 minReserve = contractBalance / 10;
        if (amount > contractBalance - minReserve) {
            emit ReserveProtectionTriggered(contractBalance, amount);
            return (false, "Insufficient contract reserves");
        }
        
        return (true, "");
    }
    
    /**
     * @dev Update withdrawal statistics after successful withdrawal
     */
    function updateWithdrawalStats(
        UserWithdrawalStats storage stats,
        uint256 amount
    ) external {
        updateTimeBasedLimits(stats);
        
        stats.dailyWithdrawn += amount;
        stats.weeklyWithdrawn += amount;
        stats.monthlyWithdrawn += amount;
        stats.lastWithdrawalTime = block.timestamp;
        stats.totalWithdrawals += amount;
        stats.withdrawalCount++;
    }
    
    /**
     * @dev Update time-based limits (reset counters when periods expire)
     */
    function updateTimeBasedLimits(
        UserWithdrawalStats storage stats
    ) internal {
        uint256 currentTime = block.timestamp;
        
        // Reset daily counter (24 hours)
        if (currentTime >= stats.lastDayReset + 86400) {
            stats.dailyWithdrawn = 0;
            stats.lastDayReset = currentTime;
        }
        
        // Reset weekly counter (7 days)
        if (currentTime >= stats.lastWeekReset + 604800) {
            stats.weeklyWithdrawn = 0;
            stats.lastWeekReset = currentTime;
        }
        
        // Reset monthly counter (30 days)
        if (currentTime >= stats.lastMonthReset + 2592000) {
            stats.monthlyWithdrawn = 0;
            stats.lastMonthReset = currentTime;
        }
    }
    
    /**
     * @dev Get available withdrawal amount for user
     */
    function getAvailableWithdrawal(
        UserWithdrawalStats storage stats,
        WithdrawalLimits storage limits,
        uint256 userBalance
    ) external view returns (uint256 available) {
        // Calculate remaining limits
        uint256 dailyRemaining = limits.dailyLimit > stats.dailyWithdrawn ? 
                                limits.dailyLimit - stats.dailyWithdrawn : 0;
        uint256 weeklyRemaining = limits.weeklyLimit > stats.weeklyWithdrawn ? 
                                 limits.weeklyLimit - stats.weeklyWithdrawn : 0;
        uint256 monthlyRemaining = limits.monthlyLimit > stats.monthlyWithdrawn ? 
                                  limits.monthlyLimit - stats.monthlyWithdrawn : 0;
        
        // Find the most restrictive limit
        available = userBalance;
        if (available > dailyRemaining) available = dailyRemaining;
        if (available > weeklyRemaining) available = weeklyRemaining;
        if (available > monthlyRemaining) available = monthlyRemaining;
        if (available > limits.maximumAmount) available = limits.maximumAmount;
        
        // Check cooldown
        if (block.timestamp < stats.lastWithdrawalTime + limits.minimumInterval) {
            available = 0;
        }
        
        return available;
    }
    
    /**
     * @dev Check if contract has sufficient reserves for withdrawal
     */
    function checkReserveProtection(
        uint256 contractBalance,
        uint256 withdrawalAmount,
        uint256 minimumReserveRatio // in basis points (1000 = 10%)
    ) external pure returns (bool sufficient, uint256 requiredReserve) {
        requiredReserve = (contractBalance * minimumReserveRatio) / 10000;
        sufficient = contractBalance >= withdrawalAmount + requiredReserve;
        
        return (sufficient, requiredReserve);
    }
    
    /**
     * @dev Calculate dynamic withdrawal limits based on user activity
     */
    function calculateDynamicLimits(
        DataStructures.User storage user,
        uint256 baseLimit
    ) external view returns (uint256 adjustedLimit) {
        adjustedLimit = baseLimit;
        
        // Increase limits for high performers
        if (user.directReferrals >= 20) {
            adjustedLimit = (adjustedLimit * 200) / 100; // 2x for 20+ referrals
        } else if (user.directReferrals >= 10) {
            adjustedLimit = (adjustedLimit * 150) / 100; // 1.5x for 10+ referrals
        } else if (user.directReferrals >= 5) {
            adjustedLimit = (adjustedLimit * 125) / 100; // 1.25x for 5+ referrals
        }
        
        // Additional bonus for team builders
        if (user.teamSize >= 500) {
            adjustedLimit = (adjustedLimit * 150) / 100; // Additional 1.5x
        } else if (user.teamSize >= 100) {
            adjustedLimit = (adjustedLimit * 125) / 100; // Additional 1.25x
        }
        
        // Cap the maximum increase
        uint256 maxLimit = baseLimit * 5; // Maximum 5x increase
        if (adjustedLimit > maxLimit) {
            adjustedLimit = maxLimit;
        }
        
        return adjustedLimit;
    }
    
    /**
     * @dev Get comprehensive withdrawal information for user
     */
    function getWithdrawalInfo(
        UserWithdrawalStats storage stats,
        WithdrawalLimits storage limits
    ) external view returns (
        uint256 dailyUsed,
        uint256 weeklyUsed,
        uint256 monthlyUsed,
        uint256 dailyRemaining,
        uint256 weeklyRemaining,
        uint256 monthlyRemaining,
        uint256 nextWithdrawalTime,
        uint256 totalWithdrawn,
        uint256 withdrawalCount
    ) {
        dailyUsed = stats.dailyWithdrawn;
        weeklyUsed = stats.weeklyWithdrawn;
        monthlyUsed = stats.monthlyWithdrawn;
        
        dailyRemaining = limits.dailyLimit > stats.dailyWithdrawn ? 
                        limits.dailyLimit - stats.dailyWithdrawn : 0;
        weeklyRemaining = limits.weeklyLimit > stats.weeklyWithdrawn ? 
                         limits.weeklyLimit - stats.weeklyWithdrawn : 0;
        monthlyRemaining = limits.monthlyLimit > stats.monthlyWithdrawn ? 
                          limits.monthlyLimit - stats.monthlyWithdrawn : 0;
        
        nextWithdrawalTime = stats.lastWithdrawalTime + limits.minimumInterval;
        if (nextWithdrawalTime < block.timestamp) {
            nextWithdrawalTime = block.timestamp;
        }
        
        totalWithdrawn = stats.totalWithdrawals;
        withdrawalCount = stats.withdrawalCount;
    }
    
    /**
     * @dev Update withdrawal limits (admin function)
     */
    function updateWithdrawalLimits(
        WithdrawalLimits storage limits,
        uint256 newDailyLimit,
        uint256 newWeeklyLimit,
        uint256 newMonthlyLimit,
        uint256 newMinimumInterval
    ) external {
        limits.dailyLimit = newDailyLimit;
        limits.weeklyLimit = newWeeklyLimit;
        limits.monthlyLimit = newMonthlyLimit;
        limits.minimumInterval = newMinimumInterval;
        
        emit WithdrawalLimitsUpdated(msg.sender, newDailyLimit, newWeeklyLimit, newMonthlyLimit);
    }
    
    /**
     * @dev Emergency withdrawal function with higher limits
     */
    function checkEmergencyWithdrawal(
        UserWithdrawalStats storage stats,
        uint256 amount,
        uint256 contractBalance,
        bool isEmergency
    ) external view returns (bool allowed, string memory reason) {
        if (!isEmergency) {
            return (false, "Not an emergency");
        }
        
        // Emergency withdrawals allow higher amounts but still protect reserves
        uint256 emergencyReserve = contractBalance / 5; // 20% reserve for emergencies
        
        if (amount > contractBalance - emergencyReserve) {
            return (false, "Insufficient emergency reserves");
        }
        
        // Still enforce minimum cooldown for security
        if (block.timestamp < stats.lastWithdrawalTime + 300) { // 5 minute cooldown
            return (false, "Emergency cooldown active");
        }
        
        return (true, "Emergency withdrawal approved");
    }
    
    /**
     * @dev Calculate withdrawal fee based on frequency and amount
     */
    function calculateWithdrawalFee(
        UserWithdrawalStats storage stats,
        uint256 amount,
        uint256 baseFeeRate // in basis points
    ) external view returns (uint256 fee) {
        fee = (amount * baseFeeRate) / 10000;
        
        // Reduce fee for loyal users (less frequent withdrawals)
        uint256 daysSinceLastWithdrawal = (block.timestamp - stats.lastWithdrawalTime) / 86400;
        
        if (daysSinceLastWithdrawal >= 30) {
            fee = fee / 2; // 50% discount for monthly withdrawals
        } else if (daysSinceLastWithdrawal >= 7) {
            fee = (fee * 75) / 100; // 25% discount for weekly withdrawals
        }
        
        // Increase fee for frequent withdrawals
        if (stats.withdrawalCount >= 10) {
            fee = (fee * 150) / 100; // 50% penalty for frequent withdrawers
        }
        
        return fee;
    }
}
