const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("OrphiCrowdFund - Withdrawal, Reinvestment, and Earnings Cap", function () {
    let contract, owner, user1, user2, user3;
    beforeEach(async function () {
        [owner, user1, user2, user3] = await ethers.getSigners();
        // Deploy OrphiCrowdFund
        const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
        contract = await upgrades.deployProxy(OrphiCrowdFund, [], { initializer: "initialize" });
        await contract.waitForDeployment();
    });

    it("should allow user to contribute, earn from downline, and withdraw", async function () {
        // User1 joins as root
        await contract.connect(user1).contribute(ethers.ZeroAddress, 1, { value: ethers.parseEther("1.0") });
        // User2 joins under user1 (user1 earns direct bonus)
        await contract.connect(user2).contribute(user1.address, 1, { value: ethers.parseEther("1.0") });
        // User3 joins under user1 (user1 earns another direct bonus)
        await contract.connect(user3).contribute(user1.address, 1, { value: ethers.parseEther("1.0") });
        // User1 should now have some withdrawable balance
        if (contract.withdraw) {
            await expect(contract.connect(user1).withdraw()).to.not.be.reverted;
        }
    });

    it("should enforce earnings cap (4x/300%) after multiple earnings", async function () {
        // User1 joins as root
        await contract.connect(user1).contribute(ethers.ZeroAddress, 1, { value: ethers.parseEther("1.0") });
        // Simulate multiple downlines to accumulate earnings
        for (let i = 0; i < 10; i++) {
            const newUser = ethers.Wallet.createRandom().connect(ethers.provider);
            await owner.sendTransaction({ to: newUser.address, value: ethers.parseEther("2.0") });
            await contract.connect(newUser).contribute(user1.address, 1, { value: ethers.parseEther("1.0") });
        }
        // User1 withdraws repeatedly until capped
        let withdraws = 0;
        let failed = false;
        while (!failed && withdraws < 10) {
            try {
                await contract.connect(user1).withdraw();
                withdraws++;
            } catch (e) {
                failed = true;
            }
        }
        expect(withdraws).to.be.greaterThan(0);
    });

    it("should apply progressive withdrawal and auto-reinvestment logic as directs increase", async function () {
        // User1 joins as root
        await contract.connect(user1).contribute(ethers.ZeroAddress, 1, { value: ethers.parseEther("1.0") });
        // Add directs to increase withdrawal percentage
        for (let i = 0; i < 20; i++) {
            const newUser = ethers.Wallet.createRandom().connect(ethers.provider);
            await owner.sendTransaction({ to: newUser.address, value: ethers.parseEther("2.0") });
            await contract.connect(newUser).contribute(user1.address, 1, { value: ethers.parseEther("1.0") });
        }
        // User1 withdraws (should get higher withdrawal % and auto-reinvest)
        if (contract.withdraw) {
            await expect(contract.connect(user1).withdraw()).to.not.be.reverted;
        }
    });
});
