// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title MatrixManagementLib
 * @dev Library for matrix management: placement, completion, cycling, spillover
 */
library MatrixManagementLib {
    using DataStructures for DataStructures.User;
    
    // Matrix configuration
    uint32 public constant MATRIX_WIDTH = 2; // Binary matrix
    uint32 public constant MAX_MATRIX_DEPTH = 10;
    
    struct MatrixPosition {
        address sponsor;
        address[] downline;
        uint8 level;
        uint32 cycleCount;
        bool isComplete;
        uint256 totalEarnings;
    }
    
    struct MatrixCycle {
        uint32 cycleId;
        uint8 level;
        uint256 cycleBonus;
        uint256 timestamp;
    }
    
    // Events
    event MatrixPlacement(address indexed user, address indexed sponsor, uint8 level);
    event SpilloverPlacement(address indexed user, address indexed actualSponsor, uint8 level);
    event MatrixCycleCompleted(address indexed user, uint8 level, uint256 bonus, uint32 cycleId);
    event MatrixReentry(address indexed user, uint8 newLevel, address sponsor);
    
    /**
     * @dev Place user in matrix with spillover logic
     */
    function placeInMatrix(
        mapping(address => MatrixPosition) storage positions,
        mapping(address => address[]) storage referrals,
        address user,
        address sponsor
    ) external returns (address actualPlacement) {
        // If sponsor's first level is not full, place directly
        if (positions[sponsor].downline.length < MATRIX_WIDTH) {
            positions[sponsor].downline.push(user);
            positions[user].sponsor = sponsor;
            positions[user].level = positions[sponsor].level + 1;
            
            emit MatrixPlacement(user, sponsor, positions[user].level);
            return sponsor;
        }
        
        // Find placement using breadth-first search (spillover)
        address placement = findSpilloverPosition(positions, sponsor);
        
        positions[placement].downline.push(user);
        positions[user].sponsor = placement;
        positions[user].level = positions[placement].level + 1;
        
        emit SpilloverPlacement(user, placement, positions[user].level);
        return placement;
    }
    
    /**
     * @dev Find available position for spillover using breadth-first search
     */
    function findSpilloverPosition(
        mapping(address => MatrixPosition) storage positions,
        address root
    ) public view returns (address) {
        // Simple spillover: find first available position in sponsor's downline
        address current = root;
        
        // Check immediate downline first
        for (uint i = 0; i < positions[root].downline.length; i++) {
            address child = positions[root].downline[i];
            if (positions[child].downline.length < MATRIX_WIDTH) {
                return child;
            }
        }
        
        // If no space in immediate downline, check deeper levels
        for (uint level = 0; level < 5; level++) {
            for (uint i = 0; i < positions[current].downline.length; i++) {
                address child = positions[current].downline[i];
                if (positions[child].downline.length < MATRIX_WIDTH) {
                    return child;
                }
                
                // Check grandchildren
                for (uint j = 0; j < positions[child].downline.length; j++) {
                    address grandchild = positions[child].downline[j];
                    if (positions[grandchild].downline.length < MATRIX_WIDTH) {
                        return grandchild;
                    }
                }
            }
        }
        
        return root; // Fallback to root
    }
    
    /**
     * @dev Check if matrix level is complete
     */
    function checkMatrixCompletion(
        mapping(address => MatrixPosition) storage positions,
        address user,
        uint8 targetLevel
    ) external view returns (bool isComplete, uint256 downlineCount) {
        MatrixPosition storage position = positions[user];
        
        if (position.level != targetLevel) {
            return (false, 0);
        }
        
        // Count total downline at all levels
        downlineCount = countTotalDownline(positions, user, 0, 5); // Check 5 levels deep
        
        // Matrix complete when specific conditions are met based on level
        uint256 requiredDownline = 2 ** targetLevel; // Exponential growth
        isComplete = downlineCount >= requiredDownline;
        
        return (isComplete, downlineCount);
    }
    
    /**
     * @dev Recursively count downline members
     */
    function countTotalDownline(
        mapping(address => MatrixPosition) storage positions,
        address user,
        uint256 currentDepth,
        uint256 maxDepth
    ) internal view returns (uint256 count) {
        if (currentDepth >= maxDepth) return 0;
        
        address[] storage downline = positions[user].downline;
        count = downline.length;
        
        for (uint i = 0; i < downline.length; i++) {
            count += countTotalDownline(positions, downline[i], currentDepth + 1, maxDepth);
        }
        
        return count;
    }
    
    /**
     * @dev Calculate cycle bonus based on level and package
     */
    function calculateCycleBonus(
        uint8 level,
        uint256 packagePrice
    ) external pure returns (uint256 bonus) {
        // Cycle bonus increases with level
        uint256 baseBonus = packagePrice / 2; // 50% of package price
        
        if (level >= 5) {
            bonus = baseBonus * 3; // 150% of package price
        } else if (level >= 3) {
            bonus = baseBonus * 2; // 100% of package price
        } else {
            bonus = baseBonus; // 50% of package price
        }
        
        return bonus;
    }
    
    /**
     * @dev Process matrix cycle completion
     */
    function processCycleCompletion(
        mapping(address => MatrixPosition) storage positions,
        mapping(address => MatrixCycle[]) storage userCycles,
        address user,
        uint8 level,
        uint256 cycleBonus
    ) external returns (uint32 newCycleId) {
        MatrixPosition storage position = positions[user];
        
        // Increment cycle count
        position.cycleCount++;
        position.totalEarnings += cycleBonus;
        position.isComplete = true;
        
        // Create new cycle record
        newCycleId = uint32(userCycles[user].length);
        userCycles[user].push(MatrixCycle({
            cycleId: newCycleId,
            level: level,
            cycleBonus: cycleBonus,
            timestamp: block.timestamp
        }));
        
        emit MatrixCycleCompleted(user, level, cycleBonus, newCycleId);
        
        // Reset position for re-entry at higher level
        position.downline = new address[](0);
        position.isComplete = false;
        position.level = level + 1;
        
        return newCycleId;
    }
    
    /**
     * @dev Handle matrix re-entry after completion
     */
    function handleMatrixReentry(
        mapping(address => MatrixPosition) storage positions,
        mapping(address => address[]) storage referrals,
        address user,
        address sponsor
    ) external {
        MatrixPosition storage position = positions[user];
        
        // Reset matrix position for re-entry
        position.downline = new address[](0);
        position.isComplete = false;
        position.level = 1;
        
        // Re-place in matrix under same or new sponsor
        // Note: This would be handled by the main contract calling placeInMatrix again
        
        emit MatrixReentry(user, position.level, sponsor);
    }
    
    /**
     * @dev Get matrix statistics for user
     */
    function getMatrixStats(
        mapping(address => MatrixPosition) storage positions,
        mapping(address => MatrixCycle[]) storage userCycles,
        address user
    ) external view returns (
        address sponsor,
        uint8 level,
        uint32 cycleCount,
        uint256 totalEarnings,
        uint256 directDownline,
        uint256 totalDownline
    ) {
        MatrixPosition storage position = positions[user];
        
        sponsor = position.sponsor;
        level = position.level;
        cycleCount = position.cycleCount;
        totalEarnings = position.totalEarnings;
        directDownline = position.downline.length;
        totalDownline = countTotalDownline(positions, user, 0, 3);
        
        return (sponsor, level, cycleCount, totalEarnings, directDownline, totalDownline);
    }
    
    /**
     * @dev Get user's matrix cycles history
     */
    function getUserCycles(
        mapping(address => MatrixCycle[]) storage userCycles,
        address user
    ) external view returns (MatrixCycle[] memory) {
        return userCycles[user];
    }
    
    /**
     * @dev Calculate matrix earnings for a specific period
     */
    function calculateMatrixEarnings(
        mapping(address => MatrixCycle[]) storage userCycles,
        address user,
        uint256 fromTimestamp,
        uint256 toTimestamp
    ) external view returns (uint256 totalEarnings) {
        MatrixCycle[] storage cycles = userCycles[user];
        
        for (uint i = 0; i < cycles.length; i++) {
            if (cycles[i].timestamp >= fromTimestamp && cycles[i].timestamp <= toTimestamp) {
                totalEarnings += cycles[i].cycleBonus;
            }
        }
        
        return totalEarnings;
    }
    
    /**
     * @dev Check if user is eligible for matrix advancement
     */
    function checkMatrixAdvancementEligibility(
        mapping(address => MatrixPosition) storage positions,
        address user,
        uint32 minDirectDownline,
        uint32 minTotalDownline
    ) external view returns (bool eligible) {
        MatrixPosition storage position = positions[user];
        
        uint256 totalDownline = countTotalDownline(positions, user, 0, 3);
        
        return position.downline.length >= minDirectDownline && 
               totalDownline >= minTotalDownline;
    }
    
    /**
     * @dev Process matrix rewards distribution to upline
     */
    function distributeMatrixRewards(
        mapping(address => MatrixPosition) storage positions,
        mapping(address => DataStructures.User) storage users,
        address user,
        uint256 rewardAmount
    ) external {
        address current = positions[user].sponsor;
        uint256 remaining = rewardAmount;
        uint8 level = 1;
        
        while (current != address(0) && remaining > 0 && level <= 5) {
            if (users[current].isActive && 
                users[current].totalEarnings < users[current].earningsCap) {
                
                uint256 levelReward = (rewardAmount * getLevelPercentage(level)) / 10000;
                uint256 allowedReward = levelReward;
                
                if (users[current].totalEarnings + levelReward > users[current].earningsCap) {
                    allowedReward = users[current].earningsCap - users[current].totalEarnings;
                }
                
                if (allowedReward > 0) {
                    users[current].balance += uint96(allowedReward);
                    users[current].totalEarnings += uint96(allowedReward);
                    remaining -= allowedReward;
                }
            }
            
            current = positions[current].sponsor;
            level++;
        }
    }
    
    /**
     * @dev Get level percentage for matrix reward distribution
     */
    function getLevelPercentage(uint8 level) internal pure returns (uint256) {
        if (level == 1) return 3000; // 30%
        if (level == 2) return 2000; // 20%
        if (level == 3) return 1500; // 15%
        if (level == 4) return 1000; // 10%
        if (level == 5) return 500;  // 5%
        return 0;
    }
}
