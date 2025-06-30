const hre = require("hardhat");
const { ethers } = require("hardhat");

async function registerTrezorPackage1() {
    try {
        console.log('🔑 REGISTERING TREZOR ADDRESS - PACKAGE 1 ($30 USDT)');
        console.log('='.repeat(55));
        
        // Contract addresses
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        // Get deployer (current owner with admin rights)
        const [deployer] = await ethers.getSigners();
        console.log('📋 Registration Details:');
        console.log(`  Deployer: ${deployer.address}`);
        console.log(`  Trezor Address: ${trezorAddress}`);
        console.log(`  Contract: ${contractAddress}`);
        
        // Check deployer BNB balance
        const deployerBalance = await deployer.provider.getBalance(deployer.address);
        console.log(`  Deployer BNB Balance: ${ethers.formatEther(deployerBalance)} BNB`);
        
        // Load contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        // Check if Trezor is already registered
        const trezorUserInfo = await contract.getUserBasicInfo(trezorAddress);
        const isRegistered = trezorUserInfo[0];
        
        if (isRegistered) {
            console.log(`  ✅ Trezor address already registered!`);
            console.log(`  Current Package Level: ${trezorUserInfo[1]}`);
            console.log(`  Current Balance: ${ethers.formatUnits(trezorUserInfo[2], 6)} USDT`);
            
            console.log('');
            console.log('🔄 To upgrade package, use:');
            console.log('  await contract.upgradePackage(newLevel, useUSDT)');
            return;
        }
        
        // Use Package 1 ($30 USDT)
        const packageLevel = 1;
        const packagePrice = await contract.getPackagePrice(packageLevel);
        console.log(`  Package ${packageLevel} Price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
        
        // Calculate BNB needed for $30 USDT
        let bnbRequired;
        try {
            const bnbPrice = await contract.getCurrentBNBPrice();
            bnbRequired = (BigInt(packagePrice) * BigInt(10**18)) / BigInt(bnbPrice);
            console.log(`  BNB Price: $${ethers.formatUnits(bnbPrice, 8)}`);
            console.log(`  BNB Required: ${ethers.formatEther(bnbRequired)} BNB`);
        } catch (error) {
            // Oracle not set up, estimate BNB needed (assuming ~$600 per BNB)
            // $30 / $600 = 0.05 BNB
            bnbRequired = ethers.parseEther("0.05"); // ~$30 worth
            console.log(`  ⚠️  No oracle set up, estimating BNB needed`);
            console.log(`  Estimated BNB Required: ${ethers.formatEther(bnbRequired)} BNB (~$30)`);
        }
        
        if (deployerBalance < bnbRequired) {
            console.log('');
            console.log('❌ INSUFFICIENT BNB BALANCE');
            console.log(`  Need: ${ethers.formatEther(bnbRequired)} BNB (~$30)`);
            console.log(`  Have: ${ethers.formatEther(deployerBalance)} BNB`);
            console.log('');
            console.log('💡 Solution: Send ~0.1 BNB to deployer:');
            console.log(`     ${deployer.address}`);
            return;
        }
        
        console.log('');
        console.log('🔄 Proceeding with Package 1 registration...');
        
        // Register Trezor address with BNB payment (Package 1)
        console.log('  📝 Registering Trezor as root user (Package 1)...');
        const registerTx = await contract.register(
            ethers.ZeroAddress, // No sponsor (root user)
            packageLevel,       // Package level 1 ($30)
            false,             // Use BNB (not USDT)
            { value: bnbRequired }
        );
        
        console.log('  ⏳ Waiting for transaction confirmation...');
        const receipt = await registerTx.wait();
        
        console.log('');
        console.log('🎉 TREZOR REGISTRATION SUCCESSFUL! (PACKAGE 1)');
        console.log('='.repeat(50));
        console.log('📋 Transaction Details:');
        console.log(`  Transaction Hash: ${receipt.hash}`);
        console.log(`  Block Number: ${receipt.blockNumber}`);
        console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
        console.log(`  BNB Sent: ${ethers.formatEther(bnbRequired)} BNB (~$30)`);
        
        // Verify registration
        const newUserInfo = await contract.getUserBasicInfo(trezorAddress);
        const userEarnings = await contract.getUserEarnings(trezorAddress);
        const newTotalUsers = await contract.getTotalUsers();
        
        console.log('');
        console.log('✅ Registration Verified:');
        console.log(`  Trezor Registered: ${newUserInfo[0]}`);
        console.log(`  Package Level: ${newUserInfo[1]} ($30 USDT)`);
        console.log(`  Balance: ${ethers.formatUnits(newUserInfo[2], 6)} USDT`);
        console.log(`  Earnings Cap: ${ethers.formatUnits(userEarnings[1], 6)} USDT (4x = $120)`);
        console.log(`  Direct Referrals: ${userEarnings[2]}`);
        console.log(`  Total Users: ${newTotalUsers}`);
        
        console.log('');
        console.log('🚀 Package Upgrade Instructions:');
        console.log('To upgrade to higher packages later:');
        console.log('');
        console.log('Package 2 ($50): await contract.upgradePackage(2, useUSDT)');
        console.log('Package 3 ($100): await contract.upgradePackage(3, useUSDT)');
        console.log('Package 4 ($200): await contract.upgradePackage(4, useUSDT)');
        console.log('');
        console.log('💡 Benefits of upgrading:');
        console.log('  - Higher earnings cap (4x investment)');
        console.log('  - Better pool bonuses');
        console.log('  - Enhanced network benefits');
        
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('1. ✅ Trezor registered as root user (Package 1)');
        console.log('2. 🔄 Test frontend with Trezor connection');
        console.log('3. 🔄 Upgrade package when ready');
        console.log('4. 🔄 Transfer contract ownership to Trezor (optional)');
        console.log('5. 🔄 Set up price oracles');
        
        console.log('');
        console.log('🔗 Verification Links:');
        console.log(`  BSCScan TX: https://bscscan.com/tx/${receipt.hash}`);
        console.log(`  Contract: https://bscscan.com/address/${contractAddress}`);
        console.log(`  Trezor Address: https://bscscan.com/address/${trezorAddress}`);
        
    } catch (error) {
        console.error('❌ Registration failed:', error.message);
        
        if (error.message.includes('Already registered')) {
            console.log('ℹ️  Trezor address is already registered');
        } else if (error.message.includes('Invalid price feed')) {
            console.log('ℹ️  Oracle issue - using estimated BNB amount');
        } else if (error.message.includes('insufficient')) {
            console.log('ℹ️  Need more BNB - send ~0.1 BNB to deployer');
        }
    }
}

registerTrezorPackage1();
