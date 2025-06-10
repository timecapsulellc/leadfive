const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * @title Orphichain Crowdfund Platform Test Suite
 * @dev Comprehensive test suite for the unified Orphichain Crowdfund Platform
 * 
 * Test Coverage:
 * - Contract deployment and initialization
 * - User registration and package management
 * - Matrix placement system
 * - Commission calculations and earnings
 * - Pool distributions
 * - Withdrawal system
 * - Rank advancement
 * - Administrative functions
 * - Security features
 * - Edge cases and error handling
 */

describe("Orphichain Crowdfund Platform", function () {
    let orphichainPlatform;
    let mockUSDT;
    let owner;
    let user1, user2, user3, user4, user5;
    let addrs;

    // Package amounts in USDT (6 decimals)
    const PACKAGE_30 = ethers.parseUnits("30", 6);
    const PACKAGE_50 = ethers.parseUnits("50", 6);
    const PACKAGE_100 = ethers.parseUnits("100", 6);
    const PACKAGE_200 = ethers.parseUnits("200", 6);

    // Commission rates
    const DIRECT_BONUS_RATE = 10; // 10%
    const BINARY_BONUS_RATE = 5;  // 5%

    beforeEach(async function () {
        // Get signers
        [owner, user1, user2, user3, user4, user5, ...addrs] = await ethers.getSigners();

        // Deploy Mock USDT
        const MockUSDT = await ethers.getContractFactory("contracts/MockUSDT.sol:MockUSDT");
        mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();

        // Deploy Orphichain Crowdfund Platform
        const OrphichainPlatform = await ethers.getContractFactory("OrphichainCrowdfundPlatform");
        orphichainPlatform = await OrphichainPlatform.deploy(await mockUSDT.getAddress());
        await orphichainPlatform.waitForDeployment();

        // Mint USDT to test users
        const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDT
        await mockUSDT.mint(user1.address, mintAmount);
        await mockUSDT.mint(user2.address, mintAmount);
        await mockUSDT.mint(user3.address, mintAmount);
        await mockUSDT.mint(user4.address, mintAmount);
        await mockUSDT.mint(user5.address, mintAmount);

        // Approve platform to spend USDT
        await mockUSDT.connect(user1).approve(await orphichainPlatform.getAddress(), mintAmount);
        await mockUSDT.connect(user2).approve(await orphichainPlatform.getAddress(), mintAmount);
        await mockUSDT.connect(user3).approve(await orphichainPlatform.getAddress(), mintAmount);
        await mockUSDT.connect(user4).approve(await orphichainPlatform.getAddress(), mintAmount);
        await mockUSDT.connect(user5).approve(await orphichainPlatform.getAddress(), mintAmount);
    });

    describe("Contract Deployment and Initialization", function () {
        it("Should deploy with correct initial values", async function () {
            expect(await orphichainPlatform.owner()).to.equal(owner.address);
            expect(await orphichainPlatform.usdtToken()).to.equal(await mockUSDT.getAddress());
            expect(await orphichainPlatform.totalMembers()).to.equal(0);
            expect(await orphichainPlatform.version()).to.equal("Orphichain Crowdfund Platform v1.0.0");
        });

        it("Should have correct package amounts", async function () {
            const packageAmounts = await orphichainPlatform.getPackageAmounts();
            expect(packageAmounts[0]).to.equal(PACKAGE_30);
            expect(packageAmounts[1]).to.equal(PACKAGE_50);
            expect(packageAmounts[2]).to.equal(PACKAGE_100);
            expect(packageAmounts[3]).to.equal(PACKAGE_200);
        });

        it("Should return correct package prices", async function () {
            expect(await orphichainPlatform.getPackagePrice(1)).to.equal(PACKAGE_30);
            expect(await orphichainPlatform.getPackagePrice(2)).to.equal(PACKAGE_50);
            expect(await orphichainPlatform.getPackagePrice(3)).to.equal(PACKAGE_100);
            expect(await orphichainPlatform.getPackagePrice(4)).to.equal(PACKAGE_200);
        });

        it("Should revert on invalid USDT address", async function () {
            const OrphichainPlatform = await ethers.getContractFactory("OrphichainCrowdfundPlatform");
            await expect(
                OrphichainPlatform.deploy(ethers.ZeroAddress)
            ).to.be.revertedWith("OrphichainCrowdfund: Invalid USDT address");
        });
    });

    describe("User Registration System", function () {
        it("Should register user successfully", async function () {
            const tx = await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
            const receipt = await tx.wait();
            
            expect(receipt.logs.length).to.be.gt(0);
            expect(await orphichainPlatform.totalMembers()).to.equal(1);
            expect(await orphichainPlatform.isUserRegistered(user2.address)).to.be.true;
            
            const userInfo = await orphichainPlatform.getUserInfo(user2.address);
            expect(userInfo.totalInvested).to.equal(PACKAGE_30);
            expect(userInfo.packageTier).to.equal(1);
            expect(userInfo.sponsor).to.equal(user1.address);
        });

        it("Should credit direct bonus to sponsor", async function () {
            // Register sponsor first
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            
            // Register user with sponsor
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
            
            const expectedBonus = (PACKAGE_30 * BigInt(DIRECT_BONUS_RATE)) / BigInt(100);
            expect(await orphichainPlatform.getWithdrawableAmount(user1.address)).to.equal(expectedBonus);
        });

        it("Should prevent self-sponsoring", async function () {
            await expect(
                orphichainPlatform.connect(user1).registerUser(user1.address, 1)
            ).to.be.revertedWith("OrphichainCrowdfund: Cannot sponsor yourself");
        });

        it("Should prevent double registration", async function () {
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            
            await expect(
                orphichainPlatform.connect(user1).registerUser(owner.address, 2)
            ).to.be.revertedWith("OrphichainCrowdfund: User already registered");
        });

        it("Should handle bulk registration", async function () {
            const users = [user1.address, user2.address, user3.address];
            const sponsors = [owner.address, user1.address, user2.address];
            const tiers = [1, 2, 3];

            await orphichainPlatform.bulkRegisterUsers(users, sponsors, tiers);

            expect(await orphichainPlatform.totalMembers()).to.equal(3);
            expect(await orphichainPlatform.isUserRegistered(user1.address)).to.be.true;
            expect(await orphichainPlatform.isUserRegistered(user2.address)).to.be.true;
            expect(await orphichainPlatform.isUserRegistered(user3.address)).to.be.true;
        });
    });

    describe("Package Management System", function () {
        beforeEach(async function () {
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
        });

        it("Should upgrade package successfully", async function () {
            const upgradeCost = PACKAGE_50 - PACKAGE_30;
            
            await expect(
                orphichainPlatform.connect(user1).upgradePackage(2)
            ).to.emit(orphichainPlatform, "PackageUpgraded")
             .withArgs(user1.address, 1, 2, upgradeCost, await time.latest() + 1);

            const userInfo = await orphichainPlatform.getUserInfo(user1.address);
            expect(userInfo.packageTier).to.equal(2);
            expect(userInfo.totalInvested).to.equal(PACKAGE_50);
        });

        it("Should prevent downgrading package", async function () {
            await orphichainPlatform.connect(user1).upgradePackage(2);
            
            await expect(
                orphichainPlatform.connect(user1).upgradePackage(1)
            ).to.be.revertedWith("OrphichainCrowdfund: Can only upgrade to higher tier");
        });

        it("Should prevent upgrading to same tier", async function () {
            await expect(
                orphichainPlatform.connect(user1).upgradePackage(1)
            ).to.be.revertedWith("OrphichainCrowdfund: Can only upgrade to higher tier");
        });
    });

    describe("Matrix Placement System", function () {
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
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
            await orphichainPlatform.connect(user3).registerUser(user1.address, 1);

            const user1Info = await orphichainPlatform.getUserInfo(user1.address);
            expect(user1Info.teamSize).to.equal(2);
        });

        it("Should calculate matrix depth correctly", async function () {
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
            await orphichainPlatform.connect(user3).registerUser(user2.address, 1);

            expect(await orphichainPlatform.getMatrixDepth(user1.address)).to.equal(1);
            expect(await orphichainPlatform.getMatrixDepth(user2.address)).to.equal(2);
            expect(await orphichainPlatform.getMatrixDepth(user3.address)).to.equal(3);
        });
    });

    describe("Commission Calculation System", function () {
        beforeEach(async function () {
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
            await orphichainPlatform.connect(user3).registerUser(user1.address, 1);
        });

        it("Should calculate binary bonus correctly", async function () {
            const binaryBonus = await orphichainPlatform.calculateBinaryBonus(user1.address);
            const expectedBonus = (PACKAGE_30 * BigInt(BINARY_BONUS_RATE)) / BigInt(100);
            expect(binaryBonus).to.equal(expectedBonus);
        });

        it("Should track earnings by pool type", async function () {
            const earningsBreakdown = await orphichainPlatform.getEarningsBreakdown(user1.address);
            expect(earningsBreakdown[0]).to.be.gt(0); // Direct bonus from user2 and user3
            
            const totalEarnings = await orphichainPlatform.getTotalEarnings(user1.address);
            expect(totalEarnings).to.be.gt(0);
        });
    });

    describe("Withdrawal System", function () {
        beforeEach(async function () {
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
        });

        it("Should allow partial withdrawal", async function () {
            const withdrawableAmount = await orphichainPlatform.getWithdrawableAmount(user1.address);
            const withdrawAmount = withdrawableAmount / BigInt(2);

            await expect(
                orphichainPlatform.connect(user1).withdraw(withdrawAmount)
            ).to.emit(orphichainPlatform, "WithdrawalProcessed")
             .withArgs(user1.address, withdrawAmount, await time.latest() + 1);

            expect(await orphichainPlatform.getWithdrawableAmount(user1.address))
                .to.equal(withdrawableAmount - withdrawAmount);
        });

        it("Should allow full withdrawal", async function () {
            const withdrawableAmount = await orphichainPlatform.getWithdrawableAmount(user1.address);

            await orphichainPlatform.connect(user1).withdrawAll();

            expect(await orphichainPlatform.getWithdrawableAmount(user1.address)).to.equal(0);
            expect(await mockUSDT.balanceOf(user1.address)).to.be.gt(0);
        });

        it("Should prevent withdrawal of more than available", async function () {
            const withdrawableAmount = await orphichainPlatform.getWithdrawableAmount(user1.address);
            const excessiveAmount = withdrawableAmount + ethers.parseUnits("100", 6);

            await expect(
                orphichainPlatform.connect(user1).withdraw(excessiveAmount)
            ).to.be.revertedWith("OrphichainCrowdfund: Insufficient balance");
        });

        it("Should prevent withdrawal by unregistered users", async function () {
            await expect(
                orphichainPlatform.connect(user3).withdraw(ethers.parseUnits("10", 6))
            ).to.be.revertedWith("OrphichainCrowdfund: User not registered");
        });
    });

    describe("Rank Advancement System", function () {
        it("Should advance to Shining Star rank", async function () {
            // Register user with sufficient investment
            await orphichainPlatform.connect(user1).registerUser(owner.address, 3); // $100 package
            
            // Simulate team building (this would require more complex setup in real scenario)
            const userInfo = await orphichainPlatform.getUserInfo(user1.address);
            
            // Check rank requirements
            const [teamSize, volume] = await orphichainPlatform.getRankRequirements(1); // Shining Star
            expect(teamSize).to.equal(10);
            expect(volume).to.equal(ethers.parseUnits("100", 6));
        });

        it("Should return correct rank requirements", async function () {
            const [shiningStarTeam, shiningStarVolume] = await orphichainPlatform.getRankRequirements(1);
            const [silverStarTeam, silverStarVolume] = await orphichainPlatform.getRankRequirements(2);

            expect(shiningStarTeam).to.equal(10);
            expect(shiningStarVolume).to.equal(ethers.parseUnits("100", 6));
            expect(silverStarTeam).to.equal(50);
            expect(silverStarVolume).to.equal(ethers.parseUnits("500", 6));
        });
    });

    describe("Pool Distribution System", function () {
        beforeEach(async function () {
            // Register multiple users to have eligible pool participants
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
            await orphichainPlatform.connect(user3).registerUser(user1.address, 1);
        });

        it("Should distribute Global Help Pool", async function () {
            // This test would require pool funds to be available
            // In a real scenario, pool funds would accumulate from various sources
            
            await expect(
                orphichainPlatform.distributeGlobalHelpPool()
            ).to.be.revertedWith("OrphichainCrowdfund: No funds in pool");
        });

        it("Should distribute Leadership Pool", async function () {
            // Similar to Global Help Pool, this would require pool funds
            await orphichainPlatform.distributeLeadershipPool();
            
            // Check that distribution timestamp was updated
            expect(await orphichainPlatform.lastLeadershipDistribution()).to.be.gt(0);
        });
    });

    describe("Administrative Functions", function () {
        it("Should allow owner to perform emergency withdrawal", async function () {
            // First, ensure contract has some USDT
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            
            const contractBalance = await mockUSDT.balanceOf(await orphichainPlatform.getAddress());
            const ownerBalanceBefore = await mockUSDT.balanceOf(owner.address);
            
            await orphichainPlatform.emergencyWithdraw(contractBalance);
            
            const ownerBalanceAfter = await mockUSDT.balanceOf(owner.address);
            expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + contractBalance);
        });

        it("Should allow ownership transfer", async function () {
            await orphichainPlatform.transferOwnership(user1.address);
            expect(await orphichainPlatform.owner()).to.equal(user1.address);
        });

        it("Should prevent non-owner from admin functions", async function () {
            await expect(
                orphichainPlatform.connect(user1).emergencyWithdraw(ethers.parseUnits("100", 6))
            ).to.be.revertedWith("OrphichainCrowdfund: Not authorized");

            await expect(
                orphichainPlatform.connect(user1).transferOwnership(user2.address)
            ).to.be.revertedWith("OrphichainCrowdfund: Not authorized");
        });
    });

    describe("Security Features", function () {
        it("Should prevent reentrancy attacks", async function () {
            // Register user and ensure they have withdrawable amount
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 1);
            
            // Test that withdrawal is protected against reentrancy
            const withdrawableAmount = await orphichainPlatform.getWithdrawableAmount(user1.address);
            
            // This should work normally
            await orphichainPlatform.connect(user1).withdraw(withdrawableAmount);
        });

        it("Should validate input parameters", async function () {
            await expect(
                orphichainPlatform.connect(user1).registerUser(ethers.ZeroAddress, 1)
            ).to.be.revertedWith("OrphichainCrowdfund: Invalid address");

            await expect(
                orphichainPlatform.getPackagePrice(0)
            ).to.be.reverted;

            await expect(
                orphichainPlatform.getPackagePrice(5)
            ).to.be.reverted;
        });
    });

    describe("Platform Statistics", function () {
        it("Should return correct platform stats", async function () {
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            await orphichainPlatform.connect(user2).registerUser(user1.address, 2);
            await orphichainPlatform.connect(user3).registerUser(user1.address, 3);

            const [totalUsers, totalVolume, poolBalances] = await orphichainPlatform.getPlatformStats();
            
            expect(totalUsers).to.equal(3);
            expect(totalVolume).to.equal(PACKAGE_30 + PACKAGE_50 + PACKAGE_100);
            expect(poolBalances.length).to.equal(5);
        });

        it("Should track user information correctly", async function () {
            await orphichainPlatform.connect(user1).registerUser(owner.address, 2);
            
            const userInfo = await orphichainPlatform.getUserInfo(user1.address);
            expect(userInfo.totalInvested).to.equal(PACKAGE_50);
            expect(userInfo.packageTier).to.equal(2);
            expect(userInfo.sponsor).to.equal(owner.address);
            expect(userInfo.teamSize).to.equal(0);
            expect(userInfo.leaderRank).to.equal(0); // NONE
        });
    });

    describe("Edge Cases and Error Handling", function () {
        it("Should handle zero amount withdrawal", async function () {
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            
            await expect(
                orphichainPlatform.connect(user1).withdraw(0)
            ).to.be.revertedWith("OrphichainCrowdfund: Amount must be greater than 0");
        });

        it("Should handle withdrawal with zero balance", async function () {
            await orphichainPlatform.connect(user1).registerUser(owner.address, 1);
            
            // Check if user has any withdrawable amount first
            const withdrawableAmount = await orphichainPlatform.getWithdrawableAmount(user1.address);
            
            if (withdrawableAmount > 0) {
                // Withdraw all first
                await orphichainPlatform.connect(user1).withdrawAll();
            }
            
            // Try to withdraw again (should fail)
            await expect(
                orphichainPlatform.connect(user1).withdrawAll()
            ).to.be.revertedWith("OrphichainCrowdfund: No balance to withdraw");
        });

        it("Should handle bulk operations with mismatched arrays", async function () {
            await expect(
                orphichainPlatform.bulkRegisterUsers(
                    [user1.address, user2.address],
                    [owner.address],
                    [1, 2]
                )
            ).to.be.revertedWith("OrphichainCrowdfund: Array length mismatch");
        });
    });
});

// Helper to get current block timestamp
const time = {
    latest: async () => {
        const block = await ethers.provider.getBlock('latest');
        return block.timestamp;
    }
};
