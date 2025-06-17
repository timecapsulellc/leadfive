// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./CommissionLibrary.sol";
import "./UserStorage.sol";

/**
 * @title MatrixLib
 * @dev Library for handling dual-branch matrix placement logic to reduce main contract size
 */
library MatrixLib {
    using UserStorage for UserStorage.User;

    // Events for matrix operations
    event MatrixPlacement(
        address indexed user,
        address indexed sponsor,
        address indexed parent,
        bool isLeft,
        uint256 level,
        uint256 timestamp
    );

    event MatrixUpgrade(
        address indexed user,
        uint256 indexed oldLevel,
        uint256 indexed newLevel,
        uint256 timestamp
    );

    /**
     * @dev Places user in the dual-branch matrix system
     * Implements 2×∞ crowd placement as per whitepaper
     */
    function placeInMatrix(
        mapping(address => UserStorage.User) storage users,
        mapping(address => address[]) storage directReferrals,
        mapping(address => address[30]) storage uplineChain,
        address user,
        address sponsor
    ) internal {
        require(sponsor != address(0), "Invalid sponsor");
        require(users[sponsor].registrationTime > 0, "Sponsor not registered");

        // Set sponsor relationship
        users[user].sponsor = sponsor;
        directReferrals[sponsor].push(user);

        // Find placement position in matrix
        address parent = _findMatrixParent(users, sponsor);
        _placeInMatrix(users, user, parent);

        // Build upline chain for Global Upline Bonus
        _buildUplineChain(users, uplineChain, user);

        emit MatrixPlacement(
            user,
            sponsor,
            parent,
            users[parent].leftChild == user,
            users[user].currentLevel,
            block.timestamp
        );
    }

    /**
     * @dev Finds the appropriate parent for matrix placement
     * Uses crowd placement algorithm to ensure balanced growth
     */
    function _findMatrixParent(
        mapping(address => UserStorage.User) storage users,
        address startingPoint
    ) internal view returns (address parent) {
        // Start from sponsor and traverse down to find available position
        address current = startingPoint;
        
        while (true) {
            // Check if current node has space
            if (users[current].leftChild == address(0)) {
                return current;
            } else if (users[current].rightChild == address(0)) {
                return current;
            }
            
            // Both positions filled, move to the node with smaller leg count
            if (users[current].leftLegCount <= users[current].rightLegCount) {
                current = users[current].leftChild;
            } else {
                current = users[current].rightChild;
            }
        }
    }

    /**
     * @dev Places user in matrix and updates leg counts
     */
    function _placeInMatrix(
        mapping(address => UserStorage.User) storage users,
        address user,
        address parent
    ) internal {
        // Place in available position
        if (users[parent].leftChild == address(0)) {
            users[parent].leftChild = user;
            _updateLegCounts(users, parent, true);
        } else {
            users[parent].rightChild = user;
            _updateLegCounts(users, parent, false);
        }

        // Set initial matrix level
        users[user].currentLevel = users[parent].currentLevel + 1;
    }

    /**
     * @dev Updates leg counts up the matrix tree
     */
    function _updateLegCounts(
        mapping(address => UserStorage.User) storage users,
        address startNode,
        bool isLeftLeg
    ) internal {
        address current = startNode;
        
        while (current != address(0)) {
            if (isLeftLeg) {
                users[current].leftLegCount++;
            } else {
                users[current].rightLegCount++;
            }
            
            // Update team size
            users[current].teamSize++;
            
            // Move to parent
            current = users[current].sponsor;
        }
    }

    /**
     * @dev Builds the 30-level upline chain for Global Upline Bonus
     */
    function _buildUplineChain(
        mapping(address => UserStorage.User) storage users,
        mapping(address => address[30]) storage uplineChain,
        address user
    ) internal {
        address current = users[user].sponsor;
        
        for (uint8 i = 0; i < 30 && current != address(0); i++) {
            uplineChain[user][i] = current;
            current = users[current].sponsor;
        }
    }

    /**
     * @dev Checks if user qualifies for matrix upgrade
     */
    function checkMatrixUpgrade(
        mapping(address => UserStorage.User) storage users,
        address user
    ) internal view returns (bool canUpgrade, uint256 newLevel) {
        uint32 leftCount = users[user].leftLegCount;
        uint32 rightCount = users[user].rightLegCount;
        uint32 currentLevel = users[user].currentLevel;
        
        // Check if both legs have sufficient members for upgrade
        uint256 requiredMembers = 2 ** currentLevel; // Exponential growth requirement
        
        if (leftCount >= requiredMembers && rightCount >= requiredMembers) {
            return (true, currentLevel + 1);
        }
        
        return (false, currentLevel);
    }

    /**
     * @dev Upgrades user's matrix level
     */
    function upgradeMatrixLevel(
        mapping(address => UserStorage.User) storage users,
        address user
    ) internal returns (bool success) {
        (bool canUpgrade, uint256 newLevel) = checkMatrixUpgrade(users, user);
        
        if (canUpgrade) {
            uint256 oldLevel = users[user].currentLevel;
            users[user].currentLevel = uint32(newLevel);
            
            emit MatrixUpgrade(user, oldLevel, newLevel, block.timestamp);
            return true;
        }
        
        return false;
    }

    /**
     * @dev Gets matrix information for a user
     */
    function getMatrixInfo(
        mapping(address => UserStorage.User) storage users,
        address user
    ) internal view returns (
        address leftChild,
        address rightChild,
        uint32 leftCount,
        uint32 rightCount,
        uint32 level,
        address sponsor
    ) {
        UserStorage.User storage userData = users[user];
        return (
            userData.leftChild,
            userData.rightChild,
            userData.leftLegCount,
            userData.rightLegCount,
            userData.currentLevel,
            userData.sponsor
        );
    }

    /**
     * @dev Calculates team volume for leader qualification
     */
    function calculateTeamVolume(
        mapping(address => UserStorage.User) storage users,
        address user
    ) internal view returns (uint256 totalVolume) {
        // Calculate volume from left leg
        if (users[user].leftChild != address(0)) {
            totalVolume += users[users[user].leftChild].totalInvested;
            totalVolume += calculateTeamVolume(users, users[user].leftChild);
        }
        
        // Calculate volume from right leg
        if (users[user].rightChild != address(0)) {
            totalVolume += users[users[user].rightChild].totalInvested;
            totalVolume += calculateTeamVolume(users, users[user].rightChild);
        }
        
        return totalVolume;
    }
}
