// scripts/check-env.cjs
// Check environment variables

require("dotenv").config();

console.log("🔍 Environment Variables Check");
console.log("=" .repeat(50));

const vars = [
  'DEPLOYER_PRIVATE_KEY',
  'BSC_MAINNET_RPC_URL',
  'BSC_TESTNET_RPC_URL'
];

vars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('PRIVATE') ? '***' : value}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log("\n🔧 Hardhat Config Check");
try {
  const config = require('../hardhat.config.js');
  console.log("✅ Hardhat config loaded");
  console.log("📋 Networks:", Object.keys(config.networks));
} catch (error) {
  console.log("❌ Hardhat config error:", error.message);
}
