// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title EventsLib
 * @dev Library containing all event definitions to reduce main contract size
 */
library EventsLib {
    
    // Core user events
    event UserRegistered(address indexed user, address indexed referrer, uint8 packageLevel, uint256 timestamp);
    event ContributionMade(address indexed user, uint256 amount, uint8 packageLevel, uint256 timestamp);
    event FundsWithdrawn(address indexed user, uint256 amount, uint256 timestamp);
    
    // Bonus and commission events
    event BonusDistributed(address indexed recipient, address indexed source, uint256 amount, uint8 bonusType, string description, uint256 timestamp);
    event CommissionPaid(address indexed recipient, address indexed payer, uint256 amount, uint8 level, uint256 timestamp);
    
    // Pool distribution events
    event GlobalHelpPoolDistributed(uint256 totalAmount, uint256 recipientCount, uint256 timestamp);
    event LeaderBonusDistributed(uint256 totalAmount, uint256 recipientCount, uint256 timestamp);
    event ClubPoolDistributed(uint256 totalAmount, uint256 recipientCount, uint256 timestamp);
    
    // Matrix events
    event MatrixPlacement(address indexed user, address indexed referrer, uint8 position, uint256 timestamp);
    event MatrixSpillover(address indexed user, address indexed newPosition, uint256 timestamp);
    
    // Admin events
    event AdminPrivilegeUsed(uint8 privilegeIndex, address indexed user, uint8 packageLevel, uint256 timestamp);
    event PackageUpdated(uint256 indexed tier, uint256 newAmount, bool isActive, uint256 timestamp);
    
    // Emergency events
    event EmergencyPaused(address admin, uint256 timestamp);
    event EmergencyUnpaused(address admin, uint256 timestamp);
    event ContractUpgraded(address indexed implementation, uint256 timestamp);
    
    /**
     * @dev Emit user registration event
     */
    function emitUserRegistered(
        address user,
        address referrer,
        uint8 packageLevel
    ) external {
        emit UserRegistered(user, referrer, packageLevel, block.timestamp);
    }
    
    /**
     * @dev Emit contribution event
     */
    function emitContributionMade(
        address user,
        uint256 amount,
        uint8 packageLevel
    ) external {
        emit ContributionMade(user, amount, packageLevel, block.timestamp);
    }
    
    /**
     * @dev Emit withdrawal event
     */
    function emitFundsWithdrawn(
        address user,
        uint256 amount
    ) external {
        emit FundsWithdrawn(user, amount, block.timestamp);
    }
    
    /**
     * @dev Emit bonus distribution event
     */
    function emitBonusDistributed(
        address recipient,
        address source,
        uint256 amount,
        uint8 bonusType,
        string memory description
    ) external {
        emit BonusDistributed(recipient, source, amount, bonusType, description, block.timestamp);
    }
    
    /**
     * @dev Emit commission payment event
     */
    function emitCommissionPaid(
        address recipient,
        address payer,
        uint256 amount,
        uint8 level
    ) external {
        emit CommissionPaid(recipient, payer, amount, level, block.timestamp);
    }
    
    /**
     * @dev Emit matrix placement event
     */
    function emitMatrixPlacement(
        address user,
        address referrer,
        uint8 position
    ) external {
        emit MatrixPlacement(user, referrer, position, block.timestamp);
    }
}
