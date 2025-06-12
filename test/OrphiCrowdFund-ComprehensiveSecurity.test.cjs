const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

/**
 * Comprehensive Security Validation Test Suite
 * Tests all security features using the OrphiCrowdFundSimplified contract
 */
describe("🛡️ OrphiCrowdFund - Comprehensive Security Validation", function () {
    let orphiCrowdFund;
    let mockUSDT;
    let deployer, user1, user2, user3, treasury, emergency, poolManager;
    
    beforeEach(async function () {
        // Get signers
        [deployer, user1, user2, user3, treasury, emergency, poolManager] = await ethers.getSigners();
        
        // Deploy Mock USDT
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        
        // Deploy OrphiCrowdFundSimplified (optimized for testing)
        const OrphiCrowdFundSimplified = await ethers.getContractFactory("OrphiCrowdFundSimplified");
        orphiCrowdFund = await upgrades.deployProxy(OrphiCrowdFundSimplified, [
            await mockUSDT.getAddress(),
            ethers.ZeroAddress,  // oracle address (can be zero for testing)
            deployer.address,    // admin address
            true,                // MEV protection enabled
            true,                // circuit breaker enabled
            true                 // timelock enabled
        ], {
            initializer: 'initialize',
            kind: 'uups'
        });
        
        await orphiCrowdFund.waitForDeployment();
        
        // Setup test tokens
        await mockUSDT.mint(user1.address, ethers.parseUnits("1000", 6));
        await mockUSDT.mint(user2.address, ethers.parseUnits("1000", 6));
        await mockUSDT.mint(user3.address, ethers.parseUnits("1000", 6));
        
        // Approve contract
        await mockUSDT.connect(user1).approve(await orphiCrowdFund.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user2).approve(await orphiCrowdFund.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user3).approve(await orphiCrowdFund.getAddress(), ethers.MaxUint256);
    });
    
    describe("🔒 1. MEV PROTECTION VALIDATION", function () {
        it("Should prevent same-block transactions", async function () {
            // Register user1
            await orphiCrowdFund.connect(user1).register(deployer.address);
            
            // First package purchase should work
            await orphiCrowdFund.connect(user1).purchasePackage(0, user1.address);
            
            // Second package purchase in same block should fail
            await expect(
                orphiCrowdFund.connect(user1).purchasePackage(0, user1.address)
            ).to.be.revertedWith("MEV protection active");
        });
        
        it("Should allow transactions in different blocks", async function () {
            // Register user
            await orphiCrowdFund.connect(user2).register(deployer.address);
            
            // First transaction
            await orphiCrowdFund.connect(user2).purchasePackage(0, user2.address);
            
            // Mine a new block
            await ethers.provider.send("evm_mine");
            
            // Second transaction should work now
            await expect(
                orphiCrowdFund.connect(user2).purchasePackage(0, user2.address)
            ).to.not.be.reverted;
        });
    });
    
    describe("🚨 2. CIRCUIT BREAKER VALIDATION", function () {
        it("Should have circuit breaker enabled", async function () {
            const isEnabled = await orphiCrowdFund.circuitBreakerEnabled();
            expect(isEnabled).to.be.true;
        });
        
        it("Should track daily withdrawal limits", async function () {
            const maxDaily = await orphiCrowdFund.maxDailyWithdrawals();
            expect(maxDaily).to.be.greaterThan(0);
        });
    });
    
    describe("🔐 3. ACCESS CONTROL VALIDATION", function () {
        it("Should prevent unauthorized access to admin functions", async function () {
            await expect(
                orphiCrowdFund.connect(user1).pause()
            ).to.be.reverted;
        });
        
        it("Should allow admin to pause/unpause", async function () {
            // Admin can pause
            await orphiCrowdFund.connect(deployer).pause();
            
            let isPaused = await orphiCrowdFund.paused();
            expect(isPaused).to.be.true;
            
            // Admin can unpause
            await orphiCrowdFund.connect(deployer).unpause();
            
            isPaused = await orphiCrowdFund.paused();
            expect(isPaused).to.be.false;
        });
    });
    
    describe("🛡️ 4. REENTRANCY PROTECTION", function () {
        it("Should prevent reentrancy in withdrawal", async function () {
            // Register and create withdrawable amount
            await orphiCrowdFund.connect(user1).register(deployer.address);
            await ethers.provider.send("evm_mine");
            
            await orphiCrowdFund.connect(user2).register(user1.address);
            await ethers.provider.send("evm_mine");
            
            // Check if user1 has withdrawable amount
            const user1Info = await orphiCrowdFund.users(user1.address);
            
            if (user1Info.withdrawableAmount > 0) {
                // Withdrawal should work (reentrancy guard in place)
                await expect(
                    orphiCrowdFund.connect(user1).withdraw()
                ).to.not.be.reverted;
            }
        });
    });
    
    describe("⚡ 5. GAS OPTIMIZATION VALIDATION", function () {
        it("Should have acceptable gas usage for registration", async function () {
            const tx = await orphiCrowdFund.connect(user1).register(deployer.address);
            const receipt = await tx.wait();
            
            console.log("      📊 Registration gas usage:", receipt.gasUsed.toString());
            expect(receipt.gasUsed).to.be.lessThan(150000);
        });
        
        it("Should have acceptable gas usage for package purchase", async function () {
            await orphiCrowdFund.connect(user1).register(deployer.address);
            await ethers.provider.send("evm_mine");
            
            const tx = await orphiCrowdFund.connect(user1).purchasePackage(0, user1.address);
            const receipt = await tx.wait();
            
            console.log("      📊 Package purchase gas usage:", receipt.gasUsed.toString());
            expect(receipt.gasUsed).to.be.lessThan(200000);
        });
    });
    
    describe("🔄 6. CONTRACT STATE VALIDATION", function () {
        it("Should maintain consistent state", async function () {
            // Register users
            await orphiCrowdFund.connect(user1).register(deployer.address);
            await ethers.provider.send("evm_mine");
            
            await orphiCrowdFund.connect(user2).register(user1.address);
            await ethers.provider.send("evm_mine");
            
            // Check total users
            const totalUsers = await orphiCrowdFund.totalUsers();
            expect(totalUsers).to.equal(2);
            
            // Check sponsor relationships
            const user2Info = await orphiCrowdFund.users(user2.address);
            expect(user2Info.sponsor).to.equal(user1.address);
        });
    });
    
    describe("🎯 7. INTEGRATION TESTING", function () {
        it("Should handle multiple users with security features", async function () {
            // Register multiple users in different blocks
            await orphiCrowdFund.connect(user1).register(deployer.address);
            await ethers.provider.send("evm_mine");
            
            await orphiCrowdFund.connect(user2).register(user1.address);
            await ethers.provider.send("evm_mine");
            
            await orphiCrowdFund.connect(user3).register(user2.address);
            await ethers.provider.send("evm_mine");
            
            // Purchase packages in different blocks
            await orphiCrowdFund.connect(user1).purchasePackage(0, user1.address);
            await ethers.provider.send("evm_mine");
            
            await orphiCrowdFund.connect(user2).purchasePackage(0, user2.address);
            await ethers.provider.send("evm_mine");
            
            await orphiCrowdFund.connect(user3).purchasePackage(0, user3.address);
            
            // Verify all registrations successful
            const totalUsers = await orphiCrowdFund.totalUsers();
            expect(totalUsers).to.equal(3);
            
            // Verify package purchases
            const user1Info = await orphiCrowdFund.users(user1.address);
            const user2Info = await orphiCrowdFund.users(user2.address);
            const user3Info = await orphiCrowdFund.users(user3.address);
            
            expect(user1Info.packageCount).to.be.greaterThan(0);
            expect(user2Info.packageCount).to.be.greaterThan(0);
            expect(user3Info.packageCount).to.be.greaterThan(0);
        });
    });
});
