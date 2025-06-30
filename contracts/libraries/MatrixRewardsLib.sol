// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";
import "./BonusDistributionLib.sol";
import "./MatrixManagementLib.sol";

/**
 * @title MatrixRewardsLib
 * @dev Library for managing matrix tier rewards
 * Extracted from main contract to reduce bytecode size
 */
library MatrixRewardsLib {
    
    event MatrixCycleCompleted(address indexed user, uint8 level, uint256 bonus, uint32 cycleId);
    
    /**
     * @dev Matrix tier USDT rewards (simplified implementation)
     * Tiers 7, 8, 11, 15 get USDT rewards
     */
    function checkMatrixTierRewards(
        mapping(address => DataStructures.User) storage users,
        address user
    ) external returns (uint96 reward) {
        DataStructures.User storage userData = users[user];
        uint32 currentLevel = userData.matrixLevel;
        
        // Check for tier rewards at specific levels
        if(currentLevel == 7 || currentLevel == 8 || currentLevel == 11 || currentLevel == 15) {
            reward = calculateTierReward(uint8(currentLevel));
            if(reward > 0) {
                BonusDistributionLib.addEarningsWithCap(users, user, reward, 30); // Bonus type 30 for tier rewards
                emit MatrixCycleCompleted(user, uint8(currentLevel), reward, userData.matrixCycles);
            }
        }
        
        return reward;
    }
    
    /**
     * @dev Calculate tier reward based on level
     */
    function calculateTierReward(uint8 level) internal pure returns (uint96) {
        if(level == 7) return 50e18;   // $50 USDT
        if(level == 8) return 100e18;  // $100 USDT
        if(level == 11) return 200e18; // $200 USDT
        if(level == 15) return 500e18; // $500 USDT
        return 0;
    }
    
    /**
     * @dev Advance user matrix level and check for rewards
     */
    function advanceUserMatrix(
        mapping(address => DataStructures.User) storage users,
        address user,
        uint8 newLevel
    ) external returns (uint96 reward) {
        require(newLevel > users[user].matrixLevel, "Can only advance");
        require(newLevel <= 15, "Max level is 15");
        
        users[user].matrixLevel = uint32(newLevel);
        users[user].matrixCycles++;
        
        // Check for tier rewards
        DataStructures.User storage userData = users[user];
        uint32 currentLevel = userData.matrixLevel;
        
        // Check for tier rewards at specific levels
        if(currentLevel == 7 || currentLevel == 8 || currentLevel == 11 || currentLevel == 15) {
            reward = calculateTierReward(uint8(currentLevel));
            if(reward > 0) {
                BonusDistributionLib.addEarningsWithCap(users, user, reward, 30); // Bonus type 30 for tier rewards
                emit MatrixCycleCompleted(user, uint8(currentLevel), reward, userData.matrixCycles);
            }
        }
        
        return reward;
    }
    
    /**
     * @dev Calculate matrix rewards for user
     */
    function calculateMatrixRewards(
        mapping(address => DataStructures.User) storage users,
        address user,
        mapping(address => MatrixManagementLib.MatrixPosition) storage matrixPositions
    ) internal view returns (
        uint256 pendingRewards,
        uint256 cycleBonus,
        uint256 spilloverEarnings
    ) {
        MatrixManagementLib.MatrixPosition memory position = matrixPositions[user];
        
        // Calculate based on matrix position and cycles
        cycleBonus = position.cycleCount * calculateTierReward(position.level);
        spilloverEarnings = position.totalEarnings;
        pendingRewards = cycleBonus + spilloverEarnings;
        
        return (pendingRewards, cycleBonus, spilloverEarnings);
    }
    
    /**
     * @dev Public wrapper for calculateMatrixRewards
     */
    function getMatrixRewards(
        mapping(address => DataStructures.User) storage users,
        address user,
        mapping(address => MatrixManagementLib.MatrixPosition) storage matrixPositions
    ) external view returns (
        uint256 pendingRewards,
        uint256 cycleBonus,
        uint256 spilloverEarnings
    ) {
        return calculateMatrixRewards(users, user, matrixPositions);
    }

    /**
     * @dev Calculate and claim matrix rewards
     */
    function calculateAndClaimMatrixRewards(
        mapping(address => DataStructures.User) storage users,
        address user,
        mapping(address => MatrixManagementLib.MatrixPosition) storage matrixPositions
    ) external returns (uint256 totalRewards) {
        (uint256 pendingRewards,,) = calculateMatrixRewards(users, user, matrixPositions);
        
        if(pendingRewards > 0) {
            // Reset pending rewards after claiming
            matrixPositions[user].totalEarnings = 0;
            totalRewards = pendingRewards;
        }
        
        return totalRewards;
    }
    
    /**
     * @dev Trigger matrix cycle for user
     */
    function triggerMatrixCycle(
        mapping(address => DataStructures.User) storage users,
        address user,
        mapping(address => MatrixManagementLib.MatrixPosition) storage matrixPositions
    ) external {
        MatrixManagementLib.MatrixPosition storage position = matrixPositions[user];
        DataStructures.User storage userData = users[user];
        
        position.cycleCount++;
        userData.matrixCycles++;
        
        // Award cycle bonus
        uint96 cycleBonus = calculateTierReward(position.level);
        if(cycleBonus > 0) {
            BonusDistributionLib.addEarningsWithCap(users, user, cycleBonus, 31); // Matrix cycle bonus
            emit MatrixCycleCompleted(user, position.level, cycleBonus, position.cycleCount);
        }
    }
}
