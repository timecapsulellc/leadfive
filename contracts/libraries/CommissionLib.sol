// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title CommissionLib
 * @dev Library for handling commission calculations and distributions
 */
library CommissionLib {
    uint256 constant BASIS_POINTS = 10000;
    uint256 constant EARNINGS_MULTIPLIER = 4;
    
    struct CommissionRates {
        uint16 directBonus;
        uint16 levelBonus;
        uint16 uplineBonus;
        uint16 leaderBonus;
        uint16 helpBonus;
        uint16 clubBonus;
    }
    
    struct Package {
        uint96 price;
        CommissionRates rates;
    }
    
    struct User {
        bool isRegistered;
        bool isBlacklisted;
        address referrer;
        uint96 balance;
        uint96 totalInvestment;
        uint96 totalEarnings;
        uint96 earningsCap;
        uint32 directReferrals;
        uint32 teamSize;
        uint8 packageLevel;
        uint8 rank;
        uint8 withdrawalRate;
        uint32 lastHelpPoolClaim;
        bool isEligibleForHelpPool;
        uint32 matrixPosition;
        uint32 matrixLevel;
        uint32 registrationTime;
        string referralCode;
    }

    /**
     * @dev Initialize package configuration
     */
    function initializePackages(mapping(uint8 => DataStructures.Package) storage packages) internal {
        packages[1] = DataStructures.Package(30e18, 4000, 1000, 1000, 1000, 3000, 0);
        packages[2] = DataStructures.Package(50e18, 4000, 1000, 1000, 1000, 3000, 0);
        packages[3] = DataStructures.Package(100e18, 4000, 1000, 1000, 1000, 3000, 0);
        packages[4] = DataStructures.Package(200e18, 4000, 1000, 1000, 1000, 3000, 0);
    }

    /**
     * @dev Calculate direct sponsor bonus
     */
    function calculateDirectBonus(uint96 amount, uint16 rate) 
        internal 
        pure 
        returns (uint96) 
    {
        return uint96((amount * rate) / BASIS_POINTS);
    }
    
    /**
     * @dev Calculate level bonus distribution
     */
    function calculateLevelBonus(uint96 amount, uint16 rate, uint8 level) 
        internal 
        pure 
        returns (uint96) 
    {
        uint16[10] memory levelRates = [300, 100, 100, 50, 50, 50, 50, 50, 50, 50];
        uint96 totalBonus = uint96((amount * rate) / BASIS_POINTS);
        
        if (level >= 10) return 0;
        return uint96((totalBonus * levelRates[level]) / 1000);
    }
    
    /**
     * @dev Calculate upline bonus per member
     */
    function calculateUplineBonus(uint96 amount, uint16 rate, uint8 uplineCount) 
        internal 
        pure 
        returns (uint96) 
    {
        if (uplineCount == 0) return 0;
        uint96 totalBonus = uint96((amount * rate) / BASIS_POINTS);
        return totalBonus / uplineCount;
    }
    
    /**
     * @dev Calculate pool contributions
     */
    function calculatePoolContributions(uint96 amount, CommissionRates memory rates) 
        internal 
        pure 
        returns (uint96 leaderPool, uint96 helpPool, uint96 clubPool) 
    {
        leaderPool = uint96((amount * rates.leaderBonus) / BASIS_POINTS);
        helpPool = uint96((amount * rates.helpBonus) / BASIS_POINTS);
        clubPool = uint96((amount * rates.clubBonus) / BASIS_POINTS);
    }
    
    /**
     * @dev Calculate progressive withdrawal rate
     */
    function getProgressiveWithdrawalRate(uint32 directReferralCount) 
        internal 
        pure 
        returns (uint8) 
    {
        if (directReferralCount >= 20) {
            return 80; // 80% withdrawal, 20% reinvestment
        } else if (directReferralCount >= 5) {
            return 75; // 75% withdrawal, 25% reinvestment
        } else {
            return 70; // 70% withdrawal, 30% reinvestment
        }
    }
    
    /**
     * @dev Calculate admin fee
     */
    function calculateAdminFee(uint96 amount, uint256 feeRate) 
        internal 
        pure 
        returns (uint96) 
    {
        return uint96((amount * feeRate) / BASIS_POINTS);
    }

    /**
     * @dev Calculate withdrawal breakdown
     */
    function calculateWithdrawalBreakdown(User storage user, uint96 amount, uint256 adminFeeRate) 
        internal 
        view 
        returns (uint96 withdrawable, uint96 adminFee, uint96 userReceives, uint96 reinvestment) 
    {
        uint8 withdrawalRate = getProgressiveWithdrawalRate(user.directReferrals);
        withdrawable = (amount * withdrawalRate) / 100;
        reinvestment = amount - withdrawable;
        adminFee = calculateAdminFee(withdrawable, adminFeeRate);
        userReceives = withdrawable - adminFee;
    }

    /**
     * @dev Distribute reinvestment (simplified)
     */
    function distributeReinvestment(
        mapping(address => User) storage users,
        mapping(address => address[30]) storage uplineChain,
        address user,
        uint96 amount
    ) internal {
        // 40% Level, 30% Upline, 30% Help distribution
        // Simplified implementation - just return for now
    }

    /**
     * @dev Distribute level bonuses through upline chain
     */
    function distributeLevelBonuses(
        mapping(address => DataStructures.User) storage users,
        mapping(address => address[30]) storage uplineChain,
        address user,
        uint96 amount,
        uint16 levelBonusRate
    ) internal {
        address currentUpline = users[user].referrer;
        uint8 level = 1;
        
        while (currentUpline != address(0) && level <= 10) {
            if (users[currentUpline].isRegistered && !users[currentUpline].isBlacklisted) {
                uint96 bonus = uint96((amount * levelBonusRate) / BASIS_POINTS / 10); // Distribute across 10 levels
                
                if (users[currentUpline].totalEarnings + bonus <= users[currentUpline].earningsCap) {
                    users[currentUpline].balance += bonus;
                }
            }
            
            currentUpline = users[currentUpline].referrer;
            level++;
        }
    }
}
