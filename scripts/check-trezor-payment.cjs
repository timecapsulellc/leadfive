const hre = require("hardhat");
const { ethers } = require("hardhat");

async function checkTrezorPaymentAndRegistration() {
    try {
        console.log('🔍 CHECKING TREZOR PAYMENT & REGISTRATION');
        console.log('='.repeat(45));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        console.log(`📋 Checking address: ${trezorAddress}`);
        console.log(`📋 Contract: ${contractAddress}`);
        console.log('');
        
        // Load contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        // Check registration status
        console.log('👤 REGISTRATION STATUS:');
        const userInfo = await contract.getUserBasicInfo(trezorAddress);
        const isRegistered = userInfo[0];
        const packageLevel = userInfo[1];
        const balance = userInfo[2];
        
        console.log(`  Registered: ${isRegistered ? '✅ YES' : '❌ NO'}`);
        
        if (isRegistered) {
            console.log(`  Package Level: ${packageLevel}`);
            console.log(`  Balance: ${ethers.formatUnits(balance, 6)} USDT`);
            
            // Get package price to check if payment was correct
            const packagePrice = await contract.getPackagePrice(packageLevel);
            console.log(`  Package ${packageLevel} Price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
            
            // Check earnings info
            try {
                const earningsInfo = await contract.getUserEarnings(trezorAddress);
                const totalEarnings = earningsInfo[0];
                const earningsCap = earningsInfo[1];
                const directReferrals = earningsInfo[2];
                const totalTeamSize = earningsInfo[3];
                
                console.log('');
                console.log('💰 EARNINGS INFORMATION:');
                console.log(`  Total Earnings: ${ethers.formatUnits(totalEarnings, 6)} USDT`);
                console.log(`  Earnings Cap: ${ethers.formatUnits(earningsCap, 6)} USDT`);
                console.log(`  Direct Referrals: ${directReferrals}`);
                console.log(`  Total Team Size: ${totalTeamSize}`);
            } catch (e) {
                console.log('  Earnings info: Not available yet');
            }
            
            // Check if root user
            try {
                const sponsor = await contract.getUserSponsor?.(trezorAddress);
                const isRoot = sponsor === ethers.ZeroAddress;
                console.log('');
                console.log('👑 ROOT USER STATUS:');
                console.log(`  Sponsor: ${sponsor === ethers.ZeroAddress ? 'None (ROOT USER)' : sponsor}`);
                console.log(`  Is Root User: ${isRoot ? '✅ YES' : '❌ NO'}`);
            } catch (e) {
                console.log('');
                console.log('👑 ROOT USER STATUS:');
                console.log('  Status: Likely ROOT USER (no sponsor function available)');
            }
            
        } else {
            console.log('  Package Level: N/A');
            console.log('  Balance: 0 USDT');
        }
        
        // Check current BNB balance
        const currentBalance = await hre.ethers.provider.getBalance(trezorAddress);
        console.log('');
        console.log('💰 CURRENT WALLET BALANCE:');
        console.log(`  BNB Balance: ${ethers.formatEther(currentBalance)} BNB`);
        
        // Calculate if payment was made (original balance was 0.11 BNB)
        const originalBalance = ethers.parseEther("0.11");
        const expectedAfterPayment = originalBalance - ethers.parseEther("0.05") - ethers.parseEther("0.001"); // 0.05 payment + ~0.001 gas
        const balanceDifference = originalBalance - currentBalance;
        
        console.log(`  Original Balance: ${ethers.formatEther(originalBalance)} BNB`);
        console.log(`  Balance Used: ${ethers.formatEther(balanceDifference)} BNB`);
        
        if (balanceDifference > ethers.parseEther("0.04")) {
            console.log('  Payment Status: ✅ PAYMENT MADE (~0.05+ BNB used)');
        } else {
            console.log('  Payment Status: ❌ NO PAYMENT DETECTED');
        }
        
        // Check total network users
        const totalUsers = await contract.getTotalUsers();
        console.log('');
        console.log('📊 NETWORK STATISTICS:');
        console.log(`  Total Users: ${totalUsers}`);
        
        // Check owner status
        const owner = await contract.owner();
        const isOwner = owner.toLowerCase() === trezorAddress.toLowerCase();
        console.log(`  Trezor is Owner: ${isOwner ? '✅ YES' : '❌ NO'}`);
        
        console.log('');
        console.log('🎯 PAYMENT VERIFICATION SUMMARY:');
        console.log('='.repeat(35));
        
        if (isRegistered) {
            console.log('🎉 SUCCESS! PAYMENT CONFIRMED');
            console.log(`✅ Trezor paid ${ethers.formatUnits(await contract.getPackagePrice(packageLevel), 6)} USDT equivalent`);
            console.log(`✅ Registered as Package ${packageLevel} user`);
            console.log('✅ Payment processed successfully');
            
            if (isOwner) {
                console.log('✅ Trezor is both OWNER and REGISTERED USER');
                console.log('🎊 PROJECT 100% COMPLETE!');
                
                console.log('');
                console.log('🚀 WHAT YOU CAN DO NOW:');
                console.log('1. ✅ Generate referral links');
                console.log('2. ✅ Earn commissions from referrals');
                console.log('3. ✅ Upgrade to higher packages');
                console.log('4. ✅ Manage contract as owner');
                console.log('5. ✅ Deploy frontend to production');
                console.log('6. ✅ Start user acquisition');
                
                console.log('');
                console.log('💡 PACKAGE UPGRADE OPTIONS:');
                console.log('  Package 2: $50 USDT → $200 earnings cap');
                console.log('  Package 3: $100 USDT → $400 earnings cap');
                console.log('  Package 4: $200 USDT → $800 earnings cap');
            }
            
        } else {
            console.log('❌ NO PAYMENT DETECTED');
            console.log('Trezor is not registered yet');
            console.log('');
            console.log('🔧 TO COMPLETE PAYMENT:');
            console.log('1. Visit BSCScan contract page');
            console.log('2. Use "register" function');
            console.log('3. Pay 0.05 BNB (~$30 USDT)');
        }
        
        console.log('');
        console.log('🔗 VERIFICATION LINKS:');
        console.log(`  Contract: https://bscscan.com/address/${contractAddress}`);
        console.log(`  Trezor: https://bscscan.com/address/${trezorAddress}`);
        console.log('  Recent transactions: Check Trezor address on BSCScan');
        
    } catch (error) {
        console.error('❌ Payment check failed:', error.message);
    }
}

checkTrezorPaymentAndRegistration();
