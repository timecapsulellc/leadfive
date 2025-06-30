// scripts/generate-wallet.cjs
// Generate a new wallet for deployment

const { ethers } = require("ethers");

function generateNewWallet() {
    console.log("🔐 Generating New Deployment Wallet");
    console.log("=" .repeat(50));
    
    // Create a new random wallet
    const wallet = ethers.Wallet.createRandom();
    
    console.log("📝 New Wallet Generated:");
    console.log("Address:", wallet.address);
    console.log("Private Key:", wallet.privateKey);
    console.log("Mnemonic:", wallet.mnemonic.phrase);
    
    console.log("\n⚠️  IMPORTANT SECURITY NOTES:");
    console.log("1. Store the private key securely");
    console.log("2. Fund this wallet with BSC Testnet BNB");
    console.log("3. Use BSC Testnet faucet: https://testnet.bnbchain.org/faucet-smart");
    console.log("4. Minimum 0.1 BNB recommended for deployment");
    
    console.log("\n📋 Next Steps:");
    console.log("1. Copy the private key below");
    console.log("2. Update hardhat.config.js with this private key");
    console.log("3. Fund the address with testnet BNB");
    console.log("4. Run deployment script");
    
    console.log("\n🔑 Private Key (for hardhat.config.js):");
    console.log(wallet.privateKey);
    
    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase
    };
}

if (require.main === module) {
    generateNewWallet();
}

module.exports = generateNewWallet;
