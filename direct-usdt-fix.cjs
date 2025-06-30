require('dotenv').config();
const { ethers } = require("hardhat");

async function directUSDTFix() {
    console.log('\n🔧 DIRECT USDT ADDRESS FIX');
    console.log('='.repeat(60));

    // Configuration
    const PROXY_ADDRESS = process.env.MAINNET_CONTRACT_ADDRESS;
    const USDT_ADDRESS = process.env.VITE_USDT_CONTRACT_ADDRESS;
    
    // Connect to network
    console.log('Connecting to BSC mainnet...');
    const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
    const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    console.log(`Connected as: ${deployer.address}`);
    
    // Check current state
    console.log('\n📊 Current State:');
    const minimalABI = [
        "function usdt() view returns (address)",
        "function owner() view returns (address)",
        "function totalUsers() view returns (uint32)"
    ];
    const contract = new ethers.Contract(PROXY_ADDRESS, minimalABI, provider);
    
    const currentUSDT = await contract.usdt();
    const owner = await contract.owner();
    
    console.log(`Current USDT: ${currentUSDT}`);
    console.log(`Owner: ${owner}`);
    console.log(`Target USDT: ${USDT_ADDRESS}`);
    console.log(`Is USDT Zero: ${currentUSDT === ethers.ZeroAddress}`);
    
    if (currentUSDT.toLowerCase() === USDT_ADDRESS.toLowerCase()) {
        console.log('✅ USDT address is already correct!');
        return;
    }
    
    // Create a simple implementation that just sets the USDT address during deployment
    console.log('\n🔨 Creating minimal USDT setter implementation...');
    
    // Deploy a very simple implementation that initializes USDT correctly
    const SimpleUSDTSetter = await ethers.getContractFactory("SimpleUSDTSetter", deployer);
    const setterImpl = await SimpleUSDTSetter.deploy();
    await setterImpl.waitForDeployment();
    
    const setterAddress = await setterImpl.getAddress();
    console.log(`✅ Simple USDT setter deployed at: ${setterAddress}`);
    
    // Upgrade to this minimal implementation temporarily
    console.log('\n🔨 Upgrading to USDT setter implementation...');
    const proxyABI = ["function upgradeTo(address newImplementation) external"];
    const proxy = new ethers.Contract(PROXY_ADDRESS, proxyABI, deployer);
    
    const upgradeTx = await proxy.upgradeTo(setterAddress);
    console.log(`Upgrade transaction: ${upgradeTx.hash}`);
    await upgradeTx.wait();
    console.log(`✅ Upgraded to USDT setter!`);
    
    // Call the setter function
    console.log('\n🔨 Setting USDT address...');
    const setterABI = ["function setUSDT(address _usdt) external"];
    const setter = new ethers.Contract(PROXY_ADDRESS, setterABI, deployer);
    
    const setTx = await setter.setUSDT(USDT_ADDRESS);
    console.log(`Set USDT transaction: ${setTx.hash}`);
    await setTx.wait();
    console.log(`✅ USDT address set!`);
    
    // Now upgrade back to the main LeadFive implementation
    console.log('\n🔨 Upgrading back to LeadFive implementation...');
    const LeadFive = await ethers.getContractFactory("contracts/LeadFive.sol:LeadFive", deployer);
    const mainImpl = await LeadFive.deploy();
    await mainImpl.waitForDeployment();
    
    const mainImplAddress = await mainImpl.getAddress();
    console.log(`✅ Main implementation deployed at: ${mainImplAddress}`);
    
    const finalUpgradeTx = await proxy.upgradeTo(mainImplAddress);
    console.log(`Final upgrade transaction: ${finalUpgradeTx.hash}`);
    await finalUpgradeTx.wait();
    console.log(`✅ Upgraded back to main implementation!`);
    
    // Verify everything is working
    console.log('\n🔍 Final Verification...');
    const finalUSDT = await contract.usdt();
    const finalOwner = await contract.owner();
    
    console.log(`Final USDT: ${finalUSDT}`);
    console.log(`Final Owner: ${finalOwner}`);
    
    if (finalUSDT.toLowerCase() === USDT_ADDRESS.toLowerCase()) {
        console.log('\n🎉🎉🎉 USDT ADDRESS SUCCESSFULLY FIXED! 🎉🎉🎉');
        console.log('='.repeat(60));
        console.log('✅ Contract is now ready for production use!');
        console.log('✅ Users can now register and make USDT payments!');
        console.log('✅ All functionality should work correctly!');
        console.log('='.repeat(60));
    } else {
        console.error('\n❌ USDT fix failed!');
        console.error(`Expected: ${USDT_ADDRESS}`);
        console.error(`Got: ${finalUSDT}`);
    }
}

directUSDTFix()
    .then(() => {
        console.log('\n✅ Direct USDT fix completed!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Direct USDT fix failed:', error);
        process.exit(1);
    });
