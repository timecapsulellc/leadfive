// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title PoolDistributionLib
 * @dev Library for pool distribution mechanisms: leader pool, help pool, club pool
 */
library PoolDistributionLib {
    using DataStructures for DataStructures.User;
    
    struct DistributionSchedule {
        uint256 lastDistribution;
        uint256 interval;
        uint256 nextDistribution;
        bool isActive;
    }
    
    struct PoolQualification {
        bool isQualifiedLeader;
        bool isQualifiedHelp;
        bool isQualifiedClub;
        uint256 lastQualificationCheck;
        uint8 leaderTier; // 1=Silver, 2=Gold, 3=Diamond
    }
    
    // Events
    event PoolDistributed(uint8 indexed poolType, uint256 amount, uint256 recipients);
    event UserQualified(address indexed user, uint8 poolType, uint8 tier);
    event DistributionScheduleUpdated(uint8 poolType, uint256 nextDistribution);
    
    /**
     * @dev Initialize distribution schedules
     */
    function initializeSchedules(
        DistributionSchedule storage leaderSchedule,
        DistributionSchedule storage helpSchedule,
        DistributionSchedule storage clubSchedule
    ) external {
        uint256 currentTime = block.timestamp;
        
        // Leader pool: weekly distribution (604800 seconds)
        leaderSchedule.lastDistribution = currentTime;
        leaderSchedule.interval = 604800;
        leaderSchedule.nextDistribution = currentTime + 604800;
        leaderSchedule.isActive = true;
        
        // Help pool: weekly distribution (604800 seconds)
        helpSchedule.lastDistribution = currentTime;
        helpSchedule.interval = 604800;
        helpSchedule.nextDistribution = currentTime + 604800;
        helpSchedule.isActive = true;
        
        // Club pool: monthly distribution (2592000 seconds)
        clubSchedule.lastDistribution = currentTime;
        clubSchedule.interval = 2592000;
        clubSchedule.nextDistribution = currentTime + 2592000;
        clubSchedule.isActive = true;
    }
    
    /**
     * @dev Check if distribution is due
     */
    function isDistributionDue(
        DistributionSchedule storage schedule
    ) external view returns (bool) {
        return schedule.isActive && block.timestamp >= schedule.nextDistribution;
    }
    
    /**
     * @dev Update distribution schedule after distribution
     */
    function updateDistributionSchedule(
        DistributionSchedule storage schedule
    ) external {
        schedule.lastDistribution = block.timestamp;
        schedule.nextDistribution = block.timestamp + schedule.interval;
        
        emit DistributionScheduleUpdated(1, schedule.nextDistribution);
    }
    
    /**
     * @dev Check and update user pool qualifications
     */
    function updatePoolQualifications(
        mapping(address => DataStructures.User) storage users,
        mapping(address => PoolQualification) storage qualifications,
        address userAddress
    ) external {
        DataStructures.User storage user = users[userAddress];
        PoolQualification storage qual = qualifications[userAddress];
        
        // Leader pool qualification
        if (user.directReferrals >= 5 && user.teamSize >= 50) {
            if (!qual.isQualifiedLeader) {
                qual.isQualifiedLeader = true;
                emit UserQualified(userAddress, 1, 1); // Leader pool, tier 1
            }
            
            // Determine leader tier
            if (user.directReferrals >= 20 && user.teamSize >= 500) {
                qual.leaderTier = 3; // Diamond
            } else if (user.directReferrals >= 10 && user.teamSize >= 200) {
                qual.leaderTier = 2; // Gold
            } else {
                qual.leaderTier = 1; // Silver
            }
        } else {
            qual.isQualifiedLeader = false;
            qual.leaderTier = 0;
        }
        
        // Help pool qualification (all active users)
        qual.isQualifiedHelp = user.isActive && user.isRegistered;
        
        // Club pool qualification (high performers)
        qual.isQualifiedClub = user.directReferrals >= 10 && 
                              user.teamSize >= 100 && 
                              user.totalInvestment >= 100 * 10**18;
        
        qual.lastQualificationCheck = block.timestamp;
    }
    
    /**
     * @dev Distribute leader pool with weighted allocation
     */
    function distributeLeaderPool(
        mapping(address => DataStructures.User) storage users,
        mapping(address => PoolQualification) storage qualifications,
        address[] storage qualifiedLeaders,
        uint256 poolBalance
    ) external returns (uint256 totalDistributed) {
        if (poolBalance == 0 || qualifiedLeaders.length == 0) {
            return 0;
        }
        
        // Calculate total weight
        uint256 totalWeight = 0;
        for (uint i = 0; i < qualifiedLeaders.length; i++) {
            address leader = qualifiedLeaders[i];
            if (qualifications[leader].isQualifiedLeader) {
                totalWeight += getLeaderWeight(qualifications[leader].leaderTier);
            }
        }
        
        if (totalWeight == 0) return 0;
        
        // Distribute based on weights
        uint256 distributed = 0;
        for (uint i = 0; i < qualifiedLeaders.length; i++) {
            address leader = qualifiedLeaders[i];
            if (qualifications[leader].isQualifiedLeader && 
                users[leader].isActive &&
                users[leader].totalEarnings < users[leader].earningsCap) {
                
                uint256 weight = getLeaderWeight(qualifications[leader].leaderTier);
                uint256 allocation = (poolBalance * weight) / totalWeight;
                
                // Apply earnings cap
                uint256 allowedAmount = allocation;
                if (users[leader].totalEarnings + allocation > users[leader].earningsCap) {
                    allowedAmount = users[leader].earningsCap - users[leader].totalEarnings;
                }
                
                if (allowedAmount > 0) {
                    users[leader].balance += uint96(allowedAmount);
                    users[leader].totalEarnings += uint96(allowedAmount);
                    distributed += allowedAmount;
                }
            }
        }
        
        emit PoolDistributed(1, distributed, getQualifiedCount(qualifications, qualifiedLeaders, 1));
        return distributed;
    }
    
    /**
     * @dev Get leader weight based on tier
     */
    function getLeaderWeight(uint8 tier) internal pure returns (uint256) {
        if (tier == 3) return 50; // Diamond: 5x weight
        if (tier == 2) return 30; // Gold: 3x weight
        if (tier == 1) return 10; // Silver: 1x weight
        return 0;
    }
    
    /**
     * @dev Distribute help pool equally among qualified users
     */
    function distributeHelpPool(
        mapping(address => DataStructures.User) storage users,
        address[] storage eligibleUsers,
        uint256 poolBalance,
        uint256 batchSize
    ) external returns (uint256 totalDistributed, uint256 processedCount) {
        if (poolBalance == 0 || eligibleUsers.length == 0) {
            return (0, 0);
        }
        
        uint256 perUser = poolBalance / eligibleUsers.length;
        if (perUser == 0) return (0, 0);
        
        uint256 endIndex = eligibleUsers.length;
        if (batchSize > 0 && batchSize < eligibleUsers.length) {
            endIndex = batchSize;
        }
        
        uint256 distributed = 0;
        uint256 processed = 0;
        
        for (uint i = 0; i < endIndex && i < eligibleUsers.length; i++) {
            address user = eligibleUsers[i];
            if (users[user].isActive && 
                users[user].isRegistered &&
                users[user].totalEarnings < users[user].earningsCap) {
                
                uint256 allowedAmount = perUser;
                if (users[user].totalEarnings + perUser > users[user].earningsCap) {
                    allowedAmount = users[user].earningsCap - users[user].totalEarnings;
                }
                
                if (allowedAmount > 0) {
                    users[user].balance += uint96(allowedAmount);
                    users[user].totalEarnings += uint96(allowedAmount);
                    distributed += allowedAmount;
                }
            }
            processed++;
        }
        
        emit PoolDistributed(2, distributed, processed);
        return (distributed, processed);
    }
    
    /**
     * @dev Distribute club pool with performance-based allocation
     */
    function distributeClubPool(
        mapping(address => DataStructures.User) storage users,
        mapping(address => PoolQualification) storage qualifications,
        address[] storage clubMembers,
        uint256 poolBalance
    ) external returns (uint256 totalDistributed) {
        if (poolBalance == 0 || clubMembers.length == 0) {
            return 0;
        }
        
        // Calculate total performance score
        uint256 totalScore = 0;
        for (uint i = 0; i < clubMembers.length; i++) {
            address member = clubMembers[i];
            if (qualifications[member].isQualifiedClub) {
                totalScore += calculatePerformanceScore(users[member]);
            }
        }
        
        if (totalScore == 0) return 0;
        
        // Distribute based on performance scores
        uint256 distributed = 0;
        for (uint i = 0; i < clubMembers.length; i++) {
            address member = clubMembers[i];
            if (qualifications[member].isQualifiedClub && 
                users[member].isActive &&
                users[member].totalEarnings < users[member].earningsCap) {
                
                uint256 score = calculatePerformanceScore(users[member]);
                uint256 allocation = (poolBalance * score) / totalScore;
                
                // Apply earnings cap
                uint256 allowedAmount = allocation;
                if (users[member].totalEarnings + allocation > users[member].earningsCap) {
                    allowedAmount = users[member].earningsCap - users[member].totalEarnings;
                }
                
                if (allowedAmount > 0) {
                    users[member].balance += uint96(allowedAmount);
                    users[member].totalEarnings += uint96(allowedAmount);
                    distributed += allowedAmount;
                }
            }
        }
        
        emit PoolDistributed(3, distributed, getQualifiedCount(qualifications, clubMembers, 3));
        return distributed;
    }
    
    /**
     * @dev Calculate performance score for club pool distribution
     */
    function calculatePerformanceScore(
        DataStructures.User storage user
    ) internal view returns (uint256 score) {
        // Base score from direct referrals (10 points per referral)
        score = user.directReferrals * 10;
        
        // Team size bonus (1 point per team member)
        score += user.teamSize;
        
        // Investment bonus (1 point per $100 invested)
        score += user.totalInvestment / (100 * 10**18);
        
        // Binary volume bonus
        uint256 weakLeg = user.leftLegVolume < user.rightLegVolume ? 
                          user.leftLegVolume : user.rightLegVolume;
        score += weakLeg / (1000 * 10**18); // 1 point per $1000 weak leg
        
        return score;
    }
    
    /**
     * @dev Get count of qualified users for specific pool
     */
    function getQualifiedCount(
        mapping(address => PoolQualification) storage qualifications,
        address[] storage userList,
        uint8 poolType
    ) internal view returns (uint256 count) {
        for (uint i = 0; i < userList.length; i++) {
            PoolQualification storage qual = qualifications[userList[i]];
            
            if (poolType == 1 && qual.isQualifiedLeader) count++;
            else if (poolType == 2 && qual.isQualifiedHelp) count++;
            else if (poolType == 3 && qual.isQualifiedClub) count++;
        }
        
        return count;
    }
    
    /**
     * @dev Get user's pool qualification status
     */
    function getUserPoolStatus(
        mapping(address => PoolQualification) storage qualifications,
        address user
    ) external view returns (
        bool leaderQualified,
        bool helpQualified,
        bool clubQualified,
        uint8 leaderTier,
        uint256 lastCheck
    ) {
        PoolQualification storage qual = qualifications[user];
        
        return (
            qual.isQualifiedLeader,
            qual.isQualifiedHelp,
            qual.isQualifiedClub,
            qual.leaderTier,
            qual.lastQualificationCheck
        );
    }
    
    /**
     * @dev Calculate next distribution times
     */
    function getNextDistributionTimes(
        DistributionSchedule storage leaderSchedule,
        DistributionSchedule storage helpSchedule,
        DistributionSchedule storage clubSchedule
    ) external view returns (
        uint256 leaderNext,
        uint256 helpNext,
        uint256 clubNext
    ) {
        return (
            leaderSchedule.nextDistribution,
            helpSchedule.nextDistribution,
            clubSchedule.nextDistribution
        );
    }
    
    /**
     * @dev Emergency pool distribution (admin only)
     */
    function emergencyDistribution(
        mapping(address => DataStructures.User) storage users,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external returns (uint256 totalDistributed) {
        require(recipients.length == amounts.length, "Array length mismatch");
        
        uint256 distributed = 0;
        for (uint i = 0; i < recipients.length; i++) {
            address recipient = recipients[i];
            uint256 amount = amounts[i];
            
            if (users[recipient].isActive && 
                users[recipient].totalEarnings < users[recipient].earningsCap) {
                
                uint256 allowedAmount = amount;
                if (users[recipient].totalEarnings + amount > users[recipient].earningsCap) {
                    allowedAmount = users[recipient].earningsCap - users[recipient].totalEarnings;
                }
                
                if (allowedAmount > 0) {
                    users[recipient].balance += uint96(allowedAmount);
                    users[recipient].totalEarnings += uint96(allowedAmount);
                    distributed += allowedAmount;
                }
            }
        }
        
        emit PoolDistributed(99, distributed, recipients.length); // Emergency type
        return distributed;
    }
}
