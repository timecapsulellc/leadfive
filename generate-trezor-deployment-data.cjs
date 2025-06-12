const { ethers } = require('ethers');
const fs = require('fs');

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║    🔐 ORPHI CROWDFUND - TREZOR SUITE WEB DEPLOYMENT DATA GENERATOR                   ║
 * ║                                                                                       ║
 * ║    This script generates the exact transaction data you need to deploy                ║
 * ║    OrphiCrowdFund using authentic Trezor Suite Web at:                               ║
 * ║    https://suite.trezor.io/web/                                                       ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 */

async function generateTrezorDeploymentData() {
    try {
        console.log('\n' + '='.repeat(80));
        console.log('🔐 GENERATING TREZOR SUITE WEB DEPLOYMENT DATA');
        console.log('='.repeat(80));

        // Load contract artifacts
        const contractPath = './artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json';
        if (!fs.existsSync(contractPath)) {
            console.log('❌ Contract artifacts not found. Compiling...');
            const { execSync } = require('child_process');
            execSync('npx hardhat compile', { stdio: 'inherit' });
        }

        const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        const contractInterface = new ethers.Interface(contractArtifact.abi);

        // Configuration
        const TREZOR_ADDRESS = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
        const USDT_TESTNET = '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684';
        const BSC_TESTNET_CHAIN_ID = 97;

        console.log('\n📋 DEPLOYMENT CONFIGURATION:');
        console.log(`   • Contract: OrphiCrowdFund`);
        console.log(`   • Network: BSC Testnet (Chain ID: ${BSC_TESTNET_CHAIN_ID})`);
        console.log(`   • Trezor Address: ${TREZOR_ADDRESS}`);
        console.log(`   • USDT Token: ${USDT_TESTNET}`);
        console.log(`   • All Admin Roles: Assigned to Trezor`);

        // Generate deployment transaction data
        const deploymentData = contractArtifact.bytecode;

        // Generate initialization data
        const initializationData = contractInterface.encodeFunctionData('initialize', [
            USDT_TESTNET,    // _usdtToken
            TREZOR_ADDRESS,  // _treasuryAddress (Trezor)
            TREZOR_ADDRESS,  // _emergencyAddress (Trezor)
            TREZOR_ADDRESS   // _poolManagerAddress (Trezor)
        ]);

        // Estimate gas
        const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
        
        console.log('\n⛽ ESTIMATING GAS COSTS...');
        
        try {
            const deployGasEstimate = await provider.estimateGas({
                data: deploymentData
            });
            console.log(`   • Deployment Gas: ${deployGasEstimate.toString()} units`);
            
            const gasPrice = await provider.getGasPrice();
            const deploymentCost = deployGasEstimate * gasPrice;
            const initializationCost = 500000n * gasPrice; // Conservative estimate
            const totalCost = deploymentCost + initializationCost;
            
            console.log(`   • Gas Price: ${ethers.formatUnits(gasPrice, 'gwei')} Gwei`);
            console.log(`   • Deployment Cost: ${ethers.formatEther(deploymentCost)} BNB`);
            console.log(`   • Initialization Cost: ~${ethers.formatEther(initializationCost)} BNB`);
            console.log(`   • Total Estimated Cost: ${ethers.formatEther(totalCost)} BNB`);
            
        } catch (gasError) {
            console.log('   ⚠️ Gas estimation failed, using defaults');
            console.log('   • Deployment Gas: ~2,500,000 units');
            console.log('   • Initialization Gas: ~500,000 units');
            console.log('   • Total Cost: ~0.015 BNB');
        }

        // Generate Trezor Suite Web instructions
        const trezorInstructions = {
            network: {
                name: 'BSC Testnet',
                rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
                chainId: BSC_TESTNET_CHAIN_ID,
                symbol: 'BNB',
                explorer: 'https://testnet.bscscan.com'
            },
            deployment: {
                to: null, // Contract creation
                value: '0x0',
                data: deploymentData,
                gasLimit: '0x2DC6C0' // 3,000,000 in hex
            },
            initialization: {
                // This will be filled with contract address after deployment
                functionName: 'initialize',
                parameters: [USDT_TESTNET, TREZOR_ADDRESS, TREZOR_ADDRESS, TREZOR_ADDRESS],
                data: initializationData,
                gasLimit: '0x7A120' // 500,000 in hex
            }
        };

        // Save deployment data
        const deploymentFile = './trezor-deployment-data.json';
        fs.writeFileSync(deploymentFile, JSON.stringify(trezorInstructions, null, 2));

        console.log('\n📄 DEPLOYMENT DATA GENERATED:');
        console.log(`   • File: ${deploymentFile}`);
        console.log(`   • Ready for Trezor Suite Web deployment`);

        console.log('\n🚀 TREZOR SUITE WEB DEPLOYMENT STEPS:');
        console.log('════════════════════════════════════════');
        console.log('');
        console.log('1. 🌐 OPEN TREZOR SUITE WEB:');
        console.log('   https://suite.trezor.io/web/');
        console.log('');
        console.log('2. 🔌 CONNECT YOUR TREZOR:');
        console.log('   • Connect device via USB');
        console.log('   • Unlock with PIN');
        console.log('   • Allow Suite Web to connect');
        console.log('');
        console.log('3. ⚙️ ADD BSC TESTNET NETWORK:');
        console.log('   • Go to Settings → Coins');
        console.log('   • Add custom network:');
        console.log(`     - Name: ${trezorInstructions.network.name}`);
        console.log(`     - RPC URL: ${trezorInstructions.network.rpcUrl}`);
        console.log(`     - Chain ID: ${trezorInstructions.network.chainId}`);
        console.log(`     - Symbol: ${trezorInstructions.network.symbol}`);
        console.log(`     - Explorer: ${trezorInstructions.network.explorer}`);
        console.log('');
        console.log('4. 📍 VERIFY YOUR ADDRESS:');
        console.log(`   Expected: ${TREZOR_ADDRESS}`);
        console.log('   Confirm this matches in Trezor Suite Web');
        console.log('');
        console.log('5. 🚀 DEPLOY CONTRACT:');
        console.log('   • Find "Send" or "Advanced" section');
        console.log('   • Create contract deployment transaction:');
        console.log(`     - To: (leave empty for contract creation)`);
        console.log(`     - Value: 0`);
        console.log(`     - Data: ${deploymentData.substring(0, 50)}...`);
        console.log(`     - Gas Limit: ${parseInt(trezorInstructions.deployment.gasLimit, 16)}`);
        console.log('   • Sign transaction on Trezor device');
        console.log('   • Note the contract address from transaction receipt');
        console.log('');
        console.log('6. ⚡ INITIALIZE CONTRACT:');
        console.log('   • Create initialization transaction:');
        console.log(`     - To: [CONTRACT_ADDRESS_FROM_STEP_5]`);
        console.log(`     - Value: 0`);
        console.log(`     - Data: ${initializationData}`);
        console.log(`     - Gas Limit: ${parseInt(trezorInstructions.initialization.gasLimit, 16)}`);
        console.log('   • Sign initialization on Trezor device');
        console.log('');
        console.log('7. ✅ VERIFY DEPLOYMENT:');
        console.log('   • Check contract on BSC Testnet explorer');
        console.log('   • Verify all admin roles assigned to your Trezor');
        console.log('   • Test admin functions require Trezor signature');

        console.log('\n🔗 USEFUL LINKS:');
        console.log(`   • Trezor Suite Web: https://suite.trezor.io/web/`);
        console.log(`   • BSC Testnet Faucet: https://testnet.binance.org/faucet-smart`);
        console.log(`   • BSC Testnet Explorer: https://testnet.bscscan.com`);
        console.log(`   • Your Address Explorer: https://testnet.bscscan.com/address/${TREZOR_ADDRESS}`);

        console.log('\n🛡️ SECURITY NOTES:');
        console.log('   • Only use official Trezor Suite Web');
        console.log('   • Verify all transaction details on Trezor screen');
        console.log('   • All admin rights will be secured by your Trezor device');
        console.log('   • No private keys ever leave your hardware wallet');

        console.log('\n✅ DEPLOYMENT DATA READY!');
        console.log('   You can now proceed with Trezor Suite Web deployment');

        return {
            success: true,
            deploymentFile,
            trezorInstructions
        };

    } catch (error) {
        console.error('\n❌ ERROR GENERATING DEPLOYMENT DATA:');
        console.error(`   ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Run the generator
generateTrezorDeploymentData()
    .then(result => {
        if (result.success) {
            console.log('\n🎉 Ready for authentic Trezor Suite Web deployment!');
            process.exit(0);
        } else {
            console.log('\n❌ Failed to generate deployment data');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
