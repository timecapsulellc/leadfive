require('dotenv').config();
const { ethers } = require("hardhat");

async function test() {
    console.log('Testing contract compilation and ABI...');
    
    // Try to get the contract factory
    try {
        const LeadFive = await ethers.getContractFactory("contracts/LeadFive.sol:LeadFive");
        console.log('✅ Contract factory loaded successfully');
        
        // Get the interface
        const iface = LeadFive.interface;
        console.log('Interface available:', !!iface);
        
        if (iface && iface.functions) {
            // List all functions
            const functions = Object.keys(iface.functions);
            console.log(`Total functions: ${functions.length}`);
            
            const adminFunctions = functions.filter(f => f.toLowerCase().includes('admin') || f.toLowerCase().includes('usdt') || f.toLowerCase().includes('owner'));
            
            console.log('Admin/USDT/Owner related functions:');
            adminFunctions.forEach(func => console.log(`  - ${func}`));
            
            // Specifically check for setUSDTAddress
            if (iface.functions['setUSDTAddress(address)']) {
                console.log('✅ setUSDTAddress function found in ABI!');
            } else {
                console.log('❌ setUSDTAddress function NOT found in ABI');
                console.log('Available function names containing "set":');
                functions.filter(f => f.toLowerCase().includes('set')).forEach(func => console.log(`  - ${func}`));
            }
        } else {
            console.log('❌ No interface or functions available');
        }
        
    } catch (error) {
        console.error('❌ Error loading contract factory:', error);
    }
}

test().catch(console.error);
