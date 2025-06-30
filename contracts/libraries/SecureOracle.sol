// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "./Errors.sol";

interface IPriceFeed {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 price,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

/**
 * @title SecureOracle
 * @dev Multi-oracle system with circuit breakers
 * Addresses audit finding #2 (Oracle Manipulation Vulnerability)
 */
library SecureOracle {
    
    struct OracleData {
        IPriceFeed feed;
        bool isActive;
        uint32 lastUpdate;
    }
    
    struct PriceConfig {
        int256 minPrice;     // Minimum acceptable price
        int256 maxPrice;     // Maximum acceptable price
        uint32 maxStaleTime; // Maximum staleness in seconds
        uint8 minOracles;    // Minimum oracles required
    }
    
    uint256 constant MAX_ORACLES = 5;
    
    function addOracle(
        OracleData[] storage oracles,
        address oracle
    ) internal {
        if (oracle == address(0)) revert Errors.ZeroAddress();
        if (oracles.length >= MAX_ORACLES) revert Errors.InvalidInput();
        
        // Test oracle before adding
        try IPriceFeed(oracle).latestRoundData() returns (uint80, int256, uint256, uint256, uint80) {
            oracles.push(OracleData({
                feed: IPriceFeed(oracle),
                isActive: true,
                lastUpdate: uint32(block.timestamp)
            }));
        } catch {
            revert Errors.OperationFailed();
        }
    }
    
    function removeOracle(
        OracleData[] storage oracles,
        address oracle
    ) internal {
        for (uint256 i = 0; i < oracles.length; i++) {
            if (address(oracles[i].feed) == oracle) {
                oracles[i] = oracles[oracles.length - 1];
                oracles.pop();
                return;
            }
        }
        revert Errors.OperationFailed();
    }
    
    function getSecurePrice(
        OracleData[] storage oracles,
        PriceConfig memory config
    ) internal view returns (int256) {
        if (oracles.length < config.minOracles) {
            revert Errors.InsufficientOracleData(uint8(oracles.length), config.minOracles);
        }
        
        int256[] memory prices = new int256[](oracles.length);
        uint256 validPrices = 0;
        
        for (uint256 i = 0; i < oracles.length; i++) {
            if (!oracles[i].isActive) continue;
            
            try oracles[i].feed.latestRoundData() returns (
                uint80,
                int256 price,
                uint256,
                uint256 updatedAt,
                uint80
            ) {
                if (block.timestamp - updatedAt <= config.maxStaleTime) {
                    if (price > 0 && price >= config.minPrice && price <= config.maxPrice) {
                        prices[validPrices++] = price;
                    }
                }
            } catch {
                // Skip failed oracle
                continue;
            }
        }
        
        if (validPrices < config.minOracles) {
            revert Errors.InsufficientOracleData(uint8(validPrices), config.minOracles);
        }
        
        return _getMedianPrice(prices, validPrices);
    }
    
    function calculateSecureBNBRequired(
        uint96 usdAmount,
        OracleData[] storage oracles,
        PriceConfig memory config
    ) internal view returns (uint96) {
        int256 price = getSecurePrice(oracles, config);
        return uint96((uint256(usdAmount) * 1e18) / (uint256(price) * 1e10));
    }
    
    function calculateBNBRequired(uint96 usdAmount, int256 bnbPrice) internal pure returns (uint96) {
        if (bnbPrice <= 0) revert Errors.InvalidParameter("Invalid price");
        
        // Convert USD amount to BNB
        // usdAmount is in 18 decimals, price is in 8 decimals
        // Result should be in 18 decimals
        uint256 bnbRequired = (uint256(usdAmount) * 1e8) / uint256(bnbPrice);
        
        return uint96(bnbRequired);
    }
    
    function _getMedianPrice(int256[] memory prices, uint256 length) private pure returns (int256) {
        // Simple bubble sort for small arrays
        for (uint256 i = 0; i < length - 1; i++) {
            for (uint256 j = 0; j < length - i - 1; j++) {
                if (prices[j] > prices[j + 1]) {
                    int256 temp = prices[j];
                    prices[j] = prices[j + 1];
                    prices[j + 1] = temp;
                }
            }
        }
        
        if (length % 2 == 0) {
            return (prices[length / 2 - 1] + prices[length / 2]) / 2;
        } else {
            return prices[length / 2];
        }
    }
}
