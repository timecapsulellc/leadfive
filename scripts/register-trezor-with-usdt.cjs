const { ethers } = require('hardhat');

async function registerTrezorWithUSDT() {
    console.log('💳 Registering Trezor with USDT (Package 1 - $30)...\n');
    
    // Contract details
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    const trezorAddress = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
    const usdtAddress = '0x55d398326f99059fF775485246999027B3197955'; // BSC USDT
    
    try {
        // Get contract instances
        const LeadFive = await ethers.getContractFactory('LeadFive');
        const contract = LeadFive.attach(contractAddress);
        
        // USDT contract ABI (minimal)
        const usdtAbi = [
            'function balanceOf(address owner) view returns (uint256)',
            'function allowance(address owner, address spender) view returns (uint256)',
            'function approve(address spender, uint256 amount) returns (bool)',
            'function transfer(address to, uint256 amount) returns (bool)',
            'function transferFrom(address from, address to, uint256 amount) returns (bool)'
        ];
        
        const usdt = new ethers.Contract(usdtAddress, usdtAbi, ethers.provider);
        
        console.log('📋 Registration Details:');
        console.log(`Contract: ${contractAddress}`);
        console.log(`Trezor: ${trezorAddress}`);
        console.log(`USDT: ${usdtAddress}`);
        console.log(`Package: 1 ($30 USDT)\n`);
        
        // Check USDT balance
        console.log('💰 Checking USDT balance...');
        const usdtBalance = await usdt.balanceOf(trezorAddress);
        console.log(`Trezor USDT Balance: ${ethers.formatUnits(usdtBalance, 6)} USDT`);
        
        const requiredUSDT = ethers.parseUnits('30', 6);
        if (usdtBalance < requiredUSDT) {
            console.log('❌ Insufficient USDT balance! Need 30 USDT for Package 1.');
            console.log('📝 Solution: Fund Trezor with at least 30 USDT first.\n');
            return;
        }
        
        // Check allowance
        console.log('🔐 Checking USDT allowance...');
        const allowance = await usdt.allowance(trezorAddress, contractAddress);
        console.log(`Current Allowance: ${ethers.formatUnits(allowance, 6)} USDT`);
        
        if (allowance < requiredUSDT) {
            console.log('❌ Insufficient USDT allowance!');
            console.log('📝 You need to approve the contract to spend 30 USDT from your Trezor.');
            console.log('🔧 Steps to approve:');
            console.log('1. Go to BSCScan USDT contract: https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955#writeContract');
            console.log('2. Connect your Trezor wallet');
            console.log('3. Call the "approve" function with:');
            console.log(`   - spender: ${contractAddress}`);
            console.log(`   - amount: 30000000 (30 USDT in 6 decimals)`);
            console.log('4. Confirm the transaction');
            console.log('5. Run this script again\n');
            return;
        }
        
        console.log('✅ Sufficient USDT balance and allowance!\n');
        
        // Check registration status
        console.log('👤 Checking registration status...');
        const user = await contract.users(trezorAddress);
        if (user.registrationTime > 0) {
            console.log('✅ Trezor is already registered!');
            console.log(`Registration Time: ${new Date(user.registrationTime * 1000)}`);
            console.log(`Package Level: ${user.packageLevel}`);
            return;
        }
        
        console.log('📝 Registration Instructions:');
        console.log('Since we cannot sign transactions with Trezor from this script,');
        console.log('you need to register manually via BSCScan:\n');
        
        console.log('🔧 Steps to register with USDT:');
        console.log('1. Go to the LeadFive contract on BSCScan:');
        console.log(`   https://bscscan.com/address/${contractAddress}#writeProxyContract`);
        console.log('2. Connect your Trezor wallet');
        console.log('3. Find the "register" function');
        console.log('4. Enter the following parameters:');
        console.log(`   - sponsor: 0x0000000000000000000000000000000000000000 (no sponsor)`);
        console.log(`   - packageLevel: 1`);
        console.log(`   - useUSDT: true`);
        console.log('5. Set payableAmount to 0 (since using USDT)');
        console.log('6. Click "Write" and confirm the transaction');
        console.log('7. Wait for confirmation\n');
        
        console.log('✅ This will bypass the oracle issue and register using USDT payment!');
        
        // Show current contract state
        console.log('📊 Current Contract State:');
        const totalUsers = await contract.totalUsers();
        console.log(`Total Users: ${totalUsers}`);
        const isPaused = await contract.paused();
        console.log(`Contract Paused: ${isPaused}`);
        const owner = await contract.owner();
        console.log(`Contract Owner: ${owner}`);
        console.log(`Is Trezor the Owner: ${owner.toLowerCase() === trezorAddress.toLowerCase()}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the registration
registerTrezorWithUSDT()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
