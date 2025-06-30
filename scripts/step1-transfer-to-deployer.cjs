const { ethers } = require('hardhat');

async function transferOwnershipToDeployer() {
    console.log('🔄 Step 1: Transferring Ownership to Deployer for Upgrade...\n');
    
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    const trezorAddress = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
    const deployerAddress = '0x140aad3E7c6bCC415Bc8E830699855fF072d405D';
    
    try {
        // Get contract instance
        const LeadFive = await ethers.getContractFactory('LeadFive');
        const contract = LeadFive.attach(contractAddress);
        
        console.log('📋 Transfer Details:');
        console.log(`Contract: ${contractAddress}`);
        console.log(`From (Trezor): ${trezorAddress}`);
        console.log(`To (Deployer): ${deployerAddress}\n`);
        
        // Check current owner
        const currentOwner = await contract.owner();
        console.log(`Current Owner: ${currentOwner}`);
        
        if (currentOwner.toLowerCase() === deployerAddress.toLowerCase()) {
            console.log('✅ Ownership already transferred to deployer!');
            return true;
        }
        
        if (currentOwner.toLowerCase() !== trezorAddress.toLowerCase()) {
            console.log('❌ Unexpected owner! Expected Trezor address.');
            return false;
        }
        
        console.log('\n📝 Manual Transfer Required:');
        console.log('Since this script runs with deployer wallet, you need to:');
        console.log('');
        console.log('🔧 OPTION 1: Via BSCScan (Recommended)');
        console.log('1. Go to: https://bscscan.com/address/0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623#writeProxyContract');
        console.log('2. Connect your Trezor wallet');
        console.log('3. Find "transferOwnership" function');
        console.log(`4. Enter newOwner: ${deployerAddress}`);
        console.log('5. Confirm transaction');
        console.log('');
        
        console.log('🔧 OPTION 2: Via Script (If you have Trezor private key)');
        console.log('1. Add Trezor private key to .env file temporarily');
        console.log('2. Run this script again');
        console.log('3. Remove private key after upgrade');
        console.log('');
        
        console.log('⚠️ IMPORTANT: This is temporary for upgrade only!');
        console.log('Ownership will be transferred back to Trezor immediately after upgrade.');
        
        return false;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

// Run the transfer
transferOwnershipToDeployer()
    .then((success) => {
        if (success) {
            console.log('\n✅ Ready for Step 2: Deploy and Upgrade V2');
            console.log('Run: npx hardhat run deploy-and-upgrade-v2.cjs --network bsc');
        } else {
            console.log('\n⏳ Complete ownership transfer first, then proceed to Step 2');
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
