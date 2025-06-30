require('dotenv').config();
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function finalUpgrade() {
    console.log('\n🚀 Executing Final Upgrade and USDT Address Setup');
    console.log('='.repeat(60));

    // --- Configuration ---
    const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    const proxyAddress = process.env.MAINNET_CONTRACT_ADDRESS;
    const usdtAddress = process.env.VITE_USDT_CONTRACT_ADDRESS;
    const artifactPath = path.resolve(__dirname, 'artifacts/contracts/LeadFive.sol/LeadFive.json');

    console.log(`Deployer: ${wallet.address}`);
    console.log(`Proxy Address: ${proxyAddress}`);
    console.log(`USDT Address: ${usdtAddress}`);

    // --- Load ABI ---
    if (!fs.existsSync(artifactPath)) {
        throw new Error(`Artifact not found at ${artifactPath}. Please compile contracts.`);
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const contractAbi = artifact.abi;

    // --- Step 1: Deploy New Implementation ---
    console.log('\n[1/4] Deploying new implementation...');
    const LeadFiveFactory = new ethers.ContractFactory(contractAbi, artifact.bytecode, wallet);
    const newImplementation = await LeadFiveFactory.deploy();
    await newImplementation.waitForDeployment();
    const newImplAddress = await newImplementation.getAddress();
    console.log(`✅ New Implementation Deployed: ${newImplAddress}`);

    // --- Step 2: Upgrade Proxy ---
    console.log('\n[2/4] Upgrading proxy to new implementation...');
    const proxyAdminAbi = ["function upgrade(address proxy, address implementation) public"];
    // The proxy admin is usually found through the proxy's storage, but for OpenZeppelin it's a known slot.
    // A more robust way is to get it from the proxy contract directly.
    // Let's assume we know the proxy admin address for now.
    // A common pattern is for the deployer to also be the proxy admin initially.
    const proxy = new ethers.Contract(proxyAddress, ["function upgradeTo(address newImplementation) external"], wallet);
    const upgradeTx = await proxy.upgradeTo(newImplAddress);
    await upgradeTx.wait();
    console.log(`✅ Proxy upgraded successfully. TX: ${upgradeTx.hash}`);

    // --- Step 3: Set USDT Address ---
    console.log('\n[3/4] Setting USDT address on the upgraded contract...');
    const upgradedContract = new ethers.Contract(proxyAddress, contractAbi, wallet);
    const setUsdtTx = await upgradedContract.setUSDTAddress(usdtAddress);
    await setUsdtTx.wait();
    console.log(`✅ USDT address set successfully. TX: ${setUsdtTx.hash}`);

    // --- Step 4: Verification ---
    console.log('\n[4/4] Verifying final state...');
    const finalUsdtAddress = await upgradedContract.usdt();
    console.log(`✅ Verified USDT Address: ${finalUsdtAddress}`);

    if (finalUsdtAddress.toLowerCase() === usdtAddress.toLowerCase()) {
        console.log('\n🎉🎉🎉 UPGRADE COMPLETE AND VERIFIED! 🎉🎉🎉');
    } else {
        console.error('\n❌ FINAL VERIFICATION FAILED! USDT address mismatch.');
    }
}

finalUpgrade().catch((error) => {
    console.error('\n❌ An error occurred during the final upgrade process:');
    console.error(error);
    process.exit(1);
});
