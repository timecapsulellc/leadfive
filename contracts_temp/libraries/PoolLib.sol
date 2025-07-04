// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title PoolLib
 * @dev Library for handling pool distributions and management
 */
library PoolLib {
    
    struct Pool {
        uint96 balance;
        uint32 lastDistribution;
        uint32 interval;
    }
    
    struct PoolDistribution {
        uint96 totalAmount;
        uint32 eligibleUsers;
        uint96 perUserAmount;
        uint32 timestamp;
    }
    
    /**
     * @dev Check if pool is ready for distribution
     */
    function isDistributionReady(Pool storage pool) 
        internal 
        view 
        returns (bool) 
    {
        return block.timestamp >= pool.lastDistribution + pool.interval;
    }
    
    /**
     * @dev Calculate per-user distribution amount
     */
    function calculatePerUserAmount(uint96 totalPool, uint32 eligibleUsers) 
        internal 
        pure 
        returns (uint96) 
    {
        if (eligibleUsers == 0) return 0;
        return totalPool / eligibleUsers;
    }
    
    /**
     * @dev Initialize pools with default settings
     */
    function initializePools(
        Pool storage leaderPool,
        Pool storage helpPool,
        Pool storage clubPool
    ) internal {
        leaderPool.balance = 0;
        leaderPool.lastDistribution = uint32(block.timestamp);
        leaderPool.interval = 604800; // Weekly
        
        helpPool.balance = 0;
        helpPool.lastDistribution = uint32(block.timestamp);
        helpPool.interval = 604800; // Weekly
        
        clubPool.balance = 0;
        clubPool.lastDistribution = uint32(block.timestamp);
        clubPool.interval = 2592000; // Monthly
    }
    
    /**
     * @dev Initialize a pool with interval
     */
    function initialize(Pool storage pool, uint32 _interval) internal {
        pool.balance = 0;
        pool.lastDistribution = uint32(block.timestamp);
        pool.interval = _interval;
    }

    /**
     * @dev Distribute leader pool to qualified leaders (simplified for contract use)
     */
    function distribute(
        Pool storage pool,
        address[] storage shiningStarLeaders,
        address[] storage silverStarLeaders
    ) internal returns (uint96) {
        if (!isDistributionReady(pool) || pool.balance == 0) {
            return 0;
        }
        
        uint32 shiningStarCount = uint32(shiningStarLeaders.length);
        uint32 silverStarCount = uint32(silverStarLeaders.length);
        uint32 totalLeaders = shiningStarCount + silverStarCount;
        
        if (totalLeaders == 0) return 0;
        
        uint96 distributed = pool.balance;
        pool.balance = 0;
        pool.lastDistribution = uint32(block.timestamp);
        
        return distributed;
    }

    /**
     * @dev Distribute help pool to eligible users (simplified for contract use)
     */
    function distributeHelp(
        Pool storage pool,
        address[] storage eligibleUsers,
        mapping(address => DataStructures.User) storage users
    ) internal returns (uint96) {
        if (!isDistributionReady(pool) || pool.balance == 0) {
            return 0;
        }
        
        uint32 eligibleCount = uint32(eligibleUsers.length);
        if (eligibleCount == 0) return 0;
        
        uint96 perUser = calculatePerUserAmount(pool.balance, eligibleCount);
        uint96 distributed = pool.balance;
        
        // Credit each eligible user
        for (uint256 i = 0; i < eligibleUsers.length; i++) {
            users[eligibleUsers[i]].balance += perUser;
        }
        
        pool.balance = 0;
        pool.lastDistribution = uint32(block.timestamp);
        
        return distributed;
    }

    /**
     * @dev Distribute club pool (simplified for contract use)
     */
    function distributeClub(
        Pool storage pool,
        mapping(address => DataStructures.User) storage users,
        uint32 totalUsers
    ) internal returns (uint96) {
        if (!isDistributionReady(pool) || pool.balance == 0) {
            return 0;
        }
        
        uint96 distributed = pool.balance;
        pool.balance = 0;
        pool.lastDistribution = uint32(block.timestamp);
        
        return distributed;
    }
}
