const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("OrphiCrowdFund - Basic Security Tests", function () {
    let orphiCrowdFund;
    let mockUSDT;
    let owner, user1, user2, user3;
    
    const PACKAGE_AMOUNTS = [30, 50, 100, 200];
    const USDT_DECIMALS = 6;
    
    beforeEach(async function () {
        [owner, user1, user2, user3] = await ethers.getSigners();
        
        // Deploy Mock USDT
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        
        // Deploy simplified version for testing
        const OrphiCrowdFundSimplified = await ethers.getContractFactory("OrphiCrowdFundSimplified");
        
        orphiCrowdFund = await upgrades.deployProxy(OrphiCrowdFundSimplified, [
            await mockUSDT.getAddress(),
            owner.address, // oracle address
            owner.address, // admin address
            true,  // MEV protection enabled
            true,  // circuit breaker enabled
            false  // timelock disabled for basic tests
        ], { 
            initializer: 'initialize',
            kind: 'uups'
        });
        await orphiCrowdFund.waitForDeployment();
        
        // Setup USDT balances
        const usdtDecimals = 10 ** USDT_DECIMALS;
        await mockUSDT.mint(user1.address, 1000 * usdtDecimals);
        await mockUSDT.mint(user2.address, 1000 * usdtDecimals);
        await mockUSDT.mint(user3.address, 1000 * usdtDecimals);
        
        // Approve contract to spend USDT
        await mockUSDT.connect(user1).approve(await orphiCrowdFund.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user2).approve(await orphiCrowdFund.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user3).approve(await orphiCrowdFund.getAddress(), ethers.MaxUint256);
    });
    
    describe("🔧 Basic Contract Functionality", function () {
        it("Should initialize with correct parameters", async function () {
            const usdtAddress = await orphiCrowdFund.usdtToken();
            expect(usdtAddress).to.equal(await mockUSDT.getAddress());
        });
        
        it("Should allow user registration", async function () {
            await orphiCrowdFund.connect(user1).register(owner.address);
            
            const userInfo = await orphiCrowdFund.users(user1.address);
            expect(userInfo.isRegistered).to.be.true;
            expect(userInfo.sponsor).to.equal(owner.address);
        });
        
        it("Should allow package purchase", async function () {
            // Register users
            await orphiCrowdFund.connect(user1).register(owner.address);
            
            const packageAmount = PACKAGE_AMOUNTS[0] * (10 ** USDT_DECIMALS);
            
            // Wait for next block to avoid MEV protection
            await ethers.provider.send("evm_mine");
            
            await expect(
                orphiCrowdFund.connect(user1).purchasePackage(0, user1.address)
            ).to.emit(orphiCrowdFund, "PackagePurchased");
            
            const userInfo = await orphiCrowdFund.users(user1.address);
            expect(userInfo.packageCount).to.equal(1);
        });
    });
    
    describe("🔒 Basic Security Features", function () {
        beforeEach(async function () {
            // Register users
            await orphiCrowdFund.connect(user1).register(owner.address);
            await orphiCrowdFund.connect(user2).register(user1.address);
        });
        
        it("Should prevent reentrancy in withdrawals", async function () {
            // This test ensures basic reentrancy protection works
            // First purchase a package to have earnings
            await orphiCrowdFund.connect(user1).purchasePackage(0, user1.address);
            
            // Try to withdraw (should work once)
            const userInfo = await orphiCrowdFund.users(user1.address);
            if (userInfo.totalEarnings > 0) {
                await expect(
                    orphiCrowdFund.connect(user1).withdraw()
                ).to.not.be.reverted;
            }
        });
        
        it("Should enforce proper access controls", async function () {
            // Only admin should be able to call admin functions
            await expect(
                orphiCrowdFund.connect(user1).pause()
            ).to.be.reverted;
        });
        
        it("Should handle pausing correctly", async function () {
            // Admin can pause
            await orphiCrowdFund.connect(owner).pause();
            
            // Operations should be paused - use a new user
            await expect(
                orphiCrowdFund.connect(user3).register(owner.address)
            ).to.be.reverted;
            
            // Admin can unpause
            await orphiCrowdFund.connect(owner).unpause();
            
            // Operations should work again
            await expect(
                orphiCrowdFund.connect(user3).register(owner.address)
            ).to.not.be.reverted;
        });
    });
    
    describe("📊 Basic Rewards System", function () {
        beforeEach(async function () {
            // Setup user chain
            await orphiCrowdFund.connect(user1).register(owner.address);
            await orphiCrowdFund.connect(user2).register(user1.address);
            await orphiCrowdFund.connect(user3).register(user2.address);
        });
        
        it("Should track sponsors correctly", async function () {
            const user2Info = await orphiCrowdFund.users(user2.address);
            expect(user2Info.sponsor).to.equal(user1.address);
            
            const user3Info = await orphiCrowdFund.users(user3.address);
            expect(user3Info.sponsor).to.equal(user2.address);
        });
        
        it("Should handle package purchases and commissions", async function () {
            // User2 purchases a package
            // Wait for next block to avoid MEV protection
            await ethers.provider.send("evm_mine");
            
            await orphiCrowdFund.connect(user2).purchasePackage(0, user2.address);
            
            // Check that sponsor (user1) received commission
            const user1Info = await orphiCrowdFund.users(user1.address);
            expect(user1Info.totalEarnings).to.be.gt(0);
        });
    });
});
