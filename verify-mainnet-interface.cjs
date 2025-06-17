#!/usr/bin/env node
/**
 * BSC Mainnet Contract Interface Verification
 * Tests the deployed OrphiCrowdFund contract interface and network data retrieval functions
 * Contract: 0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732
 * Network: BSC Mainnet
 */

const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Contract configuration
const CONTRACT_ADDRESS = '0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732';
const BSC_MAINNET_RPC = 'https://bsc-dataseed.binance.org/';

// Load contract ABI
function loadContractABI() {
    try {
        const contractsPath = path.join(__dirname, 'src', 'contracts.js');
        const contractsContent = fs.readFileSync(contractsPath, 'utf8');
        
        // Extract ABI from the contracts.js file
        const abiMatch = contractsContent.match(/export const ORPHI_CROWDFUND_ABI = (\[[\s\S]*?\]);/);
        if (!abiMatch) {
            throw new Error('Could not find ABI in contracts.js');
        }
        
        // Parse the ABI
        const abiString = abiMatch[1];
        return JSON.parse(abiString);
    } catch (error) {
        console.error('❌ Error loading contract ABI:', error.message);
        return null;
    }
}

async function verifyMainnetInterface() {
    console.log('\n🔗 BSC MAINNET CONTRACT INTERFACE VERIFICATION');
    console.log('═'.repeat(80));
    console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`🌐 Network: BSC Mainnet`);
    console.log(`🔗 BSCScan: https://bscscan.com/address/${CONTRACT_ADDRESS}`);
    console.log('═'.repeat(80));
    
    try {
        // Initialize Web3
        const web3 = new Web3(BSC_MAINNET_RPC);
        console.log('✅ Connected to BSC Mainnet');
        
        // Load ABI
        const abi = loadContractABI();
        if (!abi) {
            throw new Error('Failed to load contract ABI');
        }
        console.log('✅ Contract ABI loaded successfully');
        
        // Create contract instance
        const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
        console.log('✅ Contract instance created');
        
        console.log('\n📊 TESTING NETWORK DATA FUNCTIONS');
        console.log('─'.repeat(50));
        
        // Test view functions that are useful for network visualization
        const tests = [
            {
                name: 'Total Users',
                method: 'totalUsers',
                args: []
            },
            {
                name: 'Contract Owner',
                method: 'owner',
                args: []
            },
            {
                name: 'Contract Paused Status',
                method: 'paused',
                args: []
            },
            {
                name: 'USDT Token Address',
                method: 'usdtToken',
                args: []
            },
            {
                name: 'Global Pool Balance',
                method: 'globalHelpPoolBalance',
                args: []
            }
        ];
        
        const results = {};
        
        for (const test of tests) {
            try {
                console.log(`\n🔍 Testing ${test.name}...`);
                const result = await contract.methods[test.method](...test.args).call();
                console.log(`✅ ${test.name}:`, result);
                results[test.method] = result;
            } catch (error) {
                console.log(`❌ ${test.name}: ${error.message}`);
                results[test.method] = null;
            }
        }
        
        console.log('\n🔍 TESTING USER INFO FUNCTIONS');
        console.log('─'.repeat(50));
        
        // Test with some example addresses to see data structure
        const testAddresses = [
            '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29', // Your Trezor wallet
            '0x0000000000000000000000000000000000000001', // Test address
            '0x0000000000000000000000000000000000000002'  // Test address
        ];
        
        for (const address of testAddresses) {
            try {
                console.log(`\n🔍 Testing getUserInfo for ${address}...`);
                const userInfo = await contract.methods.getUserInfo(address).call();
                console.log('✅ User Info Structure:', userInfo);
                
                // If user exists, we have good data structure
                if (userInfo && userInfo.length > 0) {
                    results.sampleUserInfo = userInfo;
                    break;
                }
            } catch (error) {
                console.log(`❌ getUserInfo(${address}): ${error.message}`);
            }
        }
        
        console.log('\n📋 INTERFACE VERIFICATION SUMMARY');
        console.log('═'.repeat(80));
        
        // Create interface summary
        const interfaceSummary = {
            contractAddress: CONTRACT_ADDRESS,
            network: 'BSC Mainnet',
            verificationTime: new Date().toISOString(),
            availableFunctions: Object.keys(results).filter(key => results[key] !== null),
            failedFunctions: Object.keys(results).filter(key => results[key] === null),
            totalUsers: results.totalUsers || 0,
            contractName: results.contractName || 'Unknown',
            version: results.version || 'Unknown',
            isOperational: results.paused === false,
            networkDataStructure: {
                packageAmounts: results.getPackageAmounts || null,
                levelBonusRates: results.getLevelBonusRates || null,
                globalStats: results.getGlobalStats || null,
                sampleUserInfo: results.sampleUserInfo || null
            }
        };
        
        console.log('📊 Available Functions:', interfaceSummary.availableFunctions.length);
        console.log('❌ Failed Functions:', interfaceSummary.failedFunctions.length);
        console.log('👥 Total Users:', interfaceSummary.totalUsers);
        console.log('🏷️ Contract Name:', interfaceSummary.contractName);
        console.log('📋 Version:', interfaceSummary.version);
        console.log('🟢 Operational:', interfaceSummary.isOperational ? 'Yes' : 'No');
        
        // Save results for frontend integration
        const outputPath = path.join(__dirname, 'mainnet-interface-verification.json');
        fs.writeFileSync(outputPath, JSON.stringify(interfaceSummary, null, 2));
        console.log(`\n💾 Results saved to: ${outputPath}`);
        
        console.log('\n🎯 NETWORK TREE INTEGRATION READINESS');
        console.log('─'.repeat(50));
        
        const readiness = {
            contractAccessible: results.owner !== null,
            userDataAvailable: results.getUserInfo !== undefined,
            totalUsersAccessible: results.totalUsers !== null,
            contractOperational: results.paused === false,
            usdtTokenConfigured: results.usdtToken !== null
        };
        
        const readyCount = Object.values(readiness).filter(Boolean).length;
        const totalChecks = Object.keys(readiness).length;
        
        console.log(`🔗 Integration Readiness: ${readyCount}/${totalChecks} checks passed`);
        
        Object.entries(readiness).forEach(([check, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${check}`);
        });
        
        if (readyCount === totalChecks) {
            console.log('\n🎉 CONTRACT READY FOR NETWORK TREE INTEGRATION!');
            console.log('✅ All required functions are accessible');
            console.log('✅ Network data can be retrieved');
            console.log('✅ Tree visualization can connect to live data');
        } else {
            console.log('\n⚠️ PARTIAL READINESS - Some functions may be limited');
        }
        
        return interfaceSummary;
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        console.error('Stack trace:', error.stack);
        return null;
    }
}

// Run verification
if (require.main === module) {
    verifyMainnetInterface()
        .then(result => {
            if (result) {
                console.log('\n✅ Interface verification completed successfully');
                process.exit(0);
            } else {
                console.log('\n❌ Interface verification failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { verifyMainnetInterface };
