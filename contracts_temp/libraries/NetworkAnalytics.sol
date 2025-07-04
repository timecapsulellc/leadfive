// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

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
}
