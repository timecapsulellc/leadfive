// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title Simple USDT Setter
 * @dev Minimal contract that can set the USDT address in storage
 */
contract SimpleUSDTSetter {
    // Storage slot matching the USDT variable in LeadFive
    // This should be at the same slot as 'usdt' in the main contract
    address public usdt;
    
    /**
     * @dev Sets the USDT address directly
     */
    function setUSDT(address _usdt) external {
        require(_usdt != address(0), "Zero address");
        usdt = _usdt;
    }
    
    /**
     * @dev Get the current USDT address
     */
    function getUSDT() external view returns (address) {
        return usdt;
    }
}
