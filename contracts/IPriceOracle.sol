// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title IPriceOracle
 * @dev Interface for price oracle contracts to provide token price feeds
 */
interface IPriceOracle {
    /**
     * @notice Get the current price of a token
     * @param token The address of the token to get price for
     * @return The price in wei (18 decimals)
     */
    function getPrice(address token) external view returns (uint256);
    
    /**
     * @notice Check if the oracle is healthy and providing valid data
     * @return True if oracle is healthy, false otherwise
     */
    function isHealthy() external view returns (bool);
}
