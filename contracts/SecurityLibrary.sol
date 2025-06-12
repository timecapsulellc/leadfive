// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title SecurityLibrary
 * @dev Library containing security utilities for OrphiCrowdFund
 */
library SecurityLibrary {
    // ==================== CONSTANTS ====================
    uint256 internal constant MEV_PROTECTION_BLOCKS = 1;
    uint256 internal constant ORACLE_STALENESS_THRESHOLD = 3600; // 1 hour
    uint256 internal constant MAX_PRICE_DEVIATION = 500; // 5%
    uint256 internal constant DISTRIBUTION_BATCH_SIZE = 50;
    uint256 internal constant UPGRADE_DELAY = 2 days;
    
    // ==================== ERRORS ====================
    error BlockDelayNotMet();
    error ExcessiveGasUsage();
    error OracleDataStale();
    error PriceDeviationTooHigh();
    error CircuitBreakerActive();
    error TimelockNotExpired();
    error InvalidUpgradeProposal();
    
    // ==================== EVENTS ====================
    event MEVProtectionBlocked(address indexed account, uint256 blockNumber);
    event CircuitBreakerTriggered(string reason, uint256 timestamp);
    event OracleHealthCheck(bool isHealthy, uint256 timestamp);
    event UpgradeProposed(bytes32 indexed proposalId, uint256 executeTime);
    
    // ==================== MEV PROTECTION ====================
    
    /**
     * @dev Check if account can perform action (MEV protection)
     */
    function checkMEVProtection(
        mapping(address => uint256) storage lastActionBlock,
        address account
    ) internal view {
        if (lastActionBlock[account] > 0 && 
            block.number <= lastActionBlock[account] + MEV_PROTECTION_BLOCKS) {
            revert BlockDelayNotMet();
        }
    }
    
    /**
     * @dev Update last action block for MEV protection
     */
    function updateActionBlock(
        mapping(address => uint256) storage lastActionBlock,
        address account
    ) internal {
        lastActionBlock[account] = block.number;
    }
    
    // ==================== ORACLE SAFEGUARDS ====================
    
    /**
     * @dev Validate oracle data freshness and price deviation
     */
    function validateOracleData(
        uint256 price,
        uint256 timestamp,
        uint256 lastPrice
    ) internal view returns (bool) {
        // Check staleness
        if (block.timestamp - timestamp > ORACLE_STALENESS_THRESHOLD) {
            return false;
        }
        
        // Check price deviation if we have a previous price
        if (lastPrice > 0) {
            uint256 deviation;
            if (price > lastPrice) {
                deviation = ((price - lastPrice) * 10000) / lastPrice;
            } else {
                deviation = ((lastPrice - price) * 10000) / lastPrice;
            }
            
            if (deviation > MAX_PRICE_DEVIATION) {
                return false;
            }
        }
        
        return true;
    }
    
    // ==================== CIRCUIT BREAKER ====================
    
    /**
     * @dev Check if daily withdrawal limit is exceeded
     */
    function checkDailyLimit(
        mapping(uint256 => uint256) storage dailyWithdrawals,
        uint256 amount,
        uint256 dailyLimit
    ) internal view returns (bool) {
        uint256 today = block.timestamp / 1 days;
        return dailyWithdrawals[today] + amount <= dailyLimit;
    }
    
    /**
     * @dev Update daily withdrawal amount
     */
    function updateDailyWithdrawal(
        mapping(uint256 => uint256) storage dailyWithdrawals,
        uint256 amount
    ) internal {
        uint256 today = block.timestamp / 1 days;
        dailyWithdrawals[today] += amount;
    }
    
    // ==================== GAS OPTIMIZATION ====================
    
    /**
     * @dev Calculate batch size based on gas limit
     */
    function calculateOptimalBatchSize(
        uint256 gasLimit,
        uint256 gasPerItem,
        uint256 maxBatchSize
    ) internal pure returns (uint256) {
        uint256 maxItemsForGas = gasLimit / gasPerItem;
        return maxItemsForGas > maxBatchSize ? maxBatchSize : maxItemsForGas;
    }
    
    /**
     * @dev Check if gas usage is within acceptable limits
     */
    function validateGasUsage(uint256 gasUsed, uint256 gasLimit) internal pure {
        if (gasUsed > gasLimit) {
            revert ExcessiveGasUsage();
        }
    }
    
    // ==================== TIMELOCK UTILITIES ====================
    
    /**
     * @dev Generate proposal ID for timelock
     */
    function generateProposalId(
        address target,
        bytes memory data,
        uint256 value,
        uint256 salt
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(target, data, value, salt));
    }
    
    /**
     * @dev Check if timelock has expired
     */
    function isTimelockExpired(
        uint256 proposalTime,
        uint256 delay
    ) internal view returns (bool) {
        return block.timestamp >= proposalTime + delay;
    }
    
    // ==================== PRECISION MATH ====================
    
    /**
     * @dev Safe multiplication with overflow protection
     */
    function safeMul(uint256 a, uint256 b, uint256 scale) internal pure returns (uint256) {
        if (a == 0) return 0;
        
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        
        return c / scale;
    }
    
    /**
     * @dev Safe division with precision handling
     */
    function safeDiv(uint256 a, uint256 b, uint256 scale) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        return (a * scale) / b;
    }
    
    /**
     * @dev Calculate percentage with high precision
     */
    function calculatePercentage(
        uint256 amount,
        uint256 percentage,
        uint256 scale
    ) internal pure returns (uint256) {
        return safeMul(amount, percentage, scale);
    }
}
