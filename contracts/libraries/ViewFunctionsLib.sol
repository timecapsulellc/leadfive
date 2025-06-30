// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";
import "./PoolDistributionLib.sol";

/**
 * @title ViewFunctionsLib
 * @dev Library for view/getter functions
 * Extracted from main contract to reduce bytecode size
 */
library ViewFunctionsLib {
    
    /**
     * @dev Get leader pool statistics
     */
    function getLeaderStats(
        mapping(address => DataStructures.User) storage users,
        address[] storage shiningStarLeaders,
        PoolDistributionLib.DistributionSchedule storage leaderSchedule,
        PoolDistributionLib.DistributionSchedule storage helpSchedule
    ) external view returns (
        uint256 totalLeaders,
        uint256 shiningStarCount,
        uint256 silverStarCount,
        uint256 nextLeaderDistribution,
        uint256 nextHelpDistribution
    ) {
        totalLeaders = shiningStarLeaders.length;
        
        for(uint i = 0; i < shiningStarLeaders.length; i++) {
            if(users[shiningStarLeaders[i]].leaderRank == 1) {
                shiningStarCount++;
            } else if(users[shiningStarLeaders[i]].leaderRank == 2) {
                silverStarCount++;
            }
        }
        
        nextLeaderDistribution = leaderSchedule.nextDistribution;
        nextHelpDistribution = helpSchedule.nextDistribution;
        
        return (totalLeaders, shiningStarCount, silverStarCount, nextLeaderDistribution, nextHelpDistribution);
    }
    
    /**
     * @dev Enhanced user details with leader status
     */
    function getUserLeaderInfo(
        mapping(address => DataStructures.User) storage users,
        address user
    ) external view returns (
        uint8 leaderRank,
        uint32 teamSize,
        uint32 directRefs,
        bool qualifiesForShining,
        bool qualifiesForSilver
    ) {
        DataStructures.User memory userData = users[user];
        leaderRank = userData.leaderRank;
        teamSize = userData.teamSize;
        directRefs = userData.directReferrals;
        
        qualifiesForShining = (teamSize >= 250 && directRefs >= 10);
        qualifiesForSilver = (teamSize >= 500);
        
        return (leaderRank, teamSize, directRefs, qualifiesForShining, qualifiesForSilver);
    }
    
    /**
     * @dev Get basic user analytics
     */
    function getUserAnalytics(
        mapping(address => DataStructures.User) storage users,
        address user
    ) external view returns (
        uint96 personalVolume,
        uint32 directCount,
        uint32 totalTeamSize,
        uint96 totalEarnings
    ) {
        DataStructures.User memory userData = users[user];
        return (
            uint96(userData.totalInvestment),
            userData.directReferrals,
            userData.teamSize,
            uint96(userData.totalEarnings)
        );
    }
    
    /**
     * @dev Get comprehensive user details (enhanced for frontend)
     */
    function getUserDetails(
        mapping(address => DataStructures.User) storage users,
        address user
    ) external view returns (
        DataStructures.User memory userInfo,
        uint96 withdrawableAmount,
        bool canUpgrade,
        uint8 nextPackageLevel
    ) {
        userInfo = users[user];
        
        if (userInfo.isRegistered) {
            // Calculate current withdrawal rate - simplified for now
            uint8 currentRate = 70; // Base rate, can be enhanced later
            if(userInfo.directReferrals >= 3) currentRate = 75;
            if(userInfo.directReferrals >= 5) currentRate = 80;
            
            withdrawableAmount = uint96((uint256(userInfo.balance) * currentRate) / 100);
            
            // Check upgrade possibility
            canUpgrade = userInfo.packageLevel < 4 && !userInfo.isBlacklisted;
            nextPackageLevel = userInfo.packageLevel < 4 ? userInfo.packageLevel + 1 : 4;
        }
        
        return (userInfo, withdrawableAmount, canUpgrade, nextPackageLevel);
    }
}
