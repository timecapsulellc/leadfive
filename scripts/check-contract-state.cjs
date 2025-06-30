const hre = require("hardhat");
const { ethers } = require("hardhat");

async function checkContractState() {
    try {
        console.log('🔍 CHECKING CONTRACT STATE');
        console.log('='.repeat(35));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const [deployer] = await ethers.getSigners();
        
        // Load contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        console.log(`📋 Contract: ${contractAddress}`);
        console.log(`🔑 Deployer: ${deployer.address}`);
        console.log('');
        
        // Check contract owner
        const owner = await contract.owner();
        console.log(`👑 Contract Owner: ${owner}`);
        
        // Check total users
        const totalUsers = await contract.getTotalUsers();
        console.log(`📊 Total Users: ${totalUsers}`);
        
        // Check if deployer is registered
        const deployerInfo = await contract.getUserBasicInfo(deployer.address);
        console.log('');
        console.log('🔍 DEPLOYER STATUS:');
        console.log(`  Registered: ${deployerInfo[0]}`);
        console.log(`  Package Level: ${deployerInfo[1]}`);
        console.log(`  Balance: ${ethers.formatUnits(deployerInfo[2], 6)} USDT`);
        
        if (deployerInfo[0]) {
            const sponsorInfo = await contract.getUserSponsor(deployer.address);
            console.log(`  Sponsor: ${sponsorInfo === ethers.ZeroAddress ? 'None (ROOT USER)' : sponsorInfo}`);
        }
        
        // Check Trezor status
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        const trezorInfo = await contract.getUserBasicInfo(trezorAddress);
        console.log('');
        console.log('🔍 TREZOR STATUS:');
        console.log(`  Address: ${trezorAddress}`);
        console.log(`  Registered: ${trezorInfo[0]}`);
        console.log(`  Package Level: ${trezorInfo[1]}`);
        console.log(`  Balance: ${ethers.formatUnits(trezorInfo[2], 6)} USDT`);
        
        // Check deployer balance
        const deployerBalance = await deployer.provider.getBalance(deployer.address);
        console.log('');
        console.log('💰 BALANCES:');
        console.log(`  Deployer BNB: ${ethers.formatEther(deployerBalance)} BNB`);
        
        console.log('');
        console.log('🎯 NEXT ACTION:');
        if (!trezorInfo[0]) {
            console.log('📝 Trezor needs to be registered as root user');
            console.log('💡 Let\'s proceed with registration...');
        } else {
            console.log('✅ Trezor is already registered');
        }
        
    } catch (error) {
        console.error('❌ Contract state check failed:', error.message);
    }
}

checkContractState();
