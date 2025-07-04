// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title ConstantsLib
 * @dev Library containing all constants and configuration to reduce main contract size
 */
library ConstantsLib {
    // Package amounts (USDT has 6 decimals)
    uint256 internal constant PACKAGE_300 = 300e6;  // $300 USDT (PACKAGE_5)
    uint256 internal constant PACKAGE_500 = 500e6;  // $500 USDT (PACKAGE_6)
    uint256 internal constant PACKAGE_1000 = 1000e6; // $1000 USDT (PACKAGE_7)
    uint256 internal constant PACKAGE_2000 = 2000e6; // $2000 USDT (PACKAGE_8)

    // Commission rates (basis points for precision)
    uint256 internal constant SPONSOR_COMMISSION_RATE = 4000;     // 40% (UPDATED)
    uint256 internal constant LEVEL_BONUS_RATE = 1000;           // 10%
    uint256 internal constant GLOBAL_UPLINE_RATE = 1000;         // 10%
    uint256 internal constant LEADER_BONUS_RATE = 1000;          // 10%
    uint256 internal constant GLOBAL_HELP_POOL_RATE = 3000;      // 30% (UPDATED)
    uint256 internal constant BASIS_POINTS = 10000;              // 100%

    // Earnings cap multiplier
    uint256 internal constant EARNINGS_CAP_MULTIPLIER = 4; // 4x return cap

    // Withdrawal rates based on direct referrals
    uint256 internal constant BASE_WITHDRAWAL_RATE = 7000;       // 70%
    uint256 internal constant MID_WITHDRAWAL_RATE = 7500;        // 75%
    uint256 internal constant PRO_WITHDRAWAL_RATE = 8000;        // 80%

    // Leader qualification requirements
    uint256 internal constant SHINING_STAR_TEAM_REQUIREMENT = 250;
    uint256 internal constant SHINING_STAR_DIRECT_REQUIREMENT = 10;
    uint256 internal constant SILVER_STAR_TEAM_REQUIREMENT = 500;

    // Distribution intervals
    uint256 internal constant WEEKLY_DISTRIBUTION_INTERVAL = 7 days;
    uint256 internal constant LEADER_DISTRIBUTION_INTERVAL = 15 days;

    // Global Help Pool minimum payout (25% of pool)
    uint256 internal constant GHP_MINIMUM_PAYOUT_FRACTION = 2500; // 25%

    // Security constants
    uint256 internal constant MIN_BLOCK_DELAY = 1;
    uint256 internal constant UPGRADE_DELAY = 48 hours;
    uint256 internal constant MAX_FEE_RATE = 500; // 5% maximum

    /**
     * @dev Returns package amounts array
     */
    function getPackageAmounts() internal pure returns (uint256[4] memory) {
        return [PACKAGE_300, PACKAGE_500, PACKAGE_1000, PACKAGE_2000];
    }

    /**
     * @dev Returns level bonus rates array (basis points)
     * Level 1: 3%, Levels 2-6: 1% each, Levels 7-10: 0.5% each
     */
    function getLevelBonusRates() internal pure returns (uint256[10] memory) {
        return [
            uint256(3000), uint256(1000), uint256(1000), uint256(1000), uint256(1000),
            uint256(1000), uint256(500), uint256(500), uint256(500), uint256(500)
        ];
    }

    /**
     * @dev Gets package amount by tier
     */
    function getPackageAmount(uint8 tier) internal pure returns (uint256) {
        if (tier == 1) return PACKAGE_300;  // PACKAGE_5
        if (tier == 2) return PACKAGE_500;  // PACKAGE_6
        if (tier == 3) return PACKAGE_1000; // PACKAGE_7
        if (tier == 4) return PACKAGE_2000; // PACKAGE_8
        return 0;
    }

    /**
     * @dev Gets withdrawal rate based on direct referrals
     */
    function getWithdrawalRate(uint16 directReferrals) internal pure returns (uint256) {
        if (directReferrals >= 10) return PRO_WITHDRAWAL_RATE;      // 80%
        if (directReferrals >= 5) return MID_WITHDRAWAL_RATE;       // 75%
        return BASE_WITHDRAWAL_RATE;                                // 70%
    }

    /**
     * @dev Calculates earnings cap for a user
     */
    function calculateEarningsCap(uint256 totalInvested) internal pure returns (uint256) {
        return totalInvested * EARNINGS_CAP_MULTIPLIER;
    }

    /**
     * @dev Checks if user qualifies for Shining Star rank
     */
    function qualifiesForShiningStar(uint16 teamSize, uint16 directReferrals) internal pure returns (bool) {
        return teamSize >= SHINING_STAR_TEAM_REQUIREMENT && directReferrals >= SHINING_STAR_DIRECT_REQUIREMENT;
    }

    /**
     * @dev Checks if user qualifies for Silver Star rank
     */
    function qualifiesForSilverStar(uint16 teamSize) internal pure returns (bool) {
        return teamSize >= SILVER_STAR_TEAM_REQUIREMENT;
    }

    /**
     * @dev Calculates commission amounts for a package
     */
    function calculateCommissions(uint256 packageAmount) 
        internal 
        pure 
        returns (
            uint256 sponsorAmount,
            uint256 levelAmount,
            uint256 uplineAmount,
            uint256 leaderAmount,
            uint256 helpPoolAmount
        ) 
    {
        sponsorAmount = (packageAmount * SPONSOR_COMMISSION_RATE) / BASIS_POINTS;
        levelAmount = (packageAmount * LEVEL_BONUS_RATE) / BASIS_POINTS;
        uplineAmount = (packageAmount * GLOBAL_UPLINE_RATE) / BASIS_POINTS;
        leaderAmount = (packageAmount * LEADER_BONUS_RATE) / BASIS_POINTS;
        helpPoolAmount = (packageAmount * GLOBAL_HELP_POOL_RATE) / BASIS_POINTS;
    }

    /**
     * @dev Utility: Check if timestamp is leader bonus distribution day (1st or 16th UTC)
     */
    function isLeaderBonusDistributionDay(uint256 timestamp) internal pure returns (bool) {
        // Get day of month (UTC) - simplified calculation
        uint256 day = ((timestamp / 1 days) + 4) % 31 + 1; // +4 adjusts for Unix epoch starting on Thursday
        return (day == 1 || day == 16);
    }

    /**
     * @dev Calculates Global Help Pool minimum payout
     */
    function calculateMinimumGHPPayout(uint256 poolBalance) internal pure returns (uint256) {
        return (poolBalance * GHP_MINIMUM_PAYOUT_FRACTION) / BASIS_POINTS;
    }
}
