// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";
import "./Errors.sol";

/**
 * @title MatrixManagementLib
 * @dev Library for managing matrix positions and tree structure
 * Extracted from main contract to reduce bytecode size
 */
library MatrixManagementLib {
    
    struct MatrixPosition {
        address upline;
        address[] downlines;
        uint8 level;
        uint256 totalEarnings;
        uint32 cycleCount;
        bool isActive;
    }
    
    event MatrixPositionUpdated(address indexed user, address indexed upline, uint256 level);
    event MatrixEarningsUpdated(address indexed user, uint256 amount);
    
    /**
     * @dev Initialize matrix position for a new user
     */
    function initializePosition(
        MatrixPosition storage position,
        address upline,
        uint8 level
    ) external {
        position.upline = upline;
        position.level = level;
        position.isActive = true;
        position.totalEarnings = 0;
        position.cycleCount = 0;
        
        emit MatrixPositionUpdated(msg.sender, upline, level);
    }
    
    /**
     * @dev Add downline to matrix position
     */
    function addDownline(
        MatrixPosition storage position,
        address downline
    ) external {
        position.downlines.push(downline);
    }
    
    /**
     * @dev Update earnings for matrix position
     */
    function updateEarnings(
        MatrixPosition storage position,
        uint256 amount
    ) external {
        position.totalEarnings += amount;
        emit MatrixEarningsUpdated(msg.sender, amount);
    }
    
    /**
     * @dev Set matrix position active/inactive
     */
    function setPositionActive(
        MatrixPosition storage position,
        bool active
    ) external {
        position.isActive = active;
    }
    
    /**
     * @dev Get matrix position info
     */
    function getPositionInfo(MatrixPosition storage position) 
        external 
        view 
        returns (
            address upline,
            uint256 downlinesCount,
            uint8 level,
            uint256 totalEarnings,
            uint32 cycleCount,
            bool isActive
        ) 
    {
        return (
            position.upline,
            position.downlines.length,
            position.level,
            position.totalEarnings,
            position.cycleCount,
            position.isActive
        );
    }
    
    /**
     * @dev Get downlines array
     */
    function getDownlines(MatrixPosition storage position) 
        external 
        view 
        returns (address[] memory) 
    {
        return position.downlines;
    }
    
    /**
     * @dev Find optimal upline in matrix
     */
    function findOptimalUpline(
        mapping(address => MatrixPosition) storage matrixPositions,
        address startFrom,
        uint256 maxDownlines
    ) external view returns (address) {
        address current = startFrom;
        
        // Walk up the tree to find available slot
        while (current != address(0)) {
            if (matrixPositions[current].downlines.length < maxDownlines) {
                return current;
            }
            current = matrixPositions[current].upline;
        }
        
        return startFrom; // Fallback
    }
}
