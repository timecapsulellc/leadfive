// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title PoolDistributionLib
 * @dev Library for managing pool distribution schedules and logic
 * Extracted from main contract to reduce bytecode size
 */
library PoolDistributionLib {
    
    struct DistributionSchedule {
        uint32 nextDistribution;
        uint32 interval;
        uint96 minimumAmount;
        bool isActive;
    }
    
    event PoolDistributionScheduled(uint8 indexed poolType, uint32 nextDistribution);
    event DistributionExecuted(uint8 indexed poolType, uint96 amount, uint256 recipients);
    
    /**
     * @dev Initialize distribution schedule for a pool
     */
    function initializeSchedule(
        DistributionSchedule storage schedule,
        uint32 intervalDays,
        uint96 minimumAmount
    ) external {
        schedule.nextDistribution = uint32(block.timestamp + (intervalDays * 1 days));
        schedule.interval = intervalDays * 1 days;
        schedule.minimumAmount = minimumAmount;
        schedule.isActive = true;
    }
    
    /**
     * @dev Check if distribution is due
     */
    function isDistributionDue(DistributionSchedule storage schedule) 
        external 
        view 
        returns (bool) 
    {
        return schedule.isActive && 
               block.timestamp >= schedule.nextDistribution;
    }
    
    /**
     * @dev Update next distribution time
     */
    function updateNextDistribution(DistributionSchedule storage schedule) external {
        require(schedule.isActive, "Distribution not active");
        schedule.nextDistribution += schedule.interval;
    }
    
    /**
     * @dev Set distribution schedule active/inactive
     */
    function setScheduleActive(DistributionSchedule storage schedule, bool active) external {
        schedule.isActive = active;
    }
    
    /**
     * @dev Get distribution info
     */
    function getDistributionInfo(DistributionSchedule storage schedule) 
        external 
        view 
        returns (
            uint32 nextDistribution,
            uint32 interval,
            uint96 minimumAmount,
            bool isActive,
            bool isDue
        ) 
    {
        return (
            schedule.nextDistribution,
            schedule.interval,
            schedule.minimumAmount,
            schedule.isActive,
            schedule.isActive && block.timestamp >= schedule.nextDistribution
        );
    }
}
