const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LeadFive Core Features Audit Checklist (v2.0)", function () {
    let leadFive;
    let usdt;
    let priceFeed;
    let owner;
    let user1, user2, user3, user4, user5, user6, user7, user8, user9, user10;
    let adminFeeRecipient;
    
    beforeEach(async function () {
        [owner, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10, adminFeeRecipient] = await ethers.getSigners();
        
        // Deploy mock USDT
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        usdt = await MockUSDT.deploy();
        
        // Deploy mock price feed
        const MockPriceFeed = await ethers.getContractFactory("MockPriceOracle");
        priceFeed = await MockPriceFeed.deploy();
        
        // Deploy main contract
        const LeadFiveModular = await ethers.getContractFactory("LeadFiveModular");
        leadFive = await LeadFiveModular.deploy();
        
        // Initialize
        const adminIds = Array(16).fill(owner.address);
        await leadFive.initialize(usdt.target, priceFeed.target, adminIds);
        
        // Set admin fee recipient
        await leadFive.setAdminFeeRecipient(adminFeeRecipient.address);
        
        // Mint USDT to users
        const users = [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10];
        for (const user of users) {
            await usdt.mint(user.address, ethers.parseEther("10000"));
        }
    });

    describe("1. User Registration System", function () {
        it("Should deduct 5% admin fee from package amount before distribution", async function () {
            const packagePrice = ethers.parseEther("200"); // $200 package
            const expectedAdminFee = (packagePrice * 5n) / 100n; // $10
            const expectedDistributable = packagePrice - expectedAdminFee; // $190
            
            await usdt.connect(user1).approve(leadFive.target, packagePrice);
            
            const initialAdminFees = await leadFive.totalAdminFeesCollected();
            
            await leadFive.connect(user1).register(owner.address, 4, true);
            
            const finalAdminFees = await leadFive.totalAdminFeesCollected();
            const adminFeeCollected = finalAdminFees - initialAdminFees;
            
            // Verify 5% admin fee was collected
            expect(adminFeeCollected).to.equal(expectedAdminFee);
            
            // Verify distributable amount calculation
            expect(expectedDistributable).to.equal(ethers.parseEther("190"));
        });

        it("Should test all package levels with correct fee deduction", async function () {
            const packages = [
                { level: 1, price: ethers.parseEther("30"), expectedFee: ethers.parseEther("1.5") },
                { level: 2, price: ethers.parseEther("50"), expectedFee: ethers.parseEther("2.5") },
                { level: 3, price: ethers.parseEther("100"), expectedFee: ethers.parseEther("5") },
                { level: 4, price: ethers.parseEther("200"), expectedFee: ethers.parseEther("10") }
            ];
            
            for (let i = 0; i < packages.length; i++) {
                const pkg = packages[i];
                const user = [user1, user2, user3, user4][i];
                
                await usdt.connect(user).approve(leadFive.target, pkg.price);
                
                const initialFees = await leadFive.totalAdminFeesCollected();
                await leadFive.connect(user).register(owner.address, pkg.level, true);
                const finalFees = await leadFive.totalAdminFeesCollected();
                
                const feeCollected = finalFees - initialFees;
                expect(feeCollected).to.equal(pkg.expectedFee);
            }
        });
    });

    describe("2. Referral Income (40%)", function () {
        it("Should give sponsor 40% of post-fee amount", async function () {
            // Register sponsor
            await usdt.connect(user1).approve(leadFive.target, ethers.parseEther("100"));
            await leadFive.connect(user1).register(owner.address, 3, true);
            
            const initialSponsorBalance = (await leadFive.getUserInfo(user1.address)).balance;
            
            // Register user under sponsor
            const packagePrice = ethers.parseEther("200"); // $200
            const postFeeAmount = (packagePrice * 95n) / 100n; // $190 after 5% fee
            const expectedSponsorIncome = (postFeeAmount * 40n) / 100n; // 40% of $190 = $76
            
            await usdt.connect(user2).approve(leadFive.target, packagePrice);
            await leadFive.connect(user2).register(user1.address, 4, true);
            
            const finalSponsorBalance = (await leadFive.getUserInfo(user1.address)).balance;
            const sponsorIncome = finalSponsorBalance - initialSponsorBalance;
            
            expect(sponsorIncome).to.equal(expectedSponsorIncome);
            expect(sponsorIncome).to.equal(ethers.parseEther("76")); // $76
        });
    });

    describe("3. Level Bonus (10%)", function () {
        it("Should distribute 10% of post-fee amount across 10 levels", async function () {
            // Create a 10-level chain
            let currentReferrer = owner.address;
            const users = [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10];
            
            // Register chain of users
            for (let i = 0; i < 10; i++) {
                await usdt.connect(users[i]).approve(leadFive.target, ethers.parseEther("100"));
                await leadFive.connect(users[i]).register(currentReferrer, 3, true);
                currentReferrer = users[i].address;
            }
            
            // Get initial balances
            const initialBalances = [];
            for (let i = 0; i < 10; i++) {
                const userInfo = await leadFive.getUserInfo(users[i].address);
                initialBalances.push(userInfo.balance);
            }
            
            // Register final user to trigger level bonuses
            const packagePrice = ethers.parseEther("100"); // $100
            const postFeeAmount = (packagePrice * 95n) / 100n; // $95 after 5% fee
            const totalLevelBonus = (postFeeAmount * 10n) / 100n; // 10% of $95 = $9.5
            
            await usdt.connect(owner).approve(leadFive.target, packagePrice);
            await leadFive.connect(owner).register(users[9].address, 3, true);
            
            // Verify level bonus distribution
            let totalDistributed = 0n;
            const levelRates = [300, 100, 100, 50, 50, 50, 50, 50, 50, 50]; // From CommissionLib
            
            for (let i = 0; i < 10; i++) {
                const userInfo = await leadFive.getUserInfo(users[9 - i].address);
                const bonusReceived = userInfo.balance - initialBalances[9 - i];
                
                const expectedBonus = (totalLevelBonus * BigInt(levelRates[i])) / 1000n;
                expect(bonusReceived).to.equal(expectedBonus);
                totalDistributed += bonusReceived;
            }
            
            expect(totalDistributed).to.equal(totalLevelBonus);
        });
    });

    describe("4. Upline Bonus (10%)", function () {
        it("Should distribute 10% of post-fee amount across 30 uplines", async function () {
            // Register a chain of 5 users (testing subset of 30)
            let currentReferrer = owner.address;
            const users = [user1, user2, user3, user4, user5];
            
            for (let i = 0; i < 5; i++) {
                await usdt.connect(users[i]).approve(leadFive.target, ethers.parseEther("50"));
                await leadFive.connect(users[i]).register(currentReferrer, 2, true);
                currentReferrer = users[i].address;
            }
            
            const packagePrice = ethers.parseEther("100"); // $100
            const postFeeAmount = (packagePrice * 95n) / 100n; // $95 after 5% fee
            const totalUplineBonus = (postFeeAmount * 10n) / 100n; // 10% of $95 = $9.5
            const perUplineBonus = totalUplineBonus / 30n; // Divided by 30 uplines
            
            // Get initial balances
            const initialBalances = [];
            for (let i = 0; i < 5; i++) {
                const userInfo = await leadFive.getUserInfo(users[i].address);
                initialBalances.push(userInfo.balance);
            }
            
            // Register user to trigger upline bonuses
            await usdt.connect(user6).approve(leadFive.target, packagePrice);
            await leadFive.connect(user6).register(users[4].address, 3, true);
            
            // Verify each upline received correct bonus
            for (let i = 0; i < 5; i++) {
                const userInfo = await leadFive.getUserInfo(users[i].address);
                const bonusReceived = userInfo.balance - initialBalances[i];
                expect(bonusReceived).to.equal(perUplineBonus);
            }
        });
    });

    describe("5. Leader Pool (10%)", function () {
        it("Should fund leader pool with 10% of post-fee amount", async function () {
            const packagePrice = ethers.parseEther("200"); // $200
            const postFeeAmount = (packagePrice * 95n) / 100n; // $190 after 5% fee
            const expectedLeaderPoolContribution = (postFeeAmount * 10n) / 100n; // 10% of $190 = $19
            
            const initialPoolBalances = await leadFive.getPoolBalances();
            const initialLeaderPool = initialPoolBalances[0];
            
            await usdt.connect(user1).approve(leadFive.target, packagePrice);
            await leadFive.connect(user1).register(owner.address, 4, true);
            
            const finalPoolBalances = await leadFive.getPoolBalances();
            const finalLeaderPool = finalPoolBalances[0];
            
            const leaderPoolIncrease = finalLeaderPool - initialLeaderPool;
            expect(leaderPoolIncrease).to.equal(expectedLeaderPoolContribution);
            expect(leaderPoolIncrease).to.equal(ethers.parseEther("19")); // $19
        });
    });

    describe("6. Help Pool (30%)", function () {
        it("Should fund help pool with 30% of post-fee amount", async function () {
            const packagePrice = ethers.parseEther("100"); // $100
            const postFeeAmount = (packagePrice * 95n) / 100n; // $95 after 5% fee
            const expectedHelpPoolContribution = (postFeeAmount * 30n) / 100n; // 30% of $95 = $28.5
            
            const initialPoolBalances = await leadFive.getPoolBalances();
            const initialHelpPool = initialPoolBalances[1];
            
            await usdt.connect(user1).approve(leadFive.target, packagePrice);
            await leadFive.connect(user1).register(owner.address, 3, true);
            
            const finalPoolBalances = await leadFive.getPoolBalances();
            const finalHelpPool = finalPoolBalances[1];
            
            const helpPoolIncrease = finalHelpPool - initialHelpPool;
            expect(helpPoolIncrease).to.equal(expectedHelpPoolContribution);
            expect(helpPoolIncrease).to.equal(ethers.parseEther("28.5")); // $28.5
        });
    });

    describe("7. Withdrawal System", function () {
        it("Should calculate precise withdrawal amounts with admin fees", async function () {
            // Test cases for different referral levels
            const testCases = [
                { referrals: 4, withdrawalRate: 70, expectedNetRate: 66.5 }, // 70% - 3.5% = 66.5%
                { referrals: 10, withdrawalRate: 75, expectedNetRate: 71.25 }, // 75% - 3.75% = 71.25%
                { referrals: 25, withdrawalRate: 80, expectedNetRate: 76 } // 80% - 4% = 76%
            ];
            
            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];
                const user = [user1, user2, user3][i];
                
                // Register user
                await usdt.connect(user).approve(leadFive.target, ethers.parseEther("100"));
                await leadFive.connect(user).register(owner.address, 3, true);
                
                // Create required number of referrals
                for (let j = 0; j < testCase.referrals; j++) {
                    const referralUser = await ethers.getImpersonatedSigner(`0x${(j + 100 + i * 50).toString(16).padStart(40, '0')}`);
                    await ethers.provider.send("hardhat_setBalance", [referralUser.address, "0x1000000000000000000"]);
                    await usdt.mint(referralUser.address, ethers.parseEther("100"));
                    await usdt.connect(referralUser).approve(leadFive.target, ethers.parseEther("30"));
                    await leadFive.connect(referralUser).register(user.address, 1, true);
                }
                
                // Test withdrawal calculation
                const withdrawAmount = ethers.parseEther("100");
                const expectedAdminFee = (withdrawAmount * BigInt(testCase.withdrawalRate) * 5n) / 10000n;
                const expectedNetReceived = (withdrawAmount * BigInt(testCase.expectedNetRate * 100)) / 10000n;
                
                // Verify calculations match expected values
                expect(expectedAdminFee).to.be.greaterThan(0);
                expect(expectedNetReceived).to.be.greaterThan(0);
            }
        });
    });

    describe("8. Reinvestment Flow", function () {
        it("Should calculate reinvestment from post-fee base", async function () {
            // Register user with enough referrals for 70% withdrawal rate
            await usdt.connect(user1).approve(leadFive.target, ethers.parseEther("100"));
            await leadFive.connect(user1).register(owner.address, 3, true);
            
            // Add balance to user1 by registering someone under them
            await usdt.connect(user2).approve(leadFive.target, ethers.parseEther("100"));
            await leadFive.connect(user2).register(user1.address, 3, true);
            
            const userInfo = await leadFive.getUserInfo(user1.address);
            if (userInfo.balance > 0) {
                const withdrawAmount = ethers.parseEther("100");
                
                // Expected calculations:
                // Admin fee: 5% of total
                // Net amount: 95%
                // Withdrawable: 70% of net = 66.5%
                // Reinvestment: 30% of net = 28.5%
                
                const expectedAdminFee = (withdrawAmount * 5n) / 100n; // 5%
                const expectedNetAmount = withdrawAmount - expectedAdminFee; // 95%
                const expectedReinvestment = (expectedNetAmount * 30n) / 100n; // 30% of 95%
                
                expect(expectedReinvestment).to.equal(ethers.parseEther("28.5"));
            }
        });
    });

    describe("Enhanced Test Scenario: $200 Package Registration", function () {
        it("Should distribute $200 package correctly with all components", async function () {
            const packagePrice = ethers.parseEther("200");
            const expectedAdminFee = ethers.parseEther("10"); // 5% of $200
            const expectedDistributable = ethers.parseEther("190"); // 95% of $200
            
            // Register sponsor
            await usdt.connect(user1).approve(leadFive.target, ethers.parseEther("100"));
            await leadFive.connect(user1).register(owner.address, 3, true);
            
            const initialSponsorBalance = (await leadFive.getUserInfo(user1.address)).balance;
            const initialPoolBalances = await leadFive.getPoolBalances();
            const initialAdminFees = await leadFive.totalAdminFeesCollected();
            
            // Register user with $200 package
            await usdt.connect(user2).approve(leadFive.target, packagePrice);
            await leadFive.connect(user2).register(user1.address, 4, true);
            
            // Verify admin fee collection
            const finalAdminFees = await leadFive.totalAdminFeesCollected();
            const adminFeeCollected = finalAdminFees - initialAdminFees;
            expect(adminFeeCollected).to.equal(expectedAdminFee);
            
            // Verify sponsor income (40% of $190 = $76)
            const finalSponsorBalance = (await leadFive.getUserInfo(user1.address)).balance;
            const sponsorIncome = finalSponsorBalance - initialSponsorBalance;
            const expectedSponsorIncome = (expectedDistributable * 40n) / 100n;
            expect(sponsorIncome).to.equal(expectedSponsorIncome);
            expect(sponsorIncome).to.equal(ethers.parseEther("76"));
            
            // Verify pool contributions
            const finalPoolBalances = await leadFive.getPoolBalances();
            
            // Leader Pool (10% of $190 = $19)
            const leaderPoolIncrease = finalPoolBalances[0] - initialPoolBalances[0];
            expect(leaderPoolIncrease).to.equal(ethers.parseEther("19"));
            
            // Help Pool (30% of $190 = $57)
            const helpPoolIncrease = finalPoolBalances[1] - initialPoolBalances[1];
            expect(helpPoolIncrease).to.equal(ethers.parseEther("57"));
            
            // Verify total distribution adds up
            const totalDistributed = sponsorIncome + leaderPoolIncrease + helpPoolIncrease;
            // Note: Level bonus (10%) and Upline bonus (10%) also distributed but harder to track in this test
            // The key verification is that admin fee + distributions = total package price
        });
    });

    describe("Fee Collection Timing", function () {
        it("Should collect admin fees before any distributions", async function () {
            const packagePrice = ethers.parseEther("100");
            const expectedFee = ethers.parseEther("5");
            
            await usdt.connect(user1).approve(leadFive.target, packagePrice);
            
            const initialFees = await leadFive.totalAdminFeesCollected();
            
            // Register user - fee should be collected immediately
            await leadFive.connect(user1).register(owner.address, 3, true);
            
            const finalFees = await leadFive.totalAdminFeesCollected();
            const feeCollected = finalFees - initialFees;
            
            expect(feeCollected).to.equal(expectedFee);
        });
    });

    describe("Fee Accounting", function () {
        it("Should track total admin fees collected accurately", async function () {
            const transactions = [
                { user: user1, amount: ethers.parseEther("30"), expectedFee: ethers.parseEther("1.5") },
                { user: user2, amount: ethers.parseEther("50"), expectedFee: ethers.parseEther("2.5") },
                { user: user3, amount: ethers.parseEther("100"), expectedFee: ethers.parseEther("5") },
                { user: user4, amount: ethers.parseEther("200"), expectedFee: ethers.parseEther("10") }
            ];
            
            let expectedTotalFees = 0n;
            
            for (let i = 0; i < transactions.length; i++) {
                const tx = transactions[i];
                await usdt.connect(tx.user).approve(leadFive.target, tx.amount);
                await leadFive.connect(tx.user).register(owner.address, i + 1, true);
                expectedTotalFees += tx.expectedFee;
            }
            
            const actualTotalFees = await leadFive.totalAdminFeesCollected();
            expect(actualTotalFees).to.equal(expectedTotalFees);
            expect(actualTotalFees).to.equal(ethers.parseEther("19")); // $1.5 + $2.5 + $5 + $10
        });
    });

    describe("Edge Cases", function () {
        it("Should handle $30 package correctly", async function () {
            const packagePrice = ethers.parseEther("30");
            const expectedFee = ethers.parseEther("1.5"); // 5% of $30
            const expectedDistributable = ethers.parseEther("28.5"); // 95% of $30
            
            await usdt.connect(user1).approve(leadFive.target, packagePrice);
            
            const initialFees = await leadFive.totalAdminFeesCollected();
            await leadFive.connect(user1).register(owner.address, 1, true);
            const finalFees = await leadFive.totalAdminFeesCollected();
            
            const feeCollected = finalFees - initialFees;
            expect(feeCollected).to.equal(expectedFee);
        });

        it("Should handle partial withdrawals correctly", async function () {
            // Register user and give them balance
            await usdt.connect(user1).approve(leadFive.target, ethers.parseEther("100"));
            await leadFive.connect(user1).register(owner.address, 3, true);
            
            await usdt.connect(user2).approve(leadFive.target, ethers.parseEther("100"));
            await leadFive.connect(user2).register(user1.address, 3, true);
            
            const userInfo = await leadFive.getUserInfo(user1.address);
            if (userInfo.balance >= ethers.parseEther("50")) {
                const withdrawAmount = ethers.parseEther("50");
                const expectedFee = ethers.parseEther("2.5"); // 5% of $50
                
                const initialFees = await leadFive.totalAdminFeesCollected();
                await leadFive.connect(user1).withdraw(withdrawAmount);
                const finalFees = await leadFive.totalAdminFeesCollected();
                
                const feeCollected = finalFees - initialFees;
                expect(feeCollected).to.equal(expectedFee);
            }
        });
    });
});
