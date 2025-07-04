const { ethers } = require('hardhat');

async function checkActualContractFunctions() {
    console.log('🔍 CHECKING ACTUAL MAINNET CONTRACT FUNCTIONS');
    console.log('=' .repeat(60));
    
    const CONTRACT_ADDRESS = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498';
    
    try {
        const [deployer] = await ethers.getSigners();
        console.log('📍 Deployer:', deployer.address);
        console.log('🔗 Contract:', CONTRACT_ADDRESS);
        
        // Get contract bytecode
        const code = await ethers.provider.getCode(CONTRACT_ADDRESS);
        console.log('📦 Contract exists:', code !== '0x' ? 'YES' : 'NO');
        console.log('📦 Bytecode length:', code.length);
        
        // Try to connect with basic functions first
        console.log('\n🧪 TESTING BASIC FUNCTIONS:');
        console.log('-'.repeat(40));
        
        // Test owner function (this worked)
        try {
            const ownerCall = await ethers.provider.call({
                to: CONTRACT_ADDRESS,
                data: '0x8da5cb5b' // owner() function selector
            });
            const owner = ethers.getAddress('0x' + ownerCall.slice(-40));
            console.log('✅ owner():', owner);
        } catch (error) {
            console.log('❌ owner():', error.message);
        }
        
        // Test basic contract functions that should exist
        const basicFunctions = [
            { name: 'totalUsers', selector: '0x11e92d0e' },
            { name: 'paused', selector: '0x5c975abb' },
            { name: 'usdt', selector: '0x2f48ab7d' }
        ];
        
        for (const func of basicFunctions) {
            try {
                const result = await ethers.provider.call({
                    to: CONTRACT_ADDRESS,
                    data: func.selector
                });
                console.log(`✅ ${func.name}():`, result);
            } catch (error) {
                console.log(`❌ ${func.name}():`, error.message.slice(0, 50));
            }
        }
        
        console.log('\n🔍 TESTING ENHANCED FUNCTION SELECTORS:');
        console.log('-'.repeat(40));
        
        // Test enhanced function selectors
        const enhancedFunctions = [
            { name: 'withdrawEnhanced', selector: '0x4b1c5bb8' },
            { name: 'toggleAutoCompound', selector: '0x7c025200' },
            { name: 'getWithdrawalSplit', selector: '0x1a7a98e2' },
            { name: 'getUserReferralCount', selector: '0x7b96a48c' },
            { name: 'isAutoCompoundEnabled', selector: '0x6b24c5d8' },
            { name: 'getTreasuryWallet', selector: '0x6f307dc3' }
        ];
        
        for (const func of enhancedFunctions) {
            try {
                let callData = func.selector;
                if (func.name === 'getWithdrawalSplit' || func.name === 'getUserReferralCount' || func.name === 'isAutoCompoundEnabled') {
                    // Add deployer address as parameter for functions that need it
                    callData += deployer.address.slice(2).padStart(64, '0');
                }
                
                const result = await ethers.provider.call({
                    to: CONTRACT_ADDRESS,
                    data: callData
                });
                console.log(`✅ ${func.name}():`, result);
            } catch (error) {
                console.log(`❌ ${func.name}():`, error.message.slice(0, 100));
            }
        }
        
        console.log('\n🔧 CHECKING PROXY IMPLEMENTATION:');
        console.log('-'.repeat(40));
        
        // Check proxy implementation
        const implSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
        const impl = await ethers.provider.getStorageAt(CONTRACT_ADDRESS, implSlot);
        console.log('📦 Implementation address:', impl);
        
        if (impl !== '0x' + '0'.repeat(64)) {
            console.log('✅ Contract is UUPS proxy');
            
            // Check implementation contract
            const implCode = await ethers.provider.getCode(impl);
            console.log('📦 Implementation bytecode length:', implCode.length);
            
            // Try to call enhanced functions on implementation directly
            console.log('\n🎯 TESTING IMPLEMENTATION DIRECTLY:');
            try {
                const implAddress = ethers.getAddress(impl);
                console.log('🔗 Implementation:', implAddress);
                
                // Test getTreasuryWallet on implementation
                const treasuryCall = await ethers.provider.call({
                    to: implAddress,
                    data: '0x6f307dc3' // getTreasuryWallet()
                });
                console.log('✅ Implementation getTreasuryWallet():', treasuryCall);
                
            } catch (error) {
                console.log('❌ Implementation test failed:', error.message);
            }
        }
        
        console.log('\n📋 DIAGNOSIS:');
        console.log('-'.repeat(40));
        
        if (code !== '0x' && code.length > 100) {
            console.log('✅ Contract exists and has bytecode');
            
            if (impl !== '0x' + '0'.repeat(64)) {
                console.log('✅ Contract is upgradeable proxy');
                console.log('🔍 Issue: Enhanced functions may not be in current implementation');
                console.log('💡 Solution: Need to verify if upgrade was successful');
            } else {
                console.log('❌ Not a proxy contract');
                console.log('💡 This suggests the contract structure is different than expected');
            }
        } else {
            console.log('❌ Contract not found or no bytecode');
        }
        
        // Try with the original LeadFive ABI
        console.log('\n🔄 TRYING WITH ORIGINAL CONTRACT ABI:');
        console.log('-'.repeat(40));
        
        try {
            // Try connecting with basic contract interface
            const basicContract = new ethers.Contract(CONTRACT_ADDRESS, [
                'function owner() view returns (address)',
                'function totalUsers() view returns (uint32)',
                'function paused() view returns (bool)',
                'function usdt() view returns (address)'
            ], deployer);
            
            const owner = await basicContract.owner();
            const totalUsers = await basicContract.totalUsers();
            const paused = await basicContract.paused();
            const usdt = await basicContract.usdt();
            
            console.log('✅ Basic contract connection successful:');
            console.log('   Owner:', owner);
            console.log('   Total Users:', totalUsers.toString());
            console.log('   Paused:', paused);
            console.log('   USDT:', usdt);
            
        } catch (error) {
            console.log('❌ Basic contract connection failed:', error.message);
        }
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. Verify if the enhanced functions were actually deployed');
        console.log('2. Check if we need to run the upgrade script again');
        console.log('3. Confirm the contract implementation has the enhanced functions');
        
    } catch (error) {
        console.error('❌ Check failed:', error);
        throw error;
    }
}

if (require.main === module) {
    checkActualContractFunctions()
        .then(() => {
            console.log('\n🏁 Contract function check completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Check failed:', error);
            process.exit(1);
        });
}

module.exports = checkActualContractFunctions;