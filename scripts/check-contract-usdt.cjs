// scripts/check-contract-usdt.cjs
// Check if the LeadFive contract has USDT balance issues

const { ethers } = require("hardhat");

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

async function main() {
  console.log("🔍 Checking Contract USDT Balance");
  console.log("=".repeat(50));

  const [deployer] = await ethers.getSigners();
  const LEADFIVE_CONTRACT = "0x292c11A70ef007B383671b2Ada56bd68ad8d4988";
  const MOCK_USDT = "0x00175c710A7448920934eF830f2F22D6370E0642";
  
  console.log(`📋 LeadFive Contract: ${LEADFIVE_CONTRACT}`);
  console.log(`🪙 Mock USDT: ${MOCK_USDT}`);

  // Connect to contracts
  const LeadFive = await ethers.getContractFactory("LeadFive");
  const leadFive = LeadFive.attach(LEADFIVE_CONTRACT);
  const mockUSDT = new ethers.Contract(MOCK_USDT, ERC20_ABI, deployer);

  // Check contract's USDT balance
  const contractUSDT = await mockUSDT.balanceOf(LEADFIVE_CONTRACT);
  console.log(`💰 Contract USDT Balance: ${ethers.formatEther(contractUSDT)} USDT`);

  // Check what USDT token the contract is using
  try {
    const contractUSDTAddress = await leadFive.usdt();
    console.log(`🔗 Contract's USDT Token: ${contractUSDTAddress}`);
    console.log(`🔗 Our Mock USDT: ${MOCK_USDT}`);
    console.log(`✅ Addresses Match: ${contractUSDTAddress.toLowerCase() === MOCK_USDT.toLowerCase()}`);
  } catch (error) {
    console.log(`❌ Error getting contract USDT address: ${error.message}`);
  }

  // Check deployer balance in the contract's USDT token
  try {
    const contractUSDTAddress = await leadFive.usdt();
    if (contractUSDTAddress.toLowerCase() !== MOCK_USDT.toLowerCase()) {
      console.log(`\n⚠️ MISMATCH DETECTED!`);
      console.log(`Contract uses: ${contractUSDTAddress}`);
      console.log(`We're using: ${MOCK_USDT}`);
      
      // Check balance in the contract's USDT token
      const contractUSDTContract = new ethers.Contract(contractUSDTAddress, ERC20_ABI, deployer);
      const deployerBalanceInContractUSDT = await contractUSDTContract.balanceOf(deployer.address);
      console.log(`Deployer balance in contract's USDT: ${ethers.formatEther(deployerBalanceInContractUSDT)} USDT`);
    }
  } catch (error) {
    console.log(`❌ Error checking USDT mismatch: ${error.message}`);
  }

  // Check package prices
  try {
    console.log(`\n📦 Package Prices:`);
    for (let i = 1; i <= 4; i++) {
      const packageData = await leadFive.packages(i);
      console.log(`Package ${i}: ${ethers.formatEther(packageData.price)} USDT`);
    }
  } catch (error) {
    console.log(`❌ Error getting package prices: ${error.message}`);
  }

  // Check platform fee recipient
  try {
    const feeRecipient = await leadFive.platformFeeRecipient();
    console.log(`\n💼 Platform Fee Recipient: ${feeRecipient}`);
    
    if (feeRecipient === ethers.ZeroAddress) {
      console.log(`⚠️ Platform fee recipient is zero address!`);
    }
  } catch (error) {
    console.log(`❌ Error getting fee recipient: ${error.message}`);
  }

  console.log("\n🔍 Contract balance check complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Check failed:", error);
    process.exit(1);
  });
