const hre = require("hardhat");
const { ethers } = require("hardhat");

async function registerTrezorAsRoot() {
    try {
        console.log('🔑 REGISTERING TREZOR AS ROOT USER - PACKAGE 1');
        console.log('='.repeat(48));
        
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        // Get deployer (has admin rights)
        const [deployer] = await ethers.getSigners();
        console.log('📋 Registration Details:');
        console.log(`  Admin/Deployer: ${deployer.address}`);
        console.log(`  Trezor Address: ${trezorAddress}`);
        console.log(`  Contract: ${contractAddress}`);
        
        // Load contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        // Check deployer balance
        const deployerBalance = await deployer.provider.getBalance(deployer.address);
        console.log(`  Admin BNB Balance: ${ethers.formatEther(deployerBalance)} BNB`);
        
        // Check if Trezor is already registered
        const trezorInfo = await contract.getUserBasicInfo(trezorAddress);
        if (trezorInfo[0]) {
            console.log('✅ Trezor address is already registered!');
            console.log(`  Package Level: ${trezorInfo[1]}`);
            console.log(`  Balance: ${ethers.formatUnits(trezorInfo[2], 6)} USDT`);
            return;
        }
        
        // Package 1 details
        const packageLevel = 1;
        const packagePrice = await contract.getPackagePrice(packageLevel);
        console.log(`  Package ${packageLevel} Price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
        
        // Estimate BNB needed (assuming ~$600 per BNB for $30 USDT)
        const bnbRequired = ethers.parseEther("0.05"); // ~$30 worth
        console.log(`  Estimated BNB Required: ${ethers.formatEther(bnbRequired)} BNB (~$30)`);
        
        if (deployerBalance < bnbRequired) {
            console.log('');
            console.log('❌ INSUFFICIENT BNB BALANCE');
            console.log(`  Need: ${ethers.formatEther(bnbRequired)} BNB`);
            console.log(`  Have: ${ethers.formatEther(deployerBalance)} BNB`);
            return;
        }
        
        console.log('');
        console.log('🔄 Proceeding with registration...');
        
        // Use the admin function to register Trezor as root user
        console.log('  📝 Using admin privileges to register Trezor...');
        
        // Try different methods
        try {
            // Method 1: Direct registration call from admin
            const registerTx = await contract.connect(deployer).register(
                ethers.ZeroAddress, // No sponsor (root user)
                packageLevel,       // Package level 1
                false,             // Use BNB payment
                { value: bnbRequired }
            );
            
            console.log('  ⏳ Waiting for transaction confirmation...');
            const receipt = await registerTx.wait();
            
            console.log('');
            console.log('🎉 TREZOR REGISTRATION SUCCESSFUL!');
            console.log('='.repeat(35));
            console.log(`  Transaction Hash: ${receipt.hash}`);
            console.log(`  Block Number: ${receipt.blockNumber}`);
            console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
            
            // Verify registration
            const newTrezorInfo = await contract.getUserBasicInfo(trezorAddress);
            console.log('');
            console.log('✅ Registration Verified:');
            console.log(`  Registered: ${newTrezorInfo[0]}`);
            console.log(`  Package Level: ${newTrezorInfo[1]}`);
            console.log(`  Balance: ${ethers.formatUnits(newTrezorInfo[2], 6)} USDT`);
            
        } catch (registerError) {
            console.log('');
            console.log('⚠️  Direct registration failed, trying alternative...');
            
            // Method 2: If there's an admin register function
            try {
                if (contract.adminRegister) {
                    const adminRegisterTx = await contract.adminRegister(
                        trezorAddress,
                        ethers.ZeroAddress, // No sponsor
                        packageLevel,
                        { value: bnbRequired }
                    );
                    
                    const receipt = await adminRegisterTx.wait();
                    console.log('✅ Admin registration successful!');
                    console.log(`  Transaction Hash: ${receipt.hash}`);
                }
            } catch (adminError) {
                console.log('❌ Admin registration also failed');
                throw registerError; // Throw the original error
            }
        }
        
        // Final verification
        const finalTrezorInfo = await contract.getUserBasicInfo(trezorAddress);
        const totalUsers = await contract.getTotalUsers();
        
        console.log('');
        console.log('🎯 FINAL STATUS:');
        console.log(`  Trezor Registered: ${finalTrezorInfo[0]}`);
        console.log(`  Package Level: ${finalTrezorInfo[1]}`);
        console.log(`  Total Network Users: ${totalUsers}`);
        
        if (finalTrezorInfo[0]) {
            console.log('');
            console.log('🚀 SUCCESS! Next Steps:');
            console.log('1. ✅ Trezor is now registered as root user');
            console.log('2. 🔄 Test frontend with Trezor wallet');
            console.log('3. 🔄 Transfer contract ownership to Trezor (optional)');
            console.log('4. 🔄 Upgrade to higher packages when needed');
            
            console.log('');
            console.log('🔗 Verification Links:');
            console.log(`  BSCScan: https://bscscan.com/address/${trezorAddress}`);
            console.log(`  Contract: https://bscscan.com/address/${contractAddress}`);
        }
        
    } catch (error) {
        console.error('❌ Registration failed:', error.message);
        
        if (error.message.includes('Already registered')) {
            console.log('ℹ️  Address might already be registered');
        } else if (error.message.includes('Invalid sponsor')) {
            console.log('ℹ️  Sponsor validation issue');
        } else if (error.message.includes('insufficient')) {
            console.log('ℹ️  Insufficient funds - need more BNB');
        }
        
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('1. Check if Trezor address is already registered');
        console.log('2. Ensure sufficient BNB balance for gas + payment');
        console.log('3. Verify contract permissions');
    }
}

registerTrezorAsRoot();
