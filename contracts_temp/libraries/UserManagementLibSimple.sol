// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./CommissionLib.sol";
import "./MatrixLib.sol";

/**
 * @title UserManagementLibSimple
 * @dev Simplified library for handling user management operations
 */
library UserManagementLibSimple {
    
    /**
     * @dev Check if address is admin
     */
    function isAdmin(address[16] storage adminIds, address user) internal view returns (bool) {
        for(uint i = 0; i < 16; i++) {
            if(adminIds[i] == user) return true;
        }
        return false;
    }
    
    /**
     * @dev Initialize admin IDs
     */
    function initializeAdmins(address[16] storage adminIds, address deployer) internal {
        for(uint i = 0; i < 16; i++) {
            adminIds[i] = deployer;
        }
    }
    
    /**
     * @dev Initialize deployer user
     */
    function initializeDeployer(CommissionLib.User storage user, address deployer) internal {
        user.isRegistered = true;
        user.isBlacklisted = false;
        user.referrer = address(0);
        user.balance = 0;
        user.totalInvestment = 0;
        user.totalEarnings = 0;
        user.earningsCap = type(uint96).max;
        user.directReferrals = 0;
        user.teamSize = 0;
        user.packageLevel = 4;
        user.rank = 5;
        user.withdrawalRate = 80;
        user.lastHelpPoolClaim = 0;
        user.isEligibleForHelpPool = true;
        user.matrixPosition = 0;
        user.matrixLevel = 0;
        user.registrationTime = uint32(block.timestamp);
        user.referralCode = "";
    }
    
    /**
     * @dev Initialize root user
     */
    function initializeRootUser(CommissionLib.User storage user, address rootUser) internal {
        user.isRegistered = true;
        user.isBlacklisted = false;
        user.referrer = address(0);
        user.balance = 0;
        user.totalInvestment = 0;
        user.totalEarnings = 0;
        user.earningsCap = type(uint96).max;
        user.directReferrals = 0;
        user.teamSize = 0;
        user.packageLevel = 4;
        user.rank = 5;
        user.withdrawalRate = 80;
        user.lastHelpPoolClaim = 0;
        user.isEligibleForHelpPool = true;
        user.matrixPosition = 1;
        user.matrixLevel = 1;
        user.registrationTime = uint32(block.timestamp);
        user.referralCode = "ROOT001";
    }
    
    /**
     * @dev Create new user
     */
    function createUser(
        CommissionLib.User storage user,
        address referrer,
        uint96 amount,
        uint8 packageLevel,
        uint32 totalUsers
    ) internal {
        uint32 matrixPos = MatrixLib.calculateMatrixPosition(totalUsers);
        uint32 matrixLvl = MatrixLib.calculateMatrixLevel(matrixPos);
        
        user.isRegistered = true;
        user.isBlacklisted = false;
        user.referrer = referrer;
        user.balance = 0;
        user.totalInvestment = amount;
        user.totalEarnings = 0;
        user.earningsCap = uint96(amount * 4); // EARNINGS_MULTIPLIER
        user.directReferrals = 0;
        user.teamSize = 0;
        user.packageLevel = packageLevel;
        user.rank = 0;
        user.withdrawalRate = 70;
        user.lastHelpPoolClaim = 0;
        user.isEligibleForHelpPool = true;
        user.matrixPosition = matrixPos;
        user.matrixLevel = matrixLvl;
        user.registrationTime = uint32(block.timestamp);
        user.referralCode = "";
    }
    
    /**
     * @dev Generate unique referral code
     */
    function generateUniqueReferralCode(address user, mapping(string => address) storage referralCodeToUser) 
        internal view returns (string memory) {
        string memory code = string(abi.encodePacked(
            "LF",
            _toHexString(uint160(user) % 10000),
            _toHexString(uint32(block.timestamp) % 1000)
        ));
        
        uint256 counter = 0;
        while (referralCodeToUser[code] != address(0) && counter < 100) {
            code = string(abi.encodePacked(code, "X"));
            counter++;
        }
        
        return code;
    }
    
    function _toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
