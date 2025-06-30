// scripts/debug-usdt-funding.cjs
// Debug script to check USDT funding issues

const { ethers } = require("hardhat");

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) returns (bool)",
  "function faucet() returns (bool)"
];

async function main() {
  console.log("🔍 Debugging USDT Funding Issues");
  console.log("=".repeat(50));

  const [deployer] = await ethers.getSigners();
  const MOCK_USDT = "0x00175c710A7448920934eF830f2F22D6370E0642";
  
  console.log(`👤 Deployer: ${deployer.address}`);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 BNB Balance: ${ethers.formatEther(balance)} BNB`);

  // Connect to Mock USDT
  const mockUSDT = new ethers.Contract(MOCK_USDT, ERC20_ABI, deployer);
  
  // Check deployer USDT balance
  const deployerUSDT = await mockUSDT.balanceOf(deployer.address);
  console.log(`💵 Deployer USDT: ${ethers.formatEther(deployerUSDT)} USDT`);

  // Create one test account
  const testWallet = ethers.Wallet.createRandom().connect(ethers.provider);
  console.log(`🧪 Test Account: ${testWallet.address}`);

  // Step 1: Fund with BNB
  console.log("\n📤 Step 1: Funding test account with BNB...");
  try {
    const bnbTx = await deployer.sendTransaction({
      to: testWallet.address,
      value: ethers.parseEther("0.01")
    });
    await bnbTx.wait();
    
    const testBNB = await ethers.provider.getBalance(testWallet.address);
    console.log(`✅ Test account BNB: ${ethers.formatEther(testBNB)} BNB`);
  } catch (error) {
    console.log(`❌ BNB funding failed: ${error.message}`);
    return;
  }

  // Step 2: Fund with USDT
  console.log("\n📤 Step 2: Funding test account with USDT...");
  try {
    const usdtAmount = ethers.parseEther("500"); // 500 USDT
    const usdtTx = await mockUSDT.transfer(testWallet.address, usdtAmount);
    await usdtTx.wait();
    
    const testUSDT = await mockUSDT.balanceOf(testWallet.address);
    console.log(`✅ Test account USDT: ${ethers.formatEther(testUSDT)} USDT`);
  } catch (error) {
    console.log(`❌ USDT funding failed: ${error.message}`);
    console.log("🔍 Trying to understand the error...");
    
    // Check if we have enough USDT
    const ourBalance = await mockUSDT.balanceOf(deployer.address);
    console.log(`Our USDT balance: ${ethers.formatEther(ourBalance)} USDT`);
    
    if (ourBalance < ethers.parseEther("500")) {
      console.log("⚠️ Issue: Not enough USDT in deployer account");
      
      // Try to get more USDT from faucet
      console.log("📤 Trying USDT faucet...");
      try {
        const faucetTx = await mockUSDT.faucet();
        await faucetTx.wait();
        
        const newBalance = await mockUSDT.balanceOf(deployer.address);
        console.log(`✅ Faucet successful! New balance: ${ethers.formatEther(newBalance)} USDT`);
      } catch (faucetError) {
        console.log(`❌ Faucet failed: ${faucetError.message}`);
      }
    }
    return;
  }

  // Step 3: Test registration
  console.log("\n🎯 Step 3: Testing registration...");
  try {
    const LeadFive = await ethers.getContractFactory("LeadFive");
    const leadFive = LeadFive.attach("0x292c11A70ef007B383671b2Ada56bd68ad8d4988");
    
    const packagePrice = ethers.parseEther("30"); // Package 1 price
    
    // Connect contracts to test account
    const testUSDTContract = mockUSDT.connect(testWallet);
    const testLeadFive = leadFive.connect(testWallet);
    
    // Approve USDT spending
    console.log("📝 Approving USDT spending...");
    const approveTx = await testUSDTContract.approve("0x292c11A70ef007B383671b2Ada56bd68ad8d4988", packagePrice);
    await approveTx.wait();
    console.log("✅ USDT approved");
    
    // Attempt registration
    console.log("📝 Attempting registration...");
    const registerTx = await testLeadFive.register(
      deployer.address, // referrer
      1, // package level
      true, // use USDT
      "TEST001" // custom code
    );
    await registerTx.wait();
    
    console.log("🎉 Registration successful!");
    
    // Check final balances
    const finalUSDT = await mockUSDT.balanceOf(testWallet.address);
    console.log(`Final test account USDT: ${ethers.formatEther(finalUSDT)} USDT`);
    
  } catch (error) {
    console.log(`❌ Registration failed: ${error.message}`);
    
    // Check balances again
    const finalTestUSDT = await mockUSDT.balanceOf(testWallet.address);
    const finalTestBNB = await ethers.provider.getBalance(testWallet.address);
    console.log(`Test account USDT: ${ethers.formatEther(finalTestUSDT)} USDT`);
    console.log(`Test account BNB: ${ethers.formatEther(finalTestBNB)} BNB`);
  }

  console.log("\n🔍 Diagnosis complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Debug failed:", error);
    process.exit(1);
  });
