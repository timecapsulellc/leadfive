const { run } = require("hardhat");
const fs = require('fs');

async function verifyBSCTestnet() {
    console.log('🔍 VERIFYING CONTRACTS ON BSC TESTNET');
    console.log('='.repeat(60));
    
    // Load deployment info
    if (!fs.existsSync('./bsc-testnet-deployment.json')) {
        throw new Error('❌ Deployment info not found. Deploy first with: npx hardhat run deploy-bsc-testnet-hardhat.cjs --network bscTestnet');
    }
    
    const deploymentInfo = JSON.parse(
        fs.readFileSync('./bsc-testnet-deployment.json', 'utf8')
    );
    
    const addresses = deploymentInfo.addresses;
    const config = addresses.config;
    
    console.log('📋 VERIFICATION TARGETS:');
    console.log('- Proxy:', addresses.proxy);
    console.log('- Implementation:', addresses.implementation);
    console.log('- CoreOptimized:', addresses.libraries.CoreOptimized);
    console.log('- SecureOracle:', addresses.libraries.SecureOracle);
    console.log('- Errors:', addresses.libraries.Errors);
    
    const verificationResults = [];
    
    try {
        // Verify libraries first
        console.log('\n1️⃣ VERIFYING LIBRARIES...');
        
        // CoreOptimized
        console.log('Verifying CoreOptimized library...');
        try {
            await run("verify:verify", {
                address: addresses.libraries.CoreOptimized,
                constructorArguments: [],
                network: "bscTestnet"
            });
            console.log('✅ CoreOptimized verified');
            verificationResults.push({ contract: 'CoreOptimized', status: 'success' });
        } catch (error) {
            if (error.message.includes("already verified")) {
                console.log('✅ CoreOptimized already verified');
                verificationResults.push({ contract: 'CoreOptimized', status: 'already_verified' });
            } else {
                console.log('❌ CoreOptimized verification failed:', error.message);
                verificationResults.push({ contract: 'CoreOptimized', status: 'failed', error: error.message });
            }
        }
        
        // SecureOracle
        console.log('Verifying SecureOracle library...');
        try {
            await run("verify:verify", {
                address: addresses.libraries.SecureOracle,
                constructorArguments: [],
                network: "bscTestnet"
            });
            console.log('✅ SecureOracle verified');
            verificationResults.push({ contract: 'SecureOracle', status: 'success' });
        } catch (error) {
            if (error.message.includes("already verified")) {
                console.log('✅ SecureOracle already verified');
                verificationResults.push({ contract: 'SecureOracle', status: 'already_verified' });
            } else {
                console.log('❌ SecureOracle verification failed:', error.message);
                verificationResults.push({ contract: 'SecureOracle', status: 'failed', error: error.message });
            }
        }
        
        // Errors
        console.log('Verifying Errors library...');
        try {
            await run("verify:verify", {
                address: addresses.libraries.Errors,
                constructorArguments: [],
                network: "bscTestnet"
            });
            console.log('✅ Errors verified');
            verificationResults.push({ contract: 'Errors', status: 'success' });
        } catch (error) {
            if (error.message.includes("already verified")) {
                console.log('✅ Errors already verified');
                verificationResults.push({ contract: 'Errors', status: 'already_verified' });
            } else {
                console.log('❌ Errors verification failed:', error.message);
                verificationResults.push({ contract: 'Errors', status: 'failed', error: error.message });
            }
        }
        
        // Wait before verifying implementation
        console.log('\n⏳ Waiting 15 seconds before verifying implementation...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        console.log('\n2️⃣ VERIFYING IMPLEMENTATION...');
        
        // Implementation contract
        console.log('Verifying LeadFive implementation...');
        try {
            await run("verify:verify", {
                address: addresses.implementation,
                constructorArguments: [],
                libraries: {
                    "contracts/libraries/CoreOptimized.sol:CoreOptimized": addresses.libraries.CoreOptimized,
                    "contracts/libraries/SecureOracle.sol:SecureOracle": addresses.libraries.SecureOracle,
                    "contracts/libraries/Errors.sol:Errors": addresses.libraries.Errors
                },
                network: "bscTestnet"
            });
            console.log('✅ Implementation verified');
            verificationResults.push({ contract: 'Implementation', status: 'success' });
        } catch (error) {
            if (error.message.includes("already verified")) {
                console.log('✅ Implementation already verified');
                verificationResults.push({ contract: 'Implementation', status: 'already_verified' });
            } else {
                console.log('❌ Implementation verification failed:', error.message);
                console.log('   This can happen with library linking. Manual verification may be needed.');
                verificationResults.push({ contract: 'Implementation', status: 'failed', error: error.message });
            }
        }
        
        console.log('\n3️⃣ VERIFYING PROXY...');
        
        // Proxy contract (this often fails, but it's normal)
        console.log('Verifying proxy contract...');
        try {
            await run("verify:verify", {
                address: addresses.proxy,
                constructorArguments: [],
                network: "bscTestnet"
            });
            console.log('✅ Proxy verified');
            verificationResults.push({ contract: 'Proxy', status: 'success' });
        } catch (error) {
            if (error.message.includes("already verified")) {
                console.log('✅ Proxy already verified');
                verificationResults.push({ contract: 'Proxy', status: 'already_verified' });
            } else {
                console.log('⚠️ Proxy verification failed (this is often normal for proxy contracts)');
                verificationResults.push({ contract: 'Proxy', status: 'failed_normal', error: error.message });
            }
        }
        
        console.log('\n🎉 VERIFICATION PROCESS COMPLETE!');
        console.log('='.repeat(60));
        
        // Summary
        const successful = verificationResults.filter(r => r.status === 'success' || r.status === 'already_verified').length;
        const total = verificationResults.length;
        
        console.log(`📊 VERIFICATION SUMMARY: ${successful}/${total} contracts verified`);
        
        verificationResults.forEach(result => {
            const status = result.status === 'success' ? '✅' : 
                          result.status === 'already_verified' ? '✅' : 
                          result.status === 'failed_normal' ? '⚠️' : '❌';
            console.log(`${status} ${result.contract}: ${result.status}`);
        });
        
        console.log('\n📋 BSC TESTNET LINKS:');
        Object.entries(deploymentInfo.verification.bscscanLinks).forEach(([name, link]) => {
            console.log(`🔗 ${name}: ${link}`);
        });
        
        console.log('\n📋 MANUAL VERIFICATION COMMANDS (if needed):');
        console.log(`npx hardhat verify --network bscTestnet ${addresses.implementation} \\`);
        console.log(`  --libraries "contracts/libraries/CoreOptimized.sol:CoreOptimized=${addresses.libraries.CoreOptimized},contracts/libraries/SecureOracle.sol:SecureOracle=${addresses.libraries.SecureOracle},contracts/libraries/Errors.sol:Errors=${addresses.libraries.Errors}"`);
        
        console.log('\n📋 NEXT STEPS:');
        console.log('1. Check contracts on BSCScan testnet (links above)');
        console.log('2. Get testnet USDT for testing');
        console.log('3. Test user registration and functions');
        console.log('4. Monitor for 24-48 hours');
        console.log('5. Deploy to BSC mainnet when confident');
        
        // Update deployment info with verification results
        deploymentInfo.verification.completed = true;
        deploymentInfo.verification.completedAt = new Date().toISOString();
        deploymentInfo.verification.results = verificationResults;
        deploymentInfo.verification.summary = {
            total: total,
            successful: successful,
            success_rate: `${Math.round((successful/total) * 100)}%`
        };
        
        fs.writeFileSync(
            './bsc-testnet-deployment.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('\n✅ Verification results saved to bsc-testnet-deployment.json');
        
    } catch (error) {
        console.error('\n❌ Verification process failed:', error);
        throw error;
    }
}

// Main execution
if (require.main === module) {
    verifyBSCTestnet()
        .then(() => {
            console.log('\n🎉 BSC TESTNET VERIFICATION COMPLETED!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Verification failed:', error.message);
            process.exit(1);
        });
}

module.exports = verifyBSCTestnet;
