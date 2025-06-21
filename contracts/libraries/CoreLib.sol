// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

library CoreLib {
    // Constants
    uint256 constant PRECISION = 1e18;
    uint256 constant MAX_UINT32 = type(uint32).max;
    uint256 constant MAX_UINT96 = type(uint96).max;
    
    // Type conversion functions
    function toUint32(uint256 value) internal pure returns (uint32) {
        require(value <= MAX_UINT32, "Value exceeds uint32");
        return uint32(value);
    }
    
    function toUint96(uint256 value) internal pure returns (uint96) {
        require(value <= MAX_UINT96, "Value exceeds uint96");
        return uint96(value);
    }
    
    // Validation functions
    function validateAddress(address addr) internal pure returns (bool) {
        return addr != address(0);
    }
    
    function validateAmount(uint256 amount) internal pure returns (bool) {
        return amount > 0;
    }
    
    // Math functions
    function calculatePercentage(uint256 amount, uint16 rate) internal pure returns (uint256) {
        return (amount * rate) / 10000;
    }
    
    function calculateShare(uint256 total, uint256 share) internal pure returns (uint256) {
        return (total * share) / PRECISION;
    }
} 