// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title AdvancedFeaturesLib
 * @dev Library for advanced MLM features: notifications, achievements, circuit breaker, rewards
 */
library AdvancedFeaturesLib {
    using DataStructures for DataStructures.User;
    
    // Notification system structures
    struct NotificationQueue {
        uint256 head;
        uint256 tail;
        mapping(uint256 => Notification) notifications;
    }
    
    struct Notification {
        address user;
        string message;
        uint256 timestamp;
        DataStructures.NotificationType notificationType;
        bool isRead;
    }
    
    struct UserNotifications {
        uint256[] notificationIds;
        uint256 unreadCount;
    }
    
    // Events
    event NotificationSent(address indexed user, string message, uint8 notificationType);
    event NotificationRead(address indexed user, uint256 notificationId);
    event CircuitBreakerTriggered(uint256 amount, uint256 threshold);
    event AchievementUnlocked(address indexed user, uint32 achievementId, uint256 reward);
    event RewardsClaimed(address indexed user, uint256 totalAmount);
    
    /**
     * @dev Check circuit breaker conditions
     */
    function checkCircuitBreaker(
        uint256 amount,
        uint256 window,
        uint256 threshold,
        mapping(uint256 => uint256) storage windowWithdrawals
    ) external returns (bool shouldPause) {
        uint256 currentWindow = block.timestamp / window;
        windowWithdrawals[currentWindow] += amount;
        
        if (windowWithdrawals[currentWindow] > threshold) {
            emit CircuitBreakerTriggered(amount, threshold);
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Process user achievements and calculate rewards
     */
    function checkAchievements(
        DataStructures.User storage user,
        mapping(address => mapping(uint32 => bool)) storage userAchievements,
        address userAddress
    ) external returns (uint256 totalRewards) {
        uint256 rewards = 0;
        
        // First referral achievement
        if (user.directReferrals >= 1 && !userAchievements[userAddress][1]) {
            userAchievements[userAddress][1] = true;
            rewards += 10 * 10**18; // 10 USDT
            emit AchievementUnlocked(userAddress, 1, 10 * 10**18);
        }
        
        // Team builder achievement (10 direct referrals)
        if (user.directReferrals >= 10 && !userAchievements[userAddress][2]) {
            userAchievements[userAddress][2] = true;
            rewards += 50 * 10**18; // 50 USDT
            emit AchievementUnlocked(userAddress, 2, 50 * 10**18);
        }
        
        // Network leader achievement (50 direct referrals)
        if (user.directReferrals >= 50 && !userAchievements[userAddress][3]) {
            userAchievements[userAddress][3] = true;
            rewards += 200 * 10**18; // 200 USDT
            emit AchievementUnlocked(userAddress, 3, 200 * 10**18);
        }
        
        // Matrix master achievement (complete first matrix cycle)
        if (user.matrixCycles >= 1 && !userAchievements[userAddress][4]) {
            userAchievements[userAddress][4] = true;
            rewards += 100 * 10**18; // 100 USDT
            emit AchievementUnlocked(userAddress, 4, 100 * 10**18);
        }
        
        // Volume achiever (high team volume)
        if (user.leftLegVolume + user.rightLegVolume >= 10000 * 10**18 && !userAchievements[userAddress][5]) {
            userAchievements[userAddress][5] = true;
            rewards += 500 * 10**18; // 500 USDT
            emit AchievementUnlocked(userAddress, 5, 500 * 10**18);
        }
        
        if (rewards > 0) {
            user.pendingRewards += uint96(rewards);
        }
        
        return rewards;
    }
    
    /**
     * @dev Calculate fast start bonus (first 48 hours)
     */
    function calculateFastStartBonus(
        DataStructures.User storage user,
        uint256 amount
    ) external view returns (uint256) {
        if (block.timestamp <= user.fastStartExpiry) {
            return (amount * 10) / 100; // 10% fast start bonus
        }
        return 0;
    }
    
    /**
     * @dev Calculate matching bonus based on rank
     */
    function calculateMatchingBonus(
        DataStructures.User storage sponsor,
        uint256 amount
    ) external view returns (uint256) {
        uint256 rate = 0;
        
        if (sponsor.leaderRank >= 3) { // Diamond
            rate = 300; // 3%
        } else if (sponsor.leaderRank >= 2) { // Gold
            rate = 200; // 2%
        } else if (sponsor.leaderRank >= 1) { // Silver
            rate = 100; // 1%
        }
        
        return (amount * rate) / 10000;
    }
    
    /**
     * @dev Calculate binary bonus from leg volumes
     */
    function calculateBinaryBonus(
        uint256 leftVolume,
        uint256 rightVolume,
        uint256 packagePrice
    ) external pure returns (uint256 bonus, uint256 carryForward) {
        uint256 weakLeg = leftVolume < rightVolume ? leftVolume : rightVolume;
        bonus = (weakLeg * 10) / 100; // 10% of weak leg volume
        
        // Cap bonus at 50% of package price
        uint256 maxBonus = packagePrice / 2;
        if (bonus > maxBonus) {
            bonus = maxBonus;
        }
        
        // Calculate carry forward for next calculation
        if (leftVolume > rightVolume) {
            carryForward = leftVolume - weakLeg;
        } else {
            carryForward = rightVolume - weakLeg;
        }
        
        return (bonus, carryForward);
    }
    
    /**
     * @dev Send notification to user
     */
    function sendNotification(
        mapping(address => UserNotifications) storage userNotifications,
        NotificationQueue storage queue,
        address user,
        DataStructures.NotificationType notificationType,
        string memory message
    ) external {
        uint256 notificationId = queue.tail++;
        
        queue.notifications[notificationId] = Notification({
            user: user,
            message: message,
            timestamp: block.timestamp,
            notificationType: notificationType,
            isRead: false
        });
        
        userNotifications[user].notificationIds.push(notificationId);
        userNotifications[user].unreadCount++;
        
        emit NotificationSent(user, message, uint8(notificationType));
    }
    
    /**
     * @dev Mark notification as read
     */
    function markAsRead(
        mapping(address => UserNotifications) storage userNotifications,
        address user,
        uint256 notificationId
    ) external {
        if (userNotifications[user].unreadCount > 0) {
            userNotifications[user].unreadCount--;
        }
        emit NotificationRead(user, notificationId);
    }
    
    /**
     * @dev Claim all pending rewards from multiple sources
     */
    function claimAllRewards(
        DataStructures.User storage user,
        mapping(address => uint256) storage pendingCommissions,
        mapping(address => uint256) storage pendingPoolRewards,
        mapping(address => uint256) storage pendingMatrixBonuses,
        address userAddress
    ) external returns (uint256 totalClaimed) {
        uint256 commission = pendingCommissions[userAddress];
        uint256 pool = pendingPoolRewards[userAddress];
        uint256 matrix = pendingMatrixBonuses[userAddress];
        uint256 pending = user.pendingRewards;
        
        if (commission > 0) {
            pendingCommissions[userAddress] = 0;
            totalClaimed += commission;
        }
        
        if (pool > 0) {
            pendingPoolRewards[userAddress] = 0;
            totalClaimed += pool;
        }
        
        if (matrix > 0) {
            pendingMatrixBonuses[userAddress] = 0;
            totalClaimed += matrix;
        }
        
        if (pending > 0) {
            user.pendingRewards = 0;
            totalClaimed += pending;
        }
        
        if (totalClaimed > 0) {
            user.balance += uint96(totalClaimed);
            emit RewardsClaimed(userAddress, totalClaimed);
        }
        
        return totalClaimed;
    }
    
    /**
     * @dev Get comprehensive pending rewards summary
     */
    function getPendingRewardsSummary(
        DataStructures.User storage user,
        mapping(address => uint256) storage pendingCommissions,
        mapping(address => uint256) storage pendingPoolRewards,
        mapping(address => uint256) storage pendingMatrixBonuses,
        address userAddress
    ) external view returns (
        uint256 pendingUser,
        uint256 pendingCommission,
        uint256 pendingPool,
        uint256 pendingMatrix,
        uint256 total
    ) {
        pendingUser = user.pendingRewards;
        pendingCommission = pendingCommissions[userAddress];
        pendingPool = pendingPoolRewards[userAddress];
        pendingMatrix = pendingMatrixBonuses[userAddress];
        total = pendingUser + pendingCommission + pendingPool + pendingMatrix;
    }
    
    /**
     * @dev Update user leg volumes for binary calculations
     */
    function updateLegVolumes(
        DataStructures.User storage user,
        uint256 amount,
        bool isLeftLeg
    ) external {
        if (isLeftLeg) {
            user.leftLegVolume += uint96(amount);
        } else {
            user.rightLegVolume += uint96(amount);
        }
    }
    
    /**
     * @dev Check if user qualifies for rank upgrade
     */
    function checkRankQualification(
        DataStructures.User storage user
    ) external view returns (uint8 newRank) {
        uint32 directs = user.directReferrals;
        uint32 team = user.teamSize;
        uint256 totalVolume = user.leftLegVolume + user.rightLegVolume;
        
        if (directs >= 20 && team >= 1000 && totalVolume >= 50000 * 10**18) {
            return 5; // Diamond
        } else if (directs >= 15 && team >= 500 && totalVolume >= 25000 * 10**18) {
            return 4; // Platinum
        } else if (directs >= 10 && team >= 200 && totalVolume >= 10000 * 10**18) {
            return 3; // Gold
        } else if (directs >= 5 && team >= 50 && totalVolume >= 2500 * 10**18) {
            return 2; // Silver
        } else if (directs >= 2 && team >= 10) {
            return 1; // Bronze
        }
        
        return 0; // No rank
    }
}
