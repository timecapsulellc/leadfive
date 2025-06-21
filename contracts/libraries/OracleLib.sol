// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IPriceFeed {
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80);
}

interface IPriceOracleMinimal {
    function getPrice(address token) external view returns (uint256);
}

library OracleLib {
    /**
     * @dev Get BNB price in wei for given USD amount using Chainlink price feed
     */
    function getBNBPrice(address priceFeed, uint96 usdAmount) internal view returns (uint96) {
        try IPriceFeed(priceFeed).latestRoundData() returns (uint80, int256 price, uint256, uint256 updatedAt, uint80) {
            require(price > 0, "Invalid price");
            require(block.timestamp - updatedAt <= 3600, "Price too old");
            return uint96((uint256(usdAmount) * 1e18) / (uint256(price) * 1e10));
        } catch {
            return uint96((usdAmount * 1e18) / 300e18); // Fallback: 1 BNB = $300
        }
    }

    /**
     * @dev Get BNB amount for given USD amount
     */
    function getBNBAmount(IPriceFeed priceFeed, uint96 usdAmount) internal view returns (uint96) {
        return getBNBPrice(address(priceFeed), usdAmount);
    }

    /**
     * @dev Get current BNB price from price feed
     */
    function getBNBPrice(IPriceFeed priceFeed) internal view returns (uint256) {
        try priceFeed.latestRoundData() returns (uint80, int256 price, uint256, uint256 updatedAt, uint80) {
            require(price > 0, "Invalid price");
            require(block.timestamp - updatedAt <= 3600, "Price too old");
            return uint256(price) * 1e10; // Convert to 18 decimals
        } catch {
            return 300e18; // Fallback: $300
        }
    }

    /**
     * @dev Gets the dynamic price of a token from a specified oracle.
     * @param oracleAddress The address of the oracle contract.
     * @param tokenAddress The address of the token for which to get the price.
     * @return The price of the token, or 0 if the oracle is not set or fails.
     * @notice This function is `view` because it calls an external `view` function on the oracle.
     *         If the oracleAddress is address(0), it implies no oracle is configured, returning 0.
     */
    function getDynamicPrice(address oracleAddress, address tokenAddress) internal view returns (uint256) {
        if (oracleAddress == address(0)) {
            return 0; // Or revert, depending on desired behavior for unconfigured oracle
        }
        // Call the oracle contract for the price.
        // Assumes the oracle has a getPrice(address token) function.
        // Replace IPriceOracleMinimal with the actual interface of your oracle.
        return IPriceOracleMinimal(oracleAddress).getPrice(tokenAddress);
    }
}
