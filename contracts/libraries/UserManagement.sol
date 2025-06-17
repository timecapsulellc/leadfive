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
        address oldSponsor;
        address newSponsor;
        string reason;
        address admin;
        uint256 timestamp;
    }

    // Struct to return multiple user details at once
    struct UserDetails {
        // From User struct
        bool isRegistered;
        bool isActive;
        address referrer;
        address sponsor;
        uint256 totalInvestment;
        uint256 totalEarnings;
        uint256 withdrawableAmount;
        uint256 directReferralsCount; // Assuming 'directReferrals' in User struct is the count
        uint256 teamSize;
        uint256 packageLevel;
        uint256 joinTime;
        uint256 lastActivityTime;
        uint256 registrationTime;
        uint256 lastWithdrawalTime;
        DataStructures.LeaderRank rank;
        uint256 earningsCap;
        bool clubMember;
        bool isGhpEligible;
        bool isLeaderEligible;
    }

    function getUserDetails(
        mapping(address => DataStructures.User) storage users,
        mapping(address => DataStructures.LeaderRank) storage userLeaderRankExt,
        address userAddress
    ) internal view returns (UserDetails memory details) {
        DataStructures.User storage u = users[userAddress];
        details.isRegistered = u.isRegistered;
        details.isActive = u.isRegistered && !u.isBlacklisted;
        details.referrer = u.referrer;
        details.sponsor = u.referrer;
        details.totalInvestment = u.totalInvestment;
        details.totalEarnings = u.totalEarnings;
        details.withdrawableAmount = u.withdrawableBalance;
        details.directReferralsCount = u.directReferrals;
        details.teamSize = u.teamSize;
        details.packageLevel = uint256(u.currentTier);
        details.joinTime = 0; // Field doesn't exist in optimized struct
        details.lastActivityTime = 0; // Field doesn't exist in optimized struct
        details.registrationTime = 0; // Field doesn't exist in optimized struct
        details.lastWithdrawalTime = 0; // Field doesn't exist in optimized struct
        details.rank = DataStructures.LeaderRank(u.rank);
        details.earningsCap = u.earningsCap;
        details.clubMember = false; // Field doesn't exist in optimized struct
        details.isGhpEligible = false;
        details.isLeaderEligible = (u.rank != 0);
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

    function updateSponsor(
        mapping(address => DataStructures.User) storage users,
        address userAddress,
        address newSponsorAddress,
        string memory reason,
        address adminAddress
    ) internal returns (SponsorChangedEventData memory eventData) {
        require(users[userAddress].isRegistered, "UserMgmt: User not found");
        require(users[newSponsorAddress].isRegistered || newSponsorAddress == address(0), "UserMgmt: New sponsor not found");
        
        address oldSponsor = users[userAddress].referrer;
        users[userAddress].referrer = newSponsorAddress;
        return SponsorChangedEventData(userAddress, oldSponsor, newSponsorAddress, reason, adminAddress, block.timestamp);
    }
}
