const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
    console.log('📚 DEPLOYING LEADFIVE LIBRARIES TO BSC MAINNET');
    console.log('='.repeat(60));

    const [deployer] = await ethers.getSigners();
    console.log('🔑 Deploying with account:', deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('💰 Account balance:', ethers.formatEther(balance), 'BNB');
    
    if (parseFloat(ethers.formatEther(balance)) < 0.1) {
        throw new Error('❌ Insufficient BNB balance for deployment. Need at least 0.1 BNB');
    }

    const libraries = [
        'ConstantsLib',
        'CoreOperationsLib', 
        'BusinessLogicLib',
        'OracleManagementLib',
        'MatrixManagementLib',
        'MatrixRewardsLib',
        'BonusDistributionLib',
        'LeaderPoolLib',
        'PoolDistributionLib',
        'ViewFunctionsLib'
    ];

    const deployedLibraries = {};
    const gasPrice = ethers.parseUnits('5', 'gwei'); // 5 Gwei for mainnet

    console.log('⛽ Using gas price:', ethers.formatUnits(gasPrice, 'gwei'), 'Gwei');
    console.log('');

    for (const libName of libraries) {
        try {
            console.log(`📋 Deploying ${libName}...`);
            
            const LibraryFactory = await ethers.getContractFactory(libName);
            
            // Estimate gas for deployment
            const deploymentData = LibraryFactory.interface.encodeDeploy();
            const gasEstimate = await ethers.provider.estimateGas({
                data: deploymentData
            });
            
            console.log(`   ⛽ Estimated gas: ${gasEstimate.toString()}`);
            console.log(`   💵 Estimated cost: ${ethers.formatEther(gasEstimate * gasPrice)} BNB`);
            
            const library = await LibraryFactory.deploy({
                gasPrice: gasPrice,
                gasLimit: gasEstimate + 50000n // Add buffer
            });
            
            await library.waitForDeployment();
            const address = await library.getAddress();
            
            deployedLibraries[libName] = address;
            console.log(`   ✅ ${libName} deployed at: ${address}`);
            console.log('');
            
            // Wait between deployments to avoid nonce issues
            await new Promise(resolve => setTimeout(resolve, 2000));
            
        } catch (error) {
            console.error(`❌ Failed to deploy ${libName}:`, error.message);
            throw error;
        }
    }

    console.log('📚 ALL LIBRARIES DEPLOYED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 LIBRARY ADDRESSES:');
    console.log('-'.repeat(40));
    
    for (const [name, address] of Object.entries(deployedLibraries)) {
        console.log(`${name}: ${address}`);
    }
    
    console.log('');
    console.log('🔧 HARDHAT CONFIG LIBRARIES SECTION:');
    console.log('-'.repeat(40));
    console.log('libraries: {');
    console.log('  "contracts/LeadFive.sol": {');
    
    for (const [name, address] of Object.entries(deployedLibraries)) {
        const libPath = `contracts/libraries/${name}.sol`;
        console.log(`    "${libPath}:${name}": "${address}",`);
    }
    
    console.log('  }');
    console.log('}');
    console.log('');
    
    // Save addresses to file for future reference
    const fs = require('fs');
    const libraryConfig = {
        network: 'bsc_mainnet',
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        libraries: deployedLibraries
    };
    
    fs.writeFileSync(
        'mainnet-libraries.json', 
        JSON.stringify(libraryConfig, null, 2)
    );
    
    console.log('💾 Library addresses saved to mainnet-libraries.json');
    console.log('');
    
    // Check final balance
    const finalBalance = await ethers.provider.getBalance(deployer.address);
    const gasUsed = balance - finalBalance;
    console.log('📊 DEPLOYMENT SUMMARY:');
    console.log('-'.repeat(40));
    console.log('💰 Starting balance:', ethers.formatEther(balance), 'BNB');
    console.log('💰 Final balance:', ethers.formatEther(finalBalance), 'BNB');
    console.log('⛽ Total gas used:', ethers.formatEther(gasUsed), 'BNB');
    console.log('');
    console.log('✅ Ready to deploy LeadFive contract with linked libraries!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Library deployment failed:', error);
        process.exit(1);
    });
