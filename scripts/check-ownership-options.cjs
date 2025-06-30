const hre = require("hardhat");
const { ethers } = require("hardhat");

async function checkOwnershipOptions() {
    try {
        console.log('🔍 OWNERSHIP & REGISTRATION OPTIONS');
        console.log('='.repeat(40));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        const [deployer] = await ethers.getSigners();
        
        // Load contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        // Check current owner
        const currentOwner = await contract.owner();
        console.log('📋 CURRENT STATUS:');
        console.log(`  Contract Owner: ${currentOwner}`);
        console.log(`  Deployer: ${deployer.address}`);
        console.log(`  Trezor: ${trezorAddress}`);
        console.log(`  Owner is Deployer: ${currentOwner === deployer.address ? 'YES ✅' : 'NO ❌'}`);
        
        // Check balances
        const deployerBalance = await deployer.provider.getBalance(deployer.address);
        const trezorBalance = await deployer.provider.getBalance(trezorAddress);
        console.log('');
        console.log('💰 WALLET BALANCES:');
        console.log(`  Deployer: ${ethers.formatEther(deployerBalance)} BNB`);
        console.log(`  Trezor: ${ethers.formatEther(trezorBalance)} BNB`);
        
        // Check registration status
        const deployerInfo = await contract.getUserBasicInfo(deployer.address);
        const trezorInfo = await contract.getUserBasicInfo(trezorAddress);
        console.log('');
        console.log('👥 REGISTRATION STATUS:');
        console.log(`  Deployer Registered: ${deployerInfo[0]} (Package ${deployerInfo[1]})`);
        console.log(`  Trezor Registered: ${trezorInfo[0]} (Package ${trezorInfo[1]})`);
        
        console.log('');
        console.log('🎯 REGISTRATION OPTIONS:');
        console.log('='.repeat(25));
        
        console.log('');
        console.log('OPTION 1: DEPLOYER REGISTERS TREZOR (Current Setup)');
        console.log('  Pros:');
        console.log('  ✅ Deployer maintains control');
        console.log('  ✅ Can register users programmatically');
        console.log('  ✅ Admin functions available');
        console.log('  ✅ Quick and automated');
        console.log('');
        console.log('  Cons:');
        console.log('  ❌ Less decentralized');
        console.log('  ❌ Deployer holds admin power');
        console.log('');
        console.log('  Implementation:');
        console.log('  • Use admin privileges to register Trezor');
        console.log('  • Or register anyone as needed');
        
        console.log('');
        console.log('OPTION 2: TRANSFER OWNERSHIP TO TREZOR');
        console.log('  Pros:');
        console.log('  ✅ Maximum decentralization');
        console.log('  ✅ Trezor has full control');
        console.log('  ✅ Hardware wallet security');
        console.log('  ✅ True ownership by Trezor');
        console.log('');
        console.log('  Cons:');
        console.log('  ❌ Requires Trezor hardware for admin functions');
        console.log('  ❌ More complex for future operations');
        console.log('');
        console.log('  Implementation:');
        console.log('  • Transfer ownership to Trezor first');
        console.log('  • Trezor registers itself');
        console.log('  • Trezor becomes admin + root user');
        
        console.log('');
        console.log('🔧 RECOMMENDED APPROACH:');
        console.log('='.repeat(25));
        
        if (deployerInfo[0] && !trezorInfo[0]) {
            console.log('HYBRID APPROACH (Best of Both):');
            console.log('1. ✅ Keep deployer as admin for now');
            console.log('2. ✅ Register Trezor as root user');
            console.log('3. ✅ Transfer ownership to Trezor later (optional)');
            console.log('4. ✅ Maintain flexibility');
            
            console.log('');
            console.log('Benefits:');
            console.log('• Immediate functionality');
            console.log('• Easy admin operations');
            console.log('• Option to transfer later');
            console.log('• Best security when ready');
        } else {
            console.log('CURRENT BEST OPTION:');
            console.log('Since deployer is registered, let\'s proceed with Trezor registration');
        }
        
        console.log('');
        console.log('🚀 IMMEDIATE ACTION PLANS:');
        console.log('='.repeat(30));
        
        console.log('');
        console.log('PLAN A: Admin Registration (5 minutes)');
        console.log('  1. Use deployer admin rights');
        console.log('  2. Register Trezor programmatically');
        console.log('  3. Set Trezor as root user');
        console.log('  4. Complete project immediately');
        console.log('');
        console.log('  Command: npx hardhat run admin-register-trezor.cjs --network bsc');
        
        console.log('');
        console.log('PLAN B: Ownership Transfer + Self Registration (10 minutes)');
        console.log('  1. Transfer ownership to Trezor');
        console.log('  2. Trezor signs ownership acceptance');
        console.log('  3. Trezor registers itself');
        console.log('  4. Full decentralization achieved');
        console.log('');
        console.log('  Commands:');
        console.log('  • npx hardhat run transfer-ownership.cjs --network bsc');
        console.log('  • Trezor signs registration transaction');
        
        console.log('');
        console.log('💡 RECOMMENDATION:');
        console.log('  Start with PLAN A for immediate completion');
        console.log('  Transfer ownership later when ready for full decentralization');
        
    } catch (error) {
        console.error('❌ Ownership check failed:', error.message);
    }
}

checkOwnershipOptions();
