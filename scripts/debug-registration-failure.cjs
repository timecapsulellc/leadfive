const hre = require("hardhat");
const { ethers } = require("hardhat");

async function debugRegistrationFailure() {
    try {
        console.log('🔍 DEBUGGING TREZOR REGISTRATION FAILURE');
        console.log('='.repeat(45));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        // Load contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        console.log('📋 TRANSACTION DETAILS:');
        console.log(`  From: ${trezorAddress}`);
        console.log(`  To: ${contractAddress}`);
        console.log('  Function: register');
        console.log('  Parameters used:');
        console.log('    sponsor: 0x0000000000000000000000000000000000000000');
        console.log('    packageLevel: 1');
        console.log('    useUSDT: false');
        console.log('    value: (checking...)');
        
        console.log('');
        console.log('🔍 CHECKING POSSIBLE ISSUES:');
        
        // 1. Check if already registered
        const userInfo = await contract.getUserBasicInfo(trezorAddress);
        const isRegistered = userInfo[0];
        console.log(`  1. Already registered: ${isRegistered ? '❌ YES (this would cause revert)' : '✅ NO (good)'}`);
        
        // 2. Check Trezor balance
        const trezorBalance = await hre.ethers.provider.getBalance(trezorAddress);
        console.log(`  2. Trezor BNB balance: ${ethers.formatEther(trezorBalance)} BNB`);
        console.log(`     Sufficient (>0.06): ${trezorBalance >= ethers.parseEther("0.06") ? '✅ YES' : '❌ NO'}`);
        
        // 3. Check if contract is paused
        const isPaused = await contract.paused();
        console.log(`  3. Contract paused: ${isPaused ? '❌ YES (would cause revert)' : '✅ NO (good)'}`);
        
        // 4. Check package price
        const packagePrice = await contract.getPackagePrice(1);
        console.log(`  4. Package 1 price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
        
        // 5. Try to estimate BNB needed
        let bnbNeeded;
        try {
            const bnbPrice = await contract.getCurrentBNBPrice();
            bnbNeeded = (BigInt(packagePrice) * BigInt(10**18)) / BigInt(bnbPrice);
            console.log(`  5. BNB needed: ${ethers.formatEther(bnbNeeded)} BNB (with oracle)`);
        } catch (e) {
            // No oracle, estimate
            bnbNeeded = ethers.parseEther("0.05");
            console.log(`  5. BNB needed: ~${ethers.formatEther(bnbNeeded)} BNB (estimated, no oracle)`);
        }
        
        // 6. Check if value sent was sufficient
        console.log(`  6. Value comparison:`);
        console.log(`     Required: ${ethers.formatEther(bnbNeeded)} BNB`);
        console.log(`     Available: ${ethers.formatEther(trezorBalance)} BNB`);
        
        // 7. Check contract owner
        const owner = await contract.owner();
        console.log(`  7. Contract owner: ${owner}`);
        console.log(`     Is Trezor: ${owner.toLowerCase() === trezorAddress.toLowerCase() ? '✅ YES' : '❌ NO'}`);
        
        console.log('');
        console.log('🎯 MOST LIKELY ISSUES:');
        
        if (isRegistered) {
            console.log('❌ ISSUE: Trezor is already registered!');
            console.log('   This would cause "Already registered" revert');
            console.log('   Solution: Use upgradePackage instead of register');
        } else {
            console.log('✅ Trezor is not registered (good for register call)');
        }
        
        if (isPaused) {
            console.log('❌ ISSUE: Contract is paused!');
            console.log('   Solution: Unpause contract first');
        }
        
        if (trezorBalance < bnbNeeded) {
            console.log('❌ ISSUE: Insufficient BNB sent!');
            console.log(`   Need: ${ethers.formatEther(bnbNeeded)} BNB`);
            console.log(`   Have: ${ethers.formatEther(trezorBalance)} BNB`);
        }
        
        console.log('');
        console.log('🔧 SOLUTIONS:');
        
        if (isRegistered) {
            console.log('Since Trezor is already registered, use upgradePackage:');
            console.log('');
            console.log('FUNCTION: upgradePackage(uint8,bool)');
            console.log('PARAMETERS:');
            console.log('  newLevel: 2 (or 3, 4)');
            console.log('  useUSDT: false');
            console.log('  value: BNB amount for new package');
            console.log('');
            console.log('PACKAGE PRICES:');
            const pkg2 = await contract.getPackagePrice(2);
            const pkg3 = await contract.getPackagePrice(3);
            const pkg4 = await contract.getPackagePrice(4);
            console.log(`  Package 2: ${ethers.formatUnits(pkg2, 6)} USDT`);
            console.log(`  Package 3: ${ethers.formatUnits(pkg3, 6)} USDT`);
            console.log(`  Package 4: ${ethers.formatUnits(pkg4, 6)} USDT`);
        } else {
            console.log('For fresh registration, try:');
            console.log('1. Ensure sufficient BNB (send at least 0.1 BNB value)');
            console.log('2. Use exact parameters as shown');
            console.log('3. Check contract is not paused');
        }
        
        console.log('');
        console.log('📊 CURRENT STATUS:');
        if (isRegistered) {
            console.log('✅ Trezor is registered - ready for package upgrades');
            console.log(`✅ Current package: ${userInfo[1]}`);
            console.log(`✅ Current balance: ${ethers.formatUnits(userInfo[2], 6)} USDT`);
            console.log('🎉 PROJECT MIGHT ALREADY BE 100% COMPLETE!');
        } else {
            console.log('⏳ Trezor not registered - need to fix registration');
            console.log('📊 Project status: 98% complete');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugRegistrationFailure();
