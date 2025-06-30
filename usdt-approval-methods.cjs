const { ethers } = require('hardhat');

async function createApprovalInstructions() {
    console.log('🔐 USDT Approval Instructions - All Methods\n');
    
    const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    const trezorAddress = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
    
    try {
        // Check decimals first
        const erc20Abi = [
            'function decimals() view returns (uint8)',
            'function allowance(address owner, address spender) view returns (uint256)',
            'function approve(address spender, uint256 amount) returns (bool)'
        ];
        
        const usdt = new ethers.Contract(usdtAddress, erc20Abi, ethers.provider);
        const decimals = await usdt.decimals();
        
        console.log(`📋 USDT Details:`);
        console.log(`Address: ${usdtAddress}`);
        console.log(`Decimals: ${decimals}`);
        
        // Calculate the correct amount based on actual decimals
        const approvalAmount = ethers.parseUnits('30', decimals);
        console.log(`Approval Amount: ${approvalAmount.toString()}`);
        console.log(`Approval Amount (30 USDT): ${ethers.formatUnits(approvalAmount, decimals)}\n`);
        
        // Generate transaction data
        const approveData = usdt.interface.encodeFunctionData('approve', [
            contractAddress,
            approvalAmount
        ]);
        
        console.log('🌐 METHOD 1: BSCScan Contract Page');
        console.log('1. Go to: https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955#writeContract');
        console.log('2. Connect your Trezor wallet');
        console.log('3. Look for the "approve" function');
        console.log('4. Enter:');
        console.log(`   spender: ${contractAddress}`);
        console.log(`   amount: ${approvalAmount.toString()}`);
        console.log('5. Click Write and confirm\n');
        
        console.log('🏷️ METHOD 2: BSCScan Token Page');
        console.log('1. Go to: https://bscscan.com/token/0x55d398326f99059fF775485246999027B3197955');
        console.log('2. Look for "Approve" button or similar');
        console.log('3. This might have a more user-friendly interface\n');
        
        console.log('💳 METHOD 3: MetaMask/Wallet Direct');
        console.log('Send a transaction with these details:');
        console.log(`To: ${usdtAddress}`);
        console.log(`Value: 0 BNB`);
        console.log(`Data: ${approveData}`);
        console.log(`Gas Limit: 60000\n`);
        
        console.log('🔧 METHOD 4: Alternative Wallet Interfaces');
        console.log('Try these alternative interfaces:');
        console.log('- DeFiPulse: https://app.defipulse.com/');
        console.log('- 1inch: https://app.1inch.io/');
        console.log('- PancakeSwap: https://pancakeswap.finance/\n');
        
        // Check current status
        console.log('📊 Current Status:');
        const currentAllowance = await usdt.allowance(trezorAddress, contractAddress);
        console.log(`Current Allowance: ${ethers.formatUnits(currentAllowance, decimals)} USDT`);
        
        if (currentAllowance >= approvalAmount) {
            console.log('✅ Already approved! You can proceed with registration.');
        } else {
            console.log('❌ Approval needed before registration.');
        }
        
        console.log('\n🚨 IMPORTANT NOTES:');
        console.log(`- Use exactly this amount: ${approvalAmount.toString()}`);
        console.log(`- This equals 30 USDT with ${decimals} decimals`);
        console.log('- Make sure you\'re on BSC Mainnet');
        console.log('- You need some BNB for gas fees');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the instructions
createApprovalInstructions()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
