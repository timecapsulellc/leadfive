// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title Leader Management Library
 * @dev Handles leader ranks and qualifications
 */
library LeaderManagement {
    
    enum LeaderRank { 
        NONE,       // 0
        BRONZE,     // 1 - 5+ directs, $1000+ volume
        SILVER,     // 2 - 10+ directs, $5000+ volume
        GOLD,       // 3 - 20+ directs, $15000+ volume
        PLATINUM,   // 4 - 50+ directs, $50000+ volume
        DIAMOND     // 5 - 100+ directs, $150000+ volume
    }
    
    struct LeaderQualification {
        uint256 minDirectReferrals;
        uint256 minTeamVolume;
        uint256 minPersonalVolume;
        uint256 bonusPercentage;
        bool isActive;
    }
    
    function initializeLeaderQualifications(
        mapping(LeaderRank => LeaderQualification) storage qualifications
    ) internal {
        qualifications[LeaderRank.BRONZE] = LeaderQualification(5, 1000 * 10**18, 50 * 10**18, 200, true);
        qualifications[LeaderRank.SILVER] = LeaderQualification(10, 5000 * 10**18, 100 * 10**18, 300, true);
        qualifications[LeaderRank.GOLD] = LeaderQualification(20, 15000 * 10**18, 250 * 10**18, 400, true);
        qualifications[LeaderRank.PLATINUM] = LeaderQualification(50, 50000 * 10**18, 500 * 10**18, 500, true);
        qualifications[LeaderRank.DIAMOND] = LeaderQualification(100, 150000 * 10**18, 1000 * 10**18, 600, true);
    }
    
    function calculateLeaderRank(
        mapping(LeaderRank => LeaderQualification) storage qualifications,
        uint256 directReferrals,
        uint256 teamVolume,
        uint256 totalInvestment
    ) internal view returns (LeaderRank) {
        
        // Check Diamond
        LeaderQualification memory diamond = qualifications[LeaderRank.DIAMOND];
        if (directReferrals >= diamond.minDirectReferrals && 
            teamVolume >= diamond.minTeamVolume &&
            totalInvestment >= diamond.minPersonalVolume) {
            return LeaderRank.DIAMOND;
        }
        
        // Check Platinum
        LeaderQualification memory platinum = qualifications[LeaderRank.PLATINUM];
        if (directReferrals >= platinum.minDirectReferrals && 
            teamVolume >= platinum.minTeamVolume &&
            totalInvestment >= platinum.minPersonalVolume) {
            return LeaderRank.PLATINUM;
        }
        
        // Check Gold
        LeaderQualification memory gold = qualifications[LeaderRank.GOLD];
        if (directReferrals >= gold.minDirectReferrals && 
            teamVolume >= gold.minTeamVolume &&
            totalInvestment >= gold.minPersonalVolume) {
            return LeaderRank.GOLD;
        }
        
        // Check Silver
        LeaderQualification memory silver = qualifications[LeaderRank.SILVER];
        if (directReferrals >= silver.minDirectReferrals && 
            teamVolume >= silver.minTeamVolume &&
            totalInvestment >= silver.minPersonalVolume) {
            return LeaderRank.SILVER;
        }
        
        // Check Bronze
        LeaderQualification memory bronze = qualifications[LeaderRank.BRONZE];
        if (directReferrals >= bronze.minDirectReferrals && 
            teamVolume >= bronze.minTeamVolume &&
            totalInvestment >= bronze.minPersonalVolume) {
            return LeaderRank.BRONZE;
        }
        
        return LeaderRank.NONE;
    }
    
    function updateLeaderArrays(
        mapping(LeaderRank => address[]) storage leadersByRank,
        address[] storage qualifiedLeaders,
        address user,
        LeaderRank oldRank,
        LeaderRank newRank
    ) internal {
        // Remove from old rank array
        if (oldRank != LeaderRank.NONE) {
            removeFromArray(leadersByRank[oldRank], user);
        }
        
        // Add to new rank array
        if (newRank != LeaderRank.NONE) {
            leadersByRank[newRank].push(user);
            if (!isInArray(qualifiedLeaders, user)) {
                qualifiedLeaders.push(user);
            }
        }
    }
    
    function removeFromArray(address[] storage array, address element) internal {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == element) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }
    
    function isInArray(address[] storage array, address element) internal view returns (bool) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == element) {
                return true;
            }
        }
        return false;
    }
}
