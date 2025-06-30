const hre = require("hardhat");
const { ethers } = require("hardhat");

async function registerTrezorWithBNB() {
    try {
        console.log('🔑 REGISTERING TREZOR ADDRESS AS ROOT USER (BNB PAYMENT)');
        console.log('='.repeat(60));
        
        // Contract addresses
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        // Get deployer (current owner with admin rights)
        const [deployer] = await ethers.getSigners();
        console.log('📋 Transaction Details:');
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
            return;
        }
        
        // Get package price and calculate BNB needed
        const packageLevel = 4;
        const packagePrice = await contract.getPackagePrice(packageLevel); // $200 USDT
        console.log(`  Package ${packageLevel} Price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
        
        // Get current BNB price (this will fail if no oracle is set up yet)
        let bnbRequired;
        try {
            const bnbPrice = await contract.getCurrentBNBPrice();
            bnbRequired = (BigInt(packagePrice) * BigInt(10**18)) / BigInt(bnbPrice);
            console.log(`  BNB Price: $${ethers.formatUnits(bnbPrice, 8)}`);
            console.log(`  BNB Required: ${ethers.formatEther(bnbRequired)} BNB`);
        } catch (error) {
            // Oracle not set up, estimate BNB needed (assuming ~$600 per BNB)
            const estimatedBnbPrice = 600; // $600 per BNB
            bnbRequired = ethers.parseEther("0.34"); // ~$200 worth
            console.log(`  ⚠️  No oracle set up, estimating BNB needed`);
            console.log(`  Estimated BNB Required: ${ethers.formatEther(bnbRequired)} BNB`);
        }
        
        if (deployerBalance < bnbRequired) {
            console.log('');
            console.log('❌ INSUFFICIENT BNB BALANCE');
            console.log(`  Need: ${ethers.formatEther(bnbRequired)} BNB`);
            console.log(`  Have: ${ethers.formatEther(deployerBalance)} BNB`);
            return;
        }
        
        console.log('');
        console.log('🔄 Proceeding with BNB registration...');
        
        // Register Trezor address with BNB payment
        console.log('  📝 Registering Trezor as root user with BNB...');
        const registerTx = await contract.register(
            ethers.ZeroAddress, // No sponsor (root user)
            packageLevel,       // Package level 4
            false,             // Use BNB (not USDT)
            { value: bnbRequired }
        );
        
        console.log('  ⏳ Waiting for transaction confirmation...');
        const receipt = await registerTx.wait();
        
        console.log('');
        console.log('🎉 TREZOR REGISTRATION SUCCESSFUL!');
        console.log('='.repeat(50));
        console.log('📋 Transaction Details:');
        console.log(`  Transaction Hash: ${receipt.hash}`);
        console.log(`  Block Number: ${receipt.blockNumber}`);
        console.log(`  Gas Used: ${receipt.gasUsed.toString()}`);
        console.log(`  BNB Sent: ${ethers.formatEther(bnbRequired)} BNB`);
        
        // Verify registration
        const newUserInfo = await contract.getUserBasicInfo(trezorAddress);
        const newTotalUsers = await contract.getTotalUsers();
        
        console.log('');
        console.log('✅ Registration Verified:');
        console.log(`  Trezor Registered: ${newUserInfo[0]}`);
        console.log(`  Package Level: ${newUserInfo[1]}`);
        console.log(`  Balance: ${ethers.formatUnits(newUserInfo[2], 6)} USDT`);
        console.log(`  Total Users: ${newTotalUsers}`);
        
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('1. ✅ Trezor address registered as root user');
        console.log('2. 🔄 Transfer contract ownership to Trezor');
        console.log('3. 🔄 Set up price oracles');
        console.log('4. 🔄 Test registration flow in frontend');
        
    } catch (error) {
        console.error('❌ Registration failed:', error.message);
        
        if (error.message.includes('Already registered')) {
            console.log('ℹ️  Trezor address is already registered');
        } else if (error.message.includes('Invalid price feed')) {
            console.log('ℹ️  Need to set up price oracles first');
            console.log('   Run: await contract.addOracle(ORACLE_ADDRESS)');
        }
    }
}

registerTrezorWithBNB();
