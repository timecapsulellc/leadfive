const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 VERIFYING .ENV CONFIGURATION...\n");

  console.log("=".repeat(70));
  console.log("🌐 NETWORK CONFIGURATION");
  console.log("=".repeat(70));
  console.log("BSC Mainnet RPC:", process.env.BSC_MAINNET_RPC_URL);
  console.log("BSC Testnet RPC:", process.env.BSC_TESTNET_RPC_URL);
  console.log("Network:", process.env.NETWORK);
  console.log("Chain ID:", process.env.CHAIN_ID);

  console.log("\n" + "=".repeat(70));
  console.log("🔑 DEPLOYMENT CONFIGURATION");
  console.log("=".repeat(70));
  console.log("Deployer Address:", process.env.DEPLOYER_ADDRESS);
  console.log("BSCScan API Key:", process.env.BSCSCAN_API_KEY ? "✅ SET" : "❌ NOT SET");

  console.log("\n" + "=".repeat(70));
  console.log("🪙 TOKEN ADDRESSES");
  console.log("=".repeat(70));
  console.log("USDT Mainnet:", process.env.USDT_MAINNET);
  console.log("USDT Testnet:", process.env.USDT_TESTNET);

  console.log("\n" + "=".repeat(70));
  console.log("👑 ADMIN & ROLE ADDRESSES");
  console.log("=".repeat(70));
  console.log("Orphi Admin Wallet:", process.env.Orphi_ADMIN_WALLET);
  console.log("Admin Address:", process.env.ADMIN_ADDRESS);
  console.log("Admin Reserve:", process.env.ADMIN_RESERVE);
  console.log("Treasury Address:", process.env.TREASURY_ADDRESS);
  console.log("Emergency Address:", process.env.EMERGENCY_ADDRESS);
  console.log("Pool Manager:", process.env.POOL_MANAGER_ADDRESS);
  console.log("Matrix Root:", process.env.MATRIX_ROOT);
  console.log("Distributor Address:", process.env.DISTRIBUTOR_ADDRESS);
  console.log("Platform Address:", process.env.PLATFORM_ADDRESS);
  console.log("Audit Address:", process.env.AUDIT_ADDRESS);

  console.log("\n" + "=".repeat(70));
  console.log("⛽ GAS CONFIGURATION");
  console.log("=".repeat(70));
  console.log("Gas Price:", process.env.GAS_PRICE);
  console.log("Max Fee Per Gas:", process.env.MAX_FEE_PER_GAS);
  console.log("Gas Limit:", process.env.GAS_LIMIT);
  console.log("Min BNB Balance:", process.env.MIN_BNB_BALANCE);

  console.log("\n" + "=".repeat(70));
  console.log("🔒 SECURITY VERIFICATION");
  console.log("=".repeat(70));

  // Verify all critical addresses are set
  const criticalAddresses = {
    "Deployer": process.env.DEPLOYER_ADDRESS,
    "Admin": process.env.ADMIN_ADDRESS,
    "Treasury": process.env.TREASURY_ADDRESS,
    "Emergency": process.env.EMERGENCY_ADDRESS,
    "Platform": process.env.PLATFORM_ADDRESS,
    "Audit": process.env.AUDIT_ADDRESS
  };

  let allAddressesValid = true;
  for (const [role, address] of Object.entries(criticalAddresses)) {
    const isValid = address && ethers.isAddress(address);
    console.log(`${role} Address: ${isValid ? '✅ VALID' : '❌ INVALID'} (${address})`);
    if (!isValid) allAddressesValid = false;
  }

  console.log("\n" + "=".repeat(70));
  console.log("📊 CONFIGURATION SUMMARY");
  console.log("=".repeat(70));

  const configStatus = {
    "Network Settings": process.env.BSC_MAINNET_RPC_URL ? "✅ CONFIGURED" : "❌ MISSING",
    "Deployment Keys": process.env.DEPLOYER_PRIVATE_KEY ? "✅ CONFIGURED" : "❌ MISSING", 
    "BSCScan API": process.env.BSCSCAN_API_KEY ? "✅ CONFIGURED" : "❌ MISSING",
    "Token Addresses": process.env.USDT_MAINNET && process.env.USDT_TESTNET ? "✅ CONFIGURED" : "❌ MISSING",
    "Admin Addresses": allAddressesValid ? "✅ ALL VALID" : "❌ SOME INVALID",
    "Gas Settings": process.env.GAS_PRICE ? "✅ CONFIGURED" : "❌ MISSING"
  };

  Object.entries(configStatus).forEach(([setting, status]) => {
    console.log(`${setting}: ${status}`);
  });

  console.log("\n" + "=".repeat(70));
  
  if (allAddressesValid && Object.values(configStatus).every(status => status.includes("✅"))) {
    console.log("🎉 CONFIGURATION STATUS: ✅ READY FOR DEPLOYMENT!");
    console.log("All settings are properly configured for mainnet deployment.");
  } else {
    console.log("⚠️ CONFIGURATION STATUS: ❌ NEEDS ATTENTION");
    console.log("Some settings need to be fixed before deployment.");
  }

  console.log("=".repeat(70));

  console.log("\n💡 NEXT STEPS:");
  console.log("1. Verify MetaMask wallet has sufficient BNB for deployment");
  console.log("2. Run mainnet deployment script");
  console.log("3. Transfer ownership to MetaMask admin wallet");
  console.log("4. Revoke deployer permissions");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
