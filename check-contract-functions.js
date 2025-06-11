// Check Contract Functions Script
// This script checks all available functions in the OrphiCrowdFundV4UltraSecure contract

const { ethers } = require("hardhat");
const contractArtifact = require("./artifacts-v4ultra/standalone-v4ultra/OrphiCrowdFundV4UltraSecure.sol/OrphiCrowdFundV4UltraSecure.json");

async function main() {
    console.log("🔍 Analyzing OrphiCrowdFundV4UltraSecure Contract Functions...\n");

    // Contract address from latest deployment
    const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
    
    try {
        // Get all functions from ABI
        const abi = contractArtifact.abi;
        
        // Categorize functions
        const viewFunctions = abi.filter(f => f.type === 'function' && f.stateMutability === 'view');
        const writeFunctions = abi.filter(f => f.type === 'function' && f.stateMutability === 'nonpayable');
        const payableFunctions = abi.filter(f => f.type === 'function' && f.stateMutability === 'payable');
        
        // Display function categories
        console.log(`Total Functions: ${abi.filter(f => f.type === 'function').length}`);
        console.log(`View Functions: ${viewFunctions.length}`);
        console.log(`Write Functions: ${writeFunctions.length}`);
        console.log(`Payable Functions: ${payableFunctions.length}\n`);
        
        // List all view functions
        console.log("📖 VIEW FUNCTIONS:");
        viewFunctions.forEach(f => {
            const params = f.inputs.map(i => `${i.type} ${i.name}`).join(', ');
            const returns = f.outputs.map(o => o.type).join(', ');
            console.log(`  - ${f.name}(${params}) → (${returns})`);
        });
        
        // List user registration related functions
        console.log("\n🔐 REGISTRATION & USER MANAGEMENT FUNCTIONS:");
        const regFunctions = [...writeFunctions, ...payableFunctions].filter(f => 
            f.name.toLowerCase().includes('register') || 
            f.name.toLowerCase().includes('user') ||
            f.name.toLowerCase().includes('join') ||
            f.name.toLowerCase().includes('enroll')
        );
        
        regFunctions.forEach(f => {
            const params = f.inputs.map(i => `${i.type} ${i.name}`).join(', ');
            console.log(`  - ${f.name}(${params})`);
        });
        
        // List token/payment related functions
        console.log("\n💰 TOKEN & PAYMENT FUNCTIONS:");
        const tokenFunctions = [...writeFunctions, ...payableFunctions].filter(f => 
            f.name.toLowerCase().includes('token') || 
            f.name.toLowerCase().includes('payment') ||
            f.name.toLowerCase().includes('withdraw') ||
            f.name.toLowerCase().includes('deposit') ||
            f.name.toLowerCase().includes('transfer')
        );
        
        tokenFunctions.forEach(f => {
            const params = f.inputs.map(i => `${i.type} ${i.name}`).join(', ');
            console.log(`  - ${f.name}(${params})`);
        });
        
        // List admin functions
        console.log("\n👑 ADMIN FUNCTIONS:");
        const adminFunctions = [...writeFunctions, ...payableFunctions].filter(f => 
            f.name.toLowerCase().includes('admin') || 
            f.name.toLowerCase().includes('owner') ||
            f.name.toLowerCase().includes('pause') ||
            f.name.toLowerCase().includes('unpause') ||
            f.name.toLowerCase().includes('emergency') ||
            f.name.toLowerCase().includes('set')
        );
        
        adminFunctions.forEach(f => {
            const params = f.inputs.map(i => `${i.type} ${i.name}`).join(', ');
            console.log(`  - ${f.name}(${params})`);
        });
        
        console.log("\n✅ Contract function analysis complete!");
        console.log("Use this information to determine the correct functions to call for user registration and other operations.");

    } catch (error) {
        console.error("❌ Error analyzing contract functions:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
