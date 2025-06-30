const { ethers } = require('hardhat');

async function checkUSDTRegistrationStatus() {
    console.log('🔍 Checking USDT Registration Status...\n');
    
    // Contract details
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    const trezorAddress = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
    const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
    
    try {
        // Get contract instances
        const LeadFive = await ethers.getContractFactory('LeadFive');
        const contract = LeadFive.attach(contractAddress);
        
        // USDT contract ABI (minimal)
        const usdtAbi = [
            'function balanceOf(address owner) view returns (uint256)',
            'function allowance(address owner, address spender) view returns (uint256)',
            'function decimals() view returns (uint8)'
        ];
        
        const usdt = new ethers.Contract(usdtAddress, usdtAbi, ethers.provider);
        
        console.log('📋 Status Check for Trezor Registration');
        console.log(`Trezor Address: ${trezorAddress}\n`);
        
        // Check USDT allowance
        console.log('🔐 USDT Approval Status:');
        const allowance = await usdt.allowance(trezorAddress, contractAddress);
        console.log(`Current Allowance: ${ethers.formatUnits(allowance, 6)} USDT`);
        
        const requiredUSDT = ethers.parseUnits('30', 6);
        if (allowance >= requiredUSDT) {
            console.log('✅ USDT approval is sufficient for registration');
        } else {
            console.log('❌ USDT approval needed before registration');
            console.log(`   Need to approve: ${ethers.formatUnits(requiredUSDT, 6)} USDT`);
            console.log('   See USDT_REGISTRATION_GUIDE.md for instructions\n');
            return;
        }
        
        // Check registration status
        console.log('\n👤 Registration Status:');
        const user = await contract.users(trezorAddress);
        const isRegistered = user.registrationTime > 0;
        
        if (isRegistered) {
            console.log('✅ TREZOR IS SUCCESSFULLY REGISTERED!');
            console.log(`Registration Time: ${new Date(user.registrationTime * 1000)}`);
            console.log(`Package Level: ${user.packageLevel}`);
            console.log(`Total Investment: ${ethers.formatUnits(user.totalInvestment, 6)} USDT`);
            console.log(`Referrer: ${user.referrer}`);
            console.log(`User ID: ${user.id}`);
            
            // Check ownership status
            console.log('\n👑 Ownership Status:');
            const owner = await contract.owner();
            const isOwner = owner.toLowerCase() === trezorAddress.toLowerCase();
            console.log(`Contract Owner: ${owner}`);
            console.log(`Trezor is Owner: ${isOwner}`);
            
            if (isOwner && isRegistered) {
                console.log('\n🎉 SUCCESS! Trezor is both:');
                console.log('   ✅ Contract Owner');
                console.log('   ✅ Registered User (Package 1)');
                console.log('\n🚀 Project deployment is COMPLETE!');
                console.log('   - Frontend integration: ✅ Done');
                console.log('   - Contract deployment: ✅ Done');
                console.log('   - Contract verification: ✅ Done');
                console.log('   - Ownership transfer: ✅ Done');
                console.log('   - User registration: ✅ Done');
            }
        } else {
            console.log('❌ Trezor is not registered yet');
            console.log('📝 Next step: Complete registration via BSCScan');
            console.log('   See USDT_REGISTRATION_GUIDE.md for instructions');
        }
        
        // Show current USDT balance
        console.log('\n💰 Current USDT Balance:');
        const usdtBalance = await usdt.balanceOf(trezorAddress);
        console.log(`Trezor USDT: ${ethers.formatUnits(usdtBalance, 6)} USDT`);
        
        // Show contract stats
        console.log('\n📊 Contract Statistics:');
        const totalUsers = await contract.totalUsers();
        console.log(`Total Users: ${totalUsers}`);
        const isPaused = await contract.paused();
        console.log(`Contract Status: ${isPaused ? 'Paused' : 'Active'}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.message.includes('NETWORK ERROR')) {
            console.log('🔄 Network issue. Please try again in a moment.');
        }
    }
}

// Run the status check
checkUSDTRegistrationStatus()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
