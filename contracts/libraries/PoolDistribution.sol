// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title PoolDistribution
 * @dev Handles all pool distributions with proper qualification logic
 */
library PoolDistribution {
    
    struct PoolQualification {
        bool isQualified;
        uint256 sharePercentage;
        uint256 lastClaimTime;
        uint256 totalClaimed;
        uint8 rank;
    }
    
    struct DistributionSchedule {
        uint256 lastDistribution;
        uint256 interval; // seconds
        uint256 nextDistribution;
        bool isActive;
    }
    
    event LeaderPoolDistribution(uint256 amount, uint256 recipients);
    event HelpPoolDistribution(uint256 amount, uint256 recipients);
    event ClubPoolDistribution(uint256 amount, uint256 recipients);
    event UserQualifiedForPool(address indexed user, string poolType, uint8 rank);
    
    /**
     * @dev Check leader pool qualification
     */
    function checkLeaderPoolQualification(
        DataStructures.User storage user,
        uint256 requiredTeamSize,
        uint32 requiredDirects
    ) internal view returns (bool qualified, uint8 leaderRank) {
        if (user.teamSize >= 500 && user.directReferrals >= 20) {
            return (true, 3); // Diamond Leader
        } else if (user.teamSize >= 250 && user.directReferrals >= 10) {
            return (true, 2); // Gold Leader
        } else if (user.teamSize >= 100 && user.directReferrals >= 5) {
            return (true, 1); // Silver Leader
        }
        return (false, 0);
    }
    
    /**
     * @dev Distribute leader pool based on rank weights
     */
    function distributeLeaderPool(
        mapping(address => DataStructures.User) storage users,
        mapping(address => PoolQualification) storage qualifications,
        address[] storage qualifiedLeaders,
        uint256 poolBalance
    ) internal returns (uint256 distributed) {
        if (qualifiedLeaders.length == 0 || poolBalance == 0) return 0;
        
        // Calculate total weight points
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < qualifiedLeaders.length; i++) {
            address leader = qualifiedLeaders[i];
            PoolQualification storage qual = qualifications[leader];
            if (qual.isQualified && !users[leader].isBlacklisted) {
                // Weight: Diamond=3, Gold=2, Silver=1
                totalWeight += qual.rank;
            }
        }
        
        if (totalWeight == 0) return 0;
        
        // Distribute based on weight
        distributed = 0;
        for (uint256 i = 0; i < qualifiedLeaders.length; i++) {
            address leader = qualifiedLeaders[i];
            PoolQualification storage qual = qualifications[leader];
            
            if (qual.isQualified && !users[leader].isBlacklisted) {
                uint256 share = (poolBalance * qual.rank) / totalWeight;
                users[leader].balance += uint96(share);
                qual.totalClaimed += share;
                qual.lastClaimTime = block.timestamp;
                distributed += share;
            }
        }
        
        emit LeaderPoolDistribution(distributed, qualifiedLeaders.length);
        return distributed;
    }
    
    /**
     * @dev Distribute help pool to eligible users
     */
    function distributeHelpPool(
        mapping(address => DataStructures.User) storage users,
        address[] storage eligibleUsers,
        uint256 poolBalance,
        uint256 batchSize
    ) internal returns (uint256 distributed, uint256 processed) {
        if (eligibleUsers.length == 0 || poolBalance == 0) return (0, 0);
        
        uint256 perUserShare = poolBalance / eligibleUsers.length;
        uint256 toProcess = batchSize < eligibleUsers.length ? batchSize : eligibleUsers.length;
        
        distributed = 0;
        for (uint256 i = 0; i < toProcess; i++) {
            address user = eligibleUsers[i];
            if (users[user].isEligibleForHelpPool && !users[user].isBlacklisted) {
                users[user].balance += uint96(perUserShare);
                distributed += perUserShare;
                processed++;
            }
        }
        
        emit HelpPoolDistribution(distributed, processed);
        return (distributed, processed);
    }
    
    /**
     * @dev Check if distribution is due
     */
    function isDistributionDue(DistributionSchedule storage schedule) internal view returns (bool) {
        return schedule.isActive && block.timestamp >= schedule.nextDistribution;
    }
    
    /**
     * @dev Update distribution schedule
     */
    function updateDistributionSchedule(DistributionSchedule storage schedule) internal {
        schedule.lastDistribution = block.timestamp;
        schedule.nextDistribution = block.timestamp + schedule.interval;
    }
    
    /**
     * @dev Initialize distribution schedules
     */
    function initializeSchedules(
        DistributionSchedule storage leaderSchedule,
        DistributionSchedule storage helpSchedule,
        DistributionSchedule storage clubSchedule
    ) internal {
        // Leader pool - weekly (7 days)
        leaderSchedule.interval = 7 days;
        leaderSchedule.nextDistribution = block.timestamp + 7 days;
        leaderSchedule.isActive = true;
        
        // Help pool - daily
        helpSchedule.interval = 1 days;
        helpSchedule.nextDistribution = block.timestamp + 1 days;
        helpSchedule.isActive = true;
        
        // Club pool - monthly (30 days)
        clubSchedule.interval = 30 days;
        clubSchedule.nextDistribution = block.timestamp + 30 days;
        clubSchedule.isActive = true;
    }
}
