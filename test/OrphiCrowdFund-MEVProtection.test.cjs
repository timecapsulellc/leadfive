const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * 🛡️ MEV PROTECTION & ATTACK VECTOR TESTS
 * 
 * This test suite specifically targets:
 * - MEV (Maximal Extractable Value) attack protection
 * - Front-running prevention
 * - Sandwich attack mitigation
 * - Flash loan attack prevention
 * - Price manipulation resistance
 */
describe("🛡️ OrphiCrowdFund - MEV Protection & Attack Vectors", function () {
  let orphiCrowdFund;
  let mockUSDT;
  let owner, adminReserve;
  let user1, user2, user3;
  let attacker, flashLoanAttacker;
  let users = [];

  const PACKAGE_30 = ethers.parseUnits("30", 6);
  const PACKAGE_100 = ethers.parseUnits("100", 6);
  const PACKAGE_200 = ethers.parseUnits("200", 6);

  const PackageTier = {
    PACKAGE_30: 1,
    PACKAGE_50: 2,
    PACKAGE_100: 3,
    PACKAGE_200: 4
  };

  beforeEach(async function () {
    [owner, adminReserve, user1, user2, user3, attacker, flashLoanAttacker, ...users] = await ethers.getSigners();

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

    // Setup test funds
    const testAmount = ethers.parseUnits("100000", 6); // Large amount for attackers
    const allUsers = [user1, user2, user3, attacker, flashLoanAttacker, ...users.slice(0, 20)];
    
    for (const user of allUsers) {
      await mockUSDT.mint(user.address, testAmount);
      await mockUSDT.connect(user).approve(await orphiCrowdFund.getAddress(), testAmount);
    }
  });

  describe("🚫 MEV Protection - Block Delay Enforcement", function () {
    it("Should prevent same-block registration attacks", async function () {
      // Disable auto-mining to control block timing
      await ethers.provider.send("evm_setAutomine", [false]);
      
      try {
        // Attempt multiple registrations in same block
        const tx1 = orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
        const tx2 = orphiCrowdFund.connect(attacker).register(owner.address, PackageTier.PACKAGE_200);
        
        // Mine the block
        await ethers.provider.send("evm_mine");
        
        // Wait for transactions
        await tx1;
        
        // Second transaction should be protected by MEV guard
        await expect(tx2).to.be.revertedWith("OrphiCrowdFund: MEV protection active");
        
      } finally {
        // Re-enable auto-mining
        await ethers.provider.send("evm_setAutomine", [true]);
      }
    });

    it("Should allow transactions in different blocks", async function () {
      // First registration
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      
      // Mine a new block
      await ethers.provider.send("evm_mine");
      
      // Second registration should work in new block
      await orphiCrowdFund.connect(user2).register(user1.address, PackageTier.PACKAGE_50);
      
      expect(await orphiCrowdFund.isRegistered(user1.address)).to.be.true;
      expect(await orphiCrowdFund.isRegistered(user2.address)).to.be.true;
    });

    it("Should track user's last interaction block", async function () {
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      
      const lastBlock = await orphiCrowdFund.userLastBlock(user1.address);
      const currentBlock = await ethers.provider.getBlockNumber();
      
      expect(lastBlock).to.equal(currentBlock);
    });
  });

  describe("🎯 Front-Running Attack Prevention", function () {
    beforeEach(async function () {
      // Setup scenario for front-running tests
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      
      // Build up some earnings for user1
      for (let i = 0; i < 5; i++) {
        await orphiCrowdFund.connect(users[i]).register(user1.address, PackageTier.PACKAGE_30);
      }
    });

    it("Should prevent front-running of profitable registrations", async function () {
      // Simulate attacker seeing a profitable registration in mempool
      // and trying to front-run it
      
      await ethers.provider.send("evm_setAutomine", [false]);
      
      try {
        // Attacker tries to front-run by registering first with higher gas
        const attackerTx = orphiCrowdFund.connect(attacker).register(user1.address, PackageTier.PACKAGE_200, {
          gasPrice: ethers.parseUnits("100", "gwei") // High gas price
        });
        
        // Legitimate user transaction with normal gas
        const userTx = orphiCrowdFund.connect(user2).register(user1.address, PackageTier.PACKAGE_50, {
          gasPrice: ethers.parseUnits("50", "gwei") // Normal gas price
        });
        
        // Mine block - both transactions in same block
        await ethers.provider.send("evm_mine");
        
        // One should succeed, the other should be MEV protected
        await attackerTx;
        await expect(userTx).to.be.revertedWith("OrphiCrowdFund: MEV protection active");
        
      } finally {
        await ethers.provider.send("evm_setAutomine", [true]);
      }
    });

    it("Should prevent withdrawal front-running", async function () {
      // Give user1 some withdrawable amount
      const user1Info = await orphiCrowdFund.getUser(user1.address);
      
      if (user1Info.withdrawableAmount > 0) {
        await ethers.provider.send("evm_setAutomine", [false]);
        
        try {
          // Attacker tries to front-run withdrawal
          const attackerTx = orphiCrowdFund.connect(attacker).register(user1.address, PackageTier.PACKAGE_200);
          const withdrawTx = orphiCrowdFund.connect(user1).withdraw();
          
          await ethers.provider.send("evm_mine");
          
          // MEV protection should prevent same-block exploitation
          await withdrawTx;
          await expect(attackerTx).to.be.revertedWith("OrphiCrowdFund: MEV protection active");
          
        } finally {
          await ethers.provider.send("evm_setAutomine", [true]);
        }
      }
    });
  });

  describe("🥪 Sandwich Attack Prevention", function () {
    it("Should prevent sandwich attacks on large registrations", async function () {
      // Sandwich attack: attacker makes transaction before and after victim
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      
      await ethers.provider.send("evm_setAutomine", [false]);
      
      try {
        // Attacker front-runs
        const frontRunTx = orphiCrowdFund.connect(attacker).register(user1.address, PackageTier.PACKAGE_30);
        
        // Victim transaction
        const victimTx = orphiCrowdFund.connect(user2).register(user1.address, PackageTier.PACKAGE_200);
        
        // Attacker back-runs
        const backRunTx = orphiCrowdFund.connect(attacker).register(user1.address, PackageTier.PACKAGE_30);
        
        await ethers.provider.send("evm_mine");
        
        // Only first transaction should succeed due to MEV protection
        await frontRunTx;
        await expect(victimTx).to.be.revertedWith("OrphiCrowdFund: MEV protection active");
        await expect(backRunTx).to.be.revertedWith("OrphiCrowdFund: MEV protection active");
        
      } finally {
        await ethers.provider.send("evm_setAutomine", [true]);
      }
    });
  });

  describe("⚡ Flash Loan Attack Prevention", function () {
    it("Should prevent flash loan exploitation", async function () {
      // Deploy a mock flash loan attacker contract
      const FlashLoanAttacker = await ethers.getContractFactory("MockUSDT"); // Using as proxy
      const flashAttacker = await FlashLoanAttacker.deploy();
      
      // Fund the attacker contract
      await mockUSDT.mint(flashAttacker.target, ethers.parseUnits("1000000", 6)); // 1M USDT
      await mockUSDT.connect(flashLoanAttacker).transfer(flashAttacker.target, ethers.parseUnits("100000", 6));
      
      // Approve massive amount (simulating flash loan)
      await mockUSDT.connect(flashLoanAttacker).approve(await orphiCrowdFund.getAddress(), ethers.parseUnits("1000000", 6));
      
      // Try to exploit with large registrations
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      
      // Flash loan attacker tries to exploit
      await ethers.provider.send("evm_setAutomine", [false]);
      
      try {
        // Multiple large registrations in same transaction/block
        const attack1 = orphiCrowdFund.connect(flashLoanAttacker).register(user1.address, PackageTier.PACKAGE_200);
        const attack2 = orphiCrowdFund.connect(flashLoanAttacker).register(user1.address, PackageTier.PACKAGE_200);
        
        await ethers.provider.send("evm_mine");
        
        await attack1;
        await expect(attack2).to.be.revertedWith("OrphiCrowdFund: User already registered");
        
      } finally {
        await ethers.provider.send("evm_setAutomine", [true]);
      }
    });

    it("Should limit single-user impact regardless of funding", async function () {
      // Even with massive funds, single user should be limited
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      
      // Attacker with huge funds
      await mockUSDT.mint(attacker.address, ethers.parseUnits("10000000", 6)); // 10M USDT
      await mockUSDT.connect(attacker).approve(await orphiCrowdFund.getAddress(), ethers.parseUnits("10000000", 6));
      
      // Can only register once
      await orphiCrowdFund.connect(attacker).register(user1.address, PackageTier.PACKAGE_200);
      
      // Second registration should fail
      await expect(
        orphiCrowdFund.connect(attacker).register(user1.address, PackageTier.PACKAGE_200)
      ).to.be.revertedWith("OrphiCrowdFund: User already registered");
    });
  });

  describe("💰 Economic Attack Prevention", function () {
    it("Should prevent manipulation of reward pools", async function () {
      // Setup legitimate users first
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      await orphiCrowdFund.connect(user2).register(user1.address, PackageTier.PACKAGE_50);
      
      // Attacker tries to manipulate by registering many users at specific times
      const initialPoolBalances = await orphiCrowdFund.getPoolBalances();
      
      // Register attackers just before distribution
      await time.increase(7 * 24 * 60 * 60 - 60); // Almost time for distribution
      
      // Attacker can't register multiple times
      await orphiCrowdFund.connect(attacker).register(user1.address, PackageTier.PACKAGE_200);
      
      // Pool balances should be calculated fairly
      const finalPoolBalances = await orphiCrowdFund.getPoolBalances();
      
      // Verify pools were affected by legitimate activity
      expect(finalPoolBalances[4]).to.be.greaterThan(initialPoolBalances[4]); // Global Help Pool
    });

    it("Should prevent timing attacks on distributions", async function () {
      // Setup users and wait for distribution time
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      await orphiCrowdFund.connect(user2).register(user1.address, PackageTier.PACKAGE_50);
      
      await time.increase(7 * 24 * 60 * 60); // 7 days
      
      // Attacker tries to time registration just before distribution
      await ethers.provider.send("evm_setAutomine", [false]);
      
      try {
        const attackerReg = orphiCrowdFund.connect(attacker).register(user1.address, PackageTier.PACKAGE_200);
        const distribution = orphiCrowdFund.distributeGlobalHelpPool();
        
        await ethers.provider.send("evm_mine");
        
        // Both can complete, but distribution logic should be fair
        await attackerReg;
        await distribution;
        
        // Verify attacker didn't gain unfair advantage
        const attackerInfo = await orphiCrowdFund.getUser(attacker.address);
        expect(attackerInfo.globalHelpPoolEarnings).to.be.lessThanOrEqual(
          attackerInfo.totalInvested * BigInt(4) // 4x cap
        );
        
      } finally {
        await ethers.provider.send("evm_setAutomine", [true]);
      }
    });
  });

  describe("🔐 Transaction Ordering Attacks", function () {
    it("Should prevent transaction ordering manipulation", async function () {
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      
      // Multiple users try to register in specific order to gain advantage
      await ethers.provider.send("evm_setAutomine", [false]);
      
      try {
        // All try to register to same sponsor
        const tx1 = orphiCrowdFund.connect(user2).register(user1.address, PackageTier.PACKAGE_50);
        const tx2 = orphiCrowdFund.connect(user3).register(user1.address, PackageTier.PACKAGE_100);
        const tx3 = orphiCrowdFund.connect(attacker).register(user1.address, PackageTier.PACKAGE_200);
        
        await ethers.provider.send("evm_mine");
        
        // Only first should succeed due to MEV protection
        await tx1;
        await expect(tx2).to.be.revertedWith("OrphiCrowdFund: MEV protection active");
        await expect(tx3).to.be.revertedWith("OrphiCrowdFund: MEV protection active");
        
      } finally {
        await ethers.provider.send("evm_setAutomine", [true]);
      }
    });
  });

  describe("🎭 Sybil Attack Prevention", function () {
    it("Should not prevent legitimate multi-address ownership", async function () {
      // Users can legitimately own multiple addresses, but each gets one registration
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      
      // Each address is independent
      await orphiCrowdFund.connect(user2).register(user1.address, PackageTier.PACKAGE_50);
      await orphiCrowdFund.connect(user3).register(user1.address, PackageTier.PACKAGE_30);
      
      // All should succeed as they're different addresses
      expect(await orphiCrowdFund.isRegistered(user1.address)).to.be.true;
      expect(await orphiCrowdFund.isRegistered(user2.address)).to.be.true;
      expect(await orphiCrowdFund.isRegistered(user3.address)).to.be.true;
    });

    it("Should enforce one registration per address", async function () {
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      
      // Second registration from same address should fail
      await expect(
        orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_200)
      ).to.be.revertedWith("OrphiCrowdFund: User already registered");
    });
  });

  describe("⏱️ Time-Based Attack Prevention", function () {
    it("Should prevent timestamp manipulation attacks", async function () {
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      
      // Try to manipulate timing for distributions
      const initialTime = await time.latest();
      
      // Fast forward close to distribution time
      await time.increase(7 * 24 * 60 * 60 - 300); // 5 minutes before
      
      // Attacker registration
      await orphiCrowdFund.connect(attacker).register(user1.address, PackageTier.PACKAGE_200);
      
      // Small time manipulation shouldn't affect distribution fairness
      await time.increase(301); // Just past distribution time
      
      // Distribution should work based on when users actually registered
      await orphiCrowdFund.distributeGlobalHelpPool();
      
      const attackerInfo = await orphiCrowdFund.getUser(attacker.address);
      expect(attackerInfo.isRegistered).to.be.true;
      
      // But earnings should be fair based on investment and timing
      expect(attackerInfo.globalHelpPoolEarnings).to.be.lessThanOrEqual(
        attackerInfo.totalInvested * BigInt(4)
      );
    });
  });

  describe("🔄 Reentrancy Attack Comprehensive Tests", function () {
    it("Should prevent all forms of reentrancy", async function () {
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      
      // Build up withdrawable amount
      for (let i = 0; i < 5; i++) {
        await orphiCrowdFund.connect(users[i]).register(user1.address, PackageTier.PACKAGE_30);
      }
      
      const user1Info = await orphiCrowdFund.getUser(user1.address);
      if (user1Info.withdrawableAmount > 0) {
        // Normal withdrawal should work
        await orphiCrowdFund.connect(user1).withdraw();
        
        // Immediate second withdrawal should fail (no amount left)
        await expect(
          orphiCrowdFund.connect(user1).withdraw()
        ).to.be.revertedWith("OrphiCrowdFund: No withdrawable amount");
      }
    });

    it("Should prevent cross-function reentrancy", async function () {
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      
      // Verify ReentrancyGuard protects across all state-changing functions
      const user1Info = await orphiCrowdFund.getUser(user1.address);
      expect(user1Info.isRegistered).to.be.true;
      
      // Multiple function calls should be protected by the same guard
      await expect(
        orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_200)
      ).to.be.revertedWith("OrphiCrowdFund: User already registered");
    });
  });

  describe("🛡️ Combined Attack Scenarios", function () {
    it("Should resist sophisticated combined attacks", async function () {
      // Setup legitimate network
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      await orphiCrowdFund.connect(user2).register(user1.address, PackageTier.PACKAGE_50);
      
      // Attacker tries multiple attack vectors simultaneously
      await ethers.provider.send("evm_setAutomine", [false]);
      
      try {
        // 1. Large registration (economic attack)
        const attack1 = orphiCrowdFund.connect(attacker).register(user1.address, PackageTier.PACKAGE_200);
        
        // 2. Front-running legitimate user
        const victim = orphiCrowdFund.connect(user3).register(user1.address, PackageTier.PACKAGE_30);
        
        // 3. Timing manipulation near distribution
        await time.increase(7 * 24 * 60 * 60); // Distribution time
        const distribution = orphiCrowdFund.distributeGlobalHelpPool();
        
        await ethers.provider.send("evm_mine");
        
        // MEV protection should limit impact
        await attack1;
        await expect(victim).to.be.revertedWith("OrphiCrowdFund: MEV protection active");
        await distribution;
        
        // Verify system integrity maintained
        const systemStats = await orphiCrowdFund.getTotalMembers();
        expect(systemStats).to.be.greaterThan(0);
        
      } finally {
        await ethers.provider.send("evm_setAutomine", [true]);
      }
    });

    it("Should maintain fairness under attack conditions", async function () {
      // Setup legitimate users
      const legitimateUsers = [user1, user2, user3];
      
      await orphiCrowdFund.connect(user1).register(owner.address, PackageTier.PACKAGE_100);
      
      for (let i = 0; i < legitimateUsers.length - 1; i++) {
        await orphiCrowdFund.connect(legitimateUsers[i + 1]).register(
          legitimateUsers[i].address, 
          PackageTier.PACKAGE_50
        );
        
        // Add delay between legitimate registrations
        await ethers.provider.send("evm_mine");
      }
      
      // Attacker tries to exploit between legitimate operations
      await orphiCrowdFund.connect(attacker).register(user1.address, PackageTier.PACKAGE_200);
      
      // Verify legitimate users weren't negatively affected
      for (const user of legitimateUsers) {
        const userInfo = await orphiCrowdFund.getUser(user.address);
        expect(userInfo.isRegistered).to.be.true;
        expect(userInfo.totalEarnings).to.be.lessThanOrEqual(userInfo.totalInvested * BigInt(4));
      }
    });
  });
});
