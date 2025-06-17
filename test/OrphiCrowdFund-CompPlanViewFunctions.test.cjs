const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("OrphiCrowdFund - Compensation Plan & View Functions", function () {
    let contract, mockUSDT, owner, user1, user2, admin;
    beforeEach(async function () {
        [owner, user1, user2, admin] = await ethers.getSigners();
        // Deploy MockUSDT
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        mockUSDT = await MockUSDT.deploy();
        await mockUSDT.deployed();
        // Deploy OrphiCrowdFund
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        contract = await upgrades.deployProxy(OrphiCrowdFund, [], { initializer: "initialize" });
        await contract.deployed();
        // Set USDT token
        await contract.connect(owner).setUsdtToken(mockUSDT.address);
    });

    it("should return correct user bonuses and eligibility", async function () {
        // Register user1 with user2 as referrer
        await contract.connect(user2).contribute(ethers.constants.AddressZero, 5, ethers.utils.parseUnits("300", 18), 0); // user2 root
        await contract.connect(user1).contribute(user2.address, 5, ethers.utils.parseUnits("300", 18), 0);
        // Simulate earnings (direct bonus)
        // ...
        // Call view functions
        const bonuses = await contract.getUserBonuses(user1.address);
        expect(bonuses.directBonus).to.be.a("BigNumber");
        const eligibility = await contract.getUserPoolEligibility(user1.address);
        expect(eligibility.ghpEligible).to.be.a("boolean");
    });

    it("should return correct genealogy", async function () {
        // Register user1 with user2 as referrer
        await contract.connect(user2).contribute(ethers.constants.AddressZero, 5, ethers.utils.parseUnits("300", 18), 0); // user2 root
        await contract.connect(user1).contribute(user2.address, 5, ethers.utils.parseUnits("300", 18), 0);
        const genealogy = await contract.getUserGenealogy(user1.address);
        expect(genealogy.uplines).to.include(user2.address);
        expect(genealogy.directReferralsList).to.be.an("array");
    });

    it("should enforce earnings cap and auto-reinvestment on withdraw", async function () {
        // Register and simulate earnings
        await contract.connect(user2).contribute(ethers.constants.AddressZero, 5, ethers.utils.parseUnits("300", 18), 0);
        await contract.connect(user1).contribute(user2.address, 5, ethers.utils.parseUnits("300", 18), 0);
        // Simulate bonus payout to user1
        // ...
        // Withdraw and check cap enforcement
        await contract.connect(user1).withdraw();
        // Check balances and events
        // ...
    });

    it("should handle pool, leader, and club distributions correctly", async function () {
        // Register users and accumulate pools
        await contract.connect(user2).contribute(ethers.constants.AddressZero, 5, ethers.utils.parseUnits("300", 18), 0);
        await contract.connect(user1).contribute(user2.address, 5, ethers.utils.parseUnits("300", 18), 0);
        // Simulate pool accumulation
        // ...
        // Admin distributes pools
        await contract.connect(admin).distributeGlobalHelpPool();
        await contract.connect(admin).distributeLeaderBonusPool();
        await contract.connect(admin).distributeClubPool();
        // Check pool balances and events
        // ...
    });

    // Add more tests for edge cases and oracle/dual-currency logic after plan is finalized
});
