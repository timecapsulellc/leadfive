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
    ) internal view returns (UserDetails memory) {
        DataStructures.User storage user = users[userAddress];
        return UserDetails({
            isRegistered: user.isRegistered,
            isBlacklisted: user.isBlacklisted,
            referrer: user.referrer,
            totalInvestment: user.totalInvestment,
            totalEarnings: user.totalEarnings,
            withdrawableBalance: user.balance,
            directReferrals: user.directReferrals,
            teamSize: user.teamSize,
            currentTier: user.packageLevel,
            rank: user.rank,
            earningsCap: user.earningsCap
        });
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

    /**
     * @dev Create a new user with given parameters
     */
    function createUser(
        address referrer,
        uint96 amount,
        uint8 packageLevel,
        uint32 userCount
    ) internal view returns (DataStructures.User memory) {
        uint32 matrixPos = userCount;
        uint32 matrixLvl = _calculateMatrixLevel(matrixPos);
        
        return DataStructures.User({
            isRegistered: true,
            isBlacklisted: false,
            referrer: referrer,
            balance: 0,
            totalInvestment: amount,
            totalEarnings: 0,
            earningsCap: uint96(amount * 4), // EARNINGS_MULTIPLIER
            directReferrals: 0,
            teamSize: 0,
            packageLevel: packageLevel,
            rank: 0,
            withdrawalRate: 70,
            lastHelpPoolClaim: 0,
            isEligibleForHelpPool: true,
            matrixPosition: matrixPos,
            matrixLevel: matrixLvl,
            registrationTime: uint32(block.timestamp),
            referralCode: "",
            // New enhanced fields
            pendingRewards: 0,
            lastWithdrawal: 0,
            matrixCycles: 0,
            leaderRank: 0,
            leftLegVolume: 0,
            rightLegVolume: 0,
            fastStartExpiry: uint32(block.timestamp + 48 hours),
            isActive: true
        });
    }

    /**
     * @dev Update referrer data when new user joins
     */
    function updateReferrerData(
        mapping(address => DataStructures.User) storage users,
        address referrer,
        address newUser
    ) internal {
        users[referrer].directReferrals++;
        users[referrer].teamSize++;
        
        // Update team size up the chain
        address currentUpline = users[referrer].referrer;
        while (currentUpline != address(0)) {
            users[currentUpline].teamSize++;
            currentUpline = users[currentUpline].referrer;
        }
    }

    /**
     * @dev Calculate withdrawable amount based on withdrawal rate
     */
    function calculateWithdrawableAmount(
        DataStructures.User storage user,
        uint96 amount
    ) internal view returns (uint96) {
        return (amount * user.withdrawalRate) / 100;
    }

    /**
     * @dev Calculate matrix level based on position
     */
    function _calculateMatrixLevel(uint32 position) private pure returns (uint32) {
        if (position <= 2) return 1;
        if (position <= 6) return 2;
        if (position <= 14) return 3;
        if (position <= 30) return 4;
        return 5; // Max level
    }
}
