const { ethers } = require('hardhat');

async function checkDeployedVersion() {
    try {
        console.log('\n🔍 CHECKING DEPLOYED CONTRACT VERSION');
        console.log('='.repeat(50));
        
        const proxyAddress = '0x8BCB6bb3C1a688aB5b16b974824B47AD5B6820df';
        
        // Get contract instance
        const contract = await ethers.getContractAt('LeadFive', proxyAddress);
        
        console.log(`📍 Contract Address: ${proxyAddress}`);
        
        // Check version
        try {
            const version = await contract.getVersion();
            console.log(`📄 Deployed Version: ${version}`);
        } catch (e) {
            console.log(`❌ Version check failed: ${e.message}`);
        }
        
        // Check contract code hash
        const code = await ethers.provider.getCode(proxyAddress);
        const codeHash = ethers.keccak256(code);
        console.log(`🔗 Contract Code Hash: ${codeHash.slice(0, 10)}...`);
        
        // Check implementation address
        try {
            const implSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
            const implAddress = await ethers.provider.getStorageAt(proxyAddress, implSlot);
            const cleanImpl = '0x' + implAddress.slice(-40);
            console.log(`🏭 Implementation Address: ${cleanImpl}`);
        } catch (e) {
            console.log(`❌ Implementation check failed: ${e.message}`);
        }
        
        // Compare with current artifact
        try {
            const artifact = require('../artifacts/contracts/LeadFive.sol/LeadFive.json');
            const localCodeHash = ethers.keccak256(artifact.bytecode);
            console.log(`📦 Local Artifact Hash: ${localCodeHash.slice(0, 10)}...`);
            
            if (codeHash === localCodeHash) {
                console.log('✅ Deployed contract matches local artifact');
            } else {
                console.log('⚠️ Deployed contract differs from local artifact');
            }
        } catch (e) {
            console.log(`❌ Artifact comparison failed: ${e.message}`);
        }
        
        // Check if we need to update the source file
        console.log('\n📋 Analysis:');
        console.log('- If deployed version is "1.0.0-USDT-ONLY" but source shows "1.1.0"');
        console.log('- Then the deployed contract was built from an older version');
        console.log('- We should update the source to match the deployed version');
        
    } catch (error) {
        console.error('\n❌ Check failed:', error.message);
    }
}

checkDeployedVersion()
    .then(() => {
        console.log('\n✅ Check completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Check failed:', error.message);
        process.exit(1);
    });
