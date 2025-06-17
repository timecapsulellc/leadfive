// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./libraries/DataTypes.sol";

library CoreLogic {
    struct State {
        mapping(address => DataTypes.User) us;
        mapping(uint8 => DataTypes.Package) pkgs;
        mapping(address => DataTypes.Investment[]) uInvs;
        uint256 tUs;
        uint256 tInvs;
        address[] allUs;
        mapping(uint256 => address) uIdToA;
    }

    error AlreadyRegistered();
    error InvalidTier();
    error InvalidReferrer();
    error InactivePackage();
    error TransferFailed();
    error NoWithdrawableAmount();
    error UserDoesNotExist();

    function initialize(State storage self) internal {
        self.pkgs[1] = DataTypes.Package({amt: 300 ether, bnbAmt: 300 ether, usdtAmt: 300 ether, mDR: 0, a: true});
        self.pkgs[2] = DataTypes.Package({amt: 500 ether, bnbAmt: 500 ether, usdtAmt: 500 ether, mDR: 0, a: true});
        self.pkgs[3] = DataTypes.Package({amt: 1000 ether, bnbAmt: 1000 ether, usdtAmt: 1000 ether, mDR: 0, a: true});
        self.pkgs[4] = DataTypes.Package({amt: 2000 ether, bnbAmt: 2000 ether, usdtAmt: 2000 ether, mDR: 0, a: true});
    }

    function contribute(
        State storage self,
        address user,
        address referrer,
        uint8 tier,
        uint256 amount
    ) internal {
        if (self.us[user].ex) revert AlreadyRegistered();
        if (tier == 0 || tier > 4) revert InvalidTier();
        if (!self.us[referrer].ex) revert InvalidReferrer();
        if (!self.pkgs[tier].a) revert InactivePackage();
        uint256 packageAmount = self.pkgs[tier].amt;
        if (amount != packageAmount) revert TransferFailed();
        DataTypes.User storage u = self.us[user];
        u.ex = true;
        u.a = true;
        u.r = referrer;
        u.tInv = packageAmount;
        u.pLvl = tier;
        u.jT = block.timestamp;
        u.eCap = packageAmount * 3;
        self.us[referrer].dRef++;
        self.allUs.push(user);
        self.tUs++;
        self.uIdToA[self.tUs] = user;
        self.tInvs += packageAmount;
        self.uInvs[user].push(DataTypes.Investment({
            t: tier,
            a: packageAmount,
            ts: block.timestamp,
            ac: true,
            eG: 0
        }));
    }

    function withdraw(State storage self, address user) internal {
        DataTypes.User storage u = self.us[user];
        if (!u.ex) revert UserDoesNotExist();
        if (u.wAmt == 0) revert NoWithdrawableAmount();
        u.wAmt = 0;
        // Transfer logic handled in main contract
    }

    function addPackage(State storage self, uint8 tier, uint256 amount) internal {
        self.pkgs[tier] = DataTypes.Package({
            amt: uint128(amount),
            bnbAmt: uint128(amount),
            usdtAmt: uint128(amount),
            mDR: 0,
            a: true
        });
    }

    // Field mapping for DataTypes.User used in CoreLogic:
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
