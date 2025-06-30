require('dotenv').config();
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    const proxyAddress = process.env.MAINNET_CONTRACT_ADDRESS;
    const usdtAddress = process.env.VITE_USDT_CONTRACT_ADDRESS;

    if (!proxyAddress || !usdtAddress) {
        throw new Error("Missing MAINNET_CONTRACT_ADDRESS or VITE_USDT_CONTRACT_ADDRESS in .env file");
    }

    console.log(`Setting USDT address for proxy: ${proxyAddress}`);
    console.log(`USDT Address: ${usdtAddress}`);

    const [deployer] = await ethers.getSigners();
    console.log(`Using account: ${deployer.address}`);

    // Manually load the ABI
    const artifactPath = path.resolve(__dirname, 'artifacts/contracts/LeadFive.sol/LeadFive.json');
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const contractAbi = artifact.abi;

    // Create a contract instance with the correct ABI
    const contract = new ethers.Contract(proxyAddress, contractAbi, deployer);


    console.log("Calling setUSDTAddress...");
    const tx = await contract.setUSDTAddress(usdtAddress);
    console.log(`Transaction hash: ${tx.hash}`);

    await tx.wait();
    console.log("setUSDTAddress transaction confirmed.");

    const newUsdtAddress = await contract.usdt();
    console.log(`New USDT address in contract: ${newUsdtAddress}`);

    if (newUsdtAddress.toLowerCase() === usdtAddress.toLowerCase()) {
        console.log("✅ USDT address set successfully!");
    } else {
        console.error("❌ Failed to set USDT address.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
