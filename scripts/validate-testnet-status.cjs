const { ethers } = require('hardhat');

async function validateTestnetDeployment() {
    console.log('🔍 VALIDATING TESTNET DEPLOYMENT STATUS');
    console.log('='.repeat(60));
    
    // Check both testnet contracts
    const testnetContracts = [
        {
            name: 'Primary Testnet Contract',
            address: '0x35Fa466f2B4f61F9C950eC1488dc5608157315e4'
        },
        {
            name: 'Optimized Testnet Contract', 
            address: '0x1E95943b022dde7Ce7e0F54ced25599e0c6D8b9b'
        }
    ];
    
    for (const contractInfo of testnetContracts) {
        console.log(`\n📋 Checking ${contractInfo.name}...`);
        console.log(`Address: ${contractInfo.address}`);
        
        try {
            // Check if contract exists
            const code = await ethers.provider.getCode(contractInfo.address);
            const exists = code !== '0x';
            console.log(`✅ Contract exists: ${exists}`);
            
            if (exists) {
                // Try to interact with contract
                const contract = await ethers.getContractAt('LeadFive', contractInfo.address);
                
                try {
                    const owner = await contract.owner();
                    console.log(`✅ Owner: ${owner}`);
                } catch (e) {
                    console.log(`❌ Could not read owner: ${e.message}`);
                }
                
                try {
                    const version = await contract.getVersion();
                    console.log(`✅ Version: ${version}`);
                } catch (e) {
                    console.log(`❌ Could not read version: ${e.message}`);
                }
                
                try {
                    const totalUsers = await contract.getTotalUsers();
                    console.log(`✅ Total Users: ${totalUsers}`);
                } catch (e) {
                    console.log(`❌ Could not read total users: ${e.message}`);
                }
                
                try {
                    const usdt = await contract.usdt();
                    console.log(`✅ USDT Address: ${usdt}`);
                    console.log(`✅ USDT Configured: ${usdt !== ethers.ZeroAddress}`);
                } catch (e) {
                    console.log(`❌ Could not read USDT: ${e.message}`);
                }
                
                // Check package prices
                try {
                    const prices = await contract.getAllPackagePrices();
                    console.log(`✅ Package Prices: [${prices.join(', ')}]`);
                } catch (e) {
                    console.log(`❌ Could not read packages: ${e.message}`);
                }
            }
            
        } catch (error) {
            console.log(`❌ Error checking contract: ${error.message}`);
        }
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('1. Deploy fresh testnet contract with current LeadFive.sol');
    console.log('2. Test all functions thoroughly on testnet');
    console.log('3. Prepare for mainnet deployment');
}

validateTestnetDeployment().catch(console.error);
