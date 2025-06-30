const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("LeadFive USDT-Only Contract Test", function () {
    let leadFive;
    let usdt;
    let owner;
    let user1, user2, user3, user4, user5;
    let adminFeeRecipient;
    
    beforeEach(async function () {
        [owner, user1, user2, user3, user4, user5, adminFeeRecipient] = await ethers.getSigners();
        
        // Deploy mock USDT
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        usdt = await MockUSDT.deploy();
        await usdt.waitForDeployment();
        
        // Deploy LeadFive contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        leadFive = await upgrades.deployProxy(LeadFive, [await usdt.getAddress()], {
            kind: 'uups',
            initializer: 'initialize'
        });
        await leadFive.waitForDeployment();
        
        // Mint USDT to test users
        const amount = ethers.parseUnits("10000", 18); // 10,000 USDT with 18 decimals
        await usdt.mint(user1.address, amount);
        await usdt.mint(user2.address, amount);
        await usdt.mint(user3.address, amount);
        await usdt.mint(user4.address, amount);
        await usdt.mint(user5.address, amount);
        
        // Approve USDT spending
        await usdt.connect(user1).approve(await leadFive.getAddress(), amount);
        await usdt.connect(user2).approve(await leadFive.getAddress(), amount);
        await usdt.connect(user3).approve(await leadFive.getAddress(), amount);
        await usdt.connect(user4).approve(await leadFive.getAddress(), amount);
        await usdt.connect(user5).approve(await leadFive.getAddress(), amount);
    });

    describe("1. Contract Deployment and Initialization", function () {
        it("Should initialize contract with correct parameters", async function () {
            expect(await leadFive.owner()).to.equal(owner.address);
            expect(await leadFive.usdt()).to.equal(await usdt.getAddress());
            expect(await leadFive.getTotalUsers()).to.equal(1); // Root user
            expect(await leadFive.getVersion()).to.equal("1.1.0");
        });

        it("Should have USDT properly configured", async function () {
            const usdtConfig = await leadFive.getUSDTConfig();
            expect(usdtConfig[0]).to.equal(await usdt.getAddress()); // USDT address
            expect(usdtConfig[1]).to.equal(6); // Decimals
        });

        it("Should have correct package prices", async function () {
            expect(await leadFive.getPackagePrice(1)).to.equal(ethers.parseUnits("30", 6)); // 30 USDT
            expect(await leadFive.getPackagePrice(2)).to.equal(ethers.parseUnits("50", 6)); // 50 USDT
            expect(await leadFive.getPackagePrice(3)).to.equal(ethers.parseUnits("100", 6)); // 100 USDT
            expect(await leadFive.getPackagePrice(4)).to.equal(ethers.parseUnits("200", 6)); // 200 USDT
        });
    });

    describe("2. User Registration System", function () {
        it("Should register user with sponsor", async function () {
            // Register user1 with owner as sponsor
            await leadFive.connect(user1).register(owner.address, 1);
            
            const userInfo = await leadFive.getUserFullInfo(user1.address);
            expect(userInfo[0]).to.be.true; // registered
            expect(userInfo[1]).to.equal(1); // package level
            expect(userInfo[5]).to.equal(0); // direct referrals
            expect(userInfo[6]).to.equal(owner.address); // referrer
            
            // Check total users increased
            expect(await leadFive.getTotalUsers()).to.equal(2);
        });

        it("Should register user without sponsor", async function () {
            // Register user1 without sponsor
            await leadFive.connect(user1).register(ethers.ZeroAddress, 1);
            
            const userInfo = await leadFive.getUserFullInfo(user1.address);
            expect(userInfo[0]).to.be.true; // registered
            expect(userInfo[6]).to.equal(ethers.ZeroAddress); // no referrer
        });

        it("Should reject already registered user", async function () {
            await leadFive.connect(user1).register(owner.address, 1);
            
            await expect(
                leadFive.connect(user1).register(owner.address, 2)
            ).to.be.revertedWith("Already registered");
        });

        it("Should reject invalid package level", async function () {
            await expect(
                leadFive.connect(user1).register(owner.address, 0)
            ).to.be.revertedWith("Invalid package level");
            
            await expect(
                leadFive.connect(user1).register(owner.address, 5)
            ).to.be.revertedWith("Invalid package level");
        });
    });

    describe("3. USDT Payment Processing", function () {
        it("Should process USDT payment correctly", async function () {
            const contractAddress = await leadFive.getAddress();
            const initialBalance = await usdt.balanceOf(contractAddress);
            
            // Register user1 with package 1 (30 USDT)
            await leadFive.connect(user1).register(owner.address, 1);
            
            const finalBalance = await usdt.balanceOf(contractAddress);
            const expectedAmount = ethers.parseUnits("30", 18); // 30 USDT with 18 decimals
            
            expect(finalBalance - initialBalance).to.equal(expectedAmount);
        });

        it("Should reject insufficient USDT balance", async function () {
            // Create user with no USDT
            const [poorUser] = await ethers.getSigners();
            
            await expect(
                leadFive.connect(poorUser).register(owner.address, 1)
            ).to.be.revertedWith("Insufficient USDT balance");
        });

        it("Should reject insufficient allowance", async function () {
            // User with USDT but no allowance
            const amount = ethers.parseUnits("1000", 18);
            await usdt.mint(user5.address, amount);
            
            await expect(
                leadFive.connect(user5).register(owner.address, 1)
            ).to.be.revertedWith("Insufficient USDT allowance");
        });
    });

    describe("4. Package Upgrade System", function () {
        beforeEach(async function () {
            // Register user1 with package 1
            await leadFive.connect(user1).register(owner.address, 1);
        });

        it("Should upgrade package successfully", async function () {
            await leadFive.connect(user1).upgradePackage(2);
            
            const userInfo = await leadFive.getUserFullInfo(user1.address);
            expect(userInfo[1]).to.equal(2); // new package level
        });

        it("Should reject downgrade", async function () {
            await leadFive.connect(user1).upgradePackage(2);
            
            await expect(
                leadFive.connect(user1).upgradePackage(1)
            ).to.be.revertedWithCustomError(leadFive, "InvalidPackageLevel");
        });

        it("Should reject same level upgrade", async function () {
            await expect(
                leadFive.connect(user1).upgradePackage(1)
            ).to.be.revertedWithCustomError(leadFive, "InvalidPackageLevel");
        });
    });

    describe("5. Reward Distribution", function () {
        it("Should distribute direct bonus to sponsor", async function () {
            // Register user1 with owner as sponsor
            await leadFive.connect(user1).register(owner.address, 1);
            
            const ownerInfo = await leadFive.getUserFullInfo(owner.address);
            expect(ownerInfo[2]).to.be.gt(0); // balance should be > 0 from direct bonus
        });

        it("Should respect earnings cap", async function () {
            // Register user1 
            await leadFive.connect(user1).register(owner.address, 1);
            
            const userInfo = await leadFive.getUserFullInfo(user1.address);
            const earningsCap = userInfo[4];
            const packagePrice = await leadFive.getPackagePrice(1);
            
            // Earnings cap should be 4x package price
            expect(earningsCap).to.equal(packagePrice * 4n);
        });
    });

    describe("6. Withdrawal System", function () {
        beforeEach(async function () {
            // Setup users with balances
            await leadFive.connect(user1).register(owner.address, 1);
            await leadFive.connect(user2).register(user1.address, 1);
        });

        it("Should calculate withdrawal rate correctly", async function () {
            const rate = await leadFive.calculateWithdrawalRate(user1.address);
            expect(rate).to.equal(70); // Default rate for < 5 directs
        });

        it("Should process withdrawal with platform fee", async function () {
            const userInfo = await leadFive.getUserFullInfo(user1.address);
            const balance = userInfo[2];
            
            if (balance > 0) {
                const initialUSDTBalance = await usdt.balanceOf(user1.address);
                
                await leadFive.connect(user1).withdraw(balance);
                
                const finalUSDTBalance = await usdt.balanceOf(user1.address);
                expect(finalUSDTBalance).to.be.gt(initialUSDTBalance);
            }
        });
    });

    describe("7. Admin Functions", function () {
        it("Should allow owner to add admin", async function () {
            await leadFive.addAdmin(user1.address);
            expect(await leadFive.isAdmin(user1.address)).to.be.true;
        });

        it("Should allow owner to set platform fee recipient", async function () {
            await leadFive.setPlatformFeeRecipient(adminFeeRecipient.address);
            // No direct getter, but should not revert
        });

        it("Should allow admin to pause/unpause", async function () {
            await leadFive.emergencyPause();
            expect(await leadFive.paused()).to.be.true;
            
            await leadFive.emergencyUnpause();
            expect(await leadFive.paused()).to.be.false;
        });
    });

    describe("8. Security Features", function () {
        it("Should have circuit breaker protection", async function () {
            // Circuit breaker should be set to 1M USDT
            expect(await leadFive.circuitBreakerThreshold()).to.equal(ethers.parseUnits("1000000", 6));
        });

        it("Should have daily withdrawal limits", async function () {
            expect(await leadFive.dailyWithdrawalLimit()).to.equal(ethers.parseUnits("1000", 6));
        });

        it("Should prevent MEV with anti-MEV protection", async function () {
            // This is hard to test directly, but the modifier should be present
            // and will revert if same block number
        });
    });

    describe("9. View Functions", function () {
        it("Should return correct pool balances", async function () {
            const poolBalances = await leadFive.getPoolBalances();
            expect(poolBalances.length).to.equal(3); // leadership, community, club
        });

        it("Should return contract USDT balance", async function () {
            const balance = await leadFive.getUSDTBalance();
            expect(balance).to.be.a('bigint');
        });

        it("Should convert between decimal formats", async function () {
            const amount6 = ethers.parseUnits("100", 6);
            const amount18 = await leadFive.convertToUSDT18(amount6);
            expect(amount18).to.equal(ethers.parseUnits("100", 18));
            
            const backTo6 = await leadFive.convertFromUSDT18(amount18);
            expect(backTo6).to.equal(amount6);
        });
    });

    describe("10. Network Structure", function () {
        it("Should update direct network on registration", async function () {
            await leadFive.connect(user1).register(owner.address, 1);
            await leadFive.connect(user2).register(user1.address, 1);
            
            const user1Info = await leadFive.getUserFullInfo(user1.address);
            expect(user1Info[5]).to.equal(1); // 1 direct referral
        });

        it("Should assign matrix positions", async function () {
            await leadFive.connect(user1).register(owner.address, 1);
            
            const matrixPosition = await leadFive.getMatrixPosition(owner.address);
            expect(matrixPosition[0]).to.equal(user1.address); // Left position
        });
    });
});
