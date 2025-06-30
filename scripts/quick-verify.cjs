// scripts/quick-verify.cjs
// Quick verification using standard IERC20 interface

const { ethers } = require("hardhat");

async function quickVerify() {
  console.log("🔍 Quick Contract Verification");
  console.log("=".repeat(40));

  try {
    const LEADFIVE_PROXY = "0x292c11A70ef007B383671b2Ada56bd68ad8d4988";
    const MOCK_USDT = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";

    const [deployer] = await ethers.getSigners();
    console.log(`👤 Account: ${deployer.address}`);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 BNB: ${ethers.formatEther(balance)} BNB`);

    // Connect to LeadFive contract
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = LeadFive.attach(LEADFIVE_PROXY);
    
    console.log("\n📋 LeadFive Status:");
    console.log("-".repeat(25));
    
    const owner = await leadFive.owner();
    const totalUsers = await leadFive.totalUsers();
    const packages = await Promise.all([
      leadFive.packages(1),
      leadFive.packages(2),
      leadFive.packages(3),
      leadFive.packages(4)
    ]);
    
    console.log(`✅ Owner: ${owner}`);
    console.log(`✅ Total Users: ${totalUsers}`);
    console.log(`✅ Package 1: ${ethers.formatEther(packages[0].price)} USDT`);
    console.log(`✅ Package 2: ${ethers.formatEther(packages[1].price)} USDT`);
    console.log(`✅ Package 3: ${ethers.formatEther(packages[2].price)} USDT`);
    console.log(`✅ Package 4: ${ethers.formatEther(packages[3].price)} USDT`);

    // Check USDT using standard IERC20 interface
    const usdtAbi = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function mint(address to, uint256 amount)"
    ];
    
    const usdt = new ethers.Contract(MOCK_USDT, usdtAbi, deployer);
    
    console.log("\n🪙 USDT Status:");
    console.log("-".repeat(20));
    
    try {
      const name = await usdt.name();
      const symbol = await usdt.symbol();
      const decimals = await usdt.decimals();
      const usdtBalance = await usdt.balanceOf(deployer.address);
      
      console.log(`✅ Name: ${name}`);
      console.log(`✅ Symbol: ${symbol}`);
      console.log(`✅ Decimals: ${decimals}`);
      console.log(`✅ Our Balance: ${ethers.formatEther(usdtBalance)} USDT`);
      
      // Try to mint some USDT for testing
      if (usdtBalance < ethers.parseEther("10000")) {
        console.log("\n🔄 Minting USDT for testing...");
        try {
          const mintTx = await usdt.mint(deployer.address, ethers.parseEther("50000"));
          await mintTx.wait();
          
          const newBalance = await usdt.balanceOf(deployer.address);
          console.log(`✅ Minted! New balance: ${ethers.formatEther(newBalance)} USDT`);
        } catch (mintError) {
          console.log(`⚠️ Minting failed (expected if not owner): ${mintError.message.split('.')[0]}`);
        }
      }
      
    } catch (usdtError) {
      console.log(`❌ USDT contract error: ${usdtError.message}`);
    }

    console.log("\n🎯 Ready for Mass Testing!");
    return true;

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    return false;
  }
}

quickVerify()
  .then((success) => {
    if (success) {
      console.log("\n✅ Verification complete - proceed with testing");
      process.exit(0);
    } else {
      console.log("\n❌ Verification failed");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
