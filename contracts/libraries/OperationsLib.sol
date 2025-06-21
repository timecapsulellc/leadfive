// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";
import "./CoreLib.sol";

library OperationsLib {
    using CoreLib for *;

    // Optimized user registration
    function registerUser(
        mapping(address => DataStructures.User) storage users,
        address user,
        address referrer,
        uint8 packageLevel
    ) internal returns (bool) {
        require(!users[user].isRegistered, "User exists");
        require(referrer == address(0) || users[referrer].isRegistered, "Invalid referrer");
        
        users[user] = DataStructures.User({
            isRegistered: true,
            isBlacklisted: false,
            referrer: referrer,
            balance: 0,
            totalInvestment: 0,
            totalEarnings: 0,
            earningsCap: 0,
            directReferrals: 0,
            teamSize: 0,
            packageLevel: packageLevel,
            rank: 0,
            withdrawalRate: 70, // Default 70% withdrawal
            lastHelpPoolClaim: 0,
            isEligibleForHelpPool: false,
            matrixPosition: 0,
            matrixLevel: 1,
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
        
        return true;
    }

    // Optimized matrix placement
    function placeInMatrix(
        mapping(address => DataStructures.User) storage users,
        address user,
        address referrer
    ) internal returns (bool) {
        if (referrer == address(0)) return true;
        
        DataStructures.User storage referrerUser = users[referrer];
        if (referrerUser.matrixPosition == 0) {
            referrerUser.matrixPosition = 1;
            return true;
        }
        
        return false;
    }

    // Optimized compensation calculation
    function calculateCompensation(
        DataStructures.User storage user,
        uint256 amount,
        uint16 rate
    ) internal pure returns (uint256) {
        return (amount * rate) / 10000;
    }

    // Optimized volume update
    function updateVolume(
        DataStructures.User storage user,
        uint256 amount,
        bool isContribution
    ) internal {
        if (isContribution) {
            user.totalInvestment += uint96(amount);
        }
    }

    // Optimized withdrawal processing
    function processWithdrawal(
        DataStructures.User storage user,
        uint256 amount
    ) internal returns (bool) {
        if (amount > user.balance) return false;
        
        user.balance -= uint96(amount);
        return true;
    }

    // Optimized pool distribution
    function distributePool(
        DataStructures.Pool storage pool,
        uint256 amount,
        uint16 rate
    ) internal {
        uint256 poolAmount = (amount * rate) / 10000;
        pool.balance += uint96(poolAmount);
    }

    // Optimized level bonus distribution
    function distributeLevelBonus(
        mapping(address => DataStructures.User) storage users,
        address user,
        uint256 amount,
        uint16[] memory rates
    ) internal {
        address current = users[user].referrer;
        for (uint256 i = 0; i < rates.length && current != address(0); i++) {
            uint256 bonus = (amount * rates[i]) / 10000;
            users[current].balance += uint96(bonus);
            current = users[current].referrer;
        }
    }
} 