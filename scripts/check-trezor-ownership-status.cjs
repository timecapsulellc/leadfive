const hre = require("hardhat");
const { ethers } = require("hardhat");

async function checkTrezorOwnershipAndRegistration() {
    try {
        console.log('🎉 TREZOR OWNERSHIP & REGISTRATION STATUS');
        console.log('='.repeat(45));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        // Load contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        console.log('📋 CONTRACT OWNERSHIP STATUS:');
        
        // Check contract owner
        const owner = await contract.owner();
        console.log(`  Contract Owner: ${owner}`);
        console.log(`  Is Trezor Owner: ${owner.toLowerCase() === trezorAddress.toLowerCase() ? '✅ YES' : '❌ NO'}`);
        
        // Check if Trezor is admin
        const isAdmin = await contract.isAdminAddress(trezorAddress);
        console.log(`  Trezor is Admin: ${isAdmin ? '✅ YES' : '❌ NO'}`);
        
        console.log('');
        console.log('📊 TREZOR REGISTRATION STATUS:');
        
        // Check if Trezor is registered
        const trezorInfo = await contract.getUserBasicInfo(trezorAddress);
        const isRegistered = trezorInfo[0];
        const packageLevel = trezorInfo[1];
        const balance = trezorInfo[2];
        
        console.log(`  Registered: ${isRegistered ? '✅ YES' : '❌ NO'}`);
        
        if (isRegistered) {
            console.log(`  Package Level: ${packageLevel}`);
            console.log(`  Balance: ${ethers.formatUnits(balance, 6)} USDT`);
            
            // Check if root user
            try {
                const sponsor = await contract.getUserSponsor?.(trezorAddress);
                const isRoot = sponsor === ethers.ZeroAddress;
                console.log(`  Root User: ${isRoot ? '✅ YES' : '❌ NO'}`);
            } catch (e) {
                console.log('  Root User: Likely YES (no sponsor function)');
            }
        }
        
        // Check Trezor balance
        const trezorBalance = await hre.ethers.provider.getBalance(trezorAddress);
        console.log('');
        console.log('💰 TREZOR WALLET:');
        console.log(`  BNB Balance: ${ethers.formatEther(trezorBalance)} BNB`);
        console.log(`  Sufficient for Registration: ${trezorBalance >= ethers.parseEther("0.06") ? '✅ YES' : '❌ NO'}`);
        
        // Check total users
        const totalUsers = await contract.getTotalUsers();
        console.log('');
        console.log('📊 NETWORK STATUS:');
        console.log(`  Total Users: ${totalUsers}`);
        
        console.log('');
        console.log('🎯 CURRENT STATUS SUMMARY:');
        console.log('='.repeat(30));
        
        if (owner.toLowerCase() === trezorAddress.toLowerCase()) {
            console.log('✅ Trezor owns the contract (Maximum Security)');
            
            if (isRegistered) {
                console.log('✅ Trezor is registered as user');
                console.log('🎉 PROJECT 100% COMPLETE!');
                
                console.log('');
                console.log('🚀 AVAILABLE ACTIONS:');
                console.log('1. ✅ Test frontend with Trezor');
                console.log('2. ✅ Generate referral links');
                console.log('3. ✅ Manage contract settings');
                console.log('4. ✅ Add/remove admins');
                console.log('5. ✅ Upgrade packages');
                console.log('6. ✅ Deploy to production');
                
            } else {
                console.log('⏳ Trezor needs to register as user');
                console.log('📊 PROJECT STATUS: 98% COMPLETE');
                
                console.log('');
                console.log('🎯 FINAL STEP - TREZOR REGISTRATION:');
                console.log('Since Trezor now owns the contract, it can register itself:');
                console.log('');
                console.log('METHOD 1: BSCScan (Recommended)');
                console.log(`1. Visit: https://bscscan.com/address/${contractAddress}#writeContract`);
                console.log('2. Connect Trezor wallet');
                console.log('3. Find "register" function');
                console.log('4. Parameters:');
                console.log('   - sponsor: 0x0000000000000000000000000000000000000000');
                console.log('   - packageLevel: 1');
                console.log('   - useUSDT: false');
                console.log('   - value: 0.05 BNB');
                console.log('5. Confirm on Trezor device');
                
                console.log('');
                console.log('METHOD 2: Frontend Interface');
                console.log('1. Start frontend: npm run dev');
                console.log('2. Connect Trezor wallet');
                console.log('3. Use registration interface');
                
                console.log('');
                console.log('💡 BENEFITS OF TREZOR OWNERSHIP + REGISTRATION:');
                console.log('• Maximum security (hardware wallet control)');
                console.log('• Root user privileges');
                console.log('• Full admin access');
                console.log('• Complete platform control');
                console.log('• Hardware-secured transactions');
            }
        } else {
            console.log('❌ Ownership transfer may have failed');
            console.log('🔧 Please verify the transfer transaction');
        }
        
        console.log('');
        console.log('🔗 VERIFICATION LINKS:');
        console.log(`  Contract: https://bscscan.com/address/${contractAddress}`);
        console.log(`  Trezor: https://bscscan.com/address/${trezorAddress}`);
        console.log('  Transfer TX: 0xd5d030fc95de1e4d04b7da1754acdf3ee25a8b00a247f7fe16585fca3c40f9d8');
        
    } catch (error) {
        console.error('❌ Status check failed:', error.message);
    }
}

checkTrezorOwnershipAndRegistration();
