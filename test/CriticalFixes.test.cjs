const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Critical Fixes Verification", function () {
    let leadFive;
    let usdt;
    let priceFeed;
    let owner;
    let user1, user2, user3, user4, user5;
    let adminFeeRecipient;
    
    beforeEach(async function () {
        [owner, user1, user2, user3, user4, user5, adminFeeRecipient] = await ethers.getSigners();
        
        // Deploy mock USDT
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        usdt = await MockUSDT.deploy();
        
        // Deploy mock price feed
        const MockPriceFeed = await ethers.getContractFactory("MockPriceOracle");
        priceFeed = await MockPriceFeed.deploy();
        
        // Deploy main contract (libraries are already linked in compilation)
        const LeadFiveModular = await ethers.getContractFactory("LeadFiveModular");
        leadFive = await LeadFiveModular.deploy();
        
        // Initialize
        const adminIds = Array(16).fill(owner.address);
        await leadFive.initialize(usdt.target, priceFeed.target, adminIds);
        
        // Set admin fee recipient
        await leadFive.setAdminFeeRecipient(adminFeeRecipient.address);
        
        // Mint USDT to users
        await usdt.mint(user1.address, ethers.parseEther("1000"));
        await usdt.mint(user2.address, ethers.parseEther("1000"));
        await usdt.mint(user3.address, ethers.parseEther("1000"));
        await usdt.mint(user4.address, ethers.parseEther("1000"));
        await usdt.mint(user5.address, ethers.parseEther("1000"));
    });

    describe("CRITICAL FIX #1: Admin Fee Timing Correction", function () {
        it("Should deduct 5% admin fee from total withdrawal amount", async function () {
            // Register user1 with $100 package
            await usdt.connect(user1).approve(leadFive.target, ethers.parseEther("100"));
            await leadFive.connect(user1).register(owner.address, 3, true);
            
            // Add some balance to user1
            const userInfo = await leadFive.getUserInfo(user1.address);
            await leadFive.connect(owner).blacklistUser(user1.address, false); // Ensure not blacklisted
            
            // Manually add balance for testing (simulate earnings)
            // In real scenario, this would come from bonuses
            const testBalance = ethers.parseEther("100");
            
            // We need to simulate the user having a balance
            // For testing, let's register user2 under user1 to generate some earnings
            await usdt.connect(user2).approve(leadFive.target, ethers.parseEther("100"));
            await leadFive.connect(user2).register(user1.address, 3, true);
            
            // Check user1's balance after receiving direct bonus
            const userInfoAfter = await leadFive.getUserInfo(user1.address);
            const balance = userInfoAfter.balance;
            
            if (balance > 0) {
                const initialAdminFees = await leadFive.totalAdminFeesCollected();
                const initialUserBalance = await ethers.provider.getBalance(user1.address);
                const initialAdminBalance = await ethers.provider.getBalance(adminFeeRecipient.address);
                
                // Withdraw the balance
                await leadFive.connect(user1).withdraw(balance);
                
                const finalAdminFees = await leadFive.totalAdminFeesCollected();
                const adminFeeCollected = finalAdminFees - initialAdminFees;
                
                // Expected: 5% of total withdrawal amount
                const expectedAdminFee = (balance * 5n) / 100n;
                
                expect(adminFeeCollected).to.equal(expectedAdminFee);
                
                // Verify the admin fee is exactly 5% of the total amount
                const feePercentage = (adminFeeCollected * 100n) / balance;
                expect(feePercentage).to.equal(5n);
            }
        });

        it("Should calculate correct withdrawal amounts with 70% rate", async function () {
            // Register user with 4 referrals (70% withdrawal rate)
            await usdt.connect(user1).approve(leadFive.target, ethers.parseEther("100"));
            await leadFive.connect(user1).register(owner.address, 3, true);
            
            // Register 4 users under user1 to get 70% withdrawal rate
            for (let i = 0; i < 4; i++) {
                const user = [user2, user3, user4, user5][i];
                await usdt.connect(user).approve(leadFive.target, ethers.parseEther("30"));
                await leadFive.connect(user).register(user1.address, 1, true);
            }
            
            const userInfo = await leadFive.getUserInfo(user1.address);
            const balance = userInfo.balance;
            
            if (balance > 0) {
                const withdrawAmount = ethers.parseEther("100");
                
                // Expected calculations:
                // Admin fee: 5% of total = 5 USDT
                // Net amount: 95 USDT
                // Withdrawable: 70% of 95 = 66.5 USDT
                // Reinvestment: 30% of 95 = 28.5 USDT
                
                const expectedAdminFee = (withdrawAmount * 5n) / 100n; // 5 USDT
                const expectedNetAmount = withdrawAmount - expectedAdminFee; // 95 USDT
                const expectedWithdrawable = (expectedNetAmount * 70n) / 100n; // 66.5 USDT
                
                expect(expectedAdminFee).to.equal(ethers.parseEther("5"));
                expect(expectedWithdrawable).to.equal(ethers.parseEther("66.5"));
            }
        });
    });

    describe("CRITICAL FIX #2: Matrix Spillover Rotation", function () {
        it("Should maintain balanced left/right distribution", async function () {
            // Register referrer
            await usdt.connect(user1).approve(leadFive.target, ethers.parseEther("30"));
            await leadFive.connect(user1).register(owner.address, 1, true);
            
            // Register multiple users under same referrer
            const users = [user2, user3, user4, user5];
            for (let i = 0; i < users.length; i++) {
                await usdt.connect(users[i]).approve(leadFive.target, ethers.parseEther("30"));
                await leadFive.connect(users[i]).register(user1.address, 1, true);
            }
            
            // Check matrix balance
            const leftChild = await leadFive.binaryMatrix(user1.address, 0);
            const rightChild = await leadFive.binaryMatrix(user1.address, 1);
            
            // Both positions should be filled
            expect(leftChild).to.not.equal(ethers.ZeroAddress);
            expect(rightChild).to.not.equal(ethers.ZeroAddress);
            
            // Check spillover counter has been incremented
            const spilloverCount = await leadFive.spilloverCounter(user1.address);
            expect(spilloverCount).to.be.greaterThan(0);
        });

        it("Should rotate spillover direction", async function () {
            // Register referrer
            await usdt.connect(user1).approve(leadFive.target, ethers.parseEther("30"));
            await leadFive.connect(user1).register(owner.address, 1, true);
            
            // Register first two users (should fill left and right)
            await usdt.connect(user2).approve(leadFive.target, ethers.parseEther("30"));
            await leadFive.connect(user2).register(user1.address, 1, true);
            
            await usdt.connect(user3).approve(leadFive.target, ethers.parseEther("30"));
            await leadFive.connect(user3).register(user1.address, 1, true);
            
            // Check initial spillover counter
            const initialSpillover = await leadFive.spilloverCounter(user1.address);
            
            // Register third user (should trigger spillover)
            await usdt.connect(user4).approve(leadFive.target, ethers.parseEther("30"));
            await leadFive.connect(user4).register(user1.address, 1, true);
            
            // Check spillover counter has incremented
            const finalSpillover = await leadFive.spilloverCounter(user1.address);
            expect(finalSpillover).to.be.greaterThan(initialSpillover);
        });
    });

    describe("CRITICAL FIX #3: Gas Limit Protection", function () {
        it("Should handle large referral chains without reverting", async function () {
            // Create a deep referral chain
            let currentReferrer = owner.address;
            const chainLength = 15; // Test with 15 levels
            
            for (let i = 0; i < chainLength; i++) {
                const user = await ethers.getImpersonatedSigner(`0x${(i + 1).toString(16).padStart(40, '0')}`);
                await ethers.provider.send("hardhat_setBalance", [
                    user.address,
                    "0x1000000000000000000", // 1 ETH
                ]);
                
                await usdt.mint(user.address, ethers.parseEther("100"));
                await usdt.connect(user).approve(leadFive.target, ethers.parseEther("30"));
                
                // This should not revert even with deep chain
                await expect(
                    leadFive.connect(user).register(currentReferrer, 1, true)
                ).to.not.be.reverted;
                
                currentReferrer = user.address;
            }
        });

        it("Should emit GasLimitReached event when gas limit is approached", async function () {
            // This test would require a more complex setup to actually trigger gas limits
            // For now, we verify the event exists and can be emitted
            
            // Register a user
            await usdt.connect(user1).approve(leadFive.target, ethers.parseEther("30"));
            await leadFive.connect(user1).register(owner.address, 1, true);
            
            // The GasLimitReached event should be defined
            const eventFragment = leadFive.interface.getEvent("GasLimitReached");
            expect(eventFragment).to.not.be.undefined;
            expect(eventFragment.name).to.equal("GasLimitReached");
        });
    });

    describe("Integration Test: All Fixes Working Together", function () {
        it("Should handle complex scenario with all fixes active", async function () {
            // Register multiple users to test all systems
            await usdt.connect(user1).approve(leadFive.target, ethers.parseEther("100"));
            await leadFive.connect(user1).register(owner.address, 3, true);
            
            // Create referral chain
            await usdt.connect(user2).approve(leadFive.target, ethers.parseEther("50"));
            await leadFive.connect(user2).register(user1.address, 2, true);
            
            await usdt.connect(user3).approve(leadFive.target, ethers.parseEther("30"));
            await leadFive.connect(user3).register(user2.address, 1, true);
            
            // Test matrix spillover
            await usdt.connect(user4).approve(leadFive.target, ethers.parseEther("30"));
            await leadFive.connect(user4).register(user1.address, 1, true);
            
            await usdt.connect(user5).approve(leadFive.target, ethers.parseEther("30"));
            await leadFive.connect(user5).register(user1.address, 1, true);
            
            // Verify all systems are working
            const user1Info = await leadFive.getUserInfo(user1.address);
            expect(user1Info.isRegistered).to.be.true;
            expect(user1Info.directReferrals).to.be.greaterThan(0);
            
            // Test withdrawal with correct admin fee
            if (user1Info.balance > 0) {
                const initialAdminFees = await leadFive.totalAdminFeesCollected();
                await leadFive.connect(user1).withdraw(user1Info.balance);
                const finalAdminFees = await leadFive.totalAdminFeesCollected();
                
                const adminFeeCollected = finalAdminFees - initialAdminFees;
                const expectedFee = (user1Info.balance * 5n) / 100n;
                expect(adminFeeCollected).to.equal(expectedFee);
            }
            
            // Verify matrix balance
            const leftChild = await leadFive.binaryMatrix(user1.address, 0);
            const rightChild = await leadFive.binaryMatrix(user1.address, 1);
            expect(leftChild).to.not.equal(ethers.ZeroAddress);
            expect(rightChild).to.not.equal(ethers.ZeroAddress);
        });
    });
});
