// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title WithdrawalSafety
 * @dev Implements withdrawal limits, cooldowns, and reserve protection
 */
library WithdrawalSafety {
    
    struct WithdrawalLimits {
        uint256 dailyLimit;
        uint256 weeklyLimit;
        uint256 monthlyLimit;
        uint256 minimumInterval; // seconds between withdrawals
    }
    
    struct UserWithdrawalStats {
        uint256 lastWithdrawalTime;
        uint256 dailyWithdrawn;
        uint256 weeklyWithdrawn;
        uint256 monthlyWithdrawn;
        uint256 lastDailyReset;
        uint256 lastWeeklyReset;
        uint256 lastMonthlyReset;
    }
    
    uint256 constant MIN_CONTRACT_BALANCE = 100 * 10**18; // 100 USDT minimum
    uint256 constant RESERVE_PERCENTAGE = 2000; // 20% reserve
    uint256 constant BASIS_POINTS = 10000;
    
    event WithdrawalLimitExceeded(address user, string limitType, uint256 requested, uint256 limit);
    event CooldownNotMet(address user, uint256 timeRemaining);
    event ReserveProtectionTriggered(uint256 contractBalance, uint256 minRequired);
    
    /**
     * @dev Check if withdrawal is allowed based on limits and cooldowns
     */
    function checkWithdrawalAllowed(
        UserWithdrawalStats storage stats,
        WithdrawalLimits storage limits,
        uint256 amount,
        uint256 contractBalance
    ) internal returns (bool allowed, string memory reason) {
        // Reset periods if needed
        _resetPeriods(stats);
        
        // Check cooldown
        if (block.timestamp < stats.lastWithdrawalTime + limits.minimumInterval) {
            uint256 timeRemaining = (stats.lastWithdrawalTime + limits.minimumInterval) - block.timestamp;
            emit CooldownNotMet(msg.sender, timeRemaining);
            return (false, "Cooldown period not met");
        }
        
        // Check daily limit
        if (stats.dailyWithdrawn + amount > limits.dailyLimit) {
            emit WithdrawalLimitExceeded(msg.sender, "daily", amount, limits.dailyLimit - stats.dailyWithdrawn);
            return (false, "Daily withdrawal limit exceeded");
        }
        
        // Check weekly limit
        if (stats.weeklyWithdrawn + amount > limits.weeklyLimit) {
            emit WithdrawalLimitExceeded(msg.sender, "weekly", amount, limits.weeklyLimit - stats.weeklyWithdrawn);
            return (false, "Weekly withdrawal limit exceeded");
        }
        
        // Check monthly limit
        if (stats.monthlyWithdrawn + amount > limits.monthlyLimit) {
            emit WithdrawalLimitExceeded(msg.sender, "monthly", amount, limits.monthlyLimit - stats.monthlyWithdrawn);
            return (false, "Monthly withdrawal limit exceeded");
        }
        
        // Check contract reserve
        uint256 requiredReserve = (contractBalance * RESERVE_PERCENTAGE) / BASIS_POINTS;
        if (contractBalance - amount < requiredReserve || contractBalance - amount < MIN_CONTRACT_BALANCE) {
            emit ReserveProtectionTriggered(contractBalance, requiredReserve);
            return (false, "Insufficient contract reserve");
        }
        
        return (true, "");
    }
    
    /**
     * @dev Update withdrawal statistics after successful withdrawal
     */
    function updateWithdrawalStats(
        UserWithdrawalStats storage stats,
        uint256 amount
    ) internal {
        stats.lastWithdrawalTime = block.timestamp;
        stats.dailyWithdrawn += amount;
        stats.weeklyWithdrawn += amount;
        stats.monthlyWithdrawn += amount;
    }
    
    /**
     * @dev Reset withdrawal periods if time has passed
     */
    function _resetPeriods(UserWithdrawalStats storage stats) private {
        // Daily reset
        if (block.timestamp >= stats.lastDailyReset + 1 days) {
            stats.dailyWithdrawn = 0;
            stats.lastDailyReset = block.timestamp;
        }
        
        // Weekly reset
        if (block.timestamp >= stats.lastWeeklyReset + 7 days) {
            stats.weeklyWithdrawn = 0;
            stats.lastWeeklyReset = block.timestamp;
        }
        
        // Monthly reset
        if (block.timestamp >= stats.lastMonthlyReset + 30 days) {
            stats.monthlyWithdrawn = 0;
            stats.lastMonthlyReset = block.timestamp;
        }
    }
    
    /**
     * @dev Initialize default withdrawal limits based on package
     */
    function initializeUserLimits(uint8 packageLevel) internal pure returns (WithdrawalLimits memory) {
        uint256 baseDaily = 100 * 10**18; // $100 base
        
        return WithdrawalLimits({
            dailyLimit: baseDaily * (packageLevel + 1),
            weeklyLimit: baseDaily * (packageLevel + 1) * 5,
            monthlyLimit: baseDaily * (packageLevel + 1) * 20,
            minimumInterval: 6 hours
        });
    }
    
    /**
     * @dev Calculate available withdrawal amount respecting all limits
     */
    function getAvailableWithdrawal(
        UserWithdrawalStats storage stats,
        WithdrawalLimits storage limits,
        uint256 userBalance
    ) internal view returns (uint256) {
        // Note: Cannot call _resetPeriods in view function
        uint256 dailyAvailable = limits.dailyLimit > stats.dailyWithdrawn ? 
            limits.dailyLimit - stats.dailyWithdrawn : 0;
            
        uint256 weeklyAvailable = limits.weeklyLimit > stats.weeklyWithdrawn ? 
            limits.weeklyLimit - stats.weeklyWithdrawn : 0;
            
        uint256 monthlyAvailable = limits.monthlyLimit > stats.monthlyWithdrawn ? 
            limits.monthlyLimit - stats.monthlyWithdrawn : 0;
        
        // Return minimum of all limits and user balance
        uint256 minLimit = dailyAvailable;
        if (weeklyAvailable < minLimit) minLimit = weeklyAvailable;
        if (monthlyAvailable < minLimit) minLimit = monthlyAvailable;
        if (userBalance < minLimit) minLimit = userBalance;
        
        return minLimit;
    }
}
