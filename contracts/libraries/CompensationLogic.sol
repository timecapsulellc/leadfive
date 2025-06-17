// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title CompensationLogic
 * @dev Compensation plan logic for OrphiCrowdFund
 */
library CompensationLogic {
    using DataStructures for DataStructures.User;
    
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant DIRECT_BONUS_BP = 4000; // 40% (UPDATED)
    uint256 public constant GHP_PERCENTAGE_BP = 3000; // 30% (UPDATED)
    uint256 public constant CLUB_POOL_BP = 500; // 5%
    uint256 public constant EARNINGS_CAP_BASIS_POINTS = 30000; // 300%
    
    // Level bonuses: L1(3%), L2(1%), L3(1%), L4-L10(0.5% each) - UPDATED
    function getLevelBonus(uint8 _level) internal pure returns (uint256) {
        require(_level >= 1 && _level <= 10, "Invalid level");
        if (_level == 1) return 300; // 3%
        if (_level == 2) return 100; // 1%
        if (_level == 3) return 100; // 1%
        return 50; // L4-L10 are all 0.5%
    }
    
    // Package amounts in USDT (multiplied by 1e18)
    function getPackageAmountByIndex(uint8 _index) internal pure returns (uint256) {
        require(_index >= 1 && _index <= 8, "Invalid package index");
        if (_index == 1) return 30e18;   // $30
        if (_index == 2) return 50e18;   // $50
        if (_index == 3) return 100e18;  // $100
        if (_index == 4) return 200e18;  // $200
        if (_index == 5) return 300e18;  // $300
        if (_index == 6) return 500e18;  // $500
        if (_index == 7) return 1000e18; // $1000
        if (_index == 8) return 2000e18; // $2000
        return 0;
    }

    /**
     * @dev Calculate direct bonus amount
     */
    function calculateDirectBonus(uint256 _investmentAmount) internal pure returns (uint256) {
        return (_investmentAmount * DIRECT_BONUS_BP) / BASIS_POINTS;
    }

    /**
     * @dev Calculate level bonus amount
     */
    function calculateLevelBonus(uint256 _investmentAmount, uint8 _level) internal pure returns (uint256) {
        uint256 levelRate = getLevelBonus(_level);
        return (_investmentAmount * levelRate) / BASIS_POINTS;
    }
    
    /**
     * @dev Calculate global upline bonus (10% split across 30 levels)
     */
    function calculateGlobalUplineBonus(uint256 _investmentAmount) internal pure returns (uint256) {
        return (_investmentAmount * 1000) / BASIS_POINTS; // 10%
    }
    
    /**
     * @dev Calculate leader bonus pool contribution (10%)
     */
    function calculateLeaderBonusContribution(uint256 _investmentAmount) internal pure returns (uint256) {
        return (_investmentAmount * 1000) / BASIS_POINTS; // 10%
    }
    
    /**
     * @dev Calculate global help pool contribution (30%)
     */
    function calculateGHPContribution(uint256 _investmentAmount) internal pure returns (uint256) {
        return (_investmentAmount * GHP_PERCENTAGE_BP) / BASIS_POINTS; // 30%
    }

    /**
     * @dev Calculate club pool contribution
     */
    function calculateClubPoolContribution(uint256 _investmentAmount) internal pure returns (uint256) {
        return (_investmentAmount * CLUB_POOL_BP) / BASIS_POINTS;
    }

    /**
     * @dev Get package amount for tier
     */
    function getPackageAmount(DataStructures.PackageTier _tier) internal pure returns (uint256) {
        require(_tier != DataStructures.PackageTier.NONE && uint8(_tier) <= 8, "Invalid tier");
        return getPackageAmountByIndex(uint8(_tier));
    }

    /**
     * @dev Check if user has reached earnings cap
     */
    function hasReachedEarningsCap(uint256 _totalInvestment, uint256 _totalEarnings) internal pure returns (bool) {
        uint256 cap = (_totalInvestment * EARNINGS_CAP_BASIS_POINTS) / BASIS_POINTS;
        return _totalEarnings >= cap;
    }

    /**
     * @dev Calculate withdrawal percentage based on direct referrals
     */
    function getWithdrawalPercentage(uint256 _directReferrals) internal pure returns (uint256) {
        if (_directReferrals >= 10) {
            return 8000; // 80%
        } else if (_directReferrals >= 5) {
            return 7500; // 75%
        } else {
            return 7000; // 70%
        }
    }
}
