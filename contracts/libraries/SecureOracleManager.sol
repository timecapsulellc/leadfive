// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "./Errors.sol";
import "./LeadFiveCore.sol";

/**
 * @title SecureOracleManager
 * @dev Multi-oracle system with circuit breakers - optimized version
 * Fixes critical vulnerabilities from audit while minimizing bytecode
 */
library SecureOracleManager {
    using Errors for *;

    struct OracleData {
        address oracle;
        uint32 lastUpdate;
        int256 lastPrice;
        bool isActive;
    }

    struct PriceConfig {
        int256 minPrice;     // 1e8 format (e.g., $100 = 10000000000)
        int256 maxPrice;     // 1e8 format (e.g., $1000 = 100000000000)
        uint32 maxStaleTime; // seconds
        uint8 minOracles;    // minimum oracles required
    }

    /**
     * @dev Get secure price from multiple oracles with circuit breaker
     * Addresses audit finding #2: Oracle Manipulation Vulnerability
     */
    function getSecurePrice(
        OracleData[] storage oracles,
        PriceConfig memory config
    ) internal view returns (int256) {
        int256[] memory prices = new int256[](oracles.length);
        uint256 validPrices = 0;
        
        // Collect prices from all active oracles
        for (uint256 i = 0; i < oracles.length; i++) {
            if (!oracles[i].isActive) continue;
            
            try IPriceFeed(oracles[i].oracle).latestRoundData() returns (
                uint80,
                int256 price,
                uint256,
                uint256 updatedAt,
                uint80
            ) {
                // Validate price data
                if (price > 0 && 
                    block.timestamp - updatedAt <= config.maxStaleTime &&
                    price >= config.minPrice && 
                    price <= config.maxPrice) {
                    prices[validPrices++] = price;
                }
            } catch {
                // Oracle failed, continue to next
                continue;
            }
        }
        
        if (validPrices < config.minOracles) {
            revert Errors.InsufficientOracleData(validPrices, config.minOracles);
        }
        
        return LeadFiveCore.getMedianPrice(prices, validPrices);
    }

    /**
     * @dev Calculate BNB required with multi-oracle security
     */
    function calculateSecureBNBRequired(
        uint96 usdAmount,
        OracleData[] storage oracles,
        PriceConfig memory config
    ) internal view returns (uint96) {
        int256 securePrice = getSecurePrice(oracles, config);
        return LeadFiveCore.calculateBNBRequired(usdAmount, securePrice);
    }

    /**
     * @dev Add oracle with validation
     */
    function addOracle(
        OracleData[] storage oracles,
        address oracle
    ) internal {
        if (oracle == address(0)) revert Errors.InvalidAddress(oracle);
        
        // Test oracle functionality
        try IPriceFeed(oracle).latestRoundData() returns (uint80, int256, uint256, uint256, uint80) {
            oracles.push(OracleData({
                oracle: oracle,
                lastUpdate: uint32(block.timestamp),
                lastPrice: 0,
                isActive: true
            }));
        } catch {
            revert Errors.InvalidAddress(oracle);
        }
    }

    /**
     * @dev Remove oracle by address
     */
    function removeOracle(
        OracleData[] storage oracles,
        address oracle
    ) internal {
        for (uint256 i = 0; i < oracles.length; i++) {
            if (oracles[i].oracle == oracle) {
                oracles[i] = oracles[oracles.length - 1];
                oracles.pop();
                return;
            }
        }
        revert Errors.InvalidAddress(oracle);
    }

    /**
     * @dev Update oracle status
     */
    function setOracleStatus(
        OracleData[] storage oracles,
        address oracle,
        bool active
    ) internal {
        for (uint256 i = 0; i < oracles.length; i++) {
            if (oracles[i].oracle == oracle) {
                oracles[i].isActive = active;
                return;
            }
        }
        revert Errors.InvalidAddress(oracle);
    }
}

// Interface for price feeds
interface IPriceFeed {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 price,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}
