// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title AdvancedFeatures
 * @dev Implements notification system, achievements, and advanced user experience features
 */
library AdvancedFeatures {
    
    struct NotificationQueue {
        DataStructures.NotificationType[] types;
        address[] users;
        uint256[] timestamps;
        string[] messages;
        uint256 head;
        uint256 tail;
    }
    
    struct UserNotifications {
        uint256[] notificationIds;
        mapping(uint256 => bool) read;
        uint256 unreadCount;
    }
    
    event NotificationSent(
        address indexed user, 
        DataStructures.NotificationType notificationType, 
        string message,
        uint256 timestamp
    );
    
    event AchievementUnlocked(
        address indexed user,
        uint32 achievementId,
        string name,
        uint256 reward
    );
    
    event BatchClaim(address indexed user, uint256 totalAmount, uint256 claimsProcessed);
    
    /**
     * @dev Send notification to user
     */
    function sendNotification(
        mapping(address => UserNotifications) storage userNotifications,
        NotificationQueue storage queue,
        address user,
        DataStructures.NotificationType notificationType,
        string memory message
    ) internal returns (uint256 notificationId) {
        notificationId = queue.tail++;
        
        // Add to global queue
        queue.types.push(notificationType);
        queue.users.push(user);
        queue.timestamps.push(block.timestamp);
        queue.messages.push(message);
        
        // Add to user's notification list
        userNotifications[user].notificationIds.push(notificationId);
        userNotifications[user].unreadCount++;
        
        emit NotificationSent(user, notificationType, message, block.timestamp);
        return notificationId;
    }
    
    /**
     * @dev Mark notification as read
     */
    function markAsRead(
        mapping(address => UserNotifications) storage userNotifications,
        address user,
        uint256 notificationId
    ) internal {
        UserNotifications storage notifications = userNotifications[user];
        if (!notifications.read[notificationId]) {
            notifications.read[notificationId] = true;
            if (notifications.unreadCount > 0) {
                notifications.unreadCount--;
            }
        }
    }
    
    /**
     * @dev Batch claim all pending rewards
     */
    function claimAllRewards(
        DataStructures.User storage user,
        mapping(address => uint256) storage pendingCommissions,
        mapping(address => uint256) storage pendingPoolRewards,
        mapping(address => uint256) storage pendingMatrixBonuses,
        address userAddress
    ) internal returns (uint256 totalClaimed) {
        uint256 claimsProcessed = 0;
        
        // Claim pending rewards
        if (user.pendingRewards > 0) {
            totalClaimed += user.pendingRewards;
            user.balance += user.pendingRewards;
            user.pendingRewards = 0;
            claimsProcessed++;
        }
        
        // Claim pending commissions
        if (pendingCommissions[userAddress] > 0) {
            totalClaimed += pendingCommissions[userAddress];
            user.balance += uint96(pendingCommissions[userAddress]);
            pendingCommissions[userAddress] = 0;
            claimsProcessed++;
        }
        
        // Claim pending pool rewards
        if (pendingPoolRewards[userAddress] > 0) {
            totalClaimed += pendingPoolRewards[userAddress];
            user.balance += uint96(pendingPoolRewards[userAddress]);
            pendingPoolRewards[userAddress] = 0;
            claimsProcessed++;
        }
        
        // Claim pending matrix bonuses
        if (pendingMatrixBonuses[userAddress] > 0) {
            totalClaimed += pendingMatrixBonuses[userAddress];
            user.balance += uint96(pendingMatrixBonuses[userAddress]);
            pendingMatrixBonuses[userAddress] = 0;
            claimsProcessed++;
        }
        
        emit BatchClaim(userAddress, totalClaimed, claimsProcessed);
        return totalClaimed;
    }
    
    /**
     * @dev Check and unlock achievements
     */
    function checkAchievements(
        DataStructures.User storage user,
        mapping(address => mapping(uint32 => bool)) storage userAchievements,
        address userAddress
    ) internal returns (uint256 totalRewards) {
        // Achievement 1: First Registration
        if (!userAchievements[userAddress][1] && user.isRegistered) {
            userAchievements[userAddress][1] = true;
            user.balance += 10 * 10**18; // $10 bonus
            totalRewards += 10 * 10**18;
            emit AchievementUnlocked(userAddress, 1, "Welcome Bonus", 10 * 10**18);
        }
        
        // Achievement 2: First Referral
        if (!userAchievements[userAddress][2] && user.directReferrals >= 1) {
            userAchievements[userAddress][2] = true;
            user.balance += 25 * 10**18; // $25 bonus
            totalRewards += 25 * 10**18;
            emit AchievementUnlocked(userAddress, 2, "First Referral", 25 * 10**18);
        }
        
        // Achievement 3: Team Builder (10 direct referrals)
        if (!userAchievements[userAddress][3] && user.directReferrals >= 10) {
            userAchievements[userAddress][3] = true;
            user.balance += 100 * 10**18; // $100 bonus
            totalRewards += 100 * 10**18;
            emit AchievementUnlocked(userAddress, 3, "Team Builder", 100 * 10**18);
        }
        
        // Achievement 4: Network Leader (100 team size)
        if (!userAchievements[userAddress][4] && user.teamSize >= 100) {
            userAchievements[userAddress][4] = true;
            user.balance += 500 * 10**18; // $500 bonus
            totalRewards += 500 * 10**18;
            emit AchievementUnlocked(userAddress, 4, "Network Leader", 500 * 10**18);
        }
        
        // Achievement 5: Matrix Master (5 matrix cycles)
        if (!userAchievements[userAddress][5] && user.matrixCycles >= 5) {
            userAchievements[userAddress][5] = true;
            user.balance += 250 * 10**18; // $250 bonus
            totalRewards += 250 * 10**18;
            emit AchievementUnlocked(userAddress, 5, "Matrix Master", 250 * 10**18);
        }
        
        return totalRewards;
    }
    
    /**
     * @dev Get user's pending rewards summary
     */
    function getPendingRewardsSummary(
        DataStructures.User storage user,
        mapping(address => uint256) storage pendingCommissions,
        mapping(address => uint256) storage pendingPoolRewards,
        mapping(address => uint256) storage pendingMatrixBonuses,
        address userAddress
    ) internal view returns (
        uint256 pendingUserRewards,
        uint256 pendingCommissionRewards,
        uint256 pendingPoolRewardsAmount,
        uint256 pendingMatrixRewardsAmount,
        uint256 totalPending
    ) {
        pendingUserRewards = user.pendingRewards;
        pendingCommissionRewards = pendingCommissions[userAddress];
        pendingPoolRewardsAmount = pendingPoolRewards[userAddress];
        pendingMatrixRewardsAmount = pendingMatrixBonuses[userAddress];
        
        totalPending = pendingUserRewards + pendingCommissionRewards + 
                      pendingPoolRewardsAmount + pendingMatrixRewardsAmount;
        
        return (
            pendingUserRewards,
            pendingCommissionRewards,
            pendingPoolRewardsAmount,
            pendingMatrixRewardsAmount,
            totalPending
        );
    }
    
    /**
     * @dev Circuit breaker for unusual activity
     */
    function checkCircuitBreaker(
        uint256 withdrawalAmount,
        uint256 timeWindow,
        uint256 maxWithdrawalInWindow,
        mapping(uint256 => uint256) storage windowWithdrawals
    ) internal returns (bool shouldPause) {
        uint256 currentWindow = block.timestamp / timeWindow;
        windowWithdrawals[currentWindow] += withdrawalAmount;
        
        if (windowWithdrawals[currentWindow] > maxWithdrawalInWindow) {
            return true; // Should pause contract
        }
        
        return false;
    }
    
    /**
     * @dev Dynamic commission adjustment based on contract health
     */
    function adjustCommissionRates(
        uint256 contractBalance,
        uint256 totalDeposits,
        uint256 baseCommissionRate
    ) internal pure returns (uint256 adjustedRate) {
        uint256 healthRatio = (contractBalance * 10000) / totalDeposits;
        
        if (healthRatio < 2000) { // Less than 20% balance
            return (baseCommissionRate * 50) / 100; // 50% reduction
        } else if (healthRatio < 5000) { // Less than 50% balance
            return (baseCommissionRate * 75) / 100; // 25% reduction
        }
        
        return baseCommissionRate; // No adjustment
    }
}
