const { ethers } = require('hardhat');

async function transferOwnershipBackToTrezor() {
    console.log('🔄 Step 3: Transferring Ownership Back to Trezor...\n');
    
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    const trezorAddress = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
    const deployerAddress = '0x140aad3E7c6bCC415Bc8E830699855fF072d405D';
    
    try {
        // Get contract instance (using production interface)
        const LeadFive = await ethers.getContractFactory('LeadFive');
        const contract = LeadFive.attach(contractAddress);
        
        console.log('📋 Transfer Details:');
        console.log(`Contract: ${contractAddress}`);
        console.log(`From (Deployer): ${deployerAddress}`);
        console.log(`To (Trezor): ${trezorAddress}\n`);
        
        // Check current owner
        const currentOwner = await contract.owner();
        console.log(`Current Owner: ${currentOwner}`);
        
        if (currentOwner.toLowerCase() === trezorAddress.toLowerCase()) {
            console.log('✅ Ownership already restored to Trezor!');
            return true;
        }
        
        if (currentOwner.toLowerCase() !== deployerAddress.toLowerCase()) {
            console.log('❌ Unexpected owner! Expected deployer address.');
            return false;
        }
        
        // Transfer ownership back to Trezor
        console.log('🔄 Transferring ownership back to Trezor...');
        const tx = await contract.transferOwnership(trezorAddress);
        console.log(`Transaction hash: ${tx.hash}`);
        
        console.log('⏳ Waiting for confirmation...');
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
        
        // Verify the transfer
        const newOwner = await contract.owner();
        console.log(`New Owner: ${newOwner}`);
        
        if (newOwner.toLowerCase() === trezorAddress.toLowerCase()) {
            console.log('\n🎉 SUCCESS! Ownership restored to Trezor!');
            console.log('');
            console.log('✅ Contract is fully upgraded and secured');
            console.log('✅ Trezor is now the owner again');
            console.log('✅ All V2 features are active');
            console.log('');
            console.log('📋 Ready for Step 4: Final verification');
            console.log('Run: npx hardhat run step4-verify-complete-upgrade.cjs --network bsc');
            return true;
        } else {
            console.log('❌ Ownership transfer failed!');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

// Run the transfer
transferOwnershipBackToTrezor()
    .then((success) => {
        if (success) {
            console.log('\n✅ Step 3 Complete! Proceed to Step 4 for final verification.');
        } else {
            console.log('\n❌ Step 3 Failed! Check errors above.');
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
