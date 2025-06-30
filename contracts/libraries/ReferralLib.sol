// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

library ReferralLib {
    
    event ReferralCodeGenerated(address indexed user, string code);
    event ReferralEarningsCalculated(address indexed referrer, address indexed referred, uint256 amount);
    event TeamStructureUpdated(address indexed user, uint256 teamSize, uint256 teamVolume);
    
    /**
     * @dev Generate a unique referral code for a user
     */
    function generateCode(
        mapping(string => address) storage referralCodeToUser,
        address user
    ) internal returns (string memory) {
        // Create a simple referral code based on user address
        string memory baseCode = _addressToString(user);
        string memory code = string(abi.encodePacked("LF", baseCode));
        
        // Store the mapping
        referralCodeToUser[code] = user;
        
        emit ReferralCodeGenerated(user, code);
        return code;
    }
    
    /**
     * @dev Generate custom referral code
     */
    function generateCustomCode(
        mapping(string => address) storage referralCodeToUser,
        mapping(address => DataStructures.User) storage users,
        address user,
        string memory customCode
    ) internal {
        require(users[user].isRegistered, "User not registered");
        require(referralCodeToUser[customCode] == address(0), "Code already taken");
        require(bytes(customCode).length >= 4 && bytes(customCode).length <= 20, "Invalid code length");
        
        // Remove old code if exists
        string memory oldCode = users[user].referralCode;
        if(bytes(oldCode).length > 0) {
            delete referralCodeToUser[oldCode];
        }
        
        // Set new code
        users[user].referralCode = customCode;
        referralCodeToUser[customCode] = user;
        
        emit ReferralCodeGenerated(user, customCode);
    }
    
    /**
     * @dev Calculate multi-level referral bonuses (10 levels)
     */
    function calculateMultiLevelBonuses(
        mapping(address => DataStructures.User) storage users,
        address user,
        uint256 amount
    ) internal view returns (address[] memory referrers, uint256[] memory bonuses) {
        address[] memory referrerChain = new address[](10);
        uint256[] memory bonusAmounts = new uint256[](10);
        
        // Level bonus percentages (basis points)
        uint16[10] memory levelPercentages = [1000, 500, 300, 200, 100, 100, 50, 50, 25, 25]; // 10%, 5%, 3%, etc.
        
        address currentUser = user;
        uint8 level = 0;
        
        while (level < 10 && currentUser != address(0)) {
            address referrer = users[currentUser].referrer;
            if (referrer == address(0) || users[referrer].isBlacklisted) break;
            
            // Check if referrer qualifies for this level
            if (_qualifiesForLevel(users[referrer], level)) {
                referrerChain[level] = referrer;
                bonusAmounts[level] = (amount * levelPercentages[level]) / 10000;
            }
            
            currentUser = referrer;
            level++;
        }
        
        return (referrerChain, bonusAmounts);
    }
    
    /**
     * @dev Update team structure when new user joins
     */
    function updateTeamStructure(
        mapping(address => DataStructures.User) storage users,
        mapping(address => address[]) storage directReferrals,
        address newUser,
        address referrer,
        uint256 investment
    ) internal {
        if (referrer == address(0)) return;
        
        // Add to direct referrals
        directReferrals[referrer].push(newUser);
        
        // Update upline team sizes and volumes
        address currentReferrer = referrer;
        while (currentReferrer != address(0)) {
            users[currentReferrer].teamSize++;
            users[currentReferrer].leftLegVolume += uint96(investment); // Simplified binary calculation
            
            emit TeamStructureUpdated(currentReferrer, users[currentReferrer].teamSize, users[currentReferrer].leftLegVolume);
            
            currentReferrer = users[currentReferrer].referrer;
        }
    }
    
    /**
     * @dev Get referral statistics for a user
     */
    function getReferralStats(
        mapping(address => DataStructures.User) storage users,
        mapping(address => address[]) storage directReferrals,
        address user
    ) internal view returns (
        uint32 totalReferrals,
        uint32 activeReferrals,
        uint96 totalReferralVolume,
        uint96 totalReferralEarnings
    ) {
        address[] memory directs = directReferrals[user];
        totalReferrals = uint32(directs.length);
        activeReferrals = 0;
        totalReferralVolume = 0;
        
        for (uint256 i = 0; i < directs.length; i++) {
            DataStructures.User memory referredUser = users[directs[i]];
            if (referredUser.isActive && !referredUser.isBlacklisted) {
                activeReferrals++;
            }
            totalReferralVolume += referredUser.totalInvestment;
        }
        
        totalReferralEarnings = users[user].totalEarnings;
        
        return (totalReferrals, activeReferrals, totalReferralVolume, totalReferralEarnings);
    }
    
    /**
     * @dev Get genealogy tree for a user
     */
    function getGenealogyTree(
        mapping(address => DataStructures.User) storage users,
        mapping(address => address[]) storage directReferrals,
        address user,
        uint8 depth
    ) internal view returns (
        address[] memory upline,
        address[] memory downline,
        uint32[] memory teamSizes
    ) {
        // Get upline
        address[] memory uplineChain = new address[](depth);
        address currentUser = user;
        for (uint8 i = 0; i < depth && currentUser != address(0); i++) {
            currentUser = users[currentUser].referrer;
            uplineChain[i] = currentUser;
        }
        
        // Get downline (limited to first level for simplicity)
        address[] memory downlineUsers = directReferrals[user];
        uint32[] memory sizes = new uint32[](downlineUsers.length);
        
        for (uint256 i = 0; i < downlineUsers.length; i++) {
            sizes[i] = users[downlineUsers[i]].teamSize;
        }
        
        return (uplineChain, downlineUsers, sizes);
    }
    
    /**
     * @dev Calculate binary tree volumes
     */
    function calculateBinaryVolumes(
        mapping(address => DataStructures.User) storage users,
        mapping(address => address[]) storage directReferrals,
        address user
    ) internal view returns (uint96 leftVolume, uint96 rightVolume, uint96 carryForward) {
        address[] memory directs = directReferrals[user];
        if (directs.length == 0) return (0, 0, 0);
        
        // Simplified binary calculation
        leftVolume = 0;
        rightVolume = 0;
        
        for (uint256 i = 0; i < directs.length; i++) {
            if (i % 2 == 0) {
                leftVolume += users[directs[i]].totalInvestment + users[directs[i]].leftLegVolume;
            } else {
                rightVolume += users[directs[i]].totalInvestment + users[directs[i]].rightLegVolume;
            }
        }
        
        // Calculate carry forward (unmatched volume)
        carryForward = leftVolume > rightVolume ? leftVolume - rightVolume : rightVolume - leftVolume;
        
        return (leftVolume, rightVolume, carryForward);
    }
    
    /**
     * @dev Check if user qualifies for a specific level bonus
     */
    function _qualifiesForLevel(DataStructures.User storage user, uint8 level) private view returns (bool) {
        // Basic qualification: must be active and have minimum package level
        if (!user.isActive || user.isBlacklisted) return false;
        
        // Level-specific requirements
        if (level == 0) return true; // Direct sponsor always qualifies
        if (level <= 2) return user.packageLevel >= 2; // Levels 1-2 need package 2+
        if (level <= 5) return user.packageLevel >= 3; // Levels 3-5 need package 3+
        return user.packageLevel >= 4; // Levels 6+ need package 4
    }
    
    /**
     * @dev Convert address to string (simplified)
     */
    function _addressToString(address user) private pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(user)));
        bytes memory alphabet = "0123456789ABCDEF";
        
        bytes memory str = new bytes(8); // Take first 8 chars
        for (uint256 i = 0; i < 4; i++) {
            str[i*2] = alphabet[uint256(uint8(value[i] >> 4))];
            str[1+i*2] = alphabet[uint256(uint8(value[i] & 0x0f))];
        }
        return string(str);
    }
}
