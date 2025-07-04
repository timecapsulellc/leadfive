const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    
    console.log("Deployer address:", deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "BNB");
    
    if (balance < ethers.parseEther("0.1")) {
        console.log("⚠️  Low balance! Get testnet BNB from: https://testnet.binance.org/faucet-smart");
    } else {
        console.log("✅ Balance sufficient for deployment");
    }
}

main().catch(console.error);
