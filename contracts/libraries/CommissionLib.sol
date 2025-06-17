// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./UserStorage.sol";

/**
 * @title CommissionLib
 * @dev Library for handling all commission distribution logic to reduce main contract size
 */
library CommissionLib {
    // Event declarations for commission tracking
    event CommissionDistributed(
        address indexed recipient,
        address indexed payer,
        uint256 indexed amount,
        uint8 poolType,
        string poolName,
        uint256 timestamp
    );

    // Constants for commission rates (basis points)
    uint256 internal constant SPONSOR_COMMISSION_RATE = 4000;     // 40%
    uint256 internal constant LEVEL_BONUS_RATE = 1000;           // 10%
    uint256 internal constant GLOBAL_UPLINE_RATE = 1000;         // 10%
    uint256 internal constant LEADER_BONUS_RATE = 1000;          // 10%
    uint256 internal constant GLOBAL_HELP_POOL_RATE = 3000;      // 30%
    uint256 internal constant BASIS_POINTS = 10000;              // 100%

    /**
     * @dev Distributes sponsor commission (40% of package amount)
     */
    function distributeSponsorCommission(
        mapping(address => UserStorage.User) storage users,
        address user,
        uint256 packageAmount
    ) internal {
        address sponsor = users[user].sponsor;
        if (sponsor != address(0) && !UserStorage.isCapped(users[sponsor])) {
            uint256 sponsorAmount = (packageAmount * SPONSOR_COMMISSION_RATE) / BASIS_POINTS;
            _creditEarnings(users, sponsor, sponsorAmount, 0);
            emit CommissionDistributed(
                sponsor, 
                user, 
                sponsorAmount, 
                0, 
                "Sponsor Commission", 
                block.timestamp
            );
        }
    }

    /**
     * @dev Distributes level bonus across 10 levels (10% total)
     */
    function distributeLevelBonus(
        mapping(address => UserStorage.User) storage users,
        mapping(address => address[]) storage directReferrals,
        address user,
        uint256 packageAmount
    ) internal {
        uint256 totalLevelBonus = (packageAmount * LEVEL_BONUS_RATE) / BASIS_POINTS;
        uint256[10] memory rates = _getLevelBonusRates();
        
        address currentUpline = users[user].sponsor;
        for (uint8 level = 0; level < 10 && currentUpline != address(0); level++) {
            if (!UserStorage.isCapped(users[currentUpline]) && directReferrals[currentUpline].length > level) {
                uint256 levelAmount = (totalLevelBonus * rates[level]) / BASIS_POINTS;
                _creditEarnings(users, currentUpline, levelAmount, 1);
                emit CommissionDistributed(
                    currentUpline, 
                    user, 
                    levelAmount, 
                    1, 
                    "Level Bonus", 
                    block.timestamp
                );
            }
            currentUpline = users[currentUpline].sponsor;
        }
    }

    /**
     * @dev Distributes global upline bonus across 30 levels (10% total, equal distribution)
     */
    function distributeGlobalUplineBonus(
        mapping(address => UserStorage.User) storage users,
        mapping(address => address[30]) storage uplineChain,
        address user,
        uint256 packageAmount
    ) internal {
        uint256 totalUplineBonus = (packageAmount * GLOBAL_UPLINE_RATE) / BASIS_POINTS;
        uint256 perLevelAmount = totalUplineBonus / 30; // Equal distribution across 30 levels
        
        address[30] memory uplines = uplineChain[user];
        for (uint8 i = 0; i < 30; i++) {
            if (uplines[i] != address(0) && !UserStorage.isCapped(users[uplines[i]])) {
                _creditEarnings(users, uplines[i], perLevelAmount, 2);
                emit CommissionDistributed(
                    uplines[i], 
                    user, 
                    perLevelAmount, 
                    2, 
                    "Global Upline Bonus", 
                    block.timestamp
                );
            }
        }
    }

    /**
     * @dev Credits earnings to a user (internal helper)
     */
    function _creditEarnings(
        mapping(address => UserStorage.User) storage users,
        address recipient,
        uint256 amount,
        uint8 poolType
    ) internal {
        UserStorage.addEarnings(users[recipient], amount);
    }

    /**
     * @dev Returns level bonus distribution rates
     */
    function _getLevelBonusRates() internal pure returns (uint256[10] memory) {
        return [
            uint256(3000), uint256(1000), uint256(1000), uint256(1000), uint256(1000), 
            uint256(1000), uint256(500), uint256(500), uint256(500), uint256(500)
        ]; // Basis points
    }
}
