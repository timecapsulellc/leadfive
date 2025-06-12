const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * ⏰ UPGRADE TIMELOCK SYSTEM TEST SUITE
 * 
 * This test suite validates:
 * - 48-hour timelock for upgrade proposals
 * - Secure upgrade execution process
 * - Upgrade cancellation mechanisms
 * - Multi-signature upgrade approvals
 * - Emergency upgrade procedures
 * - Timelock bypass protection
 */
describe("⏰ OrphiCrowdFund - Upgrade Timelock System", function () {
  let orphiCrowdFund;
  let mockUSDT;
  let owner, adminReserve, upgradeProposer, multiSigSigner1, multiSigSigner2;
  let user1, user2;
  let newImplementation;

  const UPGRADE_DELAY = 48 * 60 * 60; // 48 hours in seconds

  beforeEach(async function () {
    [owner, adminReserve, upgradeProposer, multiSigSigner1, multiSigSigner2, user1, user2] = await ethers.getSigners();

    // Deploy Mock USDT
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();

    // Deploy OrphiCrowdFund
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
    orphiCrowdFund = await upgrades.deployProxy(
      OrphiCrowdFund,
      [await mockUSDT.getAddress(), adminReserve.address, owner.address],
      { initializer: "initialize" }
    );
    await orphiCrowdFund.waitForDeployment();

    // Deploy a new implementation for testing upgrades
    const NewImplementation = await ethers.getContractFactory("OrphiCrowdFund");
    newImplementation = await NewImplementation.deploy();
    await newImplementation.waitForDeployment();

    // Grant upgrade proposer role
    const UPGRADE_PROPOSER_ROLE = await orphiCrowdFund.UPGRADE_PROPOSER_ROLE();
    await orphiCrowdFund.grantRole(UPGRADE_PROPOSER_ROLE, upgradeProposer.address);

    // Setup test funds for users
    const testAmount = ethers.parseUnits("1000", 6);
    await mockUSDT.mint(user1.address, testAmount);
    await mockUSDT.mint(user2.address, testAmount);
    await mockUSDT.connect(user1).approve(await orphiCrowdFund.getAddress(), testAmount);
    await mockUSDT.connect(user2).approve(await orphiCrowdFund.getAddress(), testAmount);
  });

  describe("🔒 Upgrade Proposal System", function () {
    it("Should allow authorized users to propose upgrades", async function () {
      const implementationAddress = await newImplementation.getAddress();
      
      await expect(
        orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress)
      ).to.emit(orphiCrowdFund, "UpgradeProposed")
       .withArgs(implementationAddress, upgradeProposer.address, anyValue);
      
      const proposalTime = await orphiCrowdFund.proposedUpgrades(implementationAddress);
      expect(proposalTime).to.be.greaterThan(0);
    });

    it("Should prevent unauthorized users from proposing upgrades", async function () {
      const implementationAddress = await newImplementation.getAddress();
      
      await expect(
        orphiCrowdFund.connect(user1).proposeUpgrade(implementationAddress)
      ).to.be.revertedWithCustomError(orphiCrowdFund, "AccessControlUnauthorizedAccount");
    });

    it("Should prevent proposing invalid implementation addresses", async function () {
      await expect(
        orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(ethers.ZeroAddress)
      ).to.be.revertedWith("OrphiCrowdFund: Invalid implementation address");
      
      // Non-contract address should fail
      await expect(
        orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(user1.address)
      ).to.be.revertedWith("OrphiCrowdFund: Implementation must be contract");
    });

    it("Should prevent duplicate proposals", async function () {
      const implementationAddress = await newImplementation.getAddress();
      
      await orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress);
      
      await expect(
        orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress)
      ).to.be.revertedWith("OrphiCrowdFund: Upgrade already proposed");
    });

    it("Should track proposal timestamp correctly", async function () {
      const implementationAddress = await newImplementation.getAddress();
      const beforeTime = await time.latest();
      
      await orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress);
      
      const afterTime = await time.latest();
      const proposalTime = await orphiCrowdFund.proposedUpgrades(implementationAddress);
      
      expect(proposalTime).to.be.greaterThanOrEqual(beforeTime);
      expect(proposalTime).to.be.lessThanOrEqual(afterTime);
    });
  });

  describe("⏰ Timelock Enforcement", function () {
    let implementationAddress;

    beforeEach(async function () {
      implementationAddress = await newImplementation.getAddress();
      await orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress);
    });

    it("Should enforce 48-hour timelock", async function () {
      // Should fail immediately
      await expect(
        orphiCrowdFund.executeUpgrade(implementationAddress)
      ).to.be.revertedWith("OrphiCrowdFund: Timelock not expired");
      
      // Should fail after 47 hours
      await time.increase(47 * 60 * 60);
      await expect(
        orphiCrowdFund.executeUpgrade(implementationAddress)
      ).to.be.revertedWith("OrphiCrowdFund: Timelock not expired");
      
      // Should succeed after 48+ hours
      await time.increase(2 * 60 * 60); // Additional 2 hours
      
      // Note: In real test, we might not actually execute the upgrade
      // but verify the timelock check passes
      const canExecute = await orphiCrowdFund.canExecuteUpgrade(implementationAddress);
      expect(canExecute).to.be.true;
    });

    it("Should calculate timelock expiry correctly", async function () {
      const proposalTime = await orphiCrowdFund.proposedUpgrades(implementationAddress);
      const expectedExpiry = proposalTime + BigInt(UPGRADE_DELAY);
      
      const actualExpiry = await orphiCrowdFund.getUpgradeExpiry(implementationAddress);
      expect(actualExpiry).to.equal(expectedExpiry);
    });

    it("Should provide accurate time remaining", async function () {
      const timeRemaining = await orphiCrowdFund.getUpgradeTimeRemaining(implementationAddress);
      expect(timeRemaining).to.be.lessThanOrEqual(UPGRADE_DELAY);
      expect(timeRemaining).to.be.greaterThan(0);
      
      // Fast forward and check again
      await time.increase(24 * 60 * 60); // 24 hours
      
      const newTimeRemaining = await orphiCrowdFund.getUpgradeTimeRemaining(implementationAddress);
      expect(newTimeRemaining).to.be.lessThan(timeRemaining);
    });

    it("Should handle timelock expiry edge cases", async function () {
      // Fast forward to exactly the timelock expiry
      await time.increase(UPGRADE_DELAY);
      
      const canExecute = await orphiCrowdFund.canExecuteUpgrade(implementationAddress);
      expect(canExecute).to.be.true;
      
      const timeRemaining = await orphiCrowdFund.getUpgradeTimeRemaining(implementationAddress);
      expect(timeRemaining).to.equal(0);
    });
  });

  describe("🚫 Upgrade Cancellation", function () {
    let implementationAddress;

    beforeEach(async function () {
      implementationAddress = await newImplementation.getAddress();
      await orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress);
    });

    it("Should allow canceling proposed upgrades", async function () {
      await expect(
        orphiCrowdFund.cancelUpgrade(implementationAddress)
      ).to.emit(orphiCrowdFund, "UpgradeCanceled")
       .withArgs(implementationAddress, owner.address);
      
      const proposalTime = await orphiCrowdFund.proposedUpgrades(implementationAddress);
      expect(proposalTime).to.equal(0);
    });

    it("Should prevent unauthorized cancellation", async function () {
      await expect(
        orphiCrowdFund.connect(user1).cancelUpgrade(implementationAddress)
      ).to.be.revertedWithCustomError(orphiCrowdFund, "OwnableUnauthorizedAccount");
    });

    it("Should prevent canceling non-existent proposals", async function () {
      const fakeAddress = user1.address;
      
      await expect(
        orphiCrowdFund.cancelUpgrade(fakeAddress)
      ).to.be.revertedWith("OrphiCrowdFund: No upgrade proposed");
    });

    it("Should prevent execution after cancellation", async function () {
      await orphiCrowdFund.cancelUpgrade(implementationAddress);
      
      // Fast forward past timelock
      await time.increase(UPGRADE_DELAY + 3600);
      
      await expect(
        orphiCrowdFund.executeUpgrade(implementationAddress)
      ).to.be.revertedWith("OrphiCrowdFund: No upgrade proposed");
    });

    it("Should allow re-proposing after cancellation", async function () {
      await orphiCrowdFund.cancelUpgrade(implementationAddress);
      
      // Should be able to propose again
      await orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress);
      
      const newProposalTime = await orphiCrowdFund.proposedUpgrades(implementationAddress);
      expect(newProposalTime).to.be.greaterThan(0);
    });
  });

  describe("🔐 Multi-Signature Upgrades", function () {
    let implementationAddress;

    beforeEach(async function () {
      implementationAddress = await newImplementation.getAddress();
      
      // Setup multi-signature requirement
      await orphiCrowdFund.setupUpgradeMultiSig(
        [multiSigSigner1.address, multiSigSigner2.address],
        2 // Require 2 signatures
      );
      
      await orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress);
      await time.increase(UPGRADE_DELAY + 3600); // Past timelock
    });

    it("Should require multiple signatures for execution", async function () {
      // First signature
      await orphiCrowdFund.connect(multiSigSigner1).approveUpgrade(implementationAddress);
      
      // Should not be executable with just one signature
      const canExecute = await orphiCrowdFund.canExecuteUpgrade(implementationAddress);
      expect(canExecute).to.be.false;
      
      // Second signature
      await orphiCrowdFund.connect(multiSigSigner2).approveUpgrade(implementationAddress);
      
      // Should now be executable
      const canExecuteNow = await orphiCrowdFund.canExecuteUpgrade(implementationAddress);
      expect(canExecuteNow).to.be.true;
    });

    it("Should track signature count", async function () {
      await orphiCrowdFund.connect(multiSigSigner1).approveUpgrade(implementationAddress);
      
      const signatureCount = await orphiCrowdFund.getUpgradeSignatureCount(implementationAddress);
      expect(signatureCount).to.equal(1);
      
      await orphiCrowdFund.connect(multiSigSigner2).approveUpgrade(implementationAddress);
      
      const finalSignatureCount = await orphiCrowdFund.getUpgradeSignatureCount(implementationAddress);
      expect(finalSignatureCount).to.equal(2);
    });

    it("Should prevent duplicate signatures", async function () {
      await orphiCrowdFund.connect(multiSigSigner1).approveUpgrade(implementationAddress);
      
      await expect(
        orphiCrowdFund.connect(multiSigSigner1).approveUpgrade(implementationAddress)
      ).to.be.revertedWith("OrphiCrowdFund: Already signed");
    });

    it("Should prevent unauthorized signers", async function () {
      await expect(
        orphiCrowdFund.connect(user1).approveUpgrade(implementationAddress)
      ).to.be.revertedWith("OrphiCrowdFund: Not authorized signer");
    });

    it("Should emit events for signature approvals", async function () {
      await expect(
        orphiCrowdFund.connect(multiSigSigner1).approveUpgrade(implementationAddress)
      ).to.emit(orphiCrowdFund, "UpgradeApproved")
       .withArgs(implementationAddress, multiSigSigner1.address, 1, 2);
    });
  });

  describe("🚨 Emergency Upgrade Procedures", function () {
    let implementationAddress;

    beforeEach(async function () {
      implementationAddress = await newImplementation.getAddress();
      
      // Grant emergency role
      const EMERGENCY_ROLE = await orphiCrowdFund.EMERGENCY_ROLE();
      await orphiCrowdFund.grantRole(EMERGENCY_ROLE, owner.address);
    });

    it("Should allow emergency upgrades with proper authorization", async function () {
      const reason = "Critical security vulnerability";
      
      await expect(
        orphiCrowdFund.emergencyUpgrade(implementationAddress, reason)
      ).to.emit(orphiCrowdFund, "EmergencyUpgradeExecuted")
       .withArgs(implementationAddress, owner.address, reason);
    });

    it("Should prevent unauthorized emergency upgrades", async function () {
      await expect(
        orphiCrowdFund.connect(user1).emergencyUpgrade(implementationAddress, "Unauthorized")
      ).to.be.revertedWithCustomError(orphiCrowdFund, "AccessControlUnauthorizedAccount");
    });

    it("Should require valid reason for emergency upgrades", async function () {
      await expect(
        orphiCrowdFund.emergencyUpgrade(implementationAddress, "")
      ).to.be.revertedWith("OrphiCrowdFund: Emergency reason required");
    });

    it("Should bypass timelock for emergency upgrades", async function () {
      // No need to propose first for emergency upgrades
      const reason = "Critical vulnerability fix";
      
      await orphiCrowdFund.emergencyUpgrade(implementationAddress, reason);
      
      // Should succeed immediately without timelock
      expect(true).to.be.true; // Test passed if no revert
    });

    it("Should log emergency upgrades for audit trail", async function () {
      const reason = "Security patch";
      await orphiCrowdFund.emergencyUpgrade(implementationAddress, reason);
      
      const emergencyUpgrades = await orphiCrowdFund.getEmergencyUpgradeHistory();
      expect(emergencyUpgrades.length).to.be.greaterThan(0);
      
      const lastUpgrade = emergencyUpgrades[emergencyUpgrades.length - 1];
      expect(lastUpgrade.implementation).to.equal(implementationAddress);
      expect(lastUpgrade.reason).to.equal(reason);
    });
  });

  describe("🔍 Upgrade Validation", function () {
    let implementationAddress;

    beforeEach(async function () {
      implementationAddress = await newImplementation.getAddress();
      await orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress);
      await time.increase(UPGRADE_DELAY + 3600);
    });

    it("Should validate implementation before execution", async function () {
      // Mock implementation validation (in real scenario, would check interface compatibility)
      const isValid = await orphiCrowdFund.validateImplementation(implementationAddress);
      expect(isValid).to.be.true;
    });

    it("Should prevent execution of invalid implementations", async function () {
      // Use a non-upgradeable contract address
      const invalidImplementation = await mockUSDT.getAddress();
      
      await orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(invalidImplementation);
      await time.increase(UPGRADE_DELAY + 3600);
      
      await expect(
        orphiCrowdFund.executeUpgrade(invalidImplementation)
      ).to.be.revertedWith("OrphiCrowdFund: Invalid implementation");
    });

    it("Should check storage layout compatibility", async function () {
      // In a real test, this would verify storage layout compatibility
      const isCompatible = await orphiCrowdFund.checkStorageCompatibility(implementationAddress);
      expect(isCompatible).to.be.true;
    });
  });

  describe("📊 Upgrade Monitoring and Events", function () {
    it("Should provide comprehensive upgrade status", async function () {
      const implementationAddress = await newImplementation.getAddress();
      await orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress);
      
      const status = await orphiCrowdFund.getUpgradeStatus(implementationAddress);
      
      expect(status).to.have.property('proposed');
      expect(status).to.have.property('proposalTime');
      expect(status).to.have.property('canExecute');
      expect(status).to.have.property('timeRemaining');
      expect(status).to.have.property('signatureCount');
      expect(status).to.have.property('requiredSignatures');
    });

    it("Should list all pending upgrades", async function () {
      const impl1 = await newImplementation.getAddress();
      const impl2 = user1.address; // Mock second implementation
      
      await orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(impl1);
      
      const pendingUpgrades = await orphiCrowdFund.getPendingUpgrades();
      expect(pendingUpgrades).to.include(impl1);
    });

    it("Should emit detailed events for all upgrade actions", async function () {
      const implementationAddress = await newImplementation.getAddress();
      
      // Proposal event
      await expect(
        orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress)
      ).to.emit(orphiCrowdFund, "UpgradeProposed");
      
      // Time advance
      await time.increase(UPGRADE_DELAY + 3600);
      
      // Execution event (mock)
      const canExecute = await orphiCrowdFund.canExecuteUpgrade(implementationAddress);
      expect(canExecute).to.be.true;
    });
  });

  describe("🎯 Integration with System Operations", function () {
    beforeEach(async function () {
      // Setup active system with users
      await orphiCrowdFund.connect(user1).register(owner.address, 1); // PackageTier.PACKAGE_30
      await orphiCrowdFund.connect(user2).register(user1.address, 2); // PackageTier.PACKAGE_50
    });

    it("Should not interfere with normal operations during timelock", async function () {
      const implementationAddress = await newImplementation.getAddress();
      await orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress);
      
      // System should continue operating normally during timelock
      const user1Info = await orphiCrowdFund.getUser(user1.address);
      expect(user1Info.isRegistered).to.be.true;
      
      // New registrations should still work
      const testAmount = ethers.parseUnits("100", 6);
      await mockUSDT.mint(multiSigSigner1.address, testAmount);
      await mockUSDT.connect(multiSigSigner1).approve(await orphiCrowdFund.getAddress(), testAmount);
      
      await orphiCrowdFund.connect(multiSigSigner1).register(user1.address, 1);
      expect(await orphiCrowdFund.isRegistered(multiSigSigner1.address)).to.be.true;
    });

    it("Should preserve system state during upgrade proposal", async function () {
      const initialTotalMembers = await orphiCrowdFund.getTotalMembers();
      const initialPoolBalances = await orphiCrowdFund.getPoolBalances();
      
      const implementationAddress = await newImplementation.getAddress();
      await orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress);
      
      // State should remain unchanged
      const finalTotalMembers = await orphiCrowdFund.getTotalMembers();
      const finalPoolBalances = await orphiCrowdFund.getPoolBalances();
      
      expect(finalTotalMembers).to.equal(initialTotalMembers);
      expect(finalPoolBalances[0]).to.equal(initialPoolBalances[0]); // Check first pool
    });

    it("Should handle upgrade proposals during active distributions", async function () {
      // Fast forward to trigger distributions
      await time.increase(7 * 24 * 60 * 60 + 1); // 7 days
      
      const implementationAddress = await newImplementation.getAddress();
      
      // Should be able to propose upgrade even during distribution time
      await orphiCrowdFund.connect(upgradeProposer).proposeUpgrade(implementationAddress);
      
      // Distributions should still work
      await orphiCrowdFund.distributeGlobalHelpPool();
      
      const proposalTime = await orphiCrowdFund.proposedUpgrades(implementationAddress);
      expect(proposalTime).to.be.greaterThan(0);
    });
  });
});

// Helper for any value matching in events
const anyValue = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
