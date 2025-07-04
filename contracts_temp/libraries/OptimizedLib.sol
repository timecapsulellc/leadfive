// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "../libraries/DataStructures.sol";
import "../libraries/DataTypes.sol";

library OptimizedLib {
    // Constants - Packed into single bytes32 for gas optimization
    bytes32 internal constant CONSTANTS = keccak256(abi.encodePacked(
        uint256(10000),  // BASIS_POINTS
        uint256(30),     // MAX_UPLINE_LEVELS
        uint256(4000),   // SPONSOR_COMMISSION_RATE
        uint256(1000),   // LEVEL_BONUS_RATE
        uint256(3000)    // GHP_RATE
    ));
    
    // Packed struct for user flags - Using uint8 instead of multiple bools
    struct UserFlags {
        uint8 flags; // Bit-packed: [exists(1), isActive(1), ghpEligible(1), clubPoolEligible(1)]
    }
    
    // Packed struct for timestamps - Using uint32 for timestamps (sufficient until 2106)
    struct UserTimestamps {
        uint32 joinTime;
        uint32 lastActivity;
        uint32 registrationTime;
        uint32 lastWithdrawal;
    }
    
    // Packed struct for volumes - Using uint96 for volumes (sufficient for most use cases)
    struct UserVolumes {
        uint96 leftVolume;
        uint96 rightVolume;
        uint96 ghpEligibleVolume;
    }
    
    // Packed struct for earnings - Using uint96 for amounts
    struct UserEarnings {
        uint96 totalEarnings;
        uint96 withdrawableAmount;
        uint96 leaderBonusEarnings;
        uint96 clubPoolEarnings;
        uint96 earningsCap;
    }
    
    // Optimized user struct with packed storage
    struct OptimizedUser {
        UserFlags flags;
        UserTimestamps timestamps;
        UserVolumes volumes;
        UserEarnings earnings;
        address referrer;
        address sponsor;
        address leftChild;
        address rightChild;
        uint96 totalInvestment;  // Changed from uint256 to uint96
        uint16 directReferrals;  // Changed from uint32 to uint16
        uint16 teamSize;         // Changed from uint32 to uint16
        uint8 packageLevel;
        uint8 leaderRank;
    }
    
    // Bit manipulation for flags
    function setFlag(UserFlags storage flags, uint8 position, bool value) internal {
        if (value) {
            flags.flags |= uint8(1 << position);
        } else {
            flags.flags &= uint8(~(1 << position));
        }
    }
    
    function getFlag(UserFlags storage flags, uint8 position) internal view returns (bool) {
        return (flags.flags & (1 << position)) != 0;
    }
    
    // Optimized compensation calculation with packed storage
    function calculateCompensation(
        OptimizedUser storage user,
        uint96 amount,
        uint16 rate
    ) internal view returns (uint96) {
        if (user.earnings.totalEarnings >= user.earnings.earningsCap) {
            return 0;
        }
        uint96 compensation = uint96((uint256(amount) * uint256(rate)) / 10000);
        uint96 remainingCap = user.earnings.earningsCap - user.earnings.totalEarnings;
        return compensation > remainingCap ? remainingCap : compensation;
    }
    
    // Optimized level bonus calculation with packed storage
    function calculateLevelBonus(
        OptimizedUser storage user,
        uint96 amount,
        uint16[] memory levelRates
    ) internal view returns (uint96[] memory) {
        uint96[] memory bonuses = new uint96[](levelRates.length);
        for (uint i = 0; i < levelRates.length; i++) {
            bonuses[i] = uint96((uint256(amount) * uint256(levelRates[i])) / 10000);
        }
        return bonuses;
    }
    
    // Optimized pool distribution with packed storage
    function distributePool(
        uint96 amount,
        uint16 rate,
        uint96 poolBalance
    ) internal pure returns (uint96) {
        return uint96((uint256(amount) * uint256(rate)) / 10000);
    }
    
    // Optimized user validation with packed storage
    function validateUser(
        OptimizedUser storage user,
        address userAddress
    ) internal view returns (bool) {
        return getFlag(user.flags, 0) && // exists
               getFlag(user.flags, 1) && // isActive
               userAddress != address(0);
    }
    
    // Optimized timestamp conversion
    function toUint32(uint256 timestamp) internal pure returns (uint32) {
        require(timestamp <= type(uint32).max, "Timestamp overflow");
        return uint32(timestamp);
    }
    
    // Optimized amount conversion
    function toUint96(uint256 amount) internal pure returns (uint96) {
        require(amount <= type(uint96).max, "Amount overflow");
        return uint96(amount);
    }
} 