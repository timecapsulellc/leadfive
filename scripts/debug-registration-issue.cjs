const hre = require("hardhat");
const { ethers } = require("hardhat");

async function debugRegistrationIssue() {
    try {
        console.log('🔍 DEBUGGING TREZOR REGISTRATION ISSUE');
        console.log('='.repeat(45));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        // Load contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        console.log('📋 CONTRACT STATE CHECK:');
        
        // Check if contract is paused
        try {
            const isPaused = await contract.paused();
            console.log(`  Contract Paused: ${isPaused ? '❌ YES (ISSUE!)' : '✅ NO'}`);
        } catch (e) {
            console.log('  Contract Paused: Unable to check');
        }
        
        // Check circuit breaker
        try {
            const circuitBreakerTriggered = await contract.circuitBreakerTriggered();
            console.log(`  Circuit Breaker: ${circuitBreakerTriggered ? '❌ TRIGGERED (ISSUE!)' : '✅ OK'}`);
        } catch (e) {
            console.log('  Circuit Breaker: Unable to check');
        }
        
        // Check Trezor registration status
        const trezorInfo = await contract.getUserBasicInfo(trezorAddress);
        const isRegistered = trezorInfo[0];
        console.log(`  Trezor Registered: ${isRegistered ? '✅ YES' : '❌ NO (ISSUE!)'}`);
        
        // Check package prices
        console.log('');
        console.log('📦 PACKAGE PRICES:');
        for (let i = 1; i <= 4; i++) {
            const price = await contract.getPackagePrice(i);
            console.log(`  Package ${i}: ${ethers.formatUnits(price, 6)} USDT`);
        }
        
        // Check Trezor balance
        const trezorBalance = await hre.ethers.provider.getBalance(trezorAddress);
        console.log('');
        console.log('💰 TREZOR WALLET:');
        console.log(`  BNB Balance: ${ethers.formatEther(trezorBalance)} BNB`);
        console.log(`  Sufficient for Package 1: ${trezorBalance >= ethers.parseEther("0.06") ? '✅ YES' : '❌ NO'}`);
        
        // Check oracle price (might be causing issues)
        console.log('');
        console.log('🔮 ORACLE STATUS:');
        try {
            const bnbPrice = await contract.getCurrentBNBPrice();
            console.log(`  BNB Price: $${ethers.formatUnits(bnbPrice, 8)}`);
            console.log('  Oracle Status: ✅ Working');
        } catch (e) {
            console.log('  Oracle Status: ❌ Not working (might cause issues)');
            console.log(`  Oracle Error: ${e.message}`);
        }
        
        console.log('');
        console.log('🎯 REGISTRATION SOLUTION:');
        console.log('='.repeat(25));
        
        if (!isRegistered) {
            console.log('PROBLEM: Trezor is not registered as a user');
            console.log('SOLUTION: Register Trezor first, then upgrade');
            console.log('');
            console.log('🔧 STEP 1: REGISTER TREZOR');
            console.log('Function: register(address,uint8,bool)');
            console.log('Parameters:');
            console.log('  sponsor: 0x0000000000000000000000000000000000000000');
            console.log('  packageLevel: 1');
            console.log('  useUSDT: false');
            console.log('  value: 0.05 BNB');
            console.log('');
            console.log('🔧 STEP 2: AFTER REGISTRATION (OPTIONAL)');
            console.log('Function: upgradePackage(uint8,bool)');
            console.log('Parameters:');
            console.log('  newLevel: 2, 3, or 4');
            console.log('  useUSDT: false');
            console.log('  value: Additional BNB for upgrade');
            
            console.log('');
            console.log('📱 EXACT STEPS TO FIX:');
            console.log('1. Go to BSCScan contract page');
            console.log('2. Connect Trezor wallet');
            console.log('3. Find "register" function (NOT upgradePackage)');
            console.log('4. Use parameters above');
            console.log('5. Set value to 0.05 BNB');
            console.log('6. Confirm transaction');
            console.log('7. THEN upgrade if desired');
            
        } else {
            console.log('✅ Trezor is registered - upgrade should work');
        }
        
        console.log('');
        console.log('🔗 REGISTRATION LINK:');
        console.log(`https://bscscan.com/address/${contractAddress}#writeContract`);
        
        console.log('');
        console.log('⚠️  IMPORTANT:');
        console.log('- Use "register" function FIRST');
        console.log('- Use "upgradePackage" function AFTER registration');
        console.log('- Cannot upgrade without being registered first');
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugRegistrationIssue();
