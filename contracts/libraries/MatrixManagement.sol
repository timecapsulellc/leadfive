// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title MatrixManagement
 * @dev Handles matrix cycling, completion tracking, and spillover logic
 */
library MatrixManagement {
    
    uint256 constant MATRIX_WIDTH = 2; // Binary matrix
    uint256 constant MAX_MATRIX_DEPTH = 10; // 10 levels deep
    
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
        uint256 completionTime;
        uint256 earnings;
        uint8 level;
    }
    
    event MatrixLevelComplete(address indexed user, uint8 level, uint256 earnings);
    event MatrixCycleEvent(address indexed user, uint32 cycleId, uint256 bonus);
    event SpilloverPlacement(address indexed user, address indexed placedUnder, uint8 level);
    
    /**
     * @dev Place user in matrix with power line spillover logic
     */
    function placeInMatrix(
        mapping(address => MatrixPosition) storage positions,
        mapping(address => address[]) storage referrals,
        address user,
        address sponsor
    ) internal returns (address placedUnder) {
        // If sponsor's first level is not full, place directly
        if (positions[sponsor].downline.length < MATRIX_WIDTH) {
            positions[sponsor].downline.push(user);
            positions[user].sponsor = sponsor;
            positions[user].level = positions[sponsor].level + 1;
            
            emit SpilloverPlacement(user, sponsor, positions[user].level);
            return sponsor;
        }
        
        // Find next available position in power line (left leg priority)
        placedUnder = findNextPosition(positions, sponsor);
        positions[placedUnder].downline.push(user);
        positions[user].sponsor = placedUnder;
        positions[user].level = positions[placedUnder].level + 1;
        
        emit SpilloverPlacement(user, placedUnder, positions[user].level);
        return placedUnder;
    }
    
    /**
     * @dev Find next available position using breadth-first search
     */
    function findNextPosition(
        mapping(address => MatrixPosition) storage positions,
        address root
    ) internal view returns (address) {
        address[] memory queue = new address[](1024);
        uint256 front = 0;
        uint256 rear = 1;
        queue[0] = root;
        
        while (front < rear) {
            address current = queue[front++];
            
            // Check if this position has space
            if (positions[current].downline.length < MATRIX_WIDTH) {
                return current;
            }
            
            // Add children to queue (left leg first for power line)
            for (uint256 i = 0; i < positions[current].downline.length && rear < 1024; i++) {
                queue[rear++] = positions[current].downline[i];
            }
        }
        
        return root; // Fallback
    }
    
    /**
     * @dev Check if user completed a matrix level
     */
    function checkMatrixCompletion(
        mapping(address => MatrixPosition) storage positions,
        address user,
        uint8 level
    ) internal view returns (bool, uint256) {
        uint256 requiredDownline = (2 ** level) - 1; // Total nodes in binary tree
        uint256 currentDownline = countDownline(positions, user, level);
        
        return (currentDownline >= requiredDownline, currentDownline);
    }
    
    /**
     * @dev Count total downline up to specified level
     */
    function countDownline(
        mapping(address => MatrixPosition) storage positions,
        address user,
        uint8 maxLevel
    ) internal view returns (uint256) {
        if (maxLevel == 0) return 0;
        
        uint256 count = 0;
        address[] memory queue = new address[](1024);
        uint256 front = 0;
        uint256 rear = 0;
        
        // Add direct downline to queue
        for (uint256 i = 0; i < positions[user].downline.length; i++) {
            queue[rear++] = positions[user].downline[i];
            count++;
        }
        
        uint8 currentLevel = 1;
        uint256 levelEnd = rear;
        
        while (front < rear && currentLevel < maxLevel) {
            address current = queue[front++];
            
            // Add children to queue
            for (uint256 i = 0; i < positions[current].downline.length && rear < 1024; i++) {
                queue[rear++] = positions[current].downline[i];
                count++;
            }
            
            // Check if we've processed all nodes at current level
            if (front == levelEnd) {
                currentLevel++;
                levelEnd = rear;
            }
        }
        
        return count;
    }
    
    /**
     * @dev Process matrix cycle completion and re-entry
     */
    function processCycleCompletion(
        mapping(address => MatrixPosition) storage positions,
        mapping(address => MatrixCycle[]) storage cycles,
        address user,
        uint8 level,
        uint256 cycleBonus
    ) internal returns (uint32 newCycleId) {
        MatrixPosition storage position = positions[user];
        position.cycleCount++;
        position.isComplete = true;
        position.totalEarnings += cycleBonus;
        
        // Record cycle
        newCycleId = position.cycleCount;
        cycles[user].push(MatrixCycle({
            cycleId: newCycleId,
            completionTime: block.timestamp,
            earnings: cycleBonus,
            level: level
        }));
        
        emit MatrixLevelComplete(user, level, cycleBonus);
        emit MatrixCycleEvent(user, newCycleId, cycleBonus);
        
        return newCycleId;
    }
    
    /**
     * @dev Re-enter matrix after cycle completion
     */
    function reenterMatrix(
        mapping(address => MatrixPosition) storage positions,
        address user,
        address sponsor
    ) internal {
        // Reset position but keep cycle count and earnings
        MatrixPosition storage position = positions[user];
        position.downline = new address[](0);
        position.isComplete = false;
        position.level = 1;
        
        // Re-place in matrix under same sponsor
        // Note: We need to pass proper referrals mapping - this needs to be handled by caller
    }
    
    /**
     * @dev Calculate cycle bonus based on level
     */
    function calculateCycleBonus(uint8 level, uint256 baseAmount) internal pure returns (uint256) {
        // Exponential bonus growth per level
        return baseAmount * (2 ** level);
    }
}
