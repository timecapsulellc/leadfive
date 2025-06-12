const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Security Test - Quick Check", function () {
    let orphiCrowdFund;
    let mockUSDT;
    let owner, user1;
    
    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();
        
        // Deploy Mock USDT
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        
        // Deploy simplified contract
        const OrphiCrowdFundSimplified = await ethers.getContractFactory("OrphiCrowdFundSimplified");
        
        orphiCrowdFund = await upgrades.deployProxy(OrphiCrowdFundSimplified, [
            await mockUSDT.getAddress(),
            owner.address,
            owner.address,
            true,  // MEV protection enabled
            true,  // circuit breaker enabled
            true   // timelock enabled
        ], { 
            initializer: 'initialize',
            kind: 'uups'
        });
        await orphiCrowdFund.waitForDeployment();
        
        // Setup test tokens
        await mockUSDT.mint(user1.address, ethers.parseUnits("1000", 6));
        await mockUSDT.connect(user1).approve(await orphiCrowdFund.getAddress(), ethers.MaxUint256);
    });
    
    it("Should initialize correctly", async function () {
        const usdtAddress = await orphiCrowdFund.usdtToken();
        expect(usdtAddress).to.equal(await mockUSDT.getAddress());
    });
    
    it("Should enforce MEV protection", async function () {
        await orphiCrowdFund.connect(user1).register(owner.address);
        
        // First transaction
        await orphiCrowdFund.connect(user1).purchasePackage(0, user1.address);
        
        // Second transaction in same block should fail
        await expect(
            orphiCrowdFund.connect(user1).purchasePackage(0, user1.address)
        ).to.be.revertedWith("MEV protection active");
    });
});
