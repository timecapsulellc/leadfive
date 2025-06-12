// 🔍 HARDHAT TEST ACCOUNTS EXPLANATION

console.log("🔑 HARDHAT AUTO-GENERATED TEST ACCOUNTS");
console.log("=======================================");
console.log("");

// Hardhat uses a deterministic mnemonic to generate test accounts
const hardhatMnemonic = "test test test test test test test test test test test junk";

console.log("📝 Standard Hardhat Mnemonic:");
console.log(`"${hardhatMnemonic}"`);
console.log("");

// These are the first few accounts generated from this mnemonic
const testAccounts = [
    {
        index: 0,
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        description: "Account #0 - Default deployer account"
    },
    {
        index: 1,
        address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        description: "Account #1 - The one we're using for deployment"
    },
    {
        index: 2,
        address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
        description: "Account #2 - Additional test account"
    }
];

console.log("🏦 AUTO-GENERATED TEST ACCOUNTS:");
console.log("================================");

testAccounts.forEach(account => {
    console.log(`Account #${account.index}:`);
    console.log(`  Address: ${account.address}`);
    console.log(`  Private Key: ${account.privateKey}`);
    console.log(`  Description: ${account.description}`);
    console.log("");
});

console.log("⚠️  IMPORTANT SECURITY NOTES:");
console.log("=============================");
console.log("✅ These are SAFE for testnet use - they're public test keys");
console.log("❌ NEVER use these on mainnet - everyone knows these private keys");
console.log("🔒 For mainnet: Use hardware wallets (Trezor, Ledger) or secure key generation");
console.log("");

console.log("🎯 WHY WE USE ACCOUNT #1:");
console.log("========================");
console.log("• Account #0 is often used by default, so we use #1 to avoid conflicts");
console.log("• Well-known address makes it easy to fund from testnet faucets");
console.log("• Deterministic generation means it's the same across all Hardhat instances");
console.log("• Safe for testing since these keys are public knowledge");
console.log("");

console.log("🚰 FUNDING THIS ACCOUNT:");
console.log("========================");
console.log("1. Go to: https://testnet.binance.org/faucet-smart");
console.log("2. Enter address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
console.log("3. Request testnet BNB");
console.log("4. Wait for confirmation");
console.log("5. Run deployment script");
console.log("");
