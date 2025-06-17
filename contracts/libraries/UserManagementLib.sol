// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";
import "./ConstantsLib.sol"; // For Enums like LeaderRank if returned directly

library UserManagementLib {
    // Event data structs to be returned to the main contract for emitting
    // This helps keep library functions cleaner and focused on logic vs. event emission details.
    struct UserBlacklistUpdatedEventData {
        address user;
        bool blacklisted;
        string reason;
        uint256 timestamp;
    }

    struct EarningsCapAdjustedEventData {
        address user;
        uint256 oldCap;
        uint256 newCap;
        string reason;
        address admin;
        uint256 timestamp;
    }

    struct SponsorChangedEventData {
        address user;
        address oldReferrer;
        address newReferrer;
        string reason;
        address admin;
        uint256 timestamp;
    }

    // Struct to return multiple user details at once
    struct UserDetails {
        bool isRegistered;
        bool isBlacklisted;
        address referrer;
        uint96 totalInvestment;
        uint96 totalEarnings;
        uint96 withdrawableBalance;
        uint32 directReferrals;
        uint32 teamSize;
        uint8 currentTier;
        uint8 rank;
        uint96 earningsCap;
    }

    function getUserDetails(
        mapping(address => DataStructures.User) storage users,
        address userAddress
    ) internal view returns (UserDetails memory details) {
        DataStructures.User storage u = users[userAddress];
        details.isRegistered = u.isRegistered;
        details.isBlacklisted = u.isBlacklisted;
        details.referrer = u.referrer;
        details.totalInvestment = u.totalInvestment;
        details.totalEarnings = u.totalEarnings;
        details.withdrawableBalance = u.withdrawableBalance;
        details.directReferrals = u.directReferrals;
        details.teamSize = u.teamSize;
        details.currentTier = u.currentTier;
        details.rank = u.rank;
        details.earningsCap = u.earningsCap;
    }

    function getUserGenealogy(
        mapping(address => address[30]) storage uplineChain,
        mapping(address => address[]) storage directReferralsMap,
        address userAddress
    ) internal view returns (address[30] memory uplines, address[] memory directReferralsList) {
        uplines = uplineChain[userAddress];
        directReferralsList = directReferralsMap[userAddress];
    }

    function setBlacklistStatus(
        mapping(address => DataStructures.User) storage users, // Not directly used here, but good for consistency
        mapping(address => bool) storage blacklistedUsersExt,
        mapping(address => string) storage blacklistReasonsExt,
        address userAddress,
        bool newStatus,
        string memory reason
    ) internal returns (UserBlacklistUpdatedEventData memory eventData) {
        require(users[userAddress].isRegistered, "UserMgmt: User not found");
        blacklistedUsersExt[userAddress] = newStatus;
        if (newStatus) {
            blacklistReasonsExt[userAddress] = reason;
        } else {
            delete blacklistReasonsExt[userAddress]; // Clear reason on unblacklist
        }
        return UserBlacklistUpdatedEventData(userAddress, newStatus, reason, block.timestamp);
    }

    function updateEarningsCap(
        mapping(address => DataStructures.User) storage users,
        address userAddress,
        uint256 newCap,
        string memory reason, // For event
        address adminAddress // For event
    ) internal returns (EarningsCapAdjustedEventData memory eventData) {
        require(users[userAddress].isRegistered, "UserMgmt: User not found");
        uint256 oldCap = users[userAddress].earningsCap;
        users[userAddress].earningsCap = uint96(newCap);
        return EarningsCapAdjustedEventData(userAddress, oldCap, newCap, reason, adminAddress, block.timestamp);
    }

    function updateReferrer(
        mapping(address => DataStructures.User) storage users,
        address userAddress,
        address newReferrerAddress,
        string memory reason, // For event
        address adminAddress // For event
    ) internal returns (SponsorChangedEventData memory eventData) {
        require(users[userAddress].isRegistered, "UserMgmt: User not found");
        require(users[newReferrerAddress].isRegistered || newReferrerAddress == address(0), "UserMgmt: New referrer not found"); // Allow address(0) if applicable
        address oldReferrer = users[userAddress].referrer;
        users[userAddress].referrer = newReferrerAddress;
        return SponsorChangedEventData(userAddress, oldReferrer, newReferrerAddress, reason, adminAddress, block.timestamp);
    }
}
