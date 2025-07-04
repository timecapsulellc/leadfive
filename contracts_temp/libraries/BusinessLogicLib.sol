// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./DataStructures.sol";

/**
 * @title BusinessLogicLib
 * @dev Library for core business logic: flushing, compression, orphan handling, reserve fund
 */
library BusinessLogicLib {
    using DataStructures for DataStructures.User;
    
    // Events
    event UserFlushed(address indexed user, uint256 excessAmount);
    event NetworkCompressed(address indexed user, uint32 newTeamSize);
    event OrphanReassigned(address indexed orphan, address indexed newSponsor);
    event CommissionRedistributed(address indexed from, address indexed to, uint256 amount);
    event ReserveFundUpdated(uint256 oldAmount, uint256 newAmount);
    event EmergencyModeActivated(string reason);
    
    /**
     * @dev Flush user when earnings cap is reached
     */
    function flushUser(
        DataStructures.User storage user,
        mapping(address => address[]) storage directReferrals,
        address userAddress
    ) external {
        if (user.totalEarnings >= user.earningsCap) {
            uint256 excess = user.totalEarnings - user.earningsCap;
            user.isActive = false;
            user.totalEarnings = user.earningsCap;
            
            // Remove from sponsor's direct referrals
            if (user.referrer != address(0)) {
                address[] storage refs = directReferrals[user.referrer];
                for (uint i = 0; i < refs.length; i++) {
                    if (refs[i] == userAddress) {
                        refs[i] = refs[refs.length - 1];
                        refs.pop();
                        break;
                    }
                }
            }
            
            emit UserFlushed(userAddress, excess);
        }
    }
    
    /**
     * @dev Network compression - remove inactive users from team calculations
     */
    function compressNetwork(
        mapping(address => DataStructures.User) storage users,
        mapping(address => address[30]) storage uplineChain,
        address userAddress
    ) external {
        DataStructures.User storage user = users[userAddress];
        
        if (!user.isActive) {
            // Reduce team size for all uplines
            for (uint8 i = 0; i < 30; i++) {
                address upline = uplineChain[userAddress][i];
                if (upline != address(0) && users[upline].teamSize > 0) {
                    users[upline].teamSize--;
                    emit NetworkCompressed(upline, users[upline].teamSize);
                }
            }
        }
    }
    
    /**
     * @dev Handle orphaned users by reassigning to active sponsors
     */
    function handleOrphan(
        DataStructures.User storage orphan,
        DataStructures.User storage newSponsor,
        mapping(address => address[]) storage directReferrals,
        address orphanAddress,
        address newSponsorAddress
    ) external {
        if (orphan.referrer == address(0) || !orphan.isActive) {
            // Remove from old sponsor if exists
            if (orphan.referrer != address(0)) {
                address[] storage oldRefs = directReferrals[orphan.referrer];
                for (uint i = 0; i < oldRefs.length; i++) {
                    if (oldRefs[i] == orphanAddress) {
                        oldRefs[i] = oldRefs[oldRefs.length - 1];
                        oldRefs.pop();
                        break;
                    }
                }
            }
            
            // Assign to new sponsor
            orphan.referrer = newSponsorAddress;
            directReferrals[newSponsorAddress].push(orphanAddress);
            newSponsor.directReferrals++;
            
            emit OrphanReassigned(orphanAddress, newSponsorAddress);
        }
    }
    
    /**
     * @dev Redistribute commissions when user is flushed
     */
    function redistributeCommissions(
        DataStructures.User storage flushedUser,
        mapping(address => DataStructures.User) storage users,
        mapping(address => address[30]) storage uplineChain,
        address flushedAddress,
        uint256 amount
    ) external {
        // Find next active upline to receive redistributed commission
        for (uint8 i = 0; i < 30; i++) {
            address upline = uplineChain[flushedAddress][i];
            if (upline != address(0) && users[upline].isActive && 
                users[upline].totalEarnings < users[upline].earningsCap) {
                
                uint256 allowedAmount = amount;
                if (users[upline].totalEarnings + amount > users[upline].earningsCap) {
                    allowedAmount = users[upline].earningsCap - users[upline].totalEarnings;
                }
                
                if (allowedAmount > 0) {
                    users[upline].balance += uint96(allowedAmount);
                    users[upline].totalEarnings += uint96(allowedAmount);
                    emit CommissionRedistributed(flushedAddress, upline, allowedAmount);
                }
                break;
            }
        }
    }
    
    /**
     * @dev Dynamic commission rate adjustment based on contract health
     */
    function adjustCommissionRates(
        uint256 contractBalance,
        uint256 totalDeposits,
        uint256 currentRate
    ) external pure returns (uint256 newRate) {
        if (totalDeposits == 0) return currentRate;
        
        uint256 healthRatio = (contractBalance * 100) / totalDeposits;
        
        if (healthRatio < 20) {
            // Critical health - reduce commissions by 30%
            newRate = (currentRate * 70) / 100;
        } else if (healthRatio < 40) {
            // Warning health - reduce commissions by 15%
            newRate = (currentRate * 85) / 100;
        } else if (healthRatio < 60) {
            // Moderate health - reduce commissions by 5%
            newRate = (currentRate * 95) / 100;
        } else {
            // Good health - normal rates
            newRate = currentRate;
        }
        
        return newRate;
    }
    
    /**
     * @dev Update reserve fund based on total deposits
     */
    function updateReserveFund(
        uint256 totalDeposits,
        uint256 reserveRate // in basis points (1500 = 15%)
    ) external pure returns (uint256 requiredReserve) {
        return (totalDeposits * reserveRate) / 10000;
    }
    
    /**
     * @dev Check emergency conditions that require contract pause
     */
    function checkEmergencyConditions(
        uint256 contractBalance,
        uint256 dailyWithdrawals,
        uint256 maxDailyWithdrawals,
        uint256 reserveFund,
        uint256 minReserveRatio
    ) external returns (bool shouldPause, string memory reason) {
        // Check if daily withdrawals exceed limit
        if (dailyWithdrawals > maxDailyWithdrawals) {
            emit EmergencyModeActivated("Daily withdrawal limit exceeded");
            return (true, "Daily withdrawal limit exceeded");
        }
        
        // Check if contract balance is too low
        if (contractBalance < (maxDailyWithdrawals / 10)) {
            emit EmergencyModeActivated("Contract balance critically low");
            return (true, "Contract balance critically low");
        }
        
        // Check reserve fund ratio
        if (contractBalance > 0 && (reserveFund * 10000) / contractBalance < minReserveRatio) {
            emit EmergencyModeActivated("Reserve fund ratio too low");
            return (true, "Reserve fund ratio too low");
        }
        
        return (false, "");
    }
    
    /**
     * @dev Calculate progressive withdrawal rates based on activity
     */
    function calculateWithdrawalRate(
        uint32 directReferrals,
        uint32 teamSize,
        uint8 packageLevel
    ) external pure returns (uint8 rate) {
        // Base rate by package level
        uint8 baseRate = 60; // 60% base
        
        if (packageLevel >= 4) baseRate = 70;
        else if (packageLevel >= 3) baseRate = 65;
        
        // Bonus for direct referrals
        if (directReferrals >= 20) baseRate += 15;
        else if (directReferrals >= 10) baseRate += 10;
        else if (directReferrals >= 5) baseRate += 5;
        
        // Bonus for team size
        if (teamSize >= 500) baseRate += 10;
        else if (teamSize >= 100) baseRate += 5;
        
        // Cap at 90%
        return baseRate > 90 ? 90 : baseRate;
    }
    
    /**
     * @dev Calculate earnngs cap based on investment and activity
     */
    function calculateEarningsCap(
        uint256 investment,
        uint32 directReferrals,
        uint8 multiplier
    ) external pure returns (uint256 cap) {
        uint256 baseCap = investment * multiplier;
        
        // Bonus cap for active recruiters
        if (directReferrals >= 10) {
            baseCap = (baseCap * 150) / 100; // 50% bonus cap
        } else if (directReferrals >= 5) {
            baseCap = (baseCap * 125) / 100; // 25% bonus cap
        }
        
        return baseCap;
    }
    
    /**
     * @dev Process network balancing and volume calculations
     */
    function balanceNetworkVolumes(
        mapping(address => DataStructures.User) storage users,
        address userAddress,
        uint256 newVolume,
        bool isLeftLeg
    ) external {
        DataStructures.User storage user = users[userAddress];
        
        if (isLeftLeg) {
            user.leftLegVolume += uint96(newVolume);
        } else {
            user.rightLegVolume += uint96(newVolume);
        }
        
        // Update binary bonus eligibility
        uint256 weakLeg = user.leftLegVolume < user.rightLegVolume ? 
                          user.leftLegVolume : user.rightLegVolume;
        
        // Process binary bonus if weak leg reaches threshold
        if (weakLeg >= 1000 * 10**18) { // $1000 threshold
            uint256 bonus = (weakLeg * 10) / 100; // 10% of weak leg
            user.pendingRewards += uint96(bonus);
            
            // Reset volumes after bonus calculation
            if (user.leftLegVolume < user.rightLegVolume) {
                user.rightLegVolume -= user.leftLegVolume;
                user.leftLegVolume = 0;
            } else {
                user.leftLegVolume -= user.rightLegVolume;
                user.rightLegVolume = 0;
            }
        }
    }
    
    /**
     * @dev Rank advancement logic
     */
    function processRankAdvancement(
        DataStructures.User storage user,
        uint8 newRank
    ) external returns (uint256 rankBonus) {
        if (newRank > user.rank) {
            user.rank = newRank;
            
            // Rank advancement bonuses
            if (newRank == 1) rankBonus = 100 * 10**18; // Bronze: $100
            else if (newRank == 2) rankBonus = 250 * 10**18; // Silver: $250
            else if (newRank == 3) rankBonus = 500 * 10**18; // Gold: $500
            else if (newRank == 4) rankBonus = 1000 * 10**18; // Platinum: $1000
            else if (newRank == 5) rankBonus = 2500 * 10**18; // Diamond: $2500
            
            if (rankBonus > 0) {
                user.pendingRewards += uint96(rankBonus);
            }
        }
        
        return rankBonus;
    }
}
