// Quick mainnet contract test
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 MAINNET CONTRACT VALIDATION");
  console.log("=" .repeat(50));
  
  const contractAddress = "0x572BbD5092f5c16B7B9CA60257FBa7b66D5bD30f";
  console.log(`📍 Contract: ${contractAddress}`);
  
  // Connect to contract
  const LeadFive = await ethers.getContractFactory("LeadFive");
  const contract = LeadFive.attach(contractAddress);
  
  try {
    // Test basic contract state
    const owner = await contract.owner();
    const totalUsers = await contract.totalUsers();
    const feeRecipient = await contract.platformFeeRecipient();
    const usdt = await contract.usdt();
    
    console.log("\n📋 Contract State:");
    console.log(`├─ Owner: ${owner}`);
    console.log(`├─ Total Users: ${totalUsers}`);
    console.log(`├─ Fee Recipient: ${feeRecipient}`);
    console.log(`├─ USDT Token: ${usdt}`);
    
    // Test package prices
    console.log("\n💰 Package Prices:");
    for (let i = 1; i <= 4; i++) {
      const pkg = await contract.packages(i);
      console.log(`├─ Level ${i}: ${ethers.formatEther(pkg.price)} USDT`);
    }
    
    // Test pool balances
    const pools = await contract.getPoolBalances();
    console.log("\n🏊 Pool Balances:");
    console.log(`├─ Leader Pool: ${ethers.formatEther(pools[0])} USDT`);
    console.log(`├─ Help Pool: ${ethers.formatEther(pools[1])} USDT`);
    console.log(`├─ Club Pool: ${ethers.formatEther(pools[2])} USDT`);
    
    console.log("\n✅ ALL TESTS PASSED - CONTRACT IS LIVE!");
    console.log("🔗 BSCScan: https://bscscan.com/address/" + contractAddress);
    
  } catch (error) {
    console.log("❌ Contract test failed:", error.message);
  }
}

main().catch(console.error);
