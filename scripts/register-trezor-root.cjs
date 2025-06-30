const hre = require("hardhat");
const { ethers } = require("hardhat");

async function registerTrezorAsRoot() {
    try {
        console.log('🔑 REGISTERING TREZOR ADDRESS AS ROOT USER');
        console.log('='.repeat(50));
        
        // Contract addresses
        const contractAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        const trezorAddress = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
        
        // Get deployer (current owner with admin rights)
        const [deployer] = await ethers.getSigners();
        console.log('📋 Transaction Details:');
        console.log(`  Deployer: ${deployer.address}`);
        console.log(`  Trezor Address: ${trezorAddress}`);
        console.log(`  Contract: ${contractAddress}`);
        
        // Load contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(contractAddress);
        
        // Check current contract state
        console.log('');
        console.log('🔍 Current Contract State:');
        const currentOwner = await contract.owner();
        const totalUsers = await contract.getTotalUsers();
        console.log(`  Current Owner: ${currentOwner}`);
        console.log(`  Total Users: ${totalUsers}`);
        
        // Check if Trezor is already registered
        const trezorUserInfo = await contract.getUserBasicInfo(trezorAddress);
        const isRegistered = trezorUserInfo[0];
        
        if (isRegistered) {
            console.log(`  ✅ Trezor address already registered!`);
            console.log(`  Package Level: ${trezorUserInfo[1]}`);
            console.log(`  Balance: ${ethers.formatUnits(trezorUserInfo[2], 6)} USDT`);
            return;
        }
        
        console.log(`  ❌ Trezor address NOT registered yet`);
        
        // Get package price for highest level (Package 4 - $200)
        const packageLevel = 4;
        const packagePrice = await contract.getPackagePrice(packageLevel);
        console.log(`  Package ${packageLevel} Price: ${ethers.formatUnits(packagePrice, 6)} USDT`);
        
        // Check deployer's USDT balance
        const USDT = await ethers.getContractAt("IERC20", usdtAddress);
        const deployerUSDTBalance = await USDT.balanceOf(deployer.address);
        console.log(`  Deployer USDT Balance: ${ethers.formatUnits(deployerUSDTBalance, 6)} USDT`);
        
        if (deployerUSDTBalance < packagePrice) {
            console.log('');
            console.log('❌ INSUFFICIENT USDT BALANCE');
            console.log('Options:');
            console.log('1. Transfer USDT to deployer address');
            console.log('2. Use BNB payment instead');
            console.log('3. Register from Trezor wallet directly with USDT');
            return;
        }
        
        console.log('');
        console.log('🔄 Proceeding with registration...');
        
        // Check USDT allowance
        const allowance = await USDT.allowance(deployer.address, contractAddress);
        console.log(`  Current Allowance: ${ethers.formatUnits(allowance, 6)} USDT`);
        
        if (allowance < packagePrice) {
            console.log('  📝 Approving USDT...');
            const approveTx = await USDT.approve(contractAddress, packagePrice);
            await approveTx.wait();
            console.log('  ✅ USDT approved');
        }
        
        // Register Trezor address with no sponsor (root user)
        console.log('  📝 Registering Trezor as root user...');
        const registerTx = await contract.register(
            ethers.ZeroAddress, // No sponsor (root user)
            packageLevel,       // Package level 4
            true               // Use USDT
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
        console.log('2. 🔄 Transfer contract ownership to Trezor (optional)');
        console.log('3. 🔄 Set up Trezor as primary admin');
        console.log('4. 🔄 Test registration flow in frontend');
        
        console.log('');
        console.log('🔗 Verification Links:');
        console.log(`  BSCScan: https://bscscan.com/tx/${receipt.hash}`);
        console.log(`  Contract: https://bscscan.com/address/${contractAddress}`);
        
    } catch (error) {
        console.error('❌ Registration failed:', error.message);
        
        if (error.message.includes('Already registered')) {
            console.log('ℹ️  Trezor address is already registered');
        } else if (error.message.includes('insufficient')) {
            console.log('ℹ️  Insufficient balance - need USDT or BNB');
        } else {
            console.log('ℹ️  Check transaction details and try again');
        }
    }
}

registerTrezorAsRoot();
