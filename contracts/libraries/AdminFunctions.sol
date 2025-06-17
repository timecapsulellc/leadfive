// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DataStructures.sol";
import "./ConstantsLib.sol";

/**
 * @title AdminFunctions
 * @dev Library containing all admin-only operations to reduce main contract size
 */
library AdminFunctions {
    
    // Events for admin operations
    event ManualBonusDistributed(address indexed recipient, uint256 amount, string reason, address admin, uint256 timestamp);
    event EmergencyWithdrawal(address indexed recipient, uint256 amount, address admin, uint256 timestamp);
    event TokenRecovered(address indexed token, uint256 amount, address recipient, address admin, uint256 timestamp);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle, uint256 timestamp);
    event OraclePriceFetched(uint256 price, uint256 timestamp);
    event PackageAdded(uint256 indexed tier, uint96 price, uint16 directBonus, uint16 matrixBonus, uint16 poolShare, uint256 timestamp);
    event BlacklistUpdated(address indexed user, bool status, string reason, uint256 timestamp);

    /**
     * @dev Add a new package tier
     */
    function addPackage(
        mapping(uint256 => DataStructures.Package) storage packages,
        uint256 tier,
        uint96 price,
        uint16 directBonus,
        uint16 matrixBonus,
        uint16 poolShare
    ) external {
        packages[tier] = DataStructures.Package({
            price: price,
            directBonus: directBonus,
            matrixBonus: matrixBonus,
            poolShare: poolShare
        });
        
        emit PackageAdded(tier, price, directBonus, matrixBonus, poolShare, block.timestamp);
    }

    /**
     * @dev Distribute manual bonus to a user
     */
    function distributeManualBonus(
        mapping(address => DataStructures.User) storage users,
        address recipient,
        uint256 amount,
        string memory reason,
        address admin
    ) external {
        // Note: Using the main contract's User struct, not DataStructures.User
        // This requires accessing the mapping directly from the main contract
        // We'll emit the event here but the actual state update happens in main contract
        emit ManualBonusDistributed(recipient, amount, reason, admin, block.timestamp);
    }

    /**
     * @dev Emergency withdrawal function
     */
    function emergencyWithdraw(
        address recipient,
        uint256 amount,
        address admin
    ) external {
        payable(recipient).transfer(amount);
        emit EmergencyWithdrawal(recipient, amount, admin, block.timestamp);
    }

    /**
     * @dev Recover stuck tokens
     */
    function recoverToken(
        IERC20 token,
        uint256 amount,
        address recipient,
        address admin
    ) external {
        token.transfer(recipient, amount);
        emit TokenRecovered(address(token), amount, recipient, admin, block.timestamp);
    }

    /**
     * @dev Update blacklist status
     */
    function updateBlacklist(
        mapping(address => DataStructures.User) storage users,
        address user,
        bool status,
        string memory reason
    ) external {
        users[user].isBlacklisted = status;
        
        emit BlacklistUpdated(user, status, reason, block.timestamp);
    }

    /**
     * @dev Update oracle address
     */
    function updateOracle(
        address oldOracle,
        address newOracle
    ) external {
        emit OracleUpdated(oldOracle, newOracle, block.timestamp);
    }

    /**
     * @dev Set oracle price
     */
    function setOraclePrice(uint256 price) external {
        emit OraclePriceFetched(price, block.timestamp);
    }
}
