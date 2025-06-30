// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title Network Analytics Library
 * @dev Handles network analysis and binary tree operations
 */
library NetworkAnalytics {
    
    struct NetworkData {
        address[] directReferrals;
        address[] teamMembers;
        mapping(uint256 => address) uplineChain;
        uint256 networkDepth;
        address leftChild;
        address rightChild;
        uint256 leftVolume;
        uint256 rightVolume;
        bool binaryQualified;
    }
    
    function updateNetworkDepth(
        mapping(address => NetworkData) storage networkData,
        address user,
        address sponsor
    ) internal {
        address current = sponsor;
        uint256 depth = 0;
        
        for (uint256 i = 0; i < 30 && current != address(0); i++) {
            networkData[user].uplineChain[i] = current;
            networkData[current].teamMembers.push(user);
            depth++;
            current = networkData[current].uplineChain[0]; // Get sponsor of current
        }
        
        networkData[user].networkDepth = depth;
    }
    
    function findBinaryPlacement(
        mapping(address => NetworkData) storage networkData,
        address sponsor
    ) internal view returns (address placementPosition, bool isLeft) {
        NetworkData storage sponsorData = networkData[sponsor];
        
        // If sponsor has no children, place under sponsor
        if (sponsorData.leftChild == address(0)) {
            return (sponsor, true);
        }
        if (sponsorData.rightChild == address(0)) {
            return (sponsor, false);
        }
        
        // Place under the side with less volume
        if (sponsorData.leftVolume <= sponsorData.rightVolume) {
            (placementPosition, isLeft) = findBinaryPlacement(networkData, sponsorData.leftChild);
            return (placementPosition, true);
        } else {
            (placementPosition, isLeft) = findBinaryPlacement(networkData, sponsorData.rightChild);
            return (placementPosition, false);
        }
    }
    
    function updateBinaryVolumes(
        mapping(address => NetworkData) storage networkData,
        address user,
        uint256 amount
    ) internal {
        address current = user;
        
        while (current != address(0)) {
            NetworkData storage currentData = networkData[current];
            address parent = currentData.uplineChain[0];
            
            if (parent != address(0)) {
                NetworkData storage parentData = networkData[parent];
                
                // Determine if current is left or right child of parent
                if (parentData.leftChild == current) {
                    parentData.leftVolume += amount;
                } else if (parentData.rightChild == current) {
                    parentData.rightVolume += amount;
                }
                
                // Check binary qualification (both sides >= 1000 USDT)
                if (parentData.leftVolume >= 1000 * 10**18 && parentData.rightVolume >= 1000 * 10**18) {
                    parentData.binaryQualified = true;
                }
            }
            
            current = parent;
        }
    }
    
    function getUplineChain(
        mapping(address => NetworkData) storage networkData,
        address user,
        uint256 levels
    ) internal view returns (address[] memory) {
        address[] memory upline = new address[](levels);
        
        for (uint256 i = 0; i < levels; i++) {
            upline[i] = networkData[user].uplineChain[i];
        }
        
        return upline;
    }
    
    /**
     * @dev Initialize network data for a user
     */
    function initializeNetworkData(NetworkData storage data, address user) internal {
        data.networkDepth = 0;
        data.leftChild = address(0);
        data.rightChild = address(0);
        data.leftVolume = 0;
        data.rightVolume = 0;
        data.binaryQualified = false;
    }
    
    /**
     * @dev Update network data when new user joins
     */
    function updateNetworkData(
        NetworkData storage data,
        mapping(address => DataStructures.User) storage users,
        mapping(address => address[]) storage directReferrals,
        address user
    ) internal {
        // Update network depth
        data.networkDepth = calculateNetworkDepth(users, user);
        
        // Update binary tree structure
        updateBinaryTree(data, directReferrals, user);
        
        // Check binary qualification
        data.binaryQualified = checkBinaryQualification(data, users[user]);
    }
    
    /**
     * @dev Calculate binary bonus for user
     */
    function calculateBinaryBonus(NetworkData storage data, DataStructures.User storage user) internal view returns (uint256 bonus, uint256 carryForward) {
        if (!data.binaryQualified) {
            return (0, 0);
        }
        
        uint256 matchingVolume = data.leftVolume < data.rightVolume ? data.leftVolume : data.rightVolume;
        bonus = (matchingVolume * getBinaryBonusRate(user.packageLevel)) / 10000;
        carryForward = data.leftVolume > data.rightVolume ? data.leftVolume - matchingVolume : data.rightVolume - matchingVolume;
        
        return (bonus, carryForward);
    }
    
    /**
     * @dev Calculate network depth
     */
    function calculateNetworkDepth(mapping(address => DataStructures.User) storage users, address user) internal view returns (uint256) {
        uint256 depth = 0;
        address current = users[user].referrer;
        
        while (current != address(0) && depth < 50) { // Prevent infinite loops
            depth++;
            current = users[current].referrer;
        }
        
        return depth;
    }
    
    /**
     * @dev Update binary tree structure
     */
    function updateBinaryTree(
        NetworkData storage data,
        mapping(address => address[]) storage directReferrals,
        address user
    ) internal {
        address[] memory refs = directReferrals[user];
        
        if (refs.length > 0) {
            data.leftChild = refs[0];
            if (refs.length > 1) {
                data.rightChild = refs[1];
            }
        }
    }
    
    /**
     * @dev Check if user qualifies for binary bonus
     */
    function checkBinaryQualification(NetworkData storage data, DataStructures.User storage user) internal view returns (bool) {
        return user.directReferrals >= 2 && 
               user.packageLevel >= 2 && 
               data.leftVolume > 0 && 
               data.rightVolume > 0;
    }
    
    /**
     * @dev Get binary bonus rate based on package level
     */
    function getBinaryBonusRate(uint8 packageLevel) internal pure returns (uint256) {
        if (packageLevel == 1) return 1000; // 10%
        if (packageLevel == 2) return 1200; // 12%
        if (packageLevel == 3) return 1500; // 15%
        if (packageLevel == 4) return 2000; // 20%
        return 1000; // Default 10%
    }
}
