// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

/**
 * @title Errors
 * @dev Custom errors library to reduce contract size
 * Each custom error saves ~50-100 bytes compared to require strings
 */
library Errors {
    // User Management Errors
    error UserAlreadyRegistered(address user);
    error UserNotRegistered(address user);
    error UserBlacklisted(address user);
    error InvalidReferrer(address referrer);
    error SelfReferralNotAllowed();
    error InvalidPackageLevel(uint8 level);
    error InsufficientBalance(uint96 available, uint96 required);
    error InsufficientBalanceFor(address user, uint96 available, uint96 required);
    
    // Payment Errors
    error InsufficientBNB(uint256 sent, uint256 required);
    error InsufficientUSDT(uint256 balance, uint256 required);
    error PaymentFailed();
    error InvalidAmount(uint256 amount);
    
    // Oracle Errors
    error OracleDataStale(uint256 lastUpdate);
    error InvalidOraclePrice(int256 price);
    error InsufficientOracleData(uint256 validCount, uint256 required);
    error PriceOutOfBounds(int256 price, int256 min, int256 max);
    
    // Admin Errors
    error NotAuthorized(address caller);
    error InvalidAddress(address addr);
    error MaxAdminsReached(uint256 current, uint256 max);
    error AdminNotFound(address admin);
    error AdminAlreadyExists(address admin);
    
    // Matrix Errors
    error MatrixPlacementFailed(address user, uint256 depth);
    error InvalidMatrixPosition(uint256 position);
    error MatrixDepthExceeded(uint256 depth, uint256 max);
    
    // Pool Errors
    error PoolDistributionTooEarly(uint256 current, uint256 next);
    error InsufficientPoolBalance(uint256 balance, uint256 required);
    error ArrayLengthMismatch(uint256 length1, uint256 length2);
    
    // Withdrawal Errors
    error WithdrawalCooldownNotMet(uint256 remaining);
    error DailyLimitExceeded(uint256 withdrawn, uint256 limit);
    error WeeklyLimitExceeded(uint256 withdrawn, uint256 limit);
    error MonthlyLimitExceeded(uint256 withdrawn, uint256 limit);
    error CircuitBreakerTriggered(uint256 amount, uint256 threshold);
    
    // Security Errors
    error ReentrancyDetected();
    error MEVProtection();
    error MEVProtectionActive();
    error CircuitBreakerActivated();
    error ContractPaused();
    error UpgradeNotAuthorized();
    error CircuitBreakerActive();
    error CircuitBreakerNotSet();
    
    // Economic Errors
    error EarningsCapExceeded(uint256 earnings, uint256 cap);
    error InvalidCommissionRate(uint256 rate);
    error ReserveFundInsufficient(uint256 available, uint256 required);
    
    // General Errors
    error ZeroAddress();
    error InvalidInput();
    error InvalidParameter(string message);
    error InvalidValue();
    error OperationFailed();
    error FeatureNotActive();
    error EmergencyModeActive();
}
