const hre = require("hardhat");
const { ethers } = require("hardhat");

async function investigateContractIssue() {
    try {
        console.log('🔍 INVESTIGATING CONTRACT DEPLOYMENT ISSUE');
        console.log('='.repeat(50));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const implementationAddress = "0x10965e40d90054FDE981dd1A470937C68719F707";
        
        console.log('📋 CONTRACT ADDRESSES:');
        console.log(`  Proxy: ${contractAddress}`);
        console.log(`  Implementation: ${implementationAddress}`);
        
        // Check if we can interact with the contract directly
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        console.log('');
        console.log('🔍 TESTING CONTRACT FUNCTIONS:');
        
        // Test basic functions
        try {
            const owner = await contract.owner();
            console.log(`  ✅ owner(): ${owner}`);
        } catch (e) {
            console.log(`  ❌ owner() failed: ${e.message}`);
        }
        
        try {
            const totalUsers = await contract.getTotalUsers();
            console.log(`  ✅ getTotalUsers(): ${totalUsers}`);
        } catch (e) {
            console.log(`  ❌ getTotalUsers() failed: ${e.message}`);
        }
        
        try {
            const packagePrice = await contract.getPackagePrice(1);
            console.log(`  ✅ getPackagePrice(1): ${ethers.formatUnits(packagePrice, 6)} USDT`);
        } catch (e) {
            console.log(`  ❌ getPackagePrice() failed: ${e.message}`);
        }
        
        // Check contract ABI and verify register function
        console.log('');
        console.log('📋 CHECKING CONTRACT ABI:');
        
        const contractInterface = contract.interface;
        const registerFragment = contractInterface.getFunction('register');
        
        console.log(`  Function exists: ${registerFragment ? '✅ YES' : '❌ NO'}`);
        
        if (registerFragment) {
            console.log(`  Function name: ${registerFragment.name}`);
            console.log(`  Is payable: ${registerFragment.payable}`);
            console.log(`  State mutability: ${registerFragment.stateMutability}`);
            console.log(`  Signature: ${registerFragment.format()}`);
            
            console.log('');
            console.log('📝 FUNCTION INPUTS:');
            registerFragment.inputs.forEach((input, i) => {
                console.log(`    ${i + 1}. ${input.name}: ${input.type}`);
            });
        }
        
        // Try to call register with callStatic to see what happens
        console.log('');
        console.log('🧪 TESTING REGISTER FUNCTION CALL:');
        
        try {
            // This should fail with a revert reason, giving us more info
            const result = await contract.register.staticCall(
                ethers.ZeroAddress,
                1,
                false,
                { value: ethers.parseEther("0.05") }
            );
            console.log('  ✅ Static call succeeded (unexpected)');
        } catch (error) {
            console.log('  ❌ Static call failed (expected):');
            console.log(`      Error: ${error.message}`);
            
            // Try to extract the revert reason
            if (error.message.includes('revert')) {
                console.log('      This gives us the exact revert reason!');
            }
        }
        
        // Check if the contract was properly initialized
        console.log('');
        console.log('🔍 CHECKING CONTRACT INITIALIZATION:');
        
        try {
            // Try to call a function that requires initialization
            const usdt = await contract.usdt();
            console.log(`  ✅ USDT address: ${usdt}`);
            
            if (usdt === ethers.ZeroAddress) {
                console.log('  ⚠️  Contract might not be properly initialized!');
            }
        } catch (e) {
            console.log(`  ❌ USDT check failed: ${e.message}`);
            console.log('  ⚠️  Contract might not be initialized!');
        }
        
        // Check proxy implementation
        console.log('');
        console.log('🔍 CHECKING PROXY IMPLEMENTATION:');
        
        try {
            // Get the implementation slot
            const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
            const implementationData = await ethers.provider.getStorage(contractAddress, implementationSlot);
            const actualImplementation = "0x" + implementationData.slice(-40);
            
            console.log(`  Expected implementation: ${implementationAddress.toLowerCase()}`);
            console.log(`  Actual implementation: ${actualImplementation.toLowerCase()}`);
            console.log(`  Implementation matches: ${actualImplementation.toLowerCase() === implementationAddress.toLowerCase() ? '✅ YES' : '❌ NO'}`);
            
        } catch (e) {
            console.log(`  ❌ Proxy check failed: ${e.message}`);
        }
        
        console.log('');
        console.log('🎯 POSSIBLE ISSUES:');
        console.log('1. Contract not properly initialized');
        console.log('2. Proxy not pointing to correct implementation');
        console.log('3. Register function has modifiers blocking execution');
        console.log('4. BSCScan caching old ABI');
        console.log('5. Oracle dependency causing issues');
        
        console.log('');
        console.log('🔧 NEXT STEPS:');
        console.log('1. Check if contract needs re-initialization');
        console.log('2. Verify proxy implementation is correct');
        console.log('3. Try different registration approach');
        console.log('4. Check contract pause/circuit breaker status');
        
    } catch (error) {
        console.error('❌ Investigation failed:', error.message);
    }
}

investigateContractIssue();
