const hre = require("hardhat");
const { ethers } = require("hardhat");

async function analyzeContractState() {
    try {
        console.log('🔬 DEEP CONTRACT STATE ANALYSIS');
        console.log('='.repeat(40));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        // Load contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        console.log('🔍 CHECKING ADVANCED CONTRACT STATE:');
        
        // Check circuit breaker
        try {
            const circuitBreakerTriggered = await contract.circuitBreakerTriggered();
            console.log(`  Circuit Breaker: ${circuitBreakerTriggered ? '❌ TRIGGERED' : '✅ OK'}`);
        } catch (e) {
            console.log('  Circuit Breaker: Unable to check');
        }
        
        // Check if contract is initialized
        try {
            const usdt = await contract.usdt();
            console.log(`  USDT Token: ${usdt}`);
            console.log(`  Initialized: ${usdt !== ethers.ZeroAddress ? '✅ YES' : '❌ NO'}`);
        } catch (e) {
            console.log('  Initialization: Unable to check');
        }
        
        // Check daily withdrawal limits
        try {
            const dailyLimit = await contract.dailyWithdrawalLimit();
            console.log(`  Daily Limit: ${ethers.formatEther(dailyLimit)} BNB`);
        } catch (e) {
            console.log('  Daily Limit: Unable to check');
        }
        
        // Check rate limiting
        try {
            const lastTx = await contract.userLastTx(trezorAddress);
            console.log(`  Last TX Time: ${lastTx.toString()}`);
        } catch (e) {
            console.log('  Rate Limiting: Unable to check');
        }
        
        console.log('');
        console.log('🎯 TRYING STATIC CALL TO SIMULATE:');
        
        try {
            // Try a static call to see what would happen
            const bnbAmount = ethers.parseEther("0.05");
            
            await contract.register.staticCall(
                ethers.ZeroAddress,
                1,
                false,
                { value: bnbAmount, from: trezorAddress }
            );
            
            console.log('✅ Static call succeeded - transaction should work');
            
        } catch (staticError) {
            console.log('❌ Static call failed with error:');
            console.log(`   ${staticError.message}`);
            
            // Try to decode the error
            if (staticError.message.includes('revert')) {
                console.log('');
                console.log('🔍 POSSIBLE REVERT REASONS:');
                console.log('1. Already registered');
                console.log('2. Invalid sponsor');
                console.log('3. Invalid package level');
                console.log('4. Insufficient payment');
                console.log('5. Circuit breaker triggered');
                console.log('6. Contract paused');
                console.log('7. Oracle price feed issue');
                console.log('8. Rate limiting active');
            }
        }
        
        console.log('');
        console.log('🔧 ALTERNATIVE APPROACH:');
        console.log('Let\'s try with a higher BNB amount to ensure sufficient payment:');
        
        try {
            const higherAmount = ethers.parseEther("0.08"); // Try with more BNB
            
            await contract.register.staticCall(
                ethers.ZeroAddress,
                1,
                false,
                { value: higherAmount, from: trezorAddress }
            );
            
            console.log('✅ Higher amount static call succeeded');
            console.log(`   Try with: ${ethers.formatEther(higherAmount)} BNB instead of 0.05`);
            
        } catch (higherError) {
            console.log('❌ Higher amount also failed:');
            console.log(`   ${higherError.message}`);
        }
        
        console.log('');
        console.log('🎯 WORKAROUND SOLUTION:');
        console.log('Since the register function is failing, let\'s check if there\'s');
        console.log('an admin function that can register users:');
        
        // Check if there are admin registration functions
        try {
            // Try to see if owner can register others
            console.log('Checking owner privileges...');
            
            // Since Trezor is the owner, it might be able to use admin functions
            const isOwner = await contract.owner();
            if (isOwner.toLowerCase() === trezorAddress.toLowerCase()) {
                console.log('✅ Trezor is contract owner');
                console.log('💡 ALTERNATIVE: Use owner privileges if available');
                console.log('   1. Make Trezor an admin first');
                console.log('   2. Use admin functions to register');
                console.log('   3. Or modify contract settings');
            }
            
        } catch (e) {
            console.log('❌ Admin check failed');
        }
        
        console.log('');
        console.log('🚨 IMMEDIATE SOLUTIONS TO TRY:');
        console.log('1. Try registering with 0.08 BNB instead of 0.05');
        console.log('2. Wait a few minutes and try again (rate limiting)');
        console.log('3. Check if MEV protection is blocking the transaction');
        console.log('4. Use a different gas price or gas limit');
        console.log('');
        console.log('💡 RECOMMENDED: Try with 0.08 BNB value first');
        
    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
    }
}

analyzeContractState();
