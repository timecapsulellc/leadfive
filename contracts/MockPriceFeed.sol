// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./IPriceOracle.sol";

/**
 * @title MockPriceFeed
 * @dev Mock price feed for testing - simulates BNB/USD price oracle
 */
contract MockPriceFeed is IPriceOracle {
    int256 private _price;
    uint256 private _lastUpdate;
    uint8 private _decimals;
    string private _description;

    constructor() {
        _price = 60000000000; // $600 with 8 decimals
        _lastUpdate = block.timestamp;
        _decimals = 8;
        _description = "BNB / USD";
    }

    function getPrice(address token) external view override returns (uint256) {
        // For mock, ignore token parameter and return BNB price
        return uint256(_price);
    }

    function isHealthy() external view override returns (bool) {
        // Active if updated within last 24 hours
        return (block.timestamp - _lastUpdate) <= 86400;
    }

    function decimals() external view returns (uint8) {
        return _decimals;
    }

    function description() external view returns (string memory) {
        return _description;
    }

    function getLastUpdated() external view returns (uint256) {
        return _lastUpdate;
    }

    // Admin functions for testing
    function updatePrice(int256 newPrice) external {
        _price = newPrice;
        _lastUpdate = block.timestamp;
    }

    function setStalePrice() external {
        _lastUpdate = block.timestamp - 86401; // Make it stale
    }

    // Simulate price fluctuations for testing
    function simulatePriceMovement() external {
        // Random price movement between $550-$650
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));
        int256 basePrice = 60000000000; // $600
        int256 variation = int256((randomSeed % 10000000000)) - 5000000000; // ±$50
        _price = basePrice + variation;
        _lastUpdate = block.timestamp;
    }
}
