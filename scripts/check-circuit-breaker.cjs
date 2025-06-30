const hre = require("hardhat");
const { ethers } = require("hardhat");

async function checkCircuitBreaker() {
    try {
        console.log('🔍 CHECKING CIRCUIT BREAKER STATUS');
        console.log('='.repeat(40));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        console.log('🚨 CIRCUIT BREAKER INVESTIGATION:');
        
        // Check circuit breaker status
        const circuitBreakerTriggered = await contract.circuitBreakerTriggered();
        console.log(`  Circuit Breaker Triggered: ${circuitBreakerTriggered ? '❌ YES (PROBLEM!)' : '✅ NO'}`);
        
        const circuitBreakerThreshold = await contract.circuitBreakerThreshold();
        console.log(`  Circuit Breaker Threshold: ${ethers.formatEther(circuitBreakerThreshold)} BNB`);
        
        // Check package price vs threshold
        const packagePrice = await contract.getPackagePrice(1);
        console.log(`  Package 1 Price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
        
        // Estimate BNB equivalent (assuming $600 per BNB)
        const estimatedBNBNeeded = ethers.parseEther("0.05"); // ~$30
        console.log(`  Estimated BNB needed: ${ethers.formatEther(estimatedBNBNeeded)} BNB`);
        
        console.log('');
        console.log('🔍 ANALYSIS:');
        
        if (circuitBreakerTriggered) {
            console.log('❌ CIRCUIT BREAKER IS TRIGGERED!');
            console.log('  This prevents any transactions from going through');
            console.log('  Need to reset circuit breaker as contract owner');
        } else if (circuitBreakerThreshold > 0 && estimatedBNBNeeded > circuitBreakerThreshold) {
            console.log('❌ PAYMENT EXCEEDS CIRCUIT BREAKER THRESHOLD!');
            console.log(`  Payment: ${ethers.formatEther(estimatedBNBNeeded)} BNB`);
            console.log(`  Threshold: ${ethers.formatEther(circuitBreakerThreshold)} BNB`);
            console.log('  Need to increase threshold or disable circuit breaker');
        } else {
            console.log('✅ Circuit breaker should not be blocking transactions');
        }
        
        // Check if contract is paused
        const isPaused = await contract.paused();
        console.log('');
        console.log('⏸️  PAUSE STATUS:');
        console.log(`  Contract Paused: ${isPaused ? '❌ YES (PROBLEM!)' : '✅ NO'}`);
        
        console.log('');
        console.log('🔧 SOLUTIONS:');
        
        if (circuitBreakerTriggered) {
            console.log('TO RESET CIRCUIT BREAKER (as owner):');
            console.log('  1. Connect Trezor to BSCScan');
            console.log('  2. Find "resetCircuitBreaker" function');
            console.log('  3. Call it (no parameters needed)');
            console.log('  4. Then try registration again');
        }
        
        if (isPaused) {
            console.log('TO UNPAUSE CONTRACT (as owner):');
            console.log('  1. Connect Trezor to BSCScan');
            console.log('  2. Find "unpause" function');
            console.log('  3. Call it (no parameters needed)');
            console.log('  4. Then try registration again');
        }
        
        if (circuitBreakerThreshold > 0 && circuitBreakerThreshold < estimatedBNBNeeded) {
            console.log('TO ADJUST CIRCUIT BREAKER THRESHOLD (as owner):');
            console.log('  1. Connect Trezor to BSCScan');
            console.log('  2. Find "setCircuitBreakerThreshold" function');
            console.log('  3. Set to higher value (e.g., 1 BNB = 1000000000000000000)');
            console.log('  4. Then try registration again');
        }
        
        console.log('');
        console.log('💡 QUICK FIX RECOMMENDATION:');
        console.log('Since Trezor is the owner, it can:');
        console.log('1. Reset circuit breaker if triggered');
        console.log('2. Unpause contract if paused');
        console.log('3. Adjust thresholds if needed');
        console.log('4. Then proceed with registration');
        
    } catch (error) {
        console.error('❌ Circuit breaker check failed:', error.message);
    }
}

checkCircuitBreaker();
