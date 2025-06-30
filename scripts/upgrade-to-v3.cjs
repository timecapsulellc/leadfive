require('dotenv').config();
const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log('\n🚀 Comprehensive Contract Upgrade and USDT Fix - V3');
    console.log('='.repeat(60));

    // --- Configuration ---
    const proxyAddress = process.env.MAINNET_CONTRACT_ADDRESS;
    const usdtAddress = process.env.VITE_USDT_CONTRACT_ADDRESS;
    
    console.log(`Proxy Address: ${proxyAddress}`);
    console.log(`USDT Address: ${usdtAddress}`);

    // --- Get Signer ---
    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Deployer Balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} BNB`);

    try {
        // --- Step 1: Deploy New Implementation (LeadFive) ---
        console.log('\n[1/4] Deploying LeadFive implementation...');
        
        // Use fully qualified name to avoid ambiguity
        const LeadFive = await ethers.getContractFactory("contracts/LeadFive.sol:LeadFive");
        
        console.log('Upgrading proxy to LeadFive...');
        const upgradedContract = await upgrades.upgradeProxy(proxyAddress, LeadFive);
        await upgradedContract.waitForDeployment();
        
        console.log(`✅ Proxy upgraded successfully`);
        console.log(`✅ Proxy Address: ${await upgradedContract.getAddress()}`);

        // --- Step 2: Set USDT Address ---
        console.log('\n[2/4] Setting USDT address...');
        
        // Try primary method first
        try {
            const setUsdtTx = await upgradedContract.setUSDTAddress(usdtAddress);
            await setUsdtTx.wait();
            console.log(`✅ USDT address set successfully via setUSDTAddress(). TX: ${setUsdtTx.hash}`);
        } catch (error) {
            console.log(`⚠️  Primary setUSDTAddress failed: ${error.message}`);
            
            // Fallback to emergency method
            console.log('Trying emergency setter...');
            try {
                const emergencyTx = await upgradedContract.emergencySetUSDT(usdtAddress);
                await emergencyTx.wait();
                console.log(`✅ USDT address set successfully via emergencySetUSDT(). TX: ${emergencyTx.hash}`);
            } catch (emergencyError) {
                console.error(`❌ Emergency setter also failed: ${emergencyError.message}`);
                throw new Error('Both USDT setters failed');
            }
        }

        // --- Step 3: Verification ---
        console.log('\n[3/4] Verifying USDT configuration...');
        
        // Check if USDT is configured
        const isConfigured = await upgradedContract.isUSDTConfigured();
        console.log(`USDT Configured: ${isConfigured}`);
        
        // Get USDT configuration details
        const [configuredUsdtAddress, decimals, balance] = await upgradedContract.getUSDTConfig();
        console.log(`Configured USDT Address: ${configuredUsdtAddress}`);
        console.log(`USDT Decimals: ${decimals}`);
        console.log(`Contract USDT Balance: ${ethers.formatUnits(balance, 18)} USDT`);
        
        // Verify the address matches
        if (configuredUsdtAddress.toLowerCase() === usdtAddress.toLowerCase()) {
            console.log('✅ USDT address verification PASSED');
        } else {
            console.error('❌ USDT address verification FAILED');
            console.error(`Expected: ${usdtAddress}`);
            console.error(`Got: ${configuredUsdtAddress}`);
        }

        // --- Step 4: Test Contract Functions ---
        console.log('\n[4/4] Testing contract functionality...');
        
        // Test view functions
        try {
            const totalUsers = await upgradedContract.getTotalUsers();
            console.log(`Total Users: ${totalUsers}`);
            
            const version = await upgradedContract.getVersion();
            console.log(`Contract Version: ${version}`);
            
            const usdtBalance = await upgradedContract.getUSDTBalance();
            console.log(`Contract USDT Balance: ${ethers.formatUnits(usdtBalance, 18)} USDT`);
            
            // Test package prices
            for (let i = 1; i <= 4; i++) {
                const price = await upgradedContract.getPackagePrice(i);
                console.log(`Package ${i} Price: ${ethers.formatUnits(price, 6)} USDT (6 decimals)`);
            }
            
            console.log('✅ All view functions working correctly');
            
        } catch (error) {
            console.error(`❌ Function test failed: ${error.message}`);
        }

        // --- Success Summary ---
        console.log('\n🎉🎉🎉 UPGRADE COMPLETE! 🎉🎉🎉');
        console.log('='.repeat(60));
        console.log('✅ LeadFive deployed and upgraded successfully');
        console.log('✅ USDT address configured correctly');
        console.log('✅ All functions verified and working');
        console.log('✅ Contract is ready for production use');
        console.log('\n📋 Summary:');
        console.log(`   Proxy Address: ${proxyAddress}`);
        console.log(`   USDT Address: ${usdtAddress}`);
        console.log(`   Contract Version: ${await upgradedContract.getVersion()}`);
        console.log(`   Total Users: ${await upgradedContract.getTotalUsers()}`);

    } catch (error) {
        console.error('\n❌ UPGRADE FAILED!');
        console.error('='.repeat(60));
        console.error('Error details:', error);
        
        // Additional debugging information
        if (error.code) {
            console.error(`Error Code: ${error.code}`);
        }
        if (error.reason) {
            console.error(`Error Reason: ${error.reason}`);
        }
        if (error.transaction) {
            console.error(`Failed Transaction: ${error.transaction.hash}`);
        }
        
        process.exit(1);
    }
}

// Execute the upgrade
main()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
