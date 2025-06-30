// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title BonusDistributionLib
 * @dev Library for handling all bonus calculations and distributions
 * Extracted from main contract to reduce bytecode size
 */
library BonusDistributionLib {
    
    event BonusDistributed(address indexed recipient, uint96 amount, uint8 bonusType);
    event EarningsCapReached(address indexed user, uint96 exceededAmount);
    
    /**
     * @dev Distribute 10-level bonus as per business plan
     * Level 1: 3%, Levels 2-6: 1% each, Levels 7-10: 0.5% each
     */
    function distribute10LevelBonus(
        mapping(address => DataStructures.User) storage users,
        address user,
        uint96 amount
    ) external {
        // Level rates in basis points: [300, 100, 100, 100, 100, 100, 50, 50, 50, 50]
        uint16[10] memory levelRates = [300, 100, 100, 100, 100, 100, 50, 50, 50, 50];
        
        address currentReferrer = users[user].referrer;
        for(uint8 i = 0; i < 10 && currentReferrer != address(0); i++) {
            if(users[currentReferrer].isRegistered && !users[currentReferrer].isBlacklisted) {
                uint96 bonus = uint96((uint256(amount) * levelRates[i]) / 10000);
                addEarningsWithCap(users, currentReferrer, bonus, 2 + i);
            }
            currentReferrer = users[currentReferrer].referrer;
        }
    }
    
    /**
     * @dev Distribute global upline bonus (10% to 30 uplines equally)
     */
    function distributeUplineBonus(
        mapping(address => DataStructures.User) storage users,
        address user,
        uint96 amount
    ) external {
        uint96 uplineAmount = uint96((uint256(amount) * 1000) / 10000); // 10%
        uint96 perUpline = uplineAmount / 30;
        
        address current = users[user].referrer;
        for(uint8 i = 0; i < 30 && current != address(0); i++) {
            if(users[current].isRegistered && !users[current].isBlacklisted) {
                addEarningsWithCap(users, current, perUpline, 20); // Bonus type 20 for upline
            }
            current = users[current].referrer;
        }
    }
    
    /**
     * @dev Add earnings with 4x cap enforcement
     */
    function addEarningsWithCap(
        mapping(address => DataStructures.User) storage users,
        address userAddress,
        uint96 amount,
        uint8 bonusType
    ) public {
        require(amount > 0, "Invalid amount");
        
        DataStructures.User storage userData = users[userAddress];
        
        // Check for overflow protection
        require(userData.totalEarnings <= type(uint96).max - amount, "Overflow");
        
        // Respect earnings cap
        uint96 maxAllowed = userData.earningsCap - uint96(userData.totalEarnings);
        uint96 actualAmount = amount > maxAllowed ? maxAllowed : amount;
        
        if(actualAmount > 0) {
            userData.balance += actualAmount;
            userData.totalEarnings += actualAmount;
            emit BonusDistributed(userAddress, actualAmount, bonusType);
            
            // Emit event if cap was reached
            if (actualAmount < amount) {
                emit EarningsCapReached(userAddress, amount - actualAmount);
            }
        }
    }
    
    /**
     * @dev Distribute reinvestment according to business plan
     * Level Bonus: 40%, Global Upline: 30%, Help Pool: 30%
     */
    function distributeReinvestment(
        mapping(address => DataStructures.User) storage users,
        uint96 reinvestment,
        address helpPoolRecipient
    ) external returns (uint96 helpPoolAmount) {
        uint96 levelReinvest = uint96((uint256(reinvestment) * 40) / 100);
        uint96 uplineReinvest = uint96((uint256(reinvestment) * 30) / 100);
        helpPoolAmount = uint96((uint256(reinvestment) * 30) / 100);
        
        // For now, add level and upline portions to help pool
        // Can be enhanced with proper distribution logic later
        return levelReinvest + uplineReinvest + helpPoolAmount;
    }
}
