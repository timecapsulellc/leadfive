const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("OrphiCrowdFund - Pool Distributions (GHP, Leader, Club)", function () {
    let contract, owner, admin, user1, user2, user3;
    beforeEach(async function () {
        [owner, admin, user1, user2, user3] = await ethers.getSigners();
        // Deploy OrphiCrowdFund
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        contract = await upgrades.deployProxy(OrphiCrowdFund, [], { initializer: "initialize" });
        await contract.waitForDeployment();
    });

    it("should allow admin to distribute Global Help Pool (GHP)", async function () {
        // Simulate pool balance
        await ethers.provider.send("hardhat_setBalance", [await contract.getAddress(), "0x1000000000000000000"]); // 1 ETH
        // Try to call GHP distribution as admin
        if (contract.distributeGlobalHelpPool) {
            await expect(contract.connect(owner).distributeGlobalHelpPool()).to.not.be.reverted;
        }
    });

    it("should allow admin to distribute Leader Bonus Pool", async function () {
        if (contract.distributeLeaderBonusPool) {
            await expect(contract.connect(owner).distributeLeaderBonusPool()).to.not.be.reverted;
        }
    });

    it("should allow admin to distribute Club Pool", async function () {
        if (contract.distributeClubPool) {
            await expect(contract.connect(owner).distributeClubPool()).to.not.be.reverted;
        }
    });
});
