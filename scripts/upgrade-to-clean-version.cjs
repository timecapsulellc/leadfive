require('dotenv').config();
const { ethers } = require("hardhat");

async function upgradeLeadFiveAndSetUSDT() {
    console.log('\n🚀 UPGRADING LEADFIVE & SETTING USDT ADDRESS');
    console.log('='.repeat(60));

    const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    const proxyAddress = process.env.MAINNET_CONTRACT_ADDRESS;
    const usdtAddress = process.env.VITE_USDT_CONTRACT_ADDRESS;

    console.log(`Deployer: ${wallet.address}`);
    console.log(`Proxy: ${proxyAddress}`);
    console.log(`USDT to set: ${usdtAddress}`);

    // 1. Deploy new implementation
    console.log('\nDeploying new implementation...');
    const LeadFiveFactory = await ethers.getContractFactory("contracts/LeadFive.sol:LeadFive", wallet);
    const newImplementation = await LeadFiveFactory.deploy();
    await newImplementation.waitForDeployment();
    const newImplAddress = await newImplementation.getAddress();
    console.log(`✅ New Implementation deployed at: ${newImplAddress}`);

    // 2. Upgrade the proxy
    console.log('\nUpgrading proxy...');
    const proxyAbi = [
        "function upgradeTo(address newImplementation) external",
    ];
    const proxy = new ethers.Contract(proxyAddress, proxyAbi, wallet);
    const upgradeTx = await proxy.upgradeTo(newImplAddress);
    await upgradeTx.wait();
    console.log('✅ Proxy upgraded successfully.');

    // 3. Call setUSDTAddress
    console.log('\nSetting USDT address...');
    const upgradedContract = LeadFiveFactory.attach(proxyAddress);
    const setUsdtTx = await upgradedContract.setUSDTAddress(usdtAddress);
    await setUsdtTx.wait();
    console.log(`✅ setUSDTAddress transaction confirmed: ${setUsdtTx.hash}`);

    // 4. Verify the USDT address is set
    console.log('\nVerifying USDT address...');
    const currentUsdtAddress = await upgradedContract.usdt();
    console.log(`Current USDT address in contract: ${currentUsdtAddress}`);

    if (currentUsdtAddress.toLowerCase() === usdtAddress.toLowerCase()) {
        console.log('🎉 SUCCESS: USDT address has been set correctly!');
    } else {
        console.error('❌ ERROR: USDT address was not set correctly.');
    }
}

upgradeLeadFiveAndSetUSDT().catch((error) => {
    console.error(error);
    process.exit(1);
});
