// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";
import "./ConstantsLib.sol";

/**
 * @title AdminOperations
 * @dev Library for handling admin operations to reduce main contract size
 */
library AdminOperations {
    
    event UserBlacklisted(address indexed user, string reason, uint256 timestamp);
    event UserUnblacklisted(address indexed user, uint256 timestamp);
    event EarningsCapSet(address indexed user, uint256 cap, string reason, uint256 timestamp);
    event SponsorChanged(address indexed user, address indexed oldSponsor, address indexed newSponsor, string reason, uint256 timestamp);
    event ManualBonusDistributed(address indexed recipient, uint256 amount, string reason, uint256 timestamp);
    event EmergencyWithdrawal(address indexed recipient, uint256 amount, uint256 timestamp);
    
    /**
     * @dev Blacklist a user
     */
    function blacklistUser(
        mapping(address => DataStructures.User) storage users,
        address userAddress,
        string memory reason
    ) external {
        require(users[userAddress].isRegistered, "User not registered");
        users[userAddress].isBlacklisted = true;
        emit UserBlacklisted(userAddress, reason, block.timestamp);
    }
    
    /**
     * @dev Remove user from blacklist
     */
    function unblacklistUser(
        mapping(address => DataStructures.User) storage users,
        address userAddress
    ) external {
        require(users[userAddress].isRegistered, "User not registered");
        users[userAddress].isBlacklisted = false;
        emit UserUnblacklisted(userAddress, block.timestamp);
    }
    
    /**
     * @dev Set custom earnings cap for a user
     */
    function setEarningsCap(
        mapping(address => DataStructures.User) storage users,
        address userAddress,
        uint256 cap,
        string memory reason
    ) external {
        require(users[userAddress].isRegistered, "User not registered");
        users[userAddress].earningsCap = uint96(cap);
        emit EarningsCapSet(userAddress, cap, reason, block.timestamp);
    }
    
    /**
     * @dev Change user's sponsor
     */
    function changeSponsor(
        mapping(address => DataStructures.User) storage users,
        address userAddress,
        address newSponsor,
        string memory reason
    ) external {
        require(users[userAddress].isRegistered, "User not registered");
        require(users[newSponsor].isRegistered, "New sponsor not registered");
        require(newSponsor != userAddress, "Cannot sponsor self");
        
        address oldSponsor = users[userAddress].referrer;
        users[userAddress].referrer = newSponsor;
        
        // Update referral counts
        if (oldSponsor != address(0) && users[oldSponsor].directReferrals > 0) {
            users[oldSponsor].directReferrals--;
        }
        users[newSponsor].directReferrals++;
        
        emit SponsorChanged(userAddress, oldSponsor, newSponsor, reason, block.timestamp);
    }
    
    /**
     * @dev Distribute manual bonus to a user
     */
    function manualBonusDistribution(
        mapping(address => DataStructures.User) storage users,
        address recipient,
        uint256 amount,
        string memory reason
    ) external {
        require(users[recipient].isRegistered, "Recipient not registered");
        require(!users[recipient].isBlacklisted, "Recipient is blacklisted");
        
        users[recipient].totalEarnings += uint96(amount);
        users[recipient].balance += uint96(amount);
        
        emit ManualBonusDistributed(recipient, amount, reason, block.timestamp);
    }
    
    /**
     * @dev Emergency withdrawal function
     */
    function emergencyWithdrawal(
        address payable recipient,
        uint256 amount
    ) external {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        recipient.transfer(amount);
        emit EmergencyWithdrawal(recipient, amount, block.timestamp);
    }
    
    /**
     * @dev Initialize admin privilege IDs
     */
    function initializeAdminPrivilegeIDs(
        address[16] storage adminPrivilegeIDs,
        address[16] calldata newIds
    ) external {
        for (uint256 i = 0; i < 16; i++) {
            adminPrivilegeIDs[i] = newIds[i];
        }
    }
}
