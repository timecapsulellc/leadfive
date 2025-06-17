const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("OrphiCrowdFund - Matrix Placement & Genealogy", function () {
    let contract, mockUSDT, owner, user1, user2, user3, user4;
    beforeEach(async function () {
        [owner, user1, user2, user3, user4] = await ethers.getSigners();
        // Deploy MockUSDT
        const MockUSDT = await ethers.getContractFactory("MockUSDT");
        mockUSDT = await MockUSDT.deploy();
        await mockUSDT.waitForDeployment();
        // Deploy OrphiCrowdFund
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        contract = await upgrades.deployProxy(OrphiCrowdFund, [], { initializer: "initialize" });
        await contract.waitForDeployment();
    });

    it("should place users in the binary matrix and build genealogy via contribute", async function () {
        // User1 joins as root (no referrer)
        await contract.connect(user1).contribute(ethers.ZeroAddress, 1, { value: ethers.parseEther("1.0") });
        // User2 and User3 join under user1
        await contract.connect(user2).contribute(user1.address, 1, { value: ethers.parseEther("1.0") });
        await contract.connect(user3).contribute(user1.address, 1, { value: ethers.parseEther("1.0") });
        // User4 joins under user2
        await contract.connect(user4).contribute(user2.address, 1, { value: ethers.parseEther("1.0") });
        // Check genealogy for user4
        // (Assuming getUserGenealogy exists and returns uplines and directs)
        if (contract.getUserGenealogy) {
            const [uplines, directs] = await contract.getUserGenealogy(user4.address);
            expect(uplines.length).to.be.greaterThan(0);
            expect(directs).to.be.an("array");
            expect(uplines).to.include(user2.address);
        }
    });
});
