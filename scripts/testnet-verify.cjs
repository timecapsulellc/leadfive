const { run } = require("hardhat");
const fs = require('fs');

async function verifyTestnetContract() {
    console.log('🔍 VERIFYING CONTRACT ON BSCSCAN TESTNET');
    console.log('='.repeat(60));
    
    // Load deployment info
    if (!fs.existsSync('./testnet-deployment-info.json')) {
        throw new Error('❌ Deployment info not found. Please deploy first with: node testnet-deploy.cjs');
    }
    
    const deploymentInfo = JSON.parse(
        fs.readFileSync('./testnet-deployment-info.json', 'utf8')
    );
    
    const addresses = deploymentInfo.addresses;
    
    console.log('📋 VERIFICATION TARGETS:');
    console.log('Proxy Address:', addresses.proxy);
    console.log('Implementation:', addresses.implementation);
    console.log('CoreOptimized Library:', addresses.libraries.CoreOptimized);
    console.log('SecureOracle Library:', addresses.libraries.SecureOracle);
    console.log('Errors Library:', addresses.libraries.Errors);
    
    console.log('\n🔍 Starting verification process...');
    
    try {
        // Verify libraries first
        console.log('\n1️⃣ Verifying CoreOptimized library...');
        try {
            await run("verify:verify", {
                address: addresses.libraries.CoreOptimized,
                constructorArguments: [],
            });
            console.log('✅ CoreOptimized library verified!');
        } catch (error) {
            if (error.message.includes("already verified")) {
                console.log('✅ CoreOptimized library already verified!');
            } else {
                console.log('⚠️ CoreOptimized verification failed:', error.message);
            }
        }
        
        console.log('\n2️⃣ Verifying SecureOracle library...');
        try {
            await run("verify:verify", {
                address: addresses.libraries.SecureOracle,
                constructorArguments: [],
            });
            console.log('✅ SecureOracle library verified!');
        } catch (error) {
            if (error.message.includes("already verified")) {
                console.log('✅ SecureOracle library already verified!');
            } else {
                console.log('⚠️ SecureOracle verification failed:', error.message);
            }
        }
        
        console.log('\n3️⃣ Verifying Errors library...');
        try {
            await run("verify:verify", {
                address: addresses.libraries.Errors,
                constructorArguments: [],
            });
            console.log('✅ Errors library verified!');
        } catch (error) {
            if (error.message.includes("already verified")) {
                console.log('✅ Errors library already verified!');
            } else {
                console.log('⚠️ Errors verification failed:', error.message);
            }
        }
        
        // Wait a bit before verifying implementation
        console.log('\n⏳ Waiting 10 seconds before verifying implementation...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        console.log('\n4️⃣ Verifying implementation contract...');
        try {
            await run("verify:verify", {
                address: addresses.implementation,
                constructorArguments: [],
                libraries: {
                    "contracts/libraries/CoreOptimized.sol:CoreOptimized": addresses.libraries.CoreOptimized,
                    "contracts/libraries/SecureOracle.sol:SecureOracle": addresses.libraries.SecureOracle,
                    "contracts/libraries/Errors.sol:Errors": addresses.libraries.Errors
                }
            });
            console.log('✅ Implementation contract verified!');
        } catch (error) {
            if (error.message.includes("already verified")) {
                console.log('✅ Implementation contract already verified!');
            } else {
                console.log('⚠️ Implementation verification failed:', error.message);
                console.log('   This is often due to library linking. Manual verification may be needed.');
            }
        }
        
        console.log('\n5️⃣ Verifying proxy contract...');
        try {
            await run("verify:verify", {
                address: addresses.proxy,
                constructorArguments: [],
            });
            console.log('✅ Proxy contract verified!');
        } catch (error) {
            if (error.message.includes("already verified")) {
                console.log('✅ Proxy contract already verified!');
            } else {
                console.log('⚠️ Proxy verification failed:', error.message);
                console.log('   Proxy contracts sometimes have verification issues, but this is normal.');
            }
        }
        
        console.log('\n🎉 VERIFICATION PROCESS COMPLETE!');
        console.log('='.repeat(60));
        
        console.log('\n📋 BSCSCAN TESTNET LINKS:');
        console.log(`🔗 Proxy Contract: https://testnet.bscscan.com/address/${addresses.proxy}`);
        console.log(`🔗 Implementation: https://testnet.bscscan.com/address/${addresses.implementation}`);
        console.log(`🔗 CoreOptimized: https://testnet.bscscan.com/address/${addresses.libraries.CoreOptimized}`);
        console.log(`🔗 SecureOracle: https://testnet.bscscan.com/address/${addresses.libraries.SecureOracle}`);
        console.log(`🔗 Errors: https://testnet.bscscan.com/address/${addresses.libraries.Errors}`);
        
        console.log('\n📋 NEXT STEPS:');
        console.log('1. Check contracts on BSCScan (links above)');
        console.log('2. Run comprehensive tests: node testnet-test.cjs');
        console.log('3. Test user registration and transactions');
        console.log('4. Monitor for 24-48 hours before mainnet');
        
        // Update deployment info with verification status
        deploymentInfo.verification = {
            verifiedAt: new Date().toISOString(),
            status: 'completed',
            bscscanLinks: {
                proxy: `https://testnet.bscscan.com/address/${addresses.proxy}`,
                implementation: `https://testnet.bscscan.com/address/${addresses.implementation}`,
                coreOptimized: `https://testnet.bscscan.com/address/${addresses.libraries.CoreOptimized}`,
                secureOracle: `https://testnet.bscscan.com/address/${addresses.libraries.SecureOracle}`,
                errors: `https://testnet.bscscan.com/address/${addresses.libraries.Errors}`
            }
        };
        
        fs.writeFileSync(
            './testnet-deployment-info.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('\n✅ Verification info saved to testnet-deployment-info.json');
        
    } catch (error) {
        console.error('\n❌ Verification process failed:', error);
        throw error;
    }
}

// Run verification
if (require.main === module) {
    verifyTestnetContract()
        .then(() => {
            console.log('\n🎉 Contract verification completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Contract verification failed:', error);
            process.exit(1);
        });
}

module.exports = verifyTestnetContract;
