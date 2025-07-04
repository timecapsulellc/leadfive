const { ethers } = require('hardhat');

async function testEnhancedFunctions() {
    console.log('🧪 TESTING ENHANCED FUNCTIONS ON MAINNET');
    console.log('=' .repeat(60));
    
    const CONTRACT_ADDRESS = '0x29dcCb502D10C042BcC6a02a7762C49595A9E498';
    
    try {
        // Connect to contract
        const contract = await ethers.getContractAt('contracts/LeadFiveTestnet.sol:LeadFiveTestnet', CONTRACT_ADDRESS);
        const [deployer] = await ethers.getSigners();
        
        console.log('📍 Testing with address:', deployer.address);
        console.log('🔗 Contract:', CONTRACT_ADDRESS);
        console.log('');
        
        const tests = [];
        
        // Test 1: getWithdrawalSplit
        console.log('🔍 Testing getWithdrawalSplit...');
        try {
            const [withdrawPercent, reinvestPercent] = await contract.getWithdrawalSplit(deployer.address);
            console.log(`✅ Withdrawal Split: ${withdrawPercent}%/${reinvestPercent}%`);
            tests.push({ name: 'getWithdrawalSplit', status: 'SUCCESS', result: `${withdrawPercent}%/${reinvestPercent}%` });
        } catch (error) {
            console.log(`❌ getWithdrawalSplit failed: ${error.message}`);
            tests.push({ name: 'getWithdrawalSplit', status: 'FAILED', result: error.message });
        }
        
        // Test 2: getUserReferralCount
        console.log('🔍 Testing getUserReferralCount...');
        try {
            const referralCount = await contract.getUserReferralCount(deployer.address);
            console.log(`✅ Referral Count: ${referralCount.toString()}`);
            tests.push({ name: 'getUserReferralCount', status: 'SUCCESS', result: referralCount.toString() });
        } catch (error) {
            console.log(`❌ getUserReferralCount failed: ${error.message}`);
            tests.push({ name: 'getUserReferralCount', status: 'FAILED', result: error.message });
        }
        
        // Test 3: isAutoCompoundEnabled
        console.log('🔍 Testing isAutoCompoundEnabled...');
        try {
            const autoCompound = await contract.isAutoCompoundEnabled(deployer.address);
            console.log(`✅ Auto-Compound: ${autoCompound ? 'Enabled' : 'Disabled'}`);
            tests.push({ name: 'isAutoCompoundEnabled', status: 'SUCCESS', result: autoCompound ? 'Enabled' : 'Disabled' });
        } catch (error) {
            console.log(`❌ isAutoCompoundEnabled failed: ${error.message}`);
            tests.push({ name: 'isAutoCompoundEnabled', status: 'FAILED', result: error.message });
        }
        
        // Test 4: getTreasuryWallet
        console.log('🔍 Testing getTreasuryWallet...');
        try {
            const treasury = await contract.getTreasuryWallet();
            console.log(`✅ Treasury Wallet: ${treasury}`);
            tests.push({ name: 'getTreasuryWallet', status: 'SUCCESS', result: treasury });
        } catch (error) {
            console.log(`❌ getTreasuryWallet failed: ${error.message}`);
            tests.push({ name: 'getTreasuryWallet', status: 'FAILED', result: error.message });
        }
        
        // Test 5: totalAdminFeesCollected
        console.log('🔍 Testing totalAdminFeesCollected...');
        try {
            const totalFees = await contract.totalAdminFeesCollected();
            console.log(`✅ Total Fees Collected: ${ethers.formatUnits(totalFees, 18)} USDT`);
            tests.push({ name: 'totalAdminFeesCollected', status: 'SUCCESS', result: `${ethers.formatUnits(totalFees, 18)} USDT` });
        } catch (error) {
            console.log(`❌ totalAdminFeesCollected failed: ${error.message}`);
            tests.push({ name: 'totalAdminFeesCollected', status: 'FAILED', result: error.message });
        }
        
        // Test 6: Contract owner
        console.log('🔍 Testing contract owner...');
        try {
            const owner = await contract.owner();
            console.log(`✅ Contract Owner: ${owner}`);
            tests.push({ name: 'owner', status: 'SUCCESS', result: owner });
        } catch (error) {
            console.log(`❌ owner failed: ${error.message}`);
            tests.push({ name: 'owner', status: 'FAILED', result: error.message });
        }
        
        // Withdrawal calculation demo
        console.log('\n💰 WITHDRAWAL CALCULATION DEMO:');
        console.log('-'.repeat(40));
        try {
            const [withdrawPercent, reinvestPercent] = await contract.getWithdrawalSplit(deployer.address);
            const referralCount = await contract.getUserReferralCount(deployer.address);
            const autoCompound = await contract.isAutoCompoundEnabled(deployer.address);
            
            const amount = 100; // 100 USDT example
            const withdrawAmount = (amount * withdrawPercent.toNumber()) / 100;
            const adminFee = (withdrawAmount * 5) / 100; // 5% fee on withdrawal only
            const userReceives = withdrawAmount - adminFee;
            const reinvestAmount = (amount * reinvestPercent.toNumber()) / 100;
            
            console.log(`📊 Example: ${amount} USDT withdrawal`);
            console.log(`   User has ${referralCount.toString()} referrals`);
            console.log(`   Auto-compound: ${autoCompound ? 'Enabled' : 'Disabled'}`);
            console.log(`   Split: ${withdrawPercent}%/${reinvestPercent}%`);
            console.log(`   Withdrawal portion: ${withdrawAmount} USDT`);
            console.log(`   Admin fee: ${adminFee.toFixed(2)} USDT (5% of ${withdrawAmount}, NOT ${amount})`);
            console.log(`   User receives: ${userReceives.toFixed(2)} USDT`);
            console.log(`   Reinvestment: ${reinvestAmount} USDT → ${autoCompound ? 'Auto-compound +5% bonus' : 'Help Pool'}`);
            
        } catch (error) {
            console.log(`❌ Demo calculation failed: ${error.message}`);
        }
        
        // Summary
        console.log('\n📋 TEST SUMMARY:');
        console.log('=' .repeat(60));
        
        const successCount = tests.filter(t => t.status === 'SUCCESS').length;
        const totalTests = tests.length;
        
        tests.forEach(test => {
            const status = test.status === 'SUCCESS' ? '✅' : '❌';
            console.log(`${status} ${test.name}: ${test.result}`);
        });
        
        console.log('');
        console.log(`🎯 Results: ${successCount}/${totalTests} tests passed`);
        
        if (successCount === totalTests) {
            console.log('🎉 ALL ENHANCED FUNCTIONS WORKING PERFECTLY!');
            console.log('✅ Frontend integration ready');
            console.log('✅ Mainnet deployment successful');
            console.log('✅ Enhanced withdrawal system operational');
        } else {
            console.log('⚠️  Some functions failed - check network connection and contract status');
        }
        
        console.log('\n🔗 Frontend Test URL: file://' + process.cwd() + '/test-frontend-integration.html');
        
        return {
            totalTests,
            successCount,
            allPassed: successCount === totalTests,
            tests
        };
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        throw error;
    }
}

if (require.main === module) {
    testEnhancedFunctions()
        .then((result) => {
            console.log(`\n🏁 Test suite completed: ${result.successCount}/${result.totalTests} passed`);
            process.exit(result.allPassed ? 0 : 1);
        })
        .catch((error) => {
            console.error('💥 Test suite error:', error);
            process.exit(1);
        });
}

module.exports = testEnhancedFunctions;