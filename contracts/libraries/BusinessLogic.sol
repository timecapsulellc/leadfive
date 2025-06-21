// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title BusinessLogic
 * @dev Handles flushing, compression, and orphan management
 */
library BusinessLogic {
    
    event UserFlushed(address indexed user, uint256 unclaimedAmount);
    event NetworkCompressed(address indexed user, address indexed newUpline);
    event OrphanReassigned(address indexed orphan, address indexed newSponsor);
    event RankUpgraded(address indexed user, uint8 oldRank, uint8 newRank);
    event FastStartBonus(address indexed user, uint256 bonus, uint256 timeframe);
    
    /**
     * @dev Flush user when earnings cap is reached
     */
    function flushUser(
        DataStructures.User storage user,
        mapping(address => address[]) storage referrals,
        address userAddress
    ) internal returns (uint256 flushedAmount) {
        if (user.totalEarnings < user.earningsCap) return 0;
        
        // Calculate unclaimed earnings
        flushedAmount = user.balance;
        
        // Reset user state while keeping registration
        user.balance = 0;
        user.totalEarnings = 0;
        user.earningsCap = 0;
        user.packageLevel = 0;
        
        emit UserFlushed(userAddress, flushedAmount);
        return flushedAmount;
    }
    
    /**
     * @dev Compress network by removing inactive users
     */
    function compressNetwork(
        mapping(address => DataStructures.User) storage users,
        mapping(address => address[]) storage referrals,
        address inactiveUser
    ) internal {
        DataStructures.User storage user = users[inactiveUser];
        if (user.isRegistered && user.referrer != address(0)) {
            address upline = user.referrer;
            
            // Reassign all referrals to upline
            address[] storage userReferrals = referrals[inactiveUser];
            for (uint256 i = 0; i < userReferrals.length; i++) {
                address referral = userReferrals[i];
                users[referral].referrer = upline;
                referrals[upline].push(referral);
                
                emit NetworkCompressed(referral, upline);
            }
            
            // Clear inactive user's referrals
            delete referrals[inactiveUser];
        }
    }
    
    /**
     * @dev Handle orphaned users (sponsor inactive/blacklisted)
     */
    function handleOrphan(
        mapping(address => DataStructures.User) storage users,
        address orphan,
        address newSponsor
    ) internal {
        DataStructures.User storage orphanUser = users[orphan];
        DataStructures.User storage sponsor = users[orphanUser.referrer];
        
        // Check if current sponsor is inactive or blacklisted
        if (!sponsor.isRegistered || sponsor.isBlacklisted || sponsor.totalEarnings >= sponsor.earningsCap) {
            // Reassign to new sponsor
            orphanUser.referrer = newSponsor;
            users[newSponsor].directReferrals++;
            
            if (sponsor.isRegistered) {
                sponsor.directReferrals--;
            }
            
            emit OrphanReassigned(orphan, newSponsor);
        }
    }
    
    /**
     * @dev Check and update user rank based on achievements
     */
    function updateUserRank(
        DataStructures.User storage user,
        address userAddress
    ) internal returns (uint8 newRank) {
        uint8 oldRank = user.rank;
        
        // Rank 1: Bronze - 5+ direct referrals, 25+ team size
        if (user.directReferrals >= 5 && user.teamSize >= 25 && user.rank < 1) {
            user.rank = 1;
        }
        // Rank 2: Silver - 10+ direct referrals, 100+ team size
        else if (user.directReferrals >= 10 && user.teamSize >= 100 && user.rank < 2) {
            user.rank = 2;
        }
        // Rank 3: Gold - 20+ direct referrals, 250+ team size
        else if (user.directReferrals >= 20 && user.teamSize >= 250 && user.rank < 3) {
            user.rank = 3;
        }
        // Rank 4: Diamond - 50+ direct referrals, 500+ team size
        else if (user.directReferrals >= 50 && user.teamSize >= 500 && user.rank < 4) {
            user.rank = 4;
        }
        
        if (user.rank != oldRank) {
            emit RankUpgraded(userAddress, oldRank, user.rank);
        }
        
        return user.rank;
    }
    
    /**
     * @dev Calculate fast start bonus for new registrations
     */
    function calculateFastStartBonus(
        DataStructures.User storage sponsor,
        uint256 packagePrice,
        uint256 registrationTime
    ) internal returns (uint256 bonus) {
        // Fast start bonus: 10% extra if referred within 48 hours of sponsor registration
        if (block.timestamp <= registrationTime + 48 hours) {
            bonus = (packagePrice * 1000) / 10000; // 10%
            sponsor.balance += uint96(bonus);
            
            emit FastStartBonus(msg.sender, bonus, 48 hours);
            return bonus;
        }
        
        return 0;
    }
    
    /**
     * @dev Check if user qualifies for matching bonus
     */
    function calculateMatchingBonus(
        DataStructures.User storage user,
        uint256 referralBonus
    ) internal view returns (uint256 matchingBonus) {
        // Matching bonus based on rank
        if (user.rank >= 4) { // Diamond
            return (referralBonus * 50) / 100; // 50% matching
        } else if (user.rank >= 3) { // Gold
            return (referralBonus * 30) / 100; // 30% matching
        } else if (user.rank >= 2) { // Silver
            return (referralBonus * 20) / 100; // 20% matching
        } else if (user.rank >= 1) { // Bronze
            return (referralBonus * 10) / 100; // 10% matching
        }
        
        return 0;
    }
    
    /**
     * @dev Binary leg balancing tracking
     */
    function updateLegVolumes(
        mapping(address => uint256) storage leftLegVolume,
        mapping(address => uint256) storage rightLegVolume,
        address user,
        address newMember,
        uint256 volume,
        bool isLeftLeg
    ) internal {
        if (isLeftLeg) {
            leftLegVolume[user] += volume;
        } else {
            rightLegVolume[user] += volume;
        }
    }
    
    /**
     * @dev Calculate binary bonus based on weaker leg
     */
    function calculateBinaryBonus(
        uint256 leftVolume,
        uint256 rightVolume,
        uint256 binaryRate
    ) internal pure returns (uint256 bonus, uint256 carryOver) {
        uint256 weakerLeg = leftVolume < rightVolume ? leftVolume : rightVolume;
        bonus = (weakerLeg * binaryRate) / 10000;
        
        // Carry over the excess from stronger leg
        carryOver = leftVolume > rightVolume ? leftVolume - rightVolume : rightVolume - leftVolume;
        
        return (bonus, carryOver);
    }
    
    /**
     * @dev Reserve fund management
     */
    function updateReserveFund(
        uint256 totalDeposits,
        uint256 reservePercentage
    ) internal pure returns (uint256 requiredReserve) {
        return (totalDeposits * reservePercentage) / 10000;
    }
}
