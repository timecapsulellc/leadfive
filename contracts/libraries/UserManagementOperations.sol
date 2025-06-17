// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataTypes.sol";

/**
 * @title UserManagementOperations
 * @dev Library containing user management operations to reduce main contract size
 */
library UserManagementOperations {
    
    /**
     * @dev Get comprehensive user information
     */
    function getUser(
        mapping(address => DataTypes.User) storage users,
        address userAddress
    ) external view returns (
        bool ex,
        bool a,
        bool isBlacklisted,
        address r,
        address s,
        uint256 tInv,
        uint256 tEarn,
        uint256 wAmt,
        uint256 pLvl,
        uint8 lRank
    ) {
        DataTypes.User storage user = users[userAddress];
        
        return (
            user.ex,
            user.a,
            false, // isBlacklisted - simplified for size
            user.r,
            user.s,
            user.tInv,
            user.tEarn,
            user.wAmt,
            user.pLvl,
            user.lRank
        );
    }

    /**
     * @dev Get user bonus breakdown
     */
    function getUserBonuses(
        mapping(address => DataTypes.User) storage users,
        address userAddress
    ) external view returns (
        uint256 totalEarnings,
        uint256 withdrawableAmount,
        uint256 leaderBonusEarnings,
        uint256 clubPoolEarnings,
        uint256 ghpVol
    ) {
        DataTypes.User storage user = users[userAddress];
        
        return (
            user.tEarn,
            user.wAmt,
            user.lBEarn,
            user.cPEarn,
            user.ghpVol
        );
    }

    /**
     * @dev Get user matrix information
     */
    function getUserMatrix(
        mapping(address => DataTypes.User) storage users,
        address userAddress
    ) external view returns (
        address leftChild,
        address rightChild,
        uint256 leftVolume,
        uint256 rightVolume,
        uint256 teamSize,
        uint256 directReferrals
    ) {
        DataTypes.User storage user = users[userAddress];
        
        return (
            user.l,
            user.rc,
            user.lVol,
            user.rVol,
            user.tSize,
            user.dRef
        );
    }

    /**
     * @dev Free admin user registration
     */
    function registerFreeAdminUser(
        mapping(address => DataTypes.User) storage users,
        mapping(uint256 => address) storage userIdToAddress,
        address[] storage allUsers,
        address user,
        address sponsor,
        uint256 totalUsers,
        uint8 packageLevel
    ) external returns (uint256 newTotalUsers) {
        require(!users[user].ex, "User already exists");
        require(sponsor != address(0), "Invalid sponsor");
        
        users[user].ex = true;
        users[user].a = true;
        users[user].r = sponsor;
        users[user].s = sponsor;
        users[user].pLvl = packageLevel;
        users[user].jT = block.timestamp;
        users[user].lA = block.timestamp;
        users[user].rT = block.timestamp;
        users[user].ghpE = true;
        users[user].cPE = packageLevel >= 1;
        
        allUsers.push(user);
        newTotalUsers = totalUsers + 1;
        userIdToAddress[newTotalUsers] = user;
        
        return newTotalUsers;
    }

    /**
     * @dev Initialize level bonuses
     */
    function initializeLevelBonuses(
        mapping(uint256 => uint256) storage levelBonuses
    ) external {
        levelBonuses[1] = 300; // 3%
        levelBonuses[2] = 200; // 2%
        levelBonuses[3] = 150; // 1.5%
        levelBonuses[4] = 100; // 1%
        levelBonuses[5] = 100; // 1%
        levelBonuses[6] = 75;  // 0.75%
        levelBonuses[7] = 75;  // 0.75%
        levelBonuses[8] = 50;  // 0.5%
        levelBonuses[9] = 50;  // 0.5%
        levelBonuses[10] = 50; // 0.5%
    }
}
