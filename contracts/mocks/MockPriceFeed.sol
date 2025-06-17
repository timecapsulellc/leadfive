// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract MockPriceFeed {
    int256 private price = 300e8; // $300 BNB price with 8 decimals
    
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    ) {
        return (1, price, block.timestamp, block.timestamp, 1);
    }
    
    function setPrice(int256 _price) external {
        price = _price;
    }
} 