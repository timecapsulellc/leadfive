// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title CommissionLibrary
 * @dev Library for commission calculations and distribution logic
 */
library CommissionLibrary {
    
    // Commission rate constants (basis points)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SPONSOR_COMMISSION_RATE = 4000;     // 40%
    uint256 public constant LEVEL_BONUS_RATE = 1000;           // 10%
    uint256 public constant GLOBAL_UPLINE_RATE = 1000;         // 10%
    uint256 public constant LEADER_BONUS_RATE = 1000;          // 10%
    uint256 public constant GLOBAL_HELP_POOL_RATE = 3000;      // 30%
    
    /**
     * @dev Calculate sponsor commission (40%)
     * @param amount Package amount
     * @return commission amount
     */
    function calculateSponsorCommission(uint256 amount) internal pure returns (uint256) {
        return (amount * SPONSOR_COMMISSION_RATE) / BASIS_POINTS;
    }
    
    /**
     * @dev Calculate level bonus (10%)
     * @param amount Package amount
     * @return commission amount
     */
    function calculateLevelBonus(uint256 amount) internal pure returns (uint256) {
        return (amount * LEVEL_BONUS_RATE) / BASIS_POINTS;
    }
    
    /**
     * @dev Calculate global upline bonus (10%)
     * @param amount Package amount
     * @return commission amount
     */
    function calculateGlobalUplineBonus(uint256 amount) internal pure returns (uint256) {
        return (amount * GLOBAL_UPLINE_RATE) / BASIS_POINTS;
    }
    
    /**
     * @dev Calculate leader bonus (10%)
     * @param amount Package amount
     * @return commission amount
     */
    function calculateLeaderBonus(uint256 amount) internal pure returns (uint256) {
        return (amount * LEADER_BONUS_RATE) / BASIS_POINTS;
    }
    
    /**
     * @dev Calculate global help pool allocation (30%)
     * @param amount Package amount
     * @return commission amount
     */
    function calculateGlobalHelpPool(uint256 amount) internal pure returns (uint256) {
        return (amount * GLOBAL_HELP_POOL_RATE) / BASIS_POINTS;
    }
    
    /**
     * @dev Validate commission rates sum to 100%
     * @return true if valid
     */
    function validateCommissionRates() internal pure returns (bool) {
        uint256 total = SPONSOR_COMMISSION_RATE + LEVEL_BONUS_RATE + 
                       GLOBAL_UPLINE_RATE + LEADER_BONUS_RATE + GLOBAL_HELP_POOL_RATE;
        return total == BASIS_POINTS;
    }
    
    /**
     * @dev Calculate level bonus rates for 10 levels
     * @return Array of level bonus rates
     */
    function getLevelBonusRates() internal pure returns (uint256[10] memory) {
        return [
            uint256(300),  // Level 1: 3%
            uint256(100),  // Level 2: 1%
            uint256(100),  // Level 3: 1%
            uint256(100),  // Level 4: 1%
            uint256(100),  // Level 5: 1%
            uint256(100),  // Level 6: 1%
            uint256(50),   // Level 7: 0.5%
            uint256(50),   // Level 8: 0.5%
            uint256(50),   // Level 9: 0.5%
            uint256(50)    // Level 10: 0.5%
        ];
    }
    
    /**
     * @dev Calculate earnings cap (4x multiplier)
     * @param investment User's total investment
     * @return Maximum earnings allowed
     */
    function calculateEarningsCap(uint256 investment) internal pure returns (uint256) {
        return investment * 4;
    }
    
    /**
     * @dev Check if user has reached earnings cap
     * @param totalEarnings User's total earnings
     * @param totalInvestment User's total investment
     * @return true if capped
     */
    function isEarningsCapped(uint256 totalEarnings, uint256 totalInvestment) internal pure returns (bool) {
        return totalEarnings >= calculateEarningsCap(totalInvestment);
    }
}
