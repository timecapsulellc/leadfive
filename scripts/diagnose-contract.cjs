#!/usr/bin/env node

/**
 * =====================================================
 * 🔍 CONTRACT DIAGNOSTIC TOOL
 * =====================================================
 */

require('dotenv').config();
const { ethers } = require('hardhat');

async function diagnoseContract() {
    console.log('\n🔍 CONTRACT DIAGNOSTIC TOOL');
    console.log('='.repeat(60));
    
    try {
        const [signer] = await ethers.getSigners();
        const contractAddress = process.env.TESTNET_CONTRACT_ADDRESS;
        
        console.log('📋 Basic Information:');
        console.log('-'.repeat(40));
        console.log(`Contract: ${contractAddress}`);
        console.log(`Signer: ${signer.address}`);
        console.log();
        
        // Check contract code
        const code = await ethers.provider.getCode(contractAddress);
        console.log('📦 Contract Code:');
        console.log('-'.repeat(40));
        console.log(`Exists: ${code !== '0x' ? 'YES' : 'NO'}`);
        console.log(`Size: ${code.length} chars`);
        console.log(`First 100 chars: ${code.substring(0, 100)}...`);
        console.log();
        
        // Try different ways to interact with the contract
        console.log('🔍 Diagnosis Tests:');
        console.log('-'.repeat(40));
        
        // Test 1: Try calling functions with different approaches
        try {
            console.log('Test 1: Direct function call via provider...');
            const result = await ethers.provider.call({
                to: contractAddress,
                data: '0x8da5cb5b' // owner() function selector
            });
            console.log(`✅ Direct call result: ${result}`);
        } catch (error) {
            console.log(`❌ Direct call failed: ${error.message}`);
        }
        
        // Test 2: Check if it's a proxy
        try {
            console.log('\\nTest 2: Checking proxy implementation...');
            // EIP-1967 implementation slot
            const implSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
            const implAddress = await ethers.provider.getStorage(contractAddress, implSlot);
            console.log(`Implementation address: ${implAddress}`);
            
            if (implAddress !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                const cleanImplAddress = '0x' + implAddress.slice(-40);
                console.log(`✅ This is a proxy! Implementation: ${cleanImplAddress}`);
                
                // Try calling the implementation directly
                const implCode = await ethers.provider.getCode(cleanImplAddress);
                console.log(`Implementation code exists: ${implCode !== '0x' ? 'YES' : 'NO'}`);
                console.log(`Implementation size: ${implCode.length} chars`);
            } else {
                console.log('❌ Not a proxy or implementation slot empty');
            }
        } catch (error) {
            console.log(`❌ Proxy check failed: ${error.message}`);
        }
        
        // Test 3: Check initialization status
        try {
            console.log('\\nTest 3: Checking initialization...');
            
            // Try to get initialization status
            // Check if owner is set (indicating initialization)
            const ownerCall = await ethers.provider.call({
                to: contractAddress,
                data: '0x8da5cb5b' // owner()
            });
            
            if (ownerCall && ownerCall !== '0x') {
                console.log(`✅ Owner call returned: ${ownerCall}`);
                // Decode the owner address
                const owner = '0x' + ownerCall.slice(-40);
                console.log(`Decoded owner: ${owner}`);
            } else {
                console.log('❌ Owner call returned empty - contract may not be initialized');
            }
        } catch (error) {
            console.log(`❌ Initialization check failed: ${error.message}`);
        }
        
        // Test 4: Try with raw contract interface
        try {
            console.log('\\nTest 4: Testing with minimal ABI...');
            
            const minimalAbi = [
                'function owner() view returns (address)',
                'function usdt() view returns (address)',
                'function paused() view returns (bool)',
                'function totalUsers() view returns (uint32)'
            ];
            
            const contract = new ethers.Contract(contractAddress, minimalAbi, signer);
            
            console.log('Trying owner()...');
            const owner = await contract.owner();
            console.log(`✅ Owner: ${owner}`);
            
        } catch (error) {
            console.log(`❌ Minimal ABI test failed: ${error.message}`);
        }
        
        // Test 5: Check if contract needs initialization
        console.log('\\nTest 5: Initialization status...');
        try {
            // Load the actual contract with full ABI
            const leadFive = await ethers.getContractAt("LeadFive", contractAddress, signer);
            
            // Try calling initialize (should fail if already initialized)
            const tx = await leadFive.initialize.staticCall(
                '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
                { from: signer.address }
            );
            console.log('⚠️  Contract appears to NOT be initialized yet!');
            console.log('💡 You may need to call initialize() function');
            
        } catch (error) {
            if (error.message.includes('Initializable: contract is already initialized')) {
                console.log('✅ Contract is already initialized');
            } else {
                console.log(`❌ Initialize check failed: ${error.message}`);
            }
        }
        
        console.log('\n📋 DIAGNOSIS SUMMARY:');
        console.log('='.repeat(60));
        console.log('🔍 Contract exists on blockchain');
        console.log('🔍 Check if its a proxy contract');
        console.log('🔍 Verify initialization status');
        console.log('🔍 All function calls return empty data');
        console.log();
        console.log('💡 POSSIBLE SOLUTIONS:');
        console.log('1. Contract may need initialization');
        console.log('2. Wrong contract address');
        console.log('3. Proxy configuration issue');
        console.log('4. Network connectivity problem');
        console.log();
        console.log('🌐 Check on BSCScan:');
        console.log(`https://testnet.bscscan.com/address/${contractAddress}`);
        
    } catch (error) {
        console.error('❌ Diagnosis failed:', error);
    }
}

diagnoseContract()
    .then(() => {
        console.log('\n✅ Diagnosis completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Diagnosis failed:', error.message);
        process.exit(1);
    });
