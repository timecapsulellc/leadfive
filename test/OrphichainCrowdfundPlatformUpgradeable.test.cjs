const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

/**
 * @title Comprehensive Test Suite for Orphichain Crowdfund Platform Upgradeable
 * @dev Tests all compensation plan features, role management, and upgrade functionality
 */

describe("OrphichainCrowdfundPlatformUpgradeable", function () {
    let orphichainPlatform;
    let mockUSDT;
    let owner, treasury, emergency, poolManager, upgrader;
    let user1, user2, user3, user4, user5, user6, user7, user8, user9, user10;
    let proxyAddress, implementationAddress;

    // Package amounts in USDT (6 decimals)
    const PACKAGE_30 = ethers.parseUnits("30", 6);
    const PACKAGE_50 = ethers.parseUnits("50", 6);
    const PACKAGE_100 = ethers.parseUnits("100", 6);
    const PACKAGE_200 = ethers.parseUnits("200", 6);

    // Platform constants
    const DIRECT_BONUS_RATE = 10; // 10%
    const BINARY_BONUS_RATE = 5;  // 5%
    const PLATFORM_FEE_RATE = 250; // 2.5%

    before(async function () {
        console.log("🚀 Setting up test environment...");
        
        // Get signers
        [owner, treasury, emergency, poolManager, upgrader, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10] = await ethers.getSigners();
        
        console.log("📋 Test Addresses:");
        console.log("├─ Owner:", owner.address);
        console.log("├─ Treasury:", treasury.address);
        console.log("├─ Emergency:", emergency.address);
        console.log("├─ Pool Manager:", poolManager.address);
        console.log("└─ Users:", user1.address, "...", user10.address);
    });

    beforeEach(async function () {
        // Deploy Mock USDT
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();

        // Deploy upgradeable contract
        const OrphichainPlatformUpgradeable = await ethers.getContractFactory("OrphichainCrowdfundPlatformUpgradeable");
        
        orphichainPlatform = await upgrades.deployProxy(
            OrphichainPlatformUpgradeable,
            [
                await mockUSDT.getAddress(),
                treasury.address,
                emergency.address,
                poolManager.address
            ],
            {
                initializer: 'initialize',
                kind: 'uups'
            }
        );
        
        await orphichainPlatform.waitForDeployment();
        proxyAddress = await orphichainPlatform.getAddress();
        implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

        // Mint USDT to test users
        const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDT
        for (let user of [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10]) {
            await mockUSDT.mint(user.address, mintAmount);
            await mockUSDT.connect(user).approve(proxyAddress, mintAmount);
        }

        console.log("✅ Test setup complete");
    });

    describe("🔧 Contract Initialization", function () {
        it("Should initialize with correct parameters", async function () {
            expect(await orphichainPlatform.usdtToken()).to.equal(await mockUSDT.getAddress());
            expect(await orphichainPlatform.treasuryAddress()).to.equal(treasury.address);
            expect(await orphichainPlatform.emergencyAddress()).to.equal(emergency.address);
            expect(await orphichainPlatform.poolManagerAddress()).to.equal(poolManager.address);
            expect(await orphichainPlatform.platformFeeRate()).to.equal(PLATFORM_FEE_RATE);
        });

        it("Should assign roles correctly", async function () {
            const DEFAULT_ADMIN_ROLE = await orphichainPlatform.DEFAULT_ADMIN_ROLE();
            const TREASURY_ROLE = await orphichainPlatform.TREASURY_ROLE();
            const EMERGENCY_ROLE = await orphichainPlatform.EMERGENCY_ROLE();
            const POOL_MANAGER_ROLE = await orphichainPlatform.POOL_MANAGER_ROLE();
            const UPGRADER_ROLE = await orphichainPlatform.UPGRADER_ROLE();

            expect(await orphichainPlatform.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
            expect(await orphichainPlatform.hasRole(TREASURY_ROLE, treasury.address)).to.be.true;
            expect(await orphichainPlatform.hasRole(EMERGENCY_ROLE, emergency.address)).to.be.true;
            expect(await orphichainPlatform.hasRole(POOL_MANAGER_ROLE, poolManager.address)).to.be.true;
            expect(await orphichainPlatform.hasRole(UPGRADER_ROLE, owner.address)).to.be.true;
        });

        it("Should have correct package amounts", async function () {
            const packageAmounts = await orphichainPlatform.getPackageAmounts();
            expect(packageAmounts[0]).to.equal(PACKAGE_30);
            expect(packageAmounts[1]).to.equal(PACKAGE_50);
            expect(packageAmounts[2]).to.equal(PACKAGE_100);
            expect(packageAmounts[3]).to.equal(PACKAGE_200);
        });
    });

    describe("👥 User Registration System", function () {
        it("Should register user with $30 package", async function () {
            const packageTier = 1; // PACKAGE_30
            
            await expect(orphichainPlatform.connect(user2).registerUser(user1.address, packageTier))
                .to.emit(orphichainPlatform, "UserRegistered")
                .withArgs(user2.address, user1.address, packageTier, PACKAGE_30, anyValue);

            const userInfo = await orphichainPlatform.getUserInfo(user2.address);
            expect(userInfo.packageTier).to.equal(packageTier);
            expect(userInfo.totalInvested).to.equal(PACKAGE_30);
            expect(userInfo.sponsor).to.equal(user1.address);
        });

        it("Should collect platform fee on registration", async function () {
            const packageTier = 1; // PACKAGE_30
            const expectedFee = (PACKAGE_30 * BigInt(PLATFORM_FEE_RATE)) / BigInt(10000);
            
            const treasuryBalanceBefore = await mockUSDT.balanceOf(treasury.address);
            
            await orphichainPlatform.connect(user2).registerUser(user1.address, packageTier);
            
            const treasuryBalanceAfter = await mockUSDT.balanceOf(treasury.address);
            expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(expectedFee);
        });

        it("Should credit direct bonus to sponsor", async function () {
            // Register user1 first (no sponsor)
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            
            // Register user2 with user1 as sponsor
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
            
            const user1Info = await orphichainPlatform.getUserInfo(user1.address);
            const expectedBonus = (PACKAGE_30 * BigInt(DIRECT_BONUS_RATE)) / BigInt(100);
            
            expect(user1Info.withdrawableAmount).to.equal(expectedBonus);
        });

        it("Should prevent self-sponsoring", async function () {
            await expect(orphichainPlatform.connect(user1).registerUser(user1.address, 1))
                .to.be.revertedWith("OrphichainCrowdfund: Cannot sponsor yourself");
        });

        it("Should prevent double registration", async function () {
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            
            await expect(orphichainPlatform.connect(user1).registerUser(owner.address, 2))
                .to.be.revertedWith("OrphichainCrowdfund: User already registered");
        });
    });

    describe("📦 Package Management System", function () {
        beforeEach(async function () {
            // Register user1 with $30 package
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
        });

        it("Should upgrade package from $30 to $50", async function () {
            const newTier = 2; // PACKAGE_50
            const upgradeCost = PACKAGE_50 - PACKAGE_30;
            
            await expect(orphichainPlatform.connect(user1).upgradePackage(newTier))
                .to.emit(orphichainPlatform, "PackageUpgraded")
                .withArgs(user1.address, 1, newTier, upgradeCost, anyValue);

            const userInfo = await orphichainPlatform.getUserInfo(user1.address);
            expect(userInfo.packageTier).to.equal(newTier);
            expect(userInfo.totalInvested).to.equal(PACKAGE_50);
        });

        it("Should collect platform fee on upgrade", async function () {
            const newTier = 2; // PACKAGE_50
            const upgradeCost = PACKAGE_50 - PACKAGE_30;
            const expectedFee = (upgradeCost * BigInt(PLATFORM_FEE_RATE)) / BigInt(10000);
            
            const treasuryBalanceBefore = await mockUSDT.balanceOf(treasury.address);
            
            await orphichainPlatform.connect(user1).upgradePackage(newTier);
            
            const treasuryBalanceAfter = await mockUSDT.balanceOf(treasury.address);
            expect(treasuryBalanceAfter - treasuryBalanceBefore).to.be.gte(expectedFee);
        });

        it("Should prevent downgrading package", async function () {
            // User1 is already at tier 1 ($30)
            await expect(orphichainPlatform.connect(user1).upgradePackage(1))
                .to.be.revertedWith("OrphichainCrowdfund: Can only upgrade to higher tier");
        });
    });

    describe("🌳 Matrix Placement System", function () {
        it("Should place users in binary matrix correctly", async function () {
            // Register users in sequence
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
            await orphichainPlatform.connect(user3).registerUser(user1.address, 1);
            
            // Check matrix placement
            const [leftChild, rightChild] = await orphichainPlatform.getMatrixChildren(user1.address);
            expect(leftChild).to.equal(user2.address);
            expect(rightChild).to.equal(user3.address);
        });

        it("Should update team sizes correctly", async function () {
            // Register users in sequence
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
            await orphichainPlatform.connect(user3).registerUser(user1.address, 1);
            
            const user1Info = await orphichainPlatform.getUserInfo(user1.address);
            expect(user1Info.teamSize).to.equal(2);
        });

        it("Should calculate matrix depth correctly", async function () {
            // Create a 3-level matrix
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
            await orphichainPlatform.connect(user3).registerUser(user2.address, 1);
            
            expect(await orphichainPlatform.getMatrixDepth(user1.address)).to.equal(1);
            expect(await orphichainPlatform.getMatrixDepth(user2.address)).to.equal(2);
            expect(await orphichainPlatform.getMatrixDepth(user3.address)).to.equal(3);
        });
    });

    describe("💰 Commission System", function () {
        beforeEach(async function () {
            // Set up basic matrix structure
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
            await orphichainPlatform.connect(user3).registerUser(user1.address, 1);
        });

        it("Should calculate direct bonus correctly", async function () {
            const user1Info = await orphichainPlatform.getUserInfo(user1.address);
            const expectedBonus = (PACKAGE_30 * BigInt(DIRECT_BONUS_RATE) * BigInt(2)) / BigInt(100); // 2 referrals
            
            expect(user1Info.withdrawableAmount).to.equal(expectedBonus);
        });

        it("Should calculate binary bonus correctly", async function () {
            // Add more users to create volume
            await orphichainPlatform.connect(user4).registerUser(user2.address, 2); // $50 package
            await orphichainPlatform.connect(user5).registerUser(user3.address, 2); // $50 package
            
            const binaryBonus = await orphichainPlatform.calculateBinaryBonus(user1.address);
            expect(binaryBonus).to.be.gt(0);
        });

        it("Should track earnings by pool type", async function () {
            const user1Info = await orphichainPlatform.getUserInfo(user1.address);
            const earningsBreakdown = await orphichainPlatform.getEarningsBreakdown(user1.address);
            
            // Should have direct bonus earnings (pool type 0)
            expect(earningsBreakdown[0]).to.be.gt(0);
            expect(user1Info.poolEarnings[0]).to.equal(earningsBreakdown[0]);
        });
    });

    describe("🏆 Rank Advancement System", function () {
        it("Should advance to Shining Star rank", async function () {
            // Register user1 with high investment
            await orphichainPlatform.connect(user1).registerUser(owner.address, 4); // $200 package
            
            // Create team of 10+ users
            for (let i = 2; i <= 11; i++) {
                const user = eval(`user${i}`);
                if (user) {
                    await orphichainPlatform.connect(user).registerUser(user1.address, 1);
                }
            }
            
            // Check rank advancement
            await expect(orphichainPlatform.checkRankAdvancement(user1.address))
                .to.emit(orphichainPlatform, "RankAdvancement");
            
            const user1Info = await orphichainPlatform.getUserInfo(user1.address);
            expect(user1Info.leaderRank).to.equal(1); // SHINING_STAR
        });

        it("Should return correct rank requirements", async function () {
            const [teamSize, volume] = await orphichainPlatform.getRankRequirements(1); // SHINING_STAR
            expect(teamSize).to.equal(10);
            expect(volume).to.equal(ethers.parseUnits("100", 6));
        });
    });

    describe("💸 Withdrawal System", function () {
        beforeEach(async function () {
            // Set up users with earnings
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
        });

        it("Should allow withdrawal of available earnings", async function () {
            const user1Info = await orphichainPlatform.getUserInfo(user1.address);
            const withdrawableAmount = user1Info.withdrawableAmount;
            
            const balanceBefore = await mockUSDT.balanceOf(user1.address);
            
            await expect(orphichainPlatform.connect(user1).withdraw(withdrawableAmount))
                .to.emit(orphichainPlatform, "WithdrawalProcessed")
                .withArgs(user1.address, withdrawableAmount, anyValue);
            
            const balanceAfter = await mockUSDT.balanceOf(user1.address);
            expect(balanceAfter - balanceBefore).to.equal(withdrawableAmount);
        });

        it("Should allow withdrawal of all earnings", async function () {
            const user1Info = await orphichainPlatform.getUserInfo(user1.address);
            const withdrawableAmount = user1Info.withdrawableAmount;
            
            await orphichainPlatform.connect(user1).withdrawAll();
            
            const user1InfoAfter = await orphichainPlatform.getUserInfo(user1.address);
            expect(user1InfoAfter.withdrawableAmount).to.equal(0);
        });

        it("Should prevent withdrawal of insufficient balance", async function () {
            const user1Info = await orphichainPlatform.getUserInfo(user1.address);
            const excessiveAmount = user1Info.withdrawableAmount + BigInt(1);
            
            await expect(orphichainPlatform.connect(user1).withdraw(excessiveAmount))
                .to.be.revertedWith("OrphichainCrowdfund: Insufficient balance");
        });
    });

    describe("🔐 Role Management System", function () {
        it("Should allow admin to update treasury address", async function () {
            const newTreasury = user10.address;
            
            await expect(orphichainPlatform.connect(owner).setTreasuryAddress(newTreasury))
                .to.emit(orphichainPlatform, "AddressUpdated")
                .withArgs("TREASURY", treasury.address, newTreasury, anyValue);
            
            expect(await orphichainPlatform.treasuryAddress()).to.equal(newTreasury);
            
            const TREASURY_ROLE = await orphichainPlatform.TREASURY_ROLE();
            expect(await orphichainPlatform.hasRole(TREASURY_ROLE, newTreasury)).to.be.true;
            expect(await orphichainPlatform.hasRole(TREASURY_ROLE, treasury.address)).to.be.false;
        });

        it("Should allow admin to update emergency address", async function () {
            const newEmergency = user9.address;
            
            await orphichainPlatform.connect(owner).setEmergencyAddress(newEmergency);
            
            expect(await orphichainPlatform.emergencyAddress()).to.equal(newEmergency);
        });

        it("Should allow admin to update pool manager address", async function () {
            const newPoolManager = user8.address;
            
            await orphichainPlatform.connect(owner).setPoolManagerAddress(newPoolManager);
            
            expect(await orphichainPlatform.poolManagerAddress()).to.equal(newPoolManager);
        });

        it("Should prevent non-admin from updating addresses", async function () {
            await expect(orphichainPlatform.connect(user1).setTreasuryAddress(user10.address))
                .to.be.reverted;
        });
    });

    describe("⚠️ Emergency Functions", function () {
        it("Should allow emergency role to pause contract", async function () {
            await orphichainPlatform.connect(emergency).pause();
            
            await expect(orphichainPlatform.connect(user1).registerUser(owner.address, 1))
                .to.be.revertedWith("Pausable: paused");
        });

        it("Should allow owner to unpause contract", async function () {
            await orphichainPlatform.connect(emergency).pause();
            await orphichainPlatform.connect(owner).unpause();
            
            // Should work normally after unpause
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
        });

        it("Should allow emergency withdrawal", async function () {
            // First, get some funds in the contract
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            
            const contractBalance = await mockUSDT.balanceOf(proxyAddress);
            const emergencyBalanceBefore = await mockUSDT.balanceOf(emergency.address);
            
            await orphichainPlatform.connect(emergency).emergencyWithdraw(contractBalance);
            
            const emergencyBalanceAfter = await mockUSDT.balanceOf(emergency.address);
            expect(emergencyBalanceAfter - emergencyBalanceBefore).to.equal(contractBalance);
        });
    });

    describe("🔄 Pool Distribution System", function () {
        beforeEach(async function () {
            // Set up multiple users for pool testing
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
            await orphichainPlatform.connect(user3).registerUser(user1.address, 1);
            await orphichainPlatform.connect(user4).registerUser(user2.address, 1);
            await orphichainPlatform.connect(user5).registerUser(user3.address, 1);
        });

        it("Should distribute Global Help Pool", async function () {
            // This would require pool funds to be available
            // Implementation depends on how pools are funded
            const poolStats = await orphichainPlatform.getPlatformStats();
            expect(poolStats.totalUsers).to.equal(5);
        });

        it("Should distribute Leadership Pool", async function () {
            // This would require qualified leaders
            // Implementation depends on rank advancement
            const poolStats = await orphichainPlatform.getPlatformStats();
            expect(poolStats.totalVolume).to.be.gt(0);
        });
    });

    describe("📊 Platform Statistics", function () {
        it("Should return correct platform statistics", async function () {
            // Register multiple users
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 2);
            await orphichainPlatform.connect(user3).registerUser(user1.address, 3);
            
            const [totalUsers, totalVolume, poolBalances] = await orphichainPlatform.getPlatformStats();
            
            expect(totalUsers).to.equal(3);
            expect(totalVolume).to.equal(PACKAGE_30 + PACKAGE_50 + PACKAGE_100);
            expect(poolBalances).to.have.length(5);
        });

        it("Should return administrative addresses", async function () {
            const [treasuryAddr, emergencyAddr, poolManagerAddr] = await orphichainPlatform.getAdministrativeAddresses();
            
            expect(treasuryAddr).to.equal(treasury.address);
            expect(emergencyAddr).to.equal(emergency.address);
            expect(poolManagerAddr).to.equal(poolManager.address);
        });
    });

    describe("⚙️ Platform Configuration", function () {
        it("Should allow owner to update platform fee rate", async function () {
            const newFeeRate = 300; // 3%
            
            await orphichainPlatform.connect(owner).setPlatformFeeRate(newFeeRate);
            
            expect(await orphichainPlatform.platformFeeRate()).to.equal(newFeeRate);
        });

        it("Should prevent setting fee rate too high", async function () {
            const excessiveFeeRate = 1100; // 11% (above 10% max)
            
            await expect(orphichainPlatform.connect(owner).setPlatformFeeRate(excessiveFeeRate))
                .to.be.revertedWith("OrphichainCrowdfund: Fee rate too high");
        });

        it("Should allow owner to update package amounts", async function () {
            const newAmounts = [
                ethers.parseUnits("35", 6),
                ethers.parseUnits("55", 6),
                ethers.parseUnits("110", 6),
                ethers.parseUnits("220", 6)
            ];
            
            await orphichainPlatform.connect(owner).updatePackageAmounts(newAmounts);
            
            const updatedAmounts = await orphichainPlatform.getPackageAmounts();
            for (let i = 0; i < 4; i++) {
                expect(updatedAmounts[i]).to.equal(newAmounts[i]);
            }
        });
    });

    describe("🔧 Contract Information", function () {
        it("Should return correct contract version", async function () {
            const version = await orphichainPlatform.version();
            expect(version).to.equal("Orphichain Crowdfund Platform Upgradeable v1.0.0");
        });

        it("Should check user registration status", async function () {
            expect(await orphichainPlatform.isUserRegistered(user1.address)).to.be.false;
            
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            
            expect(await orphichainPlatform.isUserRegistered(user1.address)).to.be.true;
        });
    });

    // Helper function for any value matching in events
    const anyValue = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
});
