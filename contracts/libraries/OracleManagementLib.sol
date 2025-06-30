// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IPriceFeed {
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80);
}

/**
 * @title OracleManagementLib
 * @dev Library for handling multi-oracle price feeds - size optimized
 */
library OracleManagementLib {
    uint256 public constant MIN_ORACLES_REQUIRED = 2;
    int256 public constant MIN_PRICE_BOUND = 50e8;
    int256 public constant MAX_PRICE_BOUND = 2000e8;
    uint256 public constant PRICE_STALENESS_THRESHOLD = 1800;

    /**
     * @dev Get secure price from multiple oracles
     */
    function getSecurePrice(IPriceFeed[] storage oracles) external view returns (int256) {
        require(oracles.length >= MIN_ORACLES_REQUIRED, "Insufficient oracles");
        
        int256[] memory prices = new int256[](oracles.length);
        uint256 validPrices = 0;
        
        for (uint256 i = 0; i < oracles.length; i++) {
            try oracles[i].latestRoundData() returns (
                uint80,
                int256 price,
                uint256,
                uint256 updatedAt,
                uint80
            ) {
                if (validatePrice(price, updatedAt)) {
                    prices[validPrices] = price;
                    validPrices++;
                }
            } catch {
                continue;
            }
        }
        
        require(validPrices >= MIN_ORACLES_REQUIRED, "Insufficient valid oracle data");
        return calculateMedian(prices, validPrices);
    }

    /**
     * @dev Validate oracle price
     */
    function validatePrice(int256 price, uint256 updatedAt) internal view returns (bool) {
        return price > 0 && 
               block.timestamp - updatedAt <= PRICE_STALENESS_THRESHOLD &&
               price >= MIN_PRICE_BOUND && 
               price <= MAX_PRICE_BOUND;
    }

    /**
     * @dev Calculate median price - optimized for small arrays
     */
    function calculateMedian(int256[] memory prices, uint256 length) internal pure returns (int256) {
        if (length == 1) return prices[0];
        
        // Simple selection sort for small arrays
        for (uint256 i = 0; i < length - 1; i++) {
            uint256 minIdx = i;
            for (uint256 j = i + 1; j < length; j++) {
                if (prices[j] < prices[minIdx]) {
                    minIdx = j;
                }
            }
            if (minIdx != i) {
                int256 temp = prices[i];
                prices[i] = prices[minIdx];
                prices[minIdx] = temp;
            }
        }
        
        return length % 2 == 0 ? 
            (prices[length / 2 - 1] + prices[length / 2]) / 2 : 
            prices[length / 2];
    }

    /**
     * @dev Calculate BNB required for USD amount
     */
    function calculateBNBRequired(uint96 usdAmount, int256 bnbPrice) external pure returns (uint96) {
        require(bnbPrice > 0, "Invalid price");
        return uint96((uint256(usdAmount) * 1e18) / (uint256(bnbPrice) * 1e10));
    }
}
