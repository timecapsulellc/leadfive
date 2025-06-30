// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Storage Setter
 * @dev Contract to directly modify storage slots. Use with extreme caution!
 */
contract StorageSetter {
    event StorageSet(address indexed target, uint256 indexed slot, bytes32 value);

    /**
     * @dev Sets a specific storage slot in a target contract
     * @param target The address of the contract to modify
     * @param slot The storage slot to modify
     * @param value The new value to write
     */
    function setStorageSlot(address target, uint256 slot, bytes32 value) external {
        // Get the code size to verify target is a contract
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(target)
        }
        require(codeSize > 0, "Target must be a contract");
        
        // Note: This will only work on test networks or nodes that support debug APIs
        // For mainnet, we need a different approach
        revert("Direct storage manipulation not supported on mainnet");
    }
}
