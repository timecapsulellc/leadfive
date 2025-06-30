// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "./libraries/CoreOptimized.sol";

/**
 * @title LeadFiveDistribution
 * @dev Library for handling complex distribution logic to reduce main contract size
 */
library LeadFiveDistribution {
    
    /**
     * @dev Distributes bonuses across multiple levels with gas optimization
     */
    function distributeMultiLevelBonuses(
        mapping(address => CoreOptimized.PackedUser) storage users,
        address user,
        uint96 amount
    ) external {
        address current = users[user].referrer;
        uint8 level = 1;
        uint96 remaining = amount;
        
        while (current != address(0) && level <= 10 && remaining > 0) {
            CoreOptimized.PackedUser storage uplineUser = users[current];
            
            if (CoreOptimized.isRegistered(uplineUser) && !CoreOptimized.isBlacklisted(uplineUser)) {
                uint96 levelPayout = amount / 10; // Equal distribution
                if (levelPayout > remaining) levelPayout = remaining;
                
                if (levelPayout > 0) {
                    CoreOptimized.addEarningsWithCap(users, current, levelPayout);
                    remaining -= levelPayout;
                }
            }
            
            current = uplineUser.referrer;
            level++;
        }
    }
    
    /**
     * @dev Calculates all bonus distributions for a given amount and package
     */
    function calculateBonusDistributions(
        uint96 amount,
        uint16 directBonus,
        uint16 levelBonus,
        uint16 leaderBonus,
        uint16 helpBonus,
        uint16 clubBonus
    ) external pure returns (
        uint96 directAmount,
        uint96 levelAmount,
        uint96 leaderAmount,
        uint96 helpAmount,
        uint96 clubAmount,
        uint96 adminAmount
    ) {
        directAmount = uint96((uint256(amount) * directBonus) / 10000);
        levelAmount = uint96((uint256(amount) * levelBonus) / 10000);
        leaderAmount = uint96((uint256(amount) * leaderBonus) / 10000);
        helpAmount = uint96((uint256(amount) * helpBonus) / 10000);
        clubAmount = uint96((uint256(amount) * clubBonus) / 10000);
        adminAmount = uint96((uint256(amount) * CoreOptimized.ADMIN_FEE_RATE) / CoreOptimized.BASIS_POINTS);
    }
}
