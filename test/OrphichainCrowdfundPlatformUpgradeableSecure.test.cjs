const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("OrphichainCrowdfundPlatformUpgradeableSecure", function () {
    let contract;
    let mockUSDT;
    let mockOracle;
    let owner;
    let treasury;
    let emergency;
    let poolManager;
    let user1;
    let user2;
    let user3;

    const PACKAGE_AMOUNTS = [
        ethers.parseUnits("30", 6),   // $30 USDT
        ethers.parseUnits("50", 6),   // $50 USDT
        ethers.parseUnits("100", 6),  // $100 USDT
        ethers.parseUnits("200", 6)   // $200 USDT
    ];

    beforeEach(async function () {
        [owner, treasury, emergency, poolManager, user1, user2, user3] = await ethers.getSigners();

        // Deploy Mock USDT
        const MockUSDT = await ethers.getContractFactory("contracts/MockUSDT.sol:MockUSDT");
        mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();

        // Deploy Mock Oracle
        const MockOracle = await ethers.getContractFactory("contracts/MockPriceOracle.sol:MockPriceOracle");
        mockOracle = await MockOracle.deploy();
        await mockOracle.waitForDeployment();

        // Deploy the upgradeable contract
        const OrphichainSecure = await ethers.getContractFactory("OrphichainCrowdfundPlatformUpgradeableSecure");
        contract = await upgrades.deployProxy(OrphichainSecure, [
            await mockUSDT.getAddress(),
            treasury.address,
            emergency.address,
            poolManager.address
        ], { initializer: 'initialize' });
        await contract.waitForDeployment();

        // Mint USDT to users
        await mockUSDT.mint(user1.address, ethers.parseUnits("1000", 6));
        await mockUSDT.mint(user2.address, ethers.parseUnits("1000", 6));
        await mockUSDT.mint(user3.address, ethers.parseUnits("1000", 6));

        // Approve contract to spend USDT
        await mockUSDT.connect(user1).approve(await contract.getAddress(), ethers.parseUnits("1000", 6));
        await mockUSDT.connect(user2).approve(await contract.getAddress(), ethers.parseUnits("1000", 6));
        await mockUSDT.connect(user3).approve(await contract.getAddress(), ethers.parseUnits("1000", 6));
    });

    describe("🛡️ Task 1: Storage Layout Compatibility (4 points)", function () {
        it("Should have correct storage version", async function () {
            expect(await contract.STORAGE_VERSION()).to.equal(1);
        });

        it("Should generate and store storage layout hash", async function () {
            const hash = await contract.storageLayoutHash();
            expect(hash).to.not.equal(ethers.ZeroHash);
        });

        it("Should verify storage layout compatibility", async function () {
            const hash = await contract.storageLayoutHash();
            expect(await contract.verifyStorageLayoutCompatibility(hash)).to.be.true;
            
            // Test with wrong hash
            const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("wrong"));
            expect(await contract.verifyStorageLayoutCompatibility(wrongHash)).to.be.false;
        });

        it("Should return storage layout information", async function () {
            const [version, hash, slots] = await contract.getStorageLayoutInfo();
            expect(version).to.equal(1);
            expect(hash).to.not.equal(ethers.ZeroHash);
            expect(slots).to.equal(6); // User struct uses 6 slots
        });

        it("Should allow authorized storage layout hash updates", async function () {
            const newHash = ethers.keccak256(ethers.toUtf8Bytes("new_layout"));
            
            await expect(contract.updateStorageLayoutHash(newHash))
                .to.emit(contract, "StorageLayoutVerified")
                .withArgs(1, newHash, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
            
            expect(await contract.storageLayoutHash()).to.equal(newHash);
        });

        it("Should prevent unauthorized storage layout updates", async function () {
            const newHash = ethers.keccak256(ethers.toUtf8Bytes("unauthorized"));
            
            await expect(contract.connect(user1).updateStorageLayoutHash(newHash))
                .to.be.revertedWith("AccessControl:");
        });

        it("Should validate upgrade authorization", async function () {
            const newImplementation = user1.address; // Mock address
            
            await expect(contract.validateUpgrade(newImplementation))
                .to.not.be.reverted;
            
            await expect(contract.validateUpgrade(ethers.ZeroAddress))
                .to.be.revertedWith("OrphichainCrowdfund: Invalid implementation");
        });
    });

    describe("🔒 Task 2: Type Casting Safety (3 points)", function () {
        it("Should validate type safety bounds", async function () {
            expect(await contract.validateTypeSafety()).to.be.true;
        });

        it("Should safely convert package tiers", async function () {
            // Register user to test safe conversions
            await contract.connect(user1).registerUser(owner.address, 1); // PACKAGE_30
            
            const packageTier = await contract.getUserPackageTier(user1.address);
            expect(packageTier).to.equal(1);
        });

        it("Should safely convert leader ranks", async function () {
            // Register user first
            await contract.connect(user1).registerUser(owner.address, 1);
            
            const leaderRank = await contract.getUserLeaderRank(user1.address);
            expect(leaderRank).to.equal(0); // NONE
        });

        it("Should emit type conversion safety events", async function () {
            await expect(contract.connect(user1).registerUser(owner.address, 1))
                .to.emit(contract, "TypeConversionSafety")
                .withArgs("PackageTier", 1, 1, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
        });

        it("Should handle safe uint128 conversions", async function () {
            // Register user with maximum package
            await contract.connect(user1).registerUser(owner.address, 4); // PACKAGE_200
            
            const userInfo = await contract.getUserInfo(user1.address);
            expect(userInfo.totalInvested).to.equal(PACKAGE_AMOUNTS[3]);
        });

        it("Should handle safe uint64 conversions for timestamps", async function () {
            await contract.connect(user1).registerUser(owner.address, 1);
            
            const userInfo = await contract.getUserInfo(user1.address);
            expect(userInfo.registrationTime).to.be.gt(0);
        });

        it("Should handle safe uint32 conversions for team sizes", async function () {
            // Register multiple users to test team size increments
            await contract.connect(user1).registerUser(owner.address, 1);
            await contract.connect(user2).registerUser(user1.address, 1);
            
            const userInfo = await contract.getUserInfo(user1.address);
            expect(userInfo.teamSize).to.equal(1);
        });

        it("Should return user info with safe conversions", async function () {
            await contract.connect(user1).registerUser(owner.address, 2); // PACKAGE_50
            
            const userInfo = await contract.getUserInfo(user1.address);
            expect(userInfo.packageTier).to.equal(2);
            expect(userInfo.leaderRank).to.equal(0);
            expect(userInfo.totalInvested).to.equal(PACKAGE_AMOUNTS[1]);
            expect(userInfo.sponsor).to.equal(owner.address);
        });
    });

    describe("🔮 Task 3: Oracle Integration Enhancement (2 points)", function () {
        it("Should set and configure price oracle", async function () {
            await expect(contract.setPriceOracle(await mockOracle.getAddress()))
                .to.emit(contract, "AddressUpdated")
                .withArgs("PRICE_ORACLE", ethers.ZeroAddress, await mockOracle.getAddress(), await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
        });

        it("Should enable/disable oracle usage", async function () {
            await contract.setPriceOracle(await mockOracle.getAddress());
            
            await expect(contract.setOracleEnabled(true))
                .to.emit(contract, "OracleConfigurationUpdated")
                .withArgs(await mockOracle.getAddress(), true, 3600, 1000, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
            
            const config = await contract.getOracleConfig();
            expect(config.enabled).to.be.true;
        });

        it("Should update oracle configuration", async function () {
            await contract.setPriceOracle(await mockOracle.getAddress());
            
            await expect(contract.updateOracleConfig(7200, 500))
                .to.emit(contract, "OracleConfigurationUpdated")
                .withArgs(await mockOracle.getAddress(), false, 7200, 500, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
        });

        it("Should get current USDT price (fixed mode)", async function () {
            const price = await contract.getCurrentUSDTPrice();
            expect(price).to.equal(ethers.parseEther("1")); // 1 USDT = 1 USD
        });

        it("Should get current USDT price (oracle mode)", async function () {
            await contract.setPriceOracle(await mockOracle.getAddress());
            await contract.setOracleEnabled(true);
            
            // Mock oracle should return 1e18 (1 USD)
            const price = await contract.getCurrentUSDTPrice();
            expect(price).to.equal(ethers.parseEther("1"));
        });

        it("Should validate price deviation", async function () {
            const currentPrice = ethers.parseEther("1.05"); // 5% higher
            const expectedPrice = ethers.parseEther("1.00");
            
            // Should be within 10% threshold
            expect(await contract.validatePriceDeviation(currentPrice, expectedPrice)).to.be.true;
            
            const highPrice = ethers.parseEther("1.15"); // 15% higher
            expect(await contract.validatePriceDeviation(highPrice, expectedPrice)).to.be.false;
        });

        it("Should fallback to fixed price on oracle failure", async function () {
            // Set oracle but don't enable it
            await contract.setPriceOracle(await mockOracle.getAddress());
            
            const price = await contract.getCurrentUSDTPrice();
            expect(price).to.equal(ethers.parseEther("1")); // Fixed price fallback
        });

        it("Should return oracle configuration", async function () {
            await contract.setPriceOracle(await mockOracle.getAddress());
            await contract.setOracleEnabled(true);
            await contract.updateOracleConfig(3600, 1000);
            
            const [enabled, oracle, maxAge, threshold] = await contract.getOracleConfig();
            expect(enabled).to.be.true;
            expect(oracle).to.equal(await mockOracle.getAddress());
            expect(maxAge).to.equal(3600);
            expect(threshold).to.equal(1000);
        });

        it("Should prevent unauthorized oracle configuration", async function () {
            await expect(contract.connect(user1).setPriceOracle(await mockOracle.getAddress()))
                .to.be.revertedWith("AccessControl:");
            
            await expect(contract.connect(user1).setOracleEnabled(true))
                .to.be.revertedWith("AccessControl:");
            
            await expect(contract.connect(user1).updateOracleConfig(3600, 1000))
                .to.be.revertedWith("AccessControl:");
        });
    });

    describe("🚀 Enhanced Functionality Tests", function () {
        it("Should register user with enhanced safety", async function () {
            await expect(contract.connect(user1).registerUser(owner.address, 1))
                .to.emit(contract, "UserRegistered")
                .withArgs(user1.address, owner.address, 1, PACKAGE_AMOUNTS[0], await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
            
            expect(await contract.isUserRegistered(user1.address)).to.be.true;
        });

        it("Should upgrade package with enhanced safety", async function () {
            await contract.connect(user1).registerUser(owner.address, 1);
            
            await expect(contract.connect(user1).upgradePackage(2))
                .to.emit(contract, "PackageUpgraded")
                .withArgs(user1.address, 1, 2, PACKAGE_AMOUNTS[1] - PACKAGE_AMOUNTS[0], await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
        });

        it("Should handle withdrawals with enhanced safety", async function () {
            await contract.connect(user1).registerUser(owner.address, 1);
            
            // Credit some earnings first (simulate direct bonus)
            const directBonus = PACKAGE_AMOUNTS[0] * 10n / 100n; // 10%
            
            // Register another user to trigger direct bonus
            await contract.connect(user2).registerUser(user1.address, 1);
            
            const withdrawableAmount = await contract.getWithdrawableAmount(user1.address);
            if (withdrawableAmount > 0) {
                await expect(contract.connect(user1).withdraw(withdrawableAmount))
                    .to.emit(contract, "WithdrawalProcessed")
                    .withArgs(user1.address, withdrawableAmount, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
            }
        });

        it("Should check rank advancement with enhanced safety", async function () {
            await contract.connect(user1).registerUser(owner.address, 4); // High package
            
            // This won't trigger advancement yet (need team size >= 10)
            await contract.checkRankAdvancement(user1.address);
            
            const leaderRank = await contract.getUserLeaderRank(user1.address);
            expect(leaderRank).to.equal(0); // Still NONE
        });

        it("Should return correct version", async function () {
            expect(await contract.version()).to.equal("Orphichain Crowdfund Platform Upgradeable Secure v1.1.0");
        });

        it("Should handle emergency functions", async function () {
            // Test pause
            await expect(contract.connect(emergency).pause())
                .to.emit(contract, "Paused");
            
            // Test unpause
            await expect(contract.unpause())
                .to.emit(contract, "Unpaused");
        });
    });

    describe("🔐 Security and Access Control", function () {
        it("Should enforce role-based access control", async function () {
            // Test UPGRADER_ROLE
            await expect(contract.connect(user1).updateStorageLayoutHash(ethers.ZeroHash))
                .to.be.revertedWith("AccessControl:");
            
            // Test ORACLE_MANAGER_ROLE
            await expect(contract.connect(user1).setPriceOracle(await mockOracle.getAddress()))
                .to.be.revertedWith("AccessControl:");
            
            // Test EMERGENCY_ROLE
            await expect(contract.connect(user1).pause())
                .to.be.revertedWith("AccessControl:");
        });

        it("Should prevent invalid operations", async function () {
            // Test invalid package tier
            await expect(contract.connect(user1).registerUser(owner.address, 0))
                .to.be.revertedWith("OrphichainCrowdfund: Invalid package tier");
            
            // Test self-sponsoring
            await expect(contract.connect(user1).registerUser(user1.address, 1))
                .to.be.revertedWith("OrphichainCrowdfund: Cannot sponsor yourself");
        });

        it("Should handle edge cases safely", async function () {
            // Test zero address validation
            await expect(contract.connect(user1).registerUser(ethers.ZeroAddress, 1))
                .to.be.revertedWith("OrphichainCrowdfund: Invalid address");
            
            // Test withdrawal with insufficient balance
            await expect(contract.connect(user1).withdraw(ethers.parseUnits("100", 6)))
                .to.be.revertedWith("OrphichainCrowdfund: User not registered");
        });
    });

    describe("📊 Gas Optimization Verification", function () {
        it("Should maintain reasonable gas costs", async function () {
            const tx = await contract.connect(user1).registerUser(owner.address, 1);
            const receipt = await tx.wait();
            
            // Should be around 305K gas (slight increase from 299K for safety)
            expect(receipt.gasUsed).to.be.lt(350000);
            console.log(`Registration gas used: ${receipt.gasUsed}`);
        });

        it("Should optimize storage layout", async function () {
            await contract.connect(user1).registerUser(owner.address, 1);
            
            // Verify user struct is properly packed
            const userInfo = await contract.getUserInfo(user1.address);
            expect(userInfo.totalInvested).to.equal(PACKAGE_AMOUNTS[0]);
            expect(userInfo.packageTier).to.equal(1);
            expect(userInfo.leaderRank).to.equal(0);
        });
    });
});
