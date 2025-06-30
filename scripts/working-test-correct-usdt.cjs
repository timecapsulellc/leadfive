// scripts/working-test-correct-usdt.cjs
// Working test using the contract's actual USDT token

const { ethers } = require("hardhat");

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) returns (bool)",
  "function faucet() returns (bool)"
];

const TEST_CONFIG = {
  LEADFIVE_PROXY: "0x292c11A70ef007B383671b2Ada56bd68ad8d4988",
  CONTRACT_USDT: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd", // Contract's actual USDT
  TOTAL_USERS: 50 // Start with 50 users
};

async function main() {
  console.log("🚀 Working Test with Correct USDT Token");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log(`👤 Testing with: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 BNB Balance: ${ethers.formatEther(balance)} BNB`);

  // Connect to contracts
  const LeadFive = await ethers.getContractFactory("LeadFive");
  const leadFive = LeadFive.attach(TEST_CONFIG.LEADFIVE_PROXY);
  const contractUSDT = new ethers.Contract(TEST_CONFIG.CONTRACT_USDT, ERC20_ABI, deployer);

  console.log(`📋 LeadFive: ${TEST_CONFIG.LEADFIVE_PROXY}`);
  console.log(`🪙 Contract USDT: ${TEST_CONFIG.CONTRACT_USDT}`);

  // Check our balance in the contract's USDT
  const deployerUSDT = await contractUSDT.balanceOf(deployer.address);
  console.log(`💵 Our USDT Balance: ${ethers.formatEther(deployerUSDT)} USDT`);

  if (deployerUSDT === 0n) {
    console.log("⚠️ We have no USDT in the contract's token!");
    console.log("📤 Trying to get USDT from faucet...");
    
    try {
      const faucetTx = await contractUSDT.faucet();
      await faucetTx.wait();
      
      const newBalance = await contractUSDT.balanceOf(deployer.address);
      console.log(`✅ Faucet successful! Balance: ${ethers.formatEther(newBalance)} USDT`);
    } catch (error) {
      console.log(`❌ Faucet failed: ${error.message}`);
      console.log("🔧 Trying to mint USDT...");
      
      try {
        const mintTx = await contractUSDT.mint(deployer.address, ethers.parseEther("100000"));
        await mintTx.wait();
        
        const mintedBalance = await contractUSDT.balanceOf(deployer.address);
        console.log(`✅ Minting successful! Balance: ${ethers.formatEther(mintedBalance)} USDT`);
      } catch (mintError) {
        console.log(`❌ Minting failed: ${mintError.message}`);
        console.log("🛑 Cannot proceed without USDT. Check the token contract.");
        return;
      }
    }
  }

  // Generate test accounts
  console.log(`\n🏗️ Generating ${TEST_CONFIG.TOTAL_USERS} test registrations...`);
  
  let successCount = 0;
  let errorCount = 0;
  const testAccounts = [];
  
  // Generate 10 test accounts
  for (let i = 0; i < 10; i++) {
    const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
    testAccounts.push(wallet);
  }
  
  // Fund test accounts
  console.log("💰 Funding test accounts...");
  for (let i = 0; i < testAccounts.length; i++) {
    try {
      // Give BNB for gas
      const bnbTx = await deployer.sendTransaction({
        to: testAccounts[i].address,
        value: ethers.parseEther("0.01")
      });
      await bnbTx.wait();

      // Give USDT for registrations
      const usdtTx = await contractUSDT.transfer(testAccounts[i].address, ethers.parseEther("1000"));
      await usdtTx.wait();

      if ((i + 1) % 3 === 0) {
        console.log(`Funded ${i + 1}/10 accounts`);
      }
    } catch (error) {
      console.log(`❌ Error funding account ${i + 1}: ${error.message}`);
    }
  }

  // Test registrations
  console.log(`\n🎯 Testing ${TEST_CONFIG.TOTAL_USERS} registrations...`);
  
  for (let i = 0; i < TEST_CONFIG.TOTAL_USERS; i++) {
    try {
      const accountIndex = i % testAccounts.length;
      const account = testAccounts[accountIndex];
      
      // Package level rotation
      const packageLevel = (i % 4) + 1;
      const packagePrices = [
        ethers.parseEther("30"),   // Package 1
        ethers.parseEther("50"),   // Package 2
        ethers.parseEther("100"),  // Package 3
        ethers.parseEther("200")   // Package 4
      ];
      const packagePrice = packagePrices[packageLevel - 1];
      
      const referrer = successCount > 0 ? 
        testAccounts[Math.floor(Math.random() * testAccounts.length)].address :
        deployer.address;
      
      const customCode = `WORK${String(i + 1).padStart(3, '0')}`;
      
      // Connect contracts to user account
      const userUSDT = contractUSDT.connect(account);
      const userLeadFive = leadFive.connect(account);
      
      // Approve USDT
      const approveTx = await userUSDT.approve(TEST_CONFIG.LEADFIVE_PROXY, packagePrice);
      await approveTx.wait();
      
      // Register
      const registerTx = await userLeadFive.register(referrer, packageLevel, true, customCode);
      await registerTx.wait();
      
      successCount++;
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Progress: ${successCount}/${TEST_CONFIG.TOTAL_USERS} (${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(1)}%)`);
      }
      
    } catch (error) {
      errorCount++;
      if (errorCount <= 5) {
        console.log(`❌ User ${i + 1} failed: ${error.message}`);
      }
    }
  }

  // Test a few withdrawals
  console.log(`\n💸 Testing withdrawals...`);
  let withdrawalCount = 0;
  
  for (let i = 0; i < Math.min(5, testAccounts.length); i++) {
    try {
      const account = testAccounts[i];
      const userLeadFive = leadFive.connect(account);
      
      // Check user balance
      const userData = await leadFive.users(account.address);
      if (userData.balance > ethers.parseEther("5")) {
        const withdrawAmount = userData.balance / 2n;
        
        const tx = await userLeadFive.withdraw(withdrawAmount);
        await tx.wait();
        
        withdrawalCount++;
        console.log(`✅ Withdrawal ${withdrawalCount}: ${ethers.formatEther(withdrawAmount)} USDT`);
      }
    } catch (error) {
      console.log(`❌ Withdrawal ${i + 1} failed: ${error.message}`);
    }
  }

  // Final results
  console.log(`\n📊 WORKING TEST RESULTS`);
  console.log("=".repeat(50));
  console.log(`✅ Successful Registrations: ${successCount}/${TEST_CONFIG.TOTAL_USERS}`);
  console.log(`❌ Failed Registrations: ${errorCount}`);
  console.log(`📈 Success Rate: ${((successCount/TEST_CONFIG.TOTAL_USERS)*100).toFixed(2)}%`);
  console.log(`💸 Withdrawals: ${withdrawalCount}`);
  
  // Final contract state
  try {
    const totalUsers = await leadFive.totalUsers();
    const poolBalances = await leadFive.getPoolBalances();
    
    console.log(`\n📋 Contract State:`);
    console.log(`├─ Total Users: ${totalUsers}`);
    console.log(`├─ Leader Pool: ${ethers.formatEther(poolBalances[0])} USDT`);
    console.log(`├─ Help Pool: ${ethers.formatEther(poolBalances[1])} USDT`);
    console.log(`├─ Club Pool: ${ethers.formatEther(poolBalances[2])} USDT`);
  } catch (error) {
    console.log(`❌ Error getting contract state: ${error.message}`);
  }

  if (successCount >= 25) {
    console.log(`\n🎉 SUCCESS! Contract is working properly!`);
    console.log(`✅ Ready for larger scale testing`);
  } else {
    console.log(`\n⚠️ Partial success - investigate remaining issues`);
  }
}

main()
  .then(() => {
    console.log("✅ Working test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
