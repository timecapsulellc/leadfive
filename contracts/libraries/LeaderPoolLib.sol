// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";
import "./BonusDistributionLib.sol";
import "./PoolDistributionLib.sol";

/**
 * @title LeaderPoolLib
 * @dev Library for managing leader qualifications and pool distributions
 * Extracted from main contract to reduce bytecode size
 */
library LeaderPoolLib {
    
    event PoolDistributed(uint8 indexed poolType, uint96 amount);
    
    /**
     * @dev Check and update leader qualifications
     */
    function updateLeaderQualifications(
        mapping(address => DataStructures.User) storage users,
        address user,
        address[] storage shiningStarLeaders
    ) external {
        DataStructures.User storage userData = users[user];
        
        // Check for Shining Star Leader (250 team, 10 direct)
        if(userData.teamSize >= 250 && userData.directReferrals >= 10) {
            if(userData.leaderRank < 1) {
                userData.leaderRank = 1; // Shining Star
                addToLeaderArray(shiningStarLeaders, user);
            }
        }
        // Check for Silver Star Leader (500 team)
        else if(userData.teamSize >= 500) {
            if(userData.leaderRank < 2) {
                userData.leaderRank = 2; // Silver Star
                addToLeaderArray(shiningStarLeaders, user);
            }
        }
    }
    
    /**
     * @dev Add user to leader array if not already present
     */
    function addToLeaderArray(
        address[] storage shiningStarLeaders,
        address user
    ) internal {
        // Check if user is already in the array
        for(uint i = 0; i < shiningStarLeaders.length; i++) {
            if(shiningStarLeaders[i] == user) {
                return; // Already in array
            }
        }
        shiningStarLeaders.push(user);
    }
    
    /**
     * @dev Enhanced pool distribution with proper qualification checks
     */
    function distributeLeaderPoolRewards(
        mapping(address => DataStructures.User) storage users,
        address[] storage shiningStarLeaders,
        uint96 poolBalance
    ) external returns (uint96 distributed) {
        uint256 shiningStarCount = 0;
        uint256 silverStarCount = 0;
        
        // Count qualified leaders
        for(uint i = 0; i < shiningStarLeaders.length; i++) {
            address leader = shiningStarLeaders[i];
            if(users[leader].leaderRank == 1) {
                shiningStarCount++;
            } else if(users[leader].leaderRank == 2) {
                silverStarCount++;
            }
        }
        
        if(shiningStarCount + silverStarCount > 0) {
            uint256 shiningStarShare = (poolBalance * 50) / 100; // 50%
            uint256 silverStarShare = (poolBalance * 50) / 100;   // 50%
            
            // Distribute to Shining Star Leaders
            if(shiningStarCount > 0) {
                uint256 perShining = shiningStarShare / shiningStarCount;
                for(uint i = 0; i < shiningStarLeaders.length; i++) {
                    address leader = shiningStarLeaders[i];
                    if(users[leader].leaderRank == 1) {
                        BonusDistributionLib.addEarningsWithCap(users, leader, uint96(perShining), 10);
                    }
                }
                distributed += uint96(shiningStarShare);
            }
            
            // Distribute to Silver Star Leaders
            if(silverStarCount > 0) {
                uint256 perSilver = silverStarShare / silverStarCount;
                for(uint i = 0; i < shiningStarLeaders.length; i++) {
                    address leader = shiningStarLeaders[i];
                    if(users[leader].leaderRank == 2) {
                        BonusDistributionLib.addEarningsWithCap(users, leader, uint96(perSilver), 11);
                    }
                }
                distributed += uint96(silverStarShare);
            }
            
            emit PoolDistributed(1, distributed);
        }
        
        return distributed;
    }
    
    /**
     * @dev Weekly help pool distribution
     */
    function distributeHelpPoolRewards(
        mapping(address => DataStructures.User) storage users,
        address[] storage shiningStarLeaders,
        uint96 poolBalance
    ) external returns (uint96 distributed) {
        // Distribute 25% of help pool weekly to qualified users
        uint256 distributionAmount = (poolBalance * 25) / 100;
        
        // Count eligible users (simplified - can be enhanced)
        uint256 eligibleCount = 0;
        for(uint i = 0; i < shiningStarLeaders.length; i++) {
            if(users[shiningStarLeaders[i]].isEligibleForHelpPool) {
                eligibleCount++;
            }
        }
        
        if(eligibleCount > 0) {
            uint256 perUser = distributionAmount / eligibleCount;
            for(uint i = 0; i < shiningStarLeaders.length; i++) {
                address user = shiningStarLeaders[i];
                if(users[user].isEligibleForHelpPool) {
                    BonusDistributionLib.addEarningsWithCap(users, user, uint96(perUser), 12);
                }
            }
            
            distributed = uint96(distributionAmount);
            emit PoolDistributed(2, distributed);
        }
        
        return distributed;
    }
    
    /**
     * @dev Distribute club pool rewards among qualified users
     */
    function distributeClubPoolRewards(
        mapping(address => DataStructures.User) storage users,
        address[] storage qualifiedUsers,
        uint96 totalAmount
    ) external returns (uint96 distributed) {
        if(qualifiedUsers.length == 0) return 0;
        
        uint96 amountPerUser = totalAmount / uint96(qualifiedUsers.length);
        
        for(uint i = 0; i < qualifiedUsers.length; i++) {
            address user = qualifiedUsers[i];
            if(users[user].isActive && users[user].leaderRank >= 2) {
                BonusDistributionLib.addEarningsWithCap(users, user, amountPerUser, 22); // Club pool bonus
                distributed += amountPerUser;
            }
        }
        
        emit PoolDistributed(3, distributed);
        return distributed;
    }
}
