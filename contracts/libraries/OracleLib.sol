// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IPriceOracleMinimal {
    function getPrice(address token) external view returns (uint256);
}

library OracleLib {
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

    /**
     * @dev Example function that might be pure if it performed calculations without state reads.
     *      This is just to illustrate the difference.
     *      The original getDynamicPrice cannot be pure if it needs to call an external oracle.
     */
    function calculateSomethingPure(uint256 baseAmount, uint256 factor) internal pure returns (uint256) {
        return baseAmount * factor / 100;
    }
}
