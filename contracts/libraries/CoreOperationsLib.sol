// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CoreOperationsLib
 * @dev Library for core contract operations to reduce main contract size
 */
library CoreOperationsLib {
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant EARNINGS_MULTIPLIER = 4;
    uint256 private constant ADMIN_FEE_RATE = 500; // 5%

    event BonusDistributed(address indexed recipient, uint96 amount, uint8 bonusType);
    event AdminFeeCollected(uint96 amount, address indexed user);

    /**
     * @dev Process user registration with all necessary setup
     */
    function processRegistration(
        address user,
        address referrer,
        uint8 packageLevel,
        uint96 amount,
        uint32 totalUsers
    ) external view returns (DataStructures.User memory) {
        return DataStructures.User({
            isRegistered: true,
            isBlacklisted: false,
            referrer: referrer,
            balance: 0,
            totalInvestment: amount,
            totalEarnings: 0,
            earningsCap: uint96(amount * EARNINGS_MULTIPLIER),
            directReferrals: 0,
            teamSize: 0,
            packageLevel: packageLevel,
            rank: 0,
            withdrawalRate: 70,
            lastHelpPoolClaim: 0,
            isEligibleForHelpPool: true,
            matrixPosition: totalUsers,
            matrixLevel: 1,
            registrationTime: uint32(block.timestamp),
            referralCode: "",
            pendingRewards: 0,
            lastWithdrawal: 0,
            matrixCycles: 0,
            leaderRank: 0,
            leftLegVolume: 0,
            rightLegVolume: 0,
            isActive: true
        });
    }

    /**
     * @dev Add earnings to user with cap check
     */
    function addEarnings(
        DataStructures.User storage user,
        uint96 amount,
        uint8 bonusType
    ) external returns (uint96) {
        if (amount == 0) return 0;
        
        uint96 allowedAmount = amount;
        
        if (user.totalEarnings + amount > user.earningsCap) {
            allowedAmount = user.earningsCap - user.totalEarnings;
        }
        
        if (allowedAmount > 0) {
            user.balance += allowedAmount;
            user.totalEarnings += allowedAmount;
            emit BonusDistributed(user.referrer, allowedAmount, bonusType);
        }
        
        return allowedAmount;
    }

    /**
     * @dev Process withdrawal with all calculations
     */
    function processWithdrawal(
        DataStructures.User storage user,
        uint96 amount,
        uint8 withdrawalRate,
        address adminFeeRecipient,
        IERC20 usdt
    ) external returns (uint96 userReceives, uint96 adminFee, uint96 reinvestment) {
        require(amount <= user.balance, "Insufficient balance");
        
        uint96 withdrawable = uint96((uint256(amount) * withdrawalRate) / 100);
        reinvestment = amount - withdrawable;
        adminFee = uint96((uint256(withdrawable) * ADMIN_FEE_RATE) / BASIS_POINTS);
        userReceives = withdrawable - adminFee;
        
        user.balance -= amount;
        
        if (userReceives > 0) {
            usdt.transfer(user.referrer, userReceives);
        }
        
        if (adminFee > 0 && adminFeeRecipient != address(0)) {
            usdt.transfer(adminFeeRecipient, adminFee);
            emit AdminFeeCollected(adminFee, user.referrer);
        }
        
        return (userReceives, adminFee, reinvestment);
    }

    /**
     * @dev Calculate bonus distributions for a package
     */
    function calculateBonusDistributions(
        uint96 amount,
        uint16 directBonus,
        uint16 levelBonus,
        uint16 leaderBonus,
        uint16 helpBonus,
        uint16 clubBonus
    ) external pure returns (
        uint96 directAmount,
        uint96 levelAmount,
        uint96 leaderAmount,
        uint96 helpAmount,
        uint96 clubAmount,
        uint96 adminAmount
    ) {
        directAmount = uint96((uint256(amount) * directBonus) / BASIS_POINTS);
        levelAmount = uint96((uint256(amount) * levelBonus) / BASIS_POINTS);
        leaderAmount = uint96((uint256(amount) * leaderBonus) / BASIS_POINTS);
        helpAmount = uint96((uint256(amount) * helpBonus) / BASIS_POINTS);
        clubAmount = uint96((uint256(amount) * clubBonus) / BASIS_POINTS);
        adminAmount = uint96((uint256(amount) * ADMIN_FEE_RATE) / BASIS_POINTS);
        
        return (directAmount, levelAmount, leaderAmount, helpAmount, clubAmount, adminAmount);
    }
}
