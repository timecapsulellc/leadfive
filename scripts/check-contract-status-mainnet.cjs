require('dotenv').config();
const { ethers } = require('hardhat');

async function checkContractStatus() {
    console.log('🔍 CHECKING CONTRACT STATUS ON BSC MAINNET');
    console.log('='.repeat(50));
    
    try {
        // Use BSC mainnet configuration
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        console.log(`RPC URL: ${process.env.BSC_MAINNET_RPC_URL}`);
        
        const contractAddress = process.env.MAINNET_CONTRACT_ADDRESS;
        console.log(`Contract Address: ${contractAddress}`);
        
        // Check if there's code at the address
        const code = await provider.getCode(contractAddress);
        console.log(`\nContract Code Length: ${code.length} characters`);
        console.log(`Has Contract Code: ${code !== '0x'}`);
        
        if (code === '0x') {
            console.log('❌ NO CONTRACT FOUND AT THIS ADDRESS');
            console.log('This address either:');
            console.log('1. Has no contract deployed');
            console.log('2. Is not a contract address');
            console.log('3. Contract was destroyed');
            return;
        }
        
        console.log('✅ Contract code found at address');
        
        // Try to get the contract using the LeadFive ABI
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress).connect(provider);
        
        console.log('\n📋 TESTING CONTRACT FUNCTIONS:');
        
        // Test basic view functions
        try {
            const owner = await contract.owner();
            console.log(`✅ Owner: ${owner}`);
        } catch (error) {
            console.log(`❌ owner() failed: ${error.message}`);
        }
        
        try {
            const totalUsers = await contract.getTotalUsers();
            console.log(`✅ Total Users: ${totalUsers}`);
        } catch (error) {
            console.log(`❌ getTotalUsers() failed: ${error.message}`);
        }
        
        try {
            const usdt = await contract.usdt();
            console.log(`✅ USDT Address: ${usdt}`);
        } catch (error) {
            console.log(`❌ usdt() failed: ${error.message}`);
        }
        
        try {
            const version = await contract.getVersion();
            console.log(`✅ Contract Version: ${version}`);
        } catch (error) {
            console.log(`❌ getVersion() failed: ${error.message}`);
        }
        
        // Check if it has the new register function
        try {
            // Check the register function signature
            const registerFunction = contract.interface.getFunction("register");
            console.log(`✅ Register function found with ${registerFunction.inputs.length} parameters:`);
            registerFunction.inputs.forEach((input, index) => {
                console.log(`   ${index + 1}. ${input.name} (${input.type})`);
            });
        } catch (error) {
            console.log(`❌ register() function check failed: ${error.message}`);
        }
        
        console.log('\n🎯 DIAGNOSIS:');
        console.log('If owner() fails but other functions work, there might be an ABI mismatch');
        console.log('If all functions fail, the contract might not be the expected LeadFive contract');
        
    } catch (error) {
        console.error('❌ Error checking contract status:', error.message);
    }
}

checkContractStatus()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
