// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";
import "./EventsLib.sol";

/**
 * @title UserOperations
 * @dev Library for user-related operations to reduce main contract size
 */
library UserOperations {
    using DataStructures for *;

    /**
     * @dev Get user information
     */
    function getUserInfo(
        mapping(address => DataStructures.User) storage users,
        address userAddress
    ) internal view returns (
        bool isRegistered,
        bool isBlacklisted,
        address referrer,
        uint8 currentTier,
        uint96 totalInvestment,
        uint96 totalEarnings,
        uint96 withdrawableBalance,
        uint32 directReferrals,
        uint32 teamSize,
        uint32 level,
        uint32 matrixLevel,
        uint8 rank,
        uint96 earningsCap
    ) {
        DataStructures.User storage u = users[userAddress];
        return (
            u.isRegistered,
            u.isBlacklisted,
            u.referrer,
            u.packageLevel,
            u.totalInvestment,
            u.totalEarnings,
            u.balance,
            u.directReferrals,
            u.teamSize,
            u.matrixLevel,
            u.matrixLevel,
            u.rank,
            u.earningsCap
        );
    }
    
    /**
     * @dev Get user earnings breakdown
     */
    function getUserEarnings(
        mapping(address => DataStructures.User) storage users,
        address userAddress
    ) external view returns (
        uint96 totalEarnings,
        uint96 withdrawableBalance,
        uint96 totalInvestment
    ) {
        DataStructures.User storage u = users[userAddress];
        return (
            u.totalEarnings,
            u.balance,
            u.totalInvestment
        );
    }
    
    /**
     * @dev Update user investment
     */
    function updateUserInvestment(
        mapping(address => DataStructures.User) storage users,
        address userAddress,
        uint96 amount,
        uint8 tier
    ) external {
        DataStructures.User storage u = users[userAddress];
        u.totalInvestment += amount;
        u.packageLevel = tier;
    }
    
    /**
     * @dev Add earnings to user
     */
    function addEarnings(
        mapping(address => DataStructures.User) storage users,
        address userAddress,
        uint96 amount
    ) external {
        DataStructures.User storage u = users[userAddress];
        u.totalEarnings += amount;
        u.balance += amount;
    }
    
    /**
     * @dev Process user withdrawal
     */
    function processWithdrawal(
        mapping(address => DataStructures.User) storage users,
        address userAddress,
        uint96 amount
    ) external {
        DataStructures.User storage u = users[userAddress];
        require(u.balance >= amount, "Insufficient balance");
        u.balance -= amount;
    }

    /**
     * @dev Update user basic info
     */
    function updateUserBasic(
        mapping(address => DataStructures.User) storage users,
        address userAddress,
        bool isRegistered,
        bool isBlacklisted,
        address referrer,
        uint8 tier
    ) internal {
        DataStructures.User storage u = users[userAddress];
        u.isRegistered = isRegistered;
        u.isBlacklisted = isBlacklisted;
        u.referrer = referrer;
        u.packageLevel = tier;
    }
}
