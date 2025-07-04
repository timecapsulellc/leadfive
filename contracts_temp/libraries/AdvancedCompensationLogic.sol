// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title Advanced Compensation Logic Library
 * @dev Handles all bonus calculations and distributions
 */
library AdvancedCompensationLogic {
    
    struct BonusDistribution {
        address recipient;
        address payer;
        uint256 amount;
        uint8 bonusType; // 0=DIRECT, 1=LEVEL, 2=BINARY, 3=LEADER, 4=CLUB_POOL, 5=GHP
        uint8 level;
        uint256 timestamp;
        uint256 packageTier;
    }
    
    // Constants
    uint256 constant BASIS_POINTS = 10000;
    uint256 constant DIRECT_BONUS_BP = 1000; // 10%
    uint256 constant LEVEL_1_BONUS_BP = 500; // 5%
    uint256 constant LEVEL_2_BONUS_BP = 300; // 3%
    uint256 constant LEVEL_3_BONUS_BP = 200; // 2%
    uint256 constant LEVEL_4_8_BONUS_BP = 100; // 1%
    uint256 constant GHP_PERCENTAGE_BP = 300; // 3%
    uint256 constant CLUB_POOL_BP = 500; // 5%
    
    function calculateDirectBonus(uint256 amount) internal pure returns (uint256) {
        return (amount * DIRECT_BONUS_BP) / BASIS_POINTS;
    }
    
    function calculateLevelBonus(uint256 amount, uint8 level) internal pure returns (uint256) {
        uint256 bonusPercentage;
        
        if (level == 1) {
            bonusPercentage = LEVEL_1_BONUS_BP;
        } else if (level == 2) {
            bonusPercentage = LEVEL_2_BONUS_BP;
        } else if (level == 3) {
            bonusPercentage = LEVEL_3_BONUS_BP;
        } else if (level >= 4 && level <= 8) {
            bonusPercentage = LEVEL_4_8_BONUS_BP;
        } else {
            return 0;
        }
        
        return (amount * bonusPercentage) / BASIS_POINTS;
    }
    
    function calculateBinaryBonus(uint256 amount) internal pure returns (uint256) {
        return (amount * 200) / BASIS_POINTS; // 2%
    }
    
    function calculatePoolContributions(uint256 amount) internal pure returns (
        uint256 ghpContribution,
        uint256 clubPoolContribution,
        uint256 leaderPoolContribution
    ) {
        ghpContribution = (amount * GHP_PERCENTAGE_BP) / BASIS_POINTS;
        clubPoolContribution = (amount * CLUB_POOL_BP) / BASIS_POINTS;
        leaderPoolContribution = (amount * 200) / BASIS_POINTS; // 2%
    }
    
    function getWithdrawalPercentage(uint256 directRefs) internal pure returns (uint256) {
        if (directRefs >= 10) return 8000; // 80%
        if (directRefs >= 5) return 7500;  // 75%
        return 7000; // 70%
    }
}
