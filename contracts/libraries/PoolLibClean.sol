// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

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
     * @dev Distribute leader pool to qualified leaders
     */
    function distributeLeaderPool(
        Pool storage leaderPool,
        address[] storage shiningStarLeaders,
        address[] storage silverStarLeaders
    ) internal returns (uint96 distributed) {
        if (!isDistributionReady(leaderPool) || leaderPool.balance == 0) {
            return 0;
        }
        
        uint32 shiningStarCount = uint32(shiningStarLeaders.length);
        uint32 silverStarCount = uint32(silverStarLeaders.length);
        uint32 totalLeaders = shiningStarCount + silverStarCount;
        
        if (totalLeaders == 0) return 0;
        
        // 60% to Silver Star, 40% to Shining Star
        uint96 silverStarPool = (leaderPool.balance * 60) / 100;
        uint96 shiningStarPool = leaderPool.balance - silverStarPool;
        
        distributed = leaderPool.balance;
        leaderPool.balance = 0;
        leaderPool.lastDistribution = uint32(block.timestamp);
        
        return distributed;
    }
    
    /**
     * @dev Distribute help pool to eligible users (batch processing)
     */
    function distributeHelpPoolBatch(
        Pool storage helpPool,
        address[] storage eligibleUsers,
        uint256 startIndex,
        uint256 batchSize
    ) internal returns (uint96 distributedAmount, uint256 processedCount, bool completed) {
        if (!isDistributionReady(helpPool) || helpPool.balance == 0) {
            return (0, 0, true);
        }
        
        uint256 endIndex = startIndex + batchSize;
        if (endIndex > eligibleUsers.length) {
            endIndex = eligibleUsers.length;
        }
        
        uint96 perUser = calculatePerUserAmount(helpPool.balance, uint32(eligibleUsers.length));
        distributedAmount = 0;
        
        for (uint256 i = startIndex; i < endIndex; i++) {
            distributedAmount += perUser;
        }
        
        processedCount = endIndex - startIndex;
        completed = (endIndex >= eligibleUsers.length);
        
        if (completed) {
            helpPool.balance = 0;
            helpPool.lastDistribution = uint32(block.timestamp);
        }
        
        return (distributedAmount, processedCount, completed);
    }
    
    /**
     * @dev Distribute club pool to silver star leaders
     */
    function distributeClubPool(
        Pool storage clubPool,
        address[] storage silverStarLeaders
    ) internal returns (uint96 distributed) {
        if (!isDistributionReady(clubPool) || clubPool.balance == 0) {
            return 0;
        }
        
        uint32 silverStarCount = uint32(silverStarLeaders.length);
        if (silverStarCount == 0) return 0;
        
        distributed = clubPool.balance;
        clubPool.balance = 0;
        clubPool.lastDistribution = uint32(block.timestamp);
        
        return distributed;
    }
    
    /**
     * @dev Add amount to pool
     */
    function addToPool(Pool storage pool, uint96 amount) internal {
        pool.balance += amount;
    }
}
