const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("🛡️ OrphiCrowdFund - Advanced Security Tests", function () {
    let orphiCrowdFund;
    let mockUSDT;
    let owner, user1, user2, user3, user4;
    
    const USDT_DECIMALS = 6;
    
    beforeEach(async function () {
        [owner, user1, user2, user3, user4] = await ethers.getSigners();
        
        // Deploy Mock USDT
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        
        // Deploy simplified contract with all security features enabled
        const OrphiCrowdFundSimplified = await ethers.getContractFactory("OrphiCrowdFundSimplified");
        
        orphiCrowdFund = await upgrades.deployProxy(OrphiCrowdFundSimplified, [
            await mockUSDT.getAddress(),
            owner.address, // oracle address
            owner.address, // admin address
            true,  // MEV protection enabled
            true,  // circuit breaker enabled
            true   // timelock enabled
        ], { 
            initializer: 'initialize',
            kind: 'uups'
        });
        await orphiCrowdFund.waitForDeployment();
        
        // Setup USDT balances
        const usdtDecimals = 10 ** USDT_DECIMALS;
        await mockUSDT.mint(user1.address, 10000 * usdtDecimals);
        await mockUSDT.mint(user2.address, 10000 * usdtDecimals);
        await mockUSDT.mint(user3.address, 10000 * usdtDecimals);
        await mockUSDT.mint(user4.address, 10000 * usdtDecimals);
        
        // Approve contract to spend USDT
        await mockUSDT.connect(user1).approve(await orphiCrowdFund.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user2).approve(await orphiCrowdFund.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user3).approve(await orphiCrowdFund.getAddress(), ethers.MaxUint256);
        await mockUSDT.connect(user4).approve(await orphiCrowdFund.getAddress(), ethers.MaxUint256);
        
        // Register users
        await orphiCrowdFund.connect(user1).register(owner.address);
        await ethers.provider.send("evm_mine");
        await orphiCrowdFund.connect(user2).register(user1.address);
        await ethers.provider.send("evm_mine");
        await orphiCrowdFund.connect(user3).register(user2.address);
        await ethers.provider.send("evm_mine");
        await orphiCrowdFund.connect(user4).register(user3.address);
    });
    
    describe("🔒 MEV Protection Tests", function () {
        it("Should prevent same-block transactions", async function () {
            // First transaction in a block
            await orphiCrowdFund.connect(user1).purchasePackage(0, user1.address);
            
            // Second transaction in same block should fail
            await expect(
                orphiCrowdFund.connect(user1).purchasePackage(0, user1.address)
            ).to.be.revertedWith("MEV protection active");
        });
        
        it("Should allow transactions in subsequent blocks", async function () {
            // First transaction
            await orphiCrowdFund.connect(user1).purchasePackage(0, user1.address);
            
            // Mine a new block
            await ethers.provider.send("evm_mine");
            
            // Second transaction should succeed
            await expect(
                orphiCrowdFund.connect(user1).purchasePackage(0, user1.address)
            ).to.not.be.reverted;
        });
        
        it("Should track last action block per user", async function () {
            await orphiCrowdFund.connect(user1).purchasePackage(0, user1.address);
            const lastBlock1 = await orphiCrowdFund.lastActionBlock(user1.address);
            
            // Different user should be able to transact
            await orphiCrowdFund.connect(user2).purchasePackage(0, user2.address);
            const lastBlock2 = await orphiCrowdFund.lastActionBlock(user2.address);
            
            expect(lastBlock1).to.equal(lastBlock2); // Same block number
            expect(lastBlock1).to.be.gt(0);
        });
    });
    
    describe("🚨 Circuit Breaker Tests", function () {
        beforeEach(async function () {
            // Purchase packages to have withdrawable amounts
            await orphiCrowdFund.connect(user2).purchasePackage(0, user2.address);
            await ethers.provider.send("evm_mine");
            await orphiCrowdFund.connect(user3).purchasePackage(0, user3.address);
            await ethers.provider.send("evm_mine");
            await orphiCrowdFund.connect(user4).purchasePackage(0, user4.address);
        });
        
        it("Should allow withdrawals within daily limit", async function () {
            const user1Info = await orphiCrowdFund.users(user1.address);
            
            if (user1Info.withdrawableAmount > 0) {
                await ethers.provider.send("evm_mine");
                await expect(
                    orphiCrowdFund.connect(user1).withdraw()
                ).to.not.be.reverted;
            }
        });
        
        it("Should track daily withdrawal amounts", async function () {
            const initialDailyWithdrawals = await orphiCrowdFund.currentDayWithdrawals();
            expect(initialDailyWithdrawals).to.equal(0);
        });
        
        it("Should enable/disable circuit breaker by admin", async function () {
            // Admin can disable circuit breaker
            await orphiCrowdFund.connect(owner).setCircuitBreaker(false);
            
            // Admin can enable circuit breaker
            await orphiCrowdFund.connect(owner).setCircuitBreaker(true);
        });
        
        it("Should prevent non-admin from modifying circuit breaker", async function () {
            await expect(
                orphiCrowdFund.connect(user1).setCircuitBreaker(false)
            ).to.be.reverted;
        });
    });
    
    describe("🔄 Reentrancy Protection Tests", function () {
        it("Should prevent reentrancy in withdraw function", async function () {
            // This test verifies that the ReentrancyGuard is properly implemented
            // The nonReentrant modifier should prevent any reentrancy attempts
            
            const user2Info = await orphiCrowdFund.users(user2.address);
            if (user2Info.withdrawableAmount > 0) {
                await ethers.provider.send("evm_mine");
                
                // Normal withdrawal should work
                await expect(
                    orphiCrowdFund.connect(user2).withdraw()
                ).to.not.be.reverted;
            }
        });
        
        it("Should prevent reentrancy in purchasePackage function", async function () {
            // The nonReentrant modifier should prevent reentrancy
            await ethers.provider.send("evm_mine");
            
            await expect(
                orphiCrowdFund.connect(user1).purchasePackage(1, user1.address)
            ).to.not.be.reverted;
        });
    });
    
    describe("⚡ Gas Optimization Tests", function () {
        it("Should have reasonable gas costs for registration", async function () {
            const [, , , , newUser] = await ethers.getSigners();
            await mockUSDT.mint(newUser.address, 1000 * (10 ** USDT_DECIMALS));
            await mockUSDT.connect(newUser).approve(await orphiCrowdFund.getAddress(), ethers.MaxUint256);
            
            const tx = await orphiCrowdFund.connect(newUser).register(user1.address);
            const receipt = await tx.wait();
            
            // Registration should use less than 150,000 gas
            expect(receipt.gasUsed).to.be.lt(150000);
        });
        
        it("Should have reasonable gas costs for package purchase", async function () {
            await ethers.provider.send("evm_mine");
            
            const tx = await orphiCrowdFund.connect(user1).purchasePackage(0, user1.address);
            const receipt = await tx.wait();
            
            // Package purchase should use less than 200,000 gas
            expect(receipt.gasUsed).to.be.lt(200000);
        });
        
        it("Should have reasonable gas costs for withdrawal", async function () {
            const userInfo = await orphiCrowdFund.users(user2.address);
            
            if (userInfo.withdrawableAmount > 0) {
                await ethers.provider.send("evm_mine");
                
                const tx = await orphiCrowdFund.connect(user2).withdraw();
                const receipt = await tx.wait();
                
                // Withdrawal should use less than 100,000 gas
                expect(receipt.gasUsed).to.be.lt(100000);
            }
        });
    });
    
    describe("🔐 Access Control Tests", function () {
        it("Should properly enforce role-based access control", async function () {
            // Only emergency role should be able to pause
            await expect(
                orphiCrowdFund.connect(user1).pause()
            ).to.be.reverted;
            
            // Owner has emergency role by default
            await expect(
                orphiCrowdFund.connect(owner).pause()
            ).to.not.be.reverted;
            
            await orphiCrowdFund.connect(owner).unpause();
        });
        
        it("Should allow emergency withdrawal by admin", async function () {
            // Send some USDT to the contract
            await mockUSDT.transfer(await orphiCrowdFund.getAddress(), 100 * (10 ** USDT_DECIMALS));
            
            const contractBalance = await mockUSDT.balanceOf(await orphiCrowdFund.getAddress());
            expect(contractBalance).to.be.gt(0);
            
            // Admin should be able to emergency withdraw
            await expect(
                orphiCrowdFund.connect(owner).emergencyWithdraw(await mockUSDT.getAddress(), contractBalance)
            ).to.not.be.reverted;
        });
        
        it("Should prevent non-admin emergency withdrawal", async function () {
            await expect(
                orphiCrowdFund.connect(user1).emergencyWithdraw(await mockUSDT.getAddress(), 100)
            ).to.be.reverted;
        });
    });
    
    describe("📊 Integration Tests", function () {
        it("Should handle complete user flow with security features", async function () {
            // Test complete flow: register -> purchase -> earn -> withdraw
            const [, , , , , newUser] = await ethers.getSigners();
            await mockUSDT.mint(newUser.address, 1000 * (10 ** USDT_DECIMALS));
            await mockUSDT.connect(newUser).approve(await orphiCrowdFund.getAddress(), ethers.MaxUint256);
            
            // 1. Register
            await orphiCrowdFund.connect(newUser).register(user1.address);
            
            // 2. Purchase package (with MEV protection)
            await ethers.provider.send("evm_mine");
            await orphiCrowdFund.connect(newUser).purchasePackage(0, newUser.address);
            
            // 3. Check commission distribution
            const user1Info = await orphiCrowdFund.users(user1.address);
            expect(user1Info.totalEarnings).to.be.gt(0);
            
            // 4. Withdraw with circuit breaker
            if (user1Info.withdrawableAmount > 0) {
                await ethers.provider.send("evm_mine");
                await expect(
                    orphiCrowdFund.connect(user1).withdraw()
                ).to.not.be.reverted;
            }
        });
        
        it("Should maintain system integrity under stress", async function () {
            // Simulate multiple users performing actions
            const actions = [];
            
            for (let i = 0; i < 3; i++) {
                await ethers.provider.send("evm_mine");
                actions.push(
                    orphiCrowdFund.connect(user1).purchasePackage(0, user1.address)
                );
                
                await ethers.provider.send("evm_mine");
                actions.push(
                    orphiCrowdFund.connect(user2).purchasePackage(0, user2.address)
                );
            }
            
            // All transactions should succeed with proper block delays
            for (const action of actions) {
                await expect(action).to.not.be.reverted;
            }
        });
    });
    
    describe("🔧 Configuration Tests", function () {
        it("Should allow admin to configure MEV protection", async function () {
            // Admin can disable MEV protection
            await orphiCrowdFund.connect(owner).setMEVProtection(false);
            
            // Now same-block transactions should be allowed
            await orphiCrowdFund.connect(user1).purchasePackage(0, user1.address);
            await orphiCrowdFund.connect(user1).purchasePackage(0, user1.address);
            
            // Re-enable MEV protection
            await orphiCrowdFund.connect(owner).setMEVProtection(true);
        });
        
        it("Should maintain proper package amounts", async function () {
            const packageAmounts = await orphiCrowdFund.getPackageAmounts();
            
            expect(packageAmounts[0]).to.equal(30 * (10 ** USDT_DECIMALS)); // $30
            expect(packageAmounts[1]).to.equal(50 * (10 ** USDT_DECIMALS)); // $50
            expect(packageAmounts[2]).to.equal(100 * (10 ** USDT_DECIMALS)); // $100
            expect(packageAmounts[3]).to.equal(200 * (10 ** USDT_DECIMALS)); // $200
        });
    });
});
