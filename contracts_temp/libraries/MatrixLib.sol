// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title MatrixLib
 * @dev Library for handling matrix placement and genealogy
 */
library MatrixLib {
    
    struct MatrixNode {
        address user;
        address leftChild;
        address rightChild;
        uint32 level;
        uint32 position;
    }
    
    /**
     * @dev Calculate matrix position for new user
     */
    function calculateMatrixPosition(uint32 totalUsers) 
        internal 
        pure 
        returns (uint32) 
    {
        return totalUsers + 1;
    }
    
    /**
     * @dev Calculate matrix level based on position
     */
    function calculateMatrixLevel(uint32 position) 
        internal 
        pure 
        returns (uint32) 
    {
        if (position == 1) return 1;
        
        uint32 level = 1;
        uint32 maxInLevel = 2;
        uint32 currentPos = 1;
        
        while (currentPos + maxInLevel < position) {
            currentPos += maxInLevel;
            maxInLevel *= 2;
            level++;
        }
        
        return level;
    }
    
    /**
     * @dev Find placement position in binary matrix with spillover rotation
     */
    function findPlacementPosition(
        mapping(address => address[2]) storage binaryMatrix,
        mapping(address => uint32) storage spilloverCounter,
        address referrer
    ) internal returns (address placementParent, uint8 position) {
        address current = referrer;
        uint256 depth = 0;
        uint256 maxDepth = 100; // Prevent infinite loops
        
        while (depth < maxDepth) {
            if (binaryMatrix[current][0] == address(0)) {
                return (current, 0); // Left position
            } else if (binaryMatrix[current][1] == address(0)) {
                return (current, 1); // Right position
            } else {
                // ✅ FIX: Rotate spillover direction for fairness
                uint8 spilloverDirection = uint8(spilloverCounter[current] % 2);
                spilloverCounter[current]++;
                
                if (spilloverDirection == 0) {
                    current = binaryMatrix[current][0]; // Spillover to left
                } else {
                    current = binaryMatrix[current][1]; // Spillover to right
                }
                depth++;
            }
        }
        
        revert("Matrix placement failed: max depth reached");
    }
    
    /**
     * @dev Find placement position in binary matrix (view function for compatibility)
     */
    function findPlacementPosition(
        mapping(address => address[2]) storage binaryMatrix,
        address referrer
    ) internal view returns (address placementParent, uint8 position) {
        address current = referrer;
        uint256 depth = 0;
        uint256 maxDepth = 100;
        
        while (depth < maxDepth) {
            if (binaryMatrix[current][0] == address(0)) {
                return (current, 0); // Left position
            } else if (binaryMatrix[current][1] == address(0)) {
                return (current, 1); // Right position
            } else {
                current = binaryMatrix[current][0]; // Default to left for view
                depth++;
            }
        }
        
        revert("Matrix placement failed: max depth reached");
    }
    
    /**
     * @dev Build upline chain for user
     */
    function buildUplineChain(
        mapping(address => address[30]) storage uplineChain,
        mapping(address => address) storage referrers,
        address user,
        address referrer
    ) internal {
        uplineChain[user][0] = referrer;
        
        for (uint8 i = 1; i < 30; i++) {
            address nextUpline = uplineChain[uplineChain[user][i-1]][0];
            if (nextUpline == address(0)) break;
            uplineChain[user][i] = nextUpline;
        }
    }
    
    /**
     * @dev Get matrix children for a user
     */
    function getMatrixChildren(
        mapping(address => address[2]) storage binaryMatrix,
        address user
    ) internal view returns (address left, address right) {
        return (binaryMatrix[user][0], binaryMatrix[user][1]);
    }
    
    /**
     * @dev Count team size iteratively (gas efficient)
     */
    function calculateTeamSize(
        mapping(address => address[]) storage directReferrals,
        address user
    ) internal view returns (uint32) {
        uint32 totalSize = 0;
        address[] memory queue = new address[](1000); // Limit to prevent DoS
        uint256 front = 0;
        uint256 rear = 1;
        queue[0] = user;
        
        while (front < rear && front < 1000) {
            address current = queue[front++];
            address[] memory refs = directReferrals[current];
            
            for (uint i = 0; i < refs.length && rear < 1000; i++) {
                queue[rear++] = refs[i];
                totalSize++;
            }
        }
        
        return totalSize;
    }
    
    /**
     * @dev Update team sizes up the chain
     */
    function updateUplineTeamSizes(
        mapping(address => address) storage referrers,
        mapping(address => uint32) storage teamSizes,
        address user
    ) internal {
        address current = referrers[user];
        
        for (uint8 i = 0; i < 30 && current != address(0); i++) {
            teamSizes[current]++;
            current = referrers[current];
        }
    }
    
    /**
     * @dev Check if user qualifies for leader rank
     */
    function checkLeaderQualification(
        uint32 teamSize,
        uint32 directReferrals
    ) internal pure returns (uint8 rank) {
        if (teamSize >= 500) {
            return 2; // Silver Star Leader
        } else if (teamSize >= 250 && directReferrals >= 10) {
            return 1; // Shining Star Leader
        } else {
            return 0; // No rank
        }
    }
}
