// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title DataTypes
 * @dev Unified data structures for OrphiCrowdFund platform
 */
library DataTypes {
    
    enum PackageTier { 
        NONE,       // 0
        PACKAGE_5,  // 1 - $300
        PACKAGE_6,  // 2 - $500
        PACKAGE_7,  // 3 - $1000
        PACKAGE_8   // 4 - $2000
    }
    
    enum LeaderRank { 
        NONE,     // 0
        BRONZE,   // 1
        SILVER,   // 2
        GOLD,     // 3
        PLATINUM, // 4
        DIAMOND   // 5
    }

    struct User {
        bool ex; // exists
        bool a; // isActive
        address r; // referrer
        address s; // sponsor
        address l; // leftChild
        address rc; // rightChild
        uint256 tInv; // totalInvestment
        uint256 tEarn; // totalEarnings
        uint256 wAmt; // withdrawableAmount
        uint256 dRef; // directReferrals
        uint256 tSize; // teamSize
        uint256 lVol; // leftVolume
        uint256 rVol; // rightVolume
        uint256 pLvl; // packageLevel
        uint256 jT; // joinTime
        uint256 lA; // lastActivity
        uint256 rT; // registrationTime
        uint256 lW; // lastWithdrawal
        uint8 lRank; // leaderRank
        uint256 eCap; // earningsCap
        uint256 ghpVol; // ghpEligibleVolume
        uint256 lBEarn; // leaderBonusEarnings
        uint256 cPEarn; // clubPoolEarnings
        bool ghpE; // ghpEligible
        bool cPE; // clubPoolEligible
    }
    
    struct Package {
        uint128 amt; // amount
        uint128 bnbAmt; // bnbAmount
        uint128 usdtAmt; // usdtAmount
        uint32 mDR; // minDirectReferrals
        bool a; // isActive
    }
    
    struct DistributionPool {
        uint128 tBal; // totalBalance
        uint128 tDist; // totalDistributed
        uint64 lDist; // lastDistribution
        uint32 dCnt; // distributionCount
        bool a; // isActive
    }
    
    struct LeaderQualification {
        uint64 mDR; // minDirectReferrals
        uint128 mTV; // minTeamVolume
        uint128 mPV; // minPersonalVolume
        uint32 bP; // bonusPercentage
        bool a; // isActive
    }
    
    struct Investment {
        uint8 t; // tier
        uint256 a; // amount
        uint256 ts; // timestamp
        bool ac; // active
        uint256 eG; // earningsGenerated
    }

    // Field mapping for DataTypes.User:
    // exists -> ex
    // isActive -> a
    // referrer -> r
    // sponsor -> s
    // leftChild -> l
    // rightChild -> rc
    // totalInvestment -> tInv
    // totalEarnings -> tEarn
    // withdrawableAmount -> wAmt
    // directReferrals -> dRef
    // teamSize -> tSize
    // leftVolume -> lVol
    // rightVolume -> rVol
    // packageLevel -> pLvl
    // joinTime -> jT
    // lastActivity -> lA
    // registrationTime -> rT
    // lastWithdrawal -> lW
    // leaderRank -> lRank
    // earningsCap -> eCap
    // ghpEligibleVolume -> ghpVol
    // leaderBonusEarnings -> lBEarn
    // clubPoolEarnings -> cPEarn
    // ghpEligible -> ghp
    // clubPoolEligible -> club
}
