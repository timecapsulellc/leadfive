// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

/**
 * @title MockPriceOracle
 * @dev Mock price oracle for testing
 */
contract MockPriceOracle {
    int256 private _price;
    uint256 private _lastUpdate;
    uint8 private _decimals;
    
    constructor() {
        _price = 60000000000; // $600 with 8 decimals
        _lastUpdate = block.timestamp;
        _decimals = 8;
    }
    
    function getPrice() external view returns (int256) {
        return _price;
    }
    
    function setPrice(int256 newPrice) external {
        _price = newPrice;
        _lastUpdate = block.timestamp;
    }
    
    function decimals() external view returns (uint8) {
        return _decimals;
    }
    
    function lastUpdate() external view returns (uint256) {
        return _lastUpdate;
    }
}
