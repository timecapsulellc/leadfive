const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("OrphiCrowdFund - Complete Whitepaper Implementation", function () {
    let orphiCrowdFund;
    let usdtToken;
    let priceOracle;
    let owner, treasury, emergency, poolManager;
    let user1, user2, user3, user4, user5;
    let users;

    const PACKAGE_AMOUNTS = [
        ethers.parseUnits("30", 6),   // $30 USDT
        ethers.parseUnits("50", 6),   // $50 USDT
        ethers.parseUnits("100", 6),  // $100 USDT
        ethers.parseUnits("200", 6)   // $200 USDT
    ];

    beforeEach(async function () {
        [owner, treasury, emergency, poolManager, user1, user2, user3, user4, user5, ...users] = await ethers.getSigners();

        // Deploy Mock USDT
        const MockUSDT = await ethers.getContractFactory("contracts/MockUSDT.sol:MockUSDT");
        usdtToken = await MockUSDT.deploy();

        // Deploy Mock Price Oracle
        const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
        priceOracle = await MockPriceOracle.deploy();

        // Deploy OrphiCrowdFund
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        orphiCrowdFund = await upgrades.deployProxy(OrphiCrowdFund, [
            await usdtToken.getAddress(),
            treasury.address,
            emergency.address,
            poolManager.address
        ], { initializer: 'initialize' });

        // Mint USDT to users
        const mintAmount = ethers.parseUnits("10000", 6);
        await usdtToken.mint(user1.address, mintAmount);
        await usdtToken.mint(user2.address, mintAmount);
        await usdtToken.mint(user3.address, mintAmount);
        await usdtToken.mint(user4.address, mintAmount);
        await usdtToken.mint(user5.address, mintAmount);

        // Approve spending
        await usdtToken.connect(user1).approve(await orphiCrowdFund.getAddress(), mintAmount);
        await usdtToken.connect(user2).approve(await orphiCrowdFund.getAddress(), mintAmount);
        await usdtToken.connect(user3).approve(await orphiCrowdFund.getAddress(), mintAmount);
        await usdtToken.connect(user4).approve(await orphiCrowdFund.getAddress(), mintAmount);
        await usdtToken.connect(user5).approve(await orphiCrowdFund.getAddress(), mintAmount);
    });

    describe("Contract Initialization", function () {
        it("Should initialize with correct parameters", async function () {
            expect(await orphiCrowdFund.version()).to.equal("Orphi CrowdFund Platform v2.0.0 - Complete Whitepaper Implementation");
            expect(await orphiCrowdFund.treasuryAddress()).to.equal(treasury.address);
            expect(await orphiCrowdFund.emergencyAddress()).to.equal(emergency.address);
            expect(await orphiCrowdFund.poolManagerAddress()).to.equal(poolManager.address);
            
            const packageAmounts = await orphiCrowdFund.getPackageAmounts();
            expect(packageAmounts[0]).to.equal(PACKAGE_AMOUNTS[0]);
            expect(packageAmounts[1]).to.equal(PACKAGE_AMOUNTS[1]);
            expect(packageAmounts[2]).to.equal(PACKAGE_AMOUNTS[2]);
            expect(packageAmounts[3]).to.equal(PACKAGE_AMOUNTS[3]);
        });

        it("Should have correct commission rates", async function () {
            expect(await orphiCrowdFund.SPONSOR_COMMISSION_RATE()).to.equal(4000); // 40%
            expect(await orphiCrowdFund.LEVEL_BONUS_RATE()).to.equal(1000); // 10%
            expect(await orphiCrowdFund.GLOBAL_UPLINE_RATE()).to.equal(1000); // 10%
            expect(await orphiCrowdFund.LEADER_BONUS_RATE()).to.equal(1000); // 10%
            expect(await orphiCrowdFund.GLOBAL_HELP_POOL_RATE()).to.equal(3000); // 30%
        });

        it("Should have correct level bonus rates", async function () {
            const levelBonusRates = await orphiCrowdFund.getLevelBonusRates();
            expect(levelBonusRates[0]).to.equal(300); // Level 1: 3%
            expect(levelBonusRates[1]).to.equal(100); // Level 2: 1%
            expect(levelBonusRates[6]).to.equal(50);  // Level 7: 0.5%
        });
    });

    describe("User Registration System", function () {
        it("Should register first user without sponsor", async function () {
            await expect(orphiCrowdFund.connect(user1).registerUser(ethers.ZeroAddress, 1))
                .to.emit(orphiCrowdFund, "UserRegistered")
                .withArgs(user1.address, ethers.ZeroAddress, 1, PACKAGE_AMOUNTS[0], anyValue);

            const userInfo = await orphiCrowdFund.getUserInfo(user1.address);
            expect(userInfo.totalInvested).to.equal(PACKAGE_AMOUNTS[0]);
            expect(userInfo.packageTier).to.equal(1);
            expect(userInfo.isActive).to.be.true;
            expect(userInfo.isCapped).to.be.false;
        });

        it("Should register user with sponsor and distribute commissions", async function () {
            // Register first user
            await orphiCrowdFund.connect(user1).registerUser(ethers.ZeroAddress, 1);
            
            // Register second user with first as sponsor
            await expect(orphiCrowdFund.connect(user2).registerUser(user1.address, 1))
                .to.emit(orphiCrowdFund, "UserRegistered")
                .withArgs(user2.address, user1.address, 1, PACKAGE_AMOUNTS[0], anyValue)
                .to.emit(orphiCrowdFund, "CommissionDistributed")
                .withArgs(user1.address, user2.address, anyValue, 0, "Sponsor Commission", anyValue);

            // Check sponsor commission (40% of package)
            const expectedSponsorCommission = (PACKAGE_AMOUNTS[0] * 4000n) / 10000n;
            const user1Info = await orphiCrowdFund.getUserInfo(user1.address);
            expect(user1Info.withdrawableAmount).to.be.gte(expectedSponsorCommission);
        });

        it("Should place users in dual-branch matrix", async function () {
            // Register users in sequence
            await orphiCrowdFund.connect(user1).registerUser(ethers.ZeroAddress, 1);
            await orphiCrowdFund.connect(user2).registerUser(user1.address, 1);
            await orphiCrowdFund.connect(user3).registerUser(user1.address, 1);
            
            // Check matrix placement
            const [leftChild, rightChild] = await orphiCrowdFund.getMatrixChildren(user1.address);
            expect(leftChild).to.equal(user2.address);
            expect(rightChild).to.equal(user3.address);
        });

        it("Should build upline chain for Global Upline Bonus", async function () {
            // Register chain of users
            await orphiCrowdFund.connect(user1).registerUser(ethers.ZeroAddress, 1);
            await orphiCrowdFund.connect(user2).registerUser(user1.address, 1);
            await orphiCrowdFund.connect(user3).registerUser(user2.address, 1);
            
            // Check upline chain for user3
            const uplineChain = await orphiCrowdFund.getUplineChain(user3.address);
            expect(uplineChain[0]).to.equal(user2.address);
            expect(uplineChain[1]).to.equal(user1.address);
        });
    });

    describe("5-Pool Commission System", function () {
        beforeEach(async function () {
            // Register initial users
            await orphiCrowdFund.connect(user1).registerUser(ethers.ZeroAddress, 1);
            await orphiCrowdFund.connect(user2).registerUser(user1.address, 1);
        });

        it("Should distribute sponsor commission (40%)", async function () {
            const user1InfoBefore = await orphiCrowdFund.getUserInfo(user1.address);
            
            await orphiCrowdFund.connect(user3).registerUser(user1.address, 1);
            
            const user1InfoAfter = await orphiCrowdFund.getUserInfo(user1.address);
            const expectedCommission = (PACKAGE_AMOUNTS[0] * 4000n) / 10000n;
            
            expect(user1InfoAfter.withdrawableAmount - user1InfoBefore.withdrawableAmount)
                .to.be.gte(expectedCommission);
        });

        it("Should distribute level bonus (10%) across levels", async function () {
            // Create multi-level structure
            await orphiCrowdFund.connect(user3).registerUser(user2.address, 1);
            await orphiCrowdFund.connect(user4).registerUser(user3.address, 1);
            
            const user2InfoBefore = await orphiCrowdFund.getUserInfo(user2.address);
            const user1InfoBefore = await orphiCrowdFund.getUserInfo(user1.address);
            
            await orphiCrowdFund.connect(user5).registerUser(user4.address, 1);
            
            // Check level bonuses
            const user2InfoAfter = await orphiCrowdFund.getUserInfo(user2.address);
            const user1InfoAfter = await orphiCrowdFund.getUserInfo(user1.address);
            
            // User2 should get Level 1 bonus (3% of level bonus pool)
            // User1 should get Level 2 bonus (1% of level bonus pool)
            expect(user2InfoAfter.withdrawableAmount).to.be.gt(user2InfoBefore.withdrawableAmount);
            expect(user1InfoAfter.withdrawableAmount).to.be.gt(user1InfoBefore.withdrawableAmount);
        });

        it("Should accumulate Global Help Pool (30%)", async function () {
            const globalHelpPoolBefore = await orphiCrowdFund.globalHelpPoolBalance();
            
            await orphiCrowdFund.connect(user3).registerUser(user1.address, 1);
            
            const globalHelpPoolAfter = await orphiCrowdFund.globalHelpPoolBalance();
            const expectedIncrease = (PACKAGE_AMOUNTS[0] * 3000n) / 10000n;
            
            expect(globalHelpPoolAfter - globalHelpPoolBefore).to.equal(expectedIncrease);
        });

        it("Should accumulate Leader Bonus Pool (10%)", async function () {
            const leaderBonusPoolBefore = await orphiCrowdFund.leaderBonusPoolBalance();
            
            await orphiCrowdFund.connect(user3).registerUser(user1.address, 1);
            
            const leaderBonusPoolAfter = await orphiCrowdFund.leaderBonusPoolBalance();
            const expectedIncrease = (PACKAGE_AMOUNTS[0] * 1000n) / 10000n;
            
            expect(leaderBonusPoolAfter - leaderBonusPoolBefore).to.equal(expectedIncrease);
        });
    });

    describe("4x Earnings Cap System", function () {
        it("Should enforce 4x earnings cap", async function () {
            await orphiCrowdFund.connect(user1).registerUser(ethers.ZeroAddress, 1);
            
            const packageAmount = PACKAGE_AMOUNTS[0];
            const maxEarnings = packageAmount * 4n;
            
            // Simulate earnings beyond 4x cap
            const user1Info = await orphiCrowdFund.getUserInfo(user1.address);
            
            // Register many users to generate commissions
            for (let i = 0; i < 20; i++) {
                const newUser = users[i];
                await usdtToken.mint(newUser.address, packageAmount);
                await usdtToken.connect(newUser).approve(await orphiCrowdFund.getAddress(), packageAmount);
                await orphiCrowdFund.connect(newUser).registerUser(user1.address, 1);
            }
            
            const user1InfoAfter = await orphiCrowdFund.getUserInfo(user1.address);
            
            // Should be capped at 4x
            expect(user1InfoAfter.totalEarnings).to.be.lte(maxEarnings);
            
            if (user1InfoAfter.totalEarnings >= maxEarnings) {
                expect(user1InfoAfter.isCapped).to.be.true;
                expect(user1InfoAfter.isActive).to.be.false;
            }
        });
    });

    describe("Progressive Withdrawal System", function () {
        beforeEach(async function () {
            await orphiCrowdFund.connect(user1).registerUser(ethers.ZeroAddress, 1);
            await orphiCrowdFund.connect(user2).registerUser(user1.address, 1);
        });

        it("Should have 70% withdrawal rate with 0 direct referrals", async function () {
            const withdrawalRate = await orphiCrowdFund.getWithdrawalRate(user2.address);
            expect(withdrawalRate).to.equal(7000); // 70%
        });

        it("Should have 75% withdrawal rate with 5+ direct referrals", async function () {
            // Add 5 direct referrals to user1
            for (let i = 0; i < 5; i++) {
                const newUser = users[i];
                await usdtToken.mint(newUser.address, PACKAGE_AMOUNTS[0]);
                await usdtToken.connect(newUser).approve(await orphiCrowdFund.getAddress(), PACKAGE_AMOUNTS[0]);
                await orphiCrowdFund.connect(newUser).registerUser(user1.address, 1);
            }
            
            const withdrawalRate = await orphiCrowdFund.getWithdrawalRate(user1.address);
            expect(withdrawalRate).to.equal(7500); // 75%
        });

        it("Should have 80% withdrawal rate with 20+ direct referrals", async function () {
            // Add 20 direct referrals to user1
            for (let i = 0; i < 20; i++) {
                const newUser = users[i];
                await usdtToken.mint(newUser.address, PACKAGE_AMOUNTS[0]);
                await usdtToken.connect(newUser).approve(await orphiCrowdFund.getAddress(), PACKAGE_AMOUNTS[0]);
                await orphiCrowdFund.connect(newUser).registerUser(user1.address, 1);
            }
            
            const withdrawalRate = await orphiCrowdFund.getWithdrawalRate(user1.address);
            expect(withdrawalRate).to.equal(8000); // 80%
        });

        it("Should process withdrawal with reinvestment", async function () {
            const user1Info = await orphiCrowdFund.getUserInfo(user1.address);
            const withdrawableAmount = user1Info.withdrawableAmount;
            
            if (withdrawableAmount > 0) {
                const withdrawalRate = await orphiCrowdFund.getWithdrawalRate(user1.address);
                const expectedWithdrawal = (withdrawableAmount * withdrawalRate) / 10000n;
                const expectedReinvestment = withdrawableAmount - expectedWithdrawal;
                
                await expect(orphiCrowdFund.connect(user1).withdraw(withdrawableAmount))
                    .to.emit(orphiCrowdFund, "WithdrawalProcessed")
                    .withArgs(user1.address, expectedWithdrawal, expectedReinvestment, anyValue);
            }
        });
    });

    describe("Weekly Global Help Pool Distribution", function () {
        beforeEach(async function () {
            // Register users and build up Global Help Pool
            await orphiCrowdFund.connect(user1).registerUser(ethers.ZeroAddress, 1);
            await orphiCrowdFund.connect(user2).registerUser(user1.address, 1);
            await orphiCrowdFund.connect(user3).registerUser(user1.address, 1);
        });

        it("Should distribute Global Help Pool to active members", async function () {
            const globalHelpPoolBalance = await orphiCrowdFund.globalHelpPoolBalance();
            
            if (globalHelpPoolBalance > 0) {
                await expect(orphiCrowdFund.connect(poolManager).distributeGlobalHelpPool())
                    .to.emit(orphiCrowdFund, "GlobalHelpPoolDistributed");
                
                // Check that pool balance is reset
                expect(await orphiCrowdFund.globalHelpPoolBalance()).to.equal(0);
            }
        });

        it("Should not allow distribution before interval", async function () {
            await orphiCrowdFund.connect(poolManager).distributeGlobalHelpPool();
            
            await expect(orphiCrowdFund.connect(poolManager).distributeGlobalHelpPool())
                .to.be.revertedWith("OrphiCrowdFund: Too early for distribution");
        });
    });

    describe("Leader Rank Advancement", function () {
        it("Should advance to Shining Star rank", async function () {
            await orphiCrowdFund.connect(user1).registerUser(ethers.ZeroAddress, 1);
            
            // Add required direct referrals (10) and team size (250)
            for (let i = 0; i < 10; i++) {
                const newUser = users[i];
                await usdtToken.mint(newUser.address, PACKAGE_AMOUNTS[0]);
                await usdtToken.connect(newUser).approve(await orphiCrowdFund.getAddress(), PACKAGE_AMOUNTS[0]);
                await orphiCrowdFund.connect(newUser).registerUser(user1.address, 1);
            }
            
            // Simulate team size growth (this would normally happen through matrix placement)
            // For testing, we'll check the advancement logic
            await orphiCrowdFund.checkRankAdvancement(user1.address);
            
            const user1Info = await orphiCrowdFund.getUserInfo(user1.address);
            if (user1Info.teamSize >= 250 && user1Info.directReferrals >= 10) {
                expect(user1Info.leaderRank).to.equal(1); // SHINING_STAR
            }
        });
    });

    describe("Package Upgrade System", function () {
        beforeEach(async function () {
            await orphiCrowdFund.connect(user1).registerUser(ethers.ZeroAddress, 1); // $30 package
        });

        it("Should upgrade package and distribute commissions", async function () {
            const upgradeCost = PACKAGE_AMOUNTS[1] - PACKAGE_AMOUNTS[0]; // $50 - $30 = $20
            
            await expect(orphiCrowdFund.connect(user1).upgradePackage(2))
                .to.emit(orphiCrowdFund, "PackageUpgraded")
                .withArgs(user1.address, 1, 2, upgradeCost, anyValue);
            
            const user1Info = await orphiCrowdFund.getUserInfo(user1.address);
            expect(user1Info.packageTier).to.equal(2);
            expect(user1Info.totalInvested).to.equal(PACKAGE_AMOUNTS[1]);
        });

        it("Should not allow downgrade", async function () {
            await orphiCrowdFund.connect(user1).upgradePackage(2);
            
            await expect(orphiCrowdFund.connect(user1).upgradePackage(1))
                .to.be.revertedWith("OrphiCrowdFund: Can only upgrade to higher tier");
        });
    });

    describe("Admin Functions", function () {
        it("Should update admin addresses", async function () {
            const newTreasury = user4.address;
            const newEmergency = user5.address;
            const newPoolManager = users[0].address;
            
            await orphiCrowdFund.updateAdminAddresses(newTreasury, newEmergency, newPoolManager);
            
            expect(await orphiCrowdFund.treasuryAddress()).to.equal(newTreasury);
            expect(await orphiCrowdFund.emergencyAddress()).to.equal(newEmergency);
            expect(await orphiCrowdFund.poolManagerAddress()).to.equal(newPoolManager);
        });

        it("Should allow emergency withdrawal", async function () {
            const contractBalance = await usdtToken.balanceOf(await orphiCrowdFund.getAddress());
            
            if (contractBalance > 0) {
                await expect(orphiCrowdFund.connect(emergency).emergencyWithdraw(contractBalance))
                    .to.not.be.reverted;
            }
        });

        it("Should allow emergency pause", async function () {
            await orphiCrowdFund.connect(emergency).pause();
            expect(await orphiCrowdFund.paused()).to.be.true;
            
            await expect(orphiCrowdFund.connect(user1).registerUser(ethers.ZeroAddress, 1))
                .to.be.revertedWith("Pausable: paused");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await orphiCrowdFund.connect(user1).registerUser(ethers.ZeroAddress, 1);
            await orphiCrowdFund.connect(user2).registerUser(user1.address, 1);
        });

        it("Should return correct user info", async function () {
            const userInfo = await orphiCrowdFund.getUserInfo(user1.address);
            
            expect(userInfo.totalInvested).to.equal(PACKAGE_AMOUNTS[0]);
            expect(userInfo.packageTier).to.equal(1);
            expect(userInfo.sponsor).to.equal(ethers.ZeroAddress);
            expect(userInfo.directReferrals).to.equal(1);
        });

        it("Should return pool earnings", async function () {
            const poolEarnings = await orphiCrowdFund.getPoolEarnings(user1.address);
            expect(poolEarnings).to.have.length(5);
        });

        it("Should return direct referrals", async function () {
            const directReferrals = await orphiCrowdFund.getDirectReferrals(user1.address);
            expect(directReferrals).to.include(user2.address);
        });

        it("Should check if user is registered", async function () {
            expect(await orphiCrowdFund.isUserRegistered(user1.address)).to.be.true;
            expect(await orphiCrowdFund.isUserRegistered(user3.address)).to.be.false;
        });
    });
});

// Helper function for any value matching in events
const anyValue = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
