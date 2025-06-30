require('dotenv').config();
const { ethers } = require("hardhat");

async function fixUSDTAddress() {
    console.log('\n🔧 FIXING USDT ADDRESS ISSUE');
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
    const totalUsers = await contract.totalUsers();
    
    console.log(`Current USDT: ${currentUSDT}`);
    console.log(`Owner: ${owner}`);
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Is USDT Zero: ${currentUSDT === ethers.ZeroAddress}`);
    
    if (currentUSDT.toLowerCase() === USDT_ADDRESS.toLowerCase()) {
        console.log('✅ USDT address is already correct!');
        return;
    }
    
    // Approach 1: Deploy fixed implementation with emergency USDT setter
    console.log('\n🔨 Step 1: Deploy LeadFiveWithUSDTFix implementation...');
    
    try {
        const LeadFiveWithUSDTFix = await ethers.getContractFactory("LeadFiveWithUSDTFix", deployer);
        const fixedImplementation = await LeadFiveWithUSDTFix.deploy();
        await fixedImplementation.waitForDeployment();
        
        const fixedImplAddress = await fixedImplementation.getAddress();
        console.log(`✅ Fixed implementation deployed at: ${fixedImplAddress}`);
        
        // Upgrade proxy to use the fixed implementation
        console.log('\n🔨 Step 2: Upgrade proxy to fixed implementation...');
        const proxyABI = ["function upgradeTo(address newImplementation) external"];
        const proxy = new ethers.Contract(PROXY_ADDRESS, proxyABI, deployer);
        
        const upgradeTx = await proxy.upgradeTo(fixedImplAddress);
        console.log(`Upgrade transaction submitted: ${upgradeTx.hash}`);
        await upgradeTx.wait();
        console.log(`✅ Proxy upgraded successfully!`);
        
        // Now use the emergency USDT setter
        console.log('\n🔨 Step 3: Set USDT using emergency function...');
        const fixedContractABI = [
            "function emergencySetUSDT(address _usdt) external",
            "function forceUSDTUpdate(address _usdtToken) external",
            "function usdt() view returns (address)"
        ];
        const fixedContract = new ethers.Contract(PROXY_ADDRESS, fixedContractABI, deployer);
        
        try {
            const setUsdtTx = await fixedContract.emergencySetUSDT(USDT_ADDRESS);
            console.log(`EmergencySetUSDT transaction: ${setUsdtTx.hash}`);
            await setUsdtTx.wait();
            console.log(`✅ USDT set using emergencySetUSDT!`);
        } catch (error) {
            console.log(`⚠️ EmergencySetUSDT failed, trying forceUSDTUpdate...`);
            const setUsdtTx = await fixedContract.forceUSDTUpdate(USDT_ADDRESS);
            console.log(`ForceUSDTUpdate transaction: ${setUsdtTx.hash}`);
            await setUsdtTx.wait();
            console.log(`✅ USDT set using forceUSDTUpdate!`);
        }
        
        // Verify the fix
        console.log('\n🔍 Step 4: Verify USDT address...');
        const finalUSDT = await fixedContract.usdt();
        console.log(`Final USDT address: ${finalUSDT}`);
        
        if (finalUSDT.toLowerCase() === USDT_ADDRESS.toLowerCase()) {
            console.log('\n🎉🎉🎉 USDT ADDRESS FIXED SUCCESSFULLY! 🎉🎉🎉');
            console.log('='.repeat(60));
            console.log('✅ Contract is now ready for production use!');
            console.log('✅ Users can now register and make USDT payments!');
            console.log('='.repeat(60));
        } else {
            console.error('\n❌ USDT address still not set correctly!');
            throw new Error('USDT fix failed');
        }
        
    } catch (error) {
        console.error('\n❌ Fixed implementation approach failed:', error.message);
        
        // Approach 2: Fresh deployment if the above fails
        console.log('\n🔄 Fallback: Fresh deployment approach...');
        await deployFreshContract();
    }
}

async function deployFreshContract() {
    console.log('\n🚀 FRESH DEPLOYMENT WITH USDT PROPERLY SET');
    console.log('='.repeat(60));
    
    const USDT_ADDRESS = process.env.VITE_USDT_CONTRACT_ADDRESS;
    const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, 
        new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL));
    
    console.log(`Deployer: ${deployer.address}`);
    
    // Deploy implementation
    console.log('\n🔨 Deploying fresh implementation...');
    const LeadFive = await ethers.getContractFactory("contracts/LeadFive.sol:LeadFive", deployer);
    const implementation = await LeadFive.deploy();
    await implementation.waitForDeployment();
    
    const implAddress = await implementation.getAddress();
    console.log(`Implementation deployed at: ${implAddress}`);
    
    // Deploy proxy with proper initialization
    console.log('\n🔨 Deploying fresh proxy...');
    const proxyFactory = await ethers.getContractFactory("ERC1967Proxy", deployer);
    
    // Encode the initialization call with USDT address
    const initData = LeadFive.interface.encodeFunctionData("initialize", [USDT_ADDRESS]);
    
    const proxy = await proxyFactory.deploy(implAddress, initData);
    await proxy.waitForDeployment();
    
    const proxyAddress = await proxy.getAddress();
    console.log(`Fresh proxy deployed at: ${proxyAddress}`);
    
    // Connect to proxy with implementation ABI
    const leadfive = LeadFive.attach(proxyAddress);
    
    // Verify
    console.log('\n🔍 Verifying fresh deployment...');
    const usdt = await leadfive.usdt();
    const owner = await leadfive.owner();
    const totalUsers = await leadfive.getTotalUsers();
    
    console.log(`USDT address: ${usdt}`);
    console.log(`Owner: ${owner}`);
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Success: ${usdt.toLowerCase() === USDT_ADDRESS.toLowerCase()}`);
    
    if (usdt.toLowerCase() === USDT_ADDRESS.toLowerCase()) {
        console.log('\n🎉 FRESH DEPLOYMENT SUCCESSFUL!');
        console.log('='.repeat(60));
        console.log('🔒 IMPORTANT: Update your frontend and systems!');
        console.log(`📋 New Contract Address: ${proxyAddress}`);
        console.log(`📋 Replace old address: ${process.env.MAINNET_CONTRACT_ADDRESS}`);
        console.log(`📋 With new address: ${proxyAddress}`);
        console.log('='.repeat(60));
    } else {
        throw new Error('Fresh deployment also failed to set USDT correctly');
    }
}

fixUSDTAddress()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
