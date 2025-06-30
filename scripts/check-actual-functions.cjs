#!/usr/bin/env node

/**
 * =====================================================
 * 🔍 CHECK ACTUAL CONTRACT FUNCTIONS
 * =====================================================
 */

require('dotenv').config();
const { ethers } = require('hardhat');
const fs = require('fs');

async function checkActualFunctions() {
    console.log('\n🔍 Checking Actual Contract Functions\n');
    console.log('='.repeat(60));
    
    try {
        // Load the contract ABI
        const contractPath = './artifacts/contracts/LeadFive.sol/LeadFive.json';
        const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        
        console.log('📋 Available Functions:');
        console.log('='.repeat(50));
        
        // Get all functions from ABI
        const functions = contractJson.abi
            .filter(item => item.type === 'function')
            .map(func => ({
                name: func.name,
                inputs: func.inputs.map(i => `${i.type} ${i.name}`).join(', '),
                stateMutability: func.stateMutability,
                outputs: func.outputs.map(o => o.type).join(', ')
            }));
        
        // Categorize functions
        const viewFunctions = functions.filter(f => f.stateMutability === 'view' || f.stateMutability === 'pure');
        const writeFunctions = functions.filter(f => f.stateMutability === 'nonpayable' || f.stateMutability === 'payable');
        
        console.log('📖 VIEW/PURE FUNCTIONS (Read-only):');
        console.log('-'.repeat(50));
        viewFunctions.sort((a, b) => a.name.localeCompare(b.name));
        viewFunctions.forEach(func => {
            console.log(`- ${func.name}(${func.inputs}) → ${func.outputs || 'void'}`);
        });
        
        console.log('\n✏️  WRITE FUNCTIONS (State changing):');
        console.log('-'.repeat(50));
        writeFunctions.sort((a, b) => a.name.localeCompare(b.name));
        writeFunctions.forEach(func => {
            console.log(`- ${func.name}(${func.inputs})`);
        });
        
        console.log('\n📋 Initialize Function Details:');
        console.log('-'.repeat(50));
        const initFunc = contractJson.abi.find(f => f.name === 'initialize');
        if (initFunc) {
            console.log(`Initialize expects ${initFunc.inputs.length} parameters:`);
            initFunc.inputs.forEach((input, i) => {
                console.log(`  ${i + 1}. ${input.name} (${input.type})`);
            });
        } else {
            console.log('No initialize function found');
        }
        
        // Test connection to deployed contract
        console.log('\n🔗 Testing Connection to Deployed Contract:');
        console.log('-'.repeat(50));
        
        const contractAddress = process.env.TESTNET_CONTRACT_ADDRESS;
        console.log(`Contract Address: ${contractAddress}`);
        
        if (contractAddress && contractAddress !== '0x') {
            const [signer] = await ethers.getSigners();
            const leadFive = await ethers.getContractAt("LeadFive", contractAddress, signer);
            
            // Test a few basic functions that should exist
            const basicTests = [
                { name: 'owner', test: () => leadFive.owner() },
                { name: 'usdt', test: () => leadFive.usdt() },
                { name: 'paused', test: () => leadFive.paused() },
                { name: 'totalUsers', test: () => leadFive.totalUsers() },
                { name: 'isAdminAddress', test: () => leadFive.isAdminAddress(signer.address) },
                { name: 'platformFeeRecipient', test: () => leadFive.platformFeeRecipient() }
            ];
            
            for (const test of basicTests) {
                try {
                    const result = await test.test();
                    console.log(`✅ ${test.name}(): ${result}`);
                } catch (error) {
                    console.log(`❌ ${test.name}(): ${error.message.includes('is not a function') ? 'Function not found' : 'Error: ' + error.message}`);
                }
            }
        }
        
        // Save interface to file
        const interfaceData = {
            contractName: "LeadFive",
            generated: new Date().toISOString(),
            viewFunctions,
            writeFunctions,
            allFunctions: functions
        };
        
        fs.writeFileSync('./contract-interface.json', JSON.stringify(interfaceData, null, 2));
        console.log('\n💾 Interface saved to: contract-interface.json');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

checkActualFunctions()
    .then(() => {
        console.log('\n✅ Function check completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Check failed:', error.message);
        process.exit(1);
    });
