const { ethers } = require("hardhat");
require('dotenv').config();

async function checkWalletInfo() {
    console.log("🔍 Checking Wallet Information");
    console.log("=" * 40);
    
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    if (!privateKey) {
        console.log("❌ No DEPLOYER_PRIVATE_KEY found in .env");
        return;
    }
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    console.log("📋 Wallet Address from Private Key:", wallet.address);
    console.log("🔑 Expected Address:", "0x0faF67B6E49827EcB42244b4C00F9962922Eb931");
    console.log("✅ Match:", wallet.address === "0x0faF67B6E49827EcB42244b4C00F9962922Eb931");
    
    // Check balance on BSC mainnet
    try {
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const connectedWallet = wallet.connect(provider);
        const balance = await provider.getBalance(wallet.address);
        
        console.log("\n💰 BSC Mainnet Balance:");
        console.log("- Address:", wallet.address);
        console.log("- Balance:", ethers.formatEther(balance), "BNB");
        console.log("- Network:", await provider.getNetwork());
        
    } catch (error) {
        console.log("❌ Error checking mainnet balance:", error.message);
    }
}

checkWalletInfo().catch(console.error);
