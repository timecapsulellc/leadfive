require('dotenv').config();
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function setUsdt() {
    console.log('\nSetting USDT address...');
    const proxyAddress = process.env.MAINNET_CONTRACT_ADDRESS;
    const usdtAddress = process.env.VITE_USDT_CONTRACT_ADDRESS;
    const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

    const artifactPath = path.resolve(__dirname, 'artifacts/contracts/LeadFive.sol/LeadFive.json');
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const contractAbi = artifact.abi;

    const contract = new ethers.Contract(proxyAddress, contractAbi, wallet);

    console.log(`Calling setUSDTAddress(${usdtAddress}) on ${proxyAddress}`);
    const tx = await contract.setUSDTAddress(usdtAddress);
    await tx.wait();
    console.log(`Transaction hash: ${tx.hash}`);

    const newUsdtAddress = await contract.usdt();
    console.log(`New USDT address in contract: ${newUsdtAddress}`);

    if (newUsdtAddress.toLowerCase() === usdtAddress.toLowerCase()) {
        console.log("✅ USDT address set successfully!");
    } else {
        console.error("❌ Failed to set USDT address.");
    }
}

setUsdt().catch(err => {
    console.error(err);
    process.exit(1);
});
