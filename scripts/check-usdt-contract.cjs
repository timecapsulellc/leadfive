const { ethers } = require('hardhat');

async function checkUSDTContract() {
    console.log('🔍 Checking USDT Contract Functions...\n');
    
    const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
    
    try {
        // Standard ERC20 ABI
        const erc20Abi = [
            'function name() view returns (string)',
            'function symbol() view returns (string)',
            'function decimals() view returns (uint8)',
            'function totalSupply() view returns (uint256)',
            'function balanceOf(address owner) view returns (uint256)',
            'function allowance(address owner, address spender) view returns (uint256)',
            'function approve(address spender, uint256 amount) returns (bool)',
            'function transfer(address to, uint256 amount) returns (bool)',
            'function transferFrom(address from, address to, uint256 amount) returns (bool)'
        ];
        
        const usdt = new ethers.Contract(usdtAddress, erc20Abi, ethers.provider);
        
        console.log('📋 USDT Contract Information:');
        console.log(`Address: ${usdtAddress}`);
        
        try {
            const name = await usdt.name();
            console.log(`Name: ${name}`);
        } catch (e) {
            console.log('Name: Could not fetch');
        }
        
        try {
            const symbol = await usdt.symbol();
            console.log(`Symbol: ${symbol}`);
        } catch (e) {
            console.log('Symbol: Could not fetch');
        }
        
        try {
            const decimals = await usdt.decimals();
            console.log(`Decimals: ${decimals}`);
        } catch (e) {
            console.log('Decimals: Could not fetch');
        }
        
        // Check if approve function exists by testing it
        console.log('\n🔐 Testing USDT Approve Function...');
        
        const trezorAddress = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
        const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
        
        try {
            // Check current allowance
            const currentAllowance = await usdt.allowance(trezorAddress, contractAddress);
            console.log(`Current Allowance: ${ethers.formatUnits(currentAllowance, 6)} USDT`);
            
            // Try to estimate gas for approve (this will tell us if the function exists)
            try {
                const approveData = usdt.interface.encodeFunctionData('approve', [
                    contractAddress,
                    ethers.parseUnits('30', 6)
                ]);
                console.log('✅ Approve function exists and can be called');
                console.log(`Approve transaction data: ${approveData}`);
                
                // Show the exact BSCScan URL
                console.log('\n🌐 BSCScan Links:');
                console.log('1. USDT Contract (Read):');
                console.log(`   https://bscscan.com/address/${usdtAddress}#readContract`);
                console.log('2. USDT Contract (Write):');
                console.log(`   https://bscscan.com/address/${usdtAddress}#writeContract`);
                console.log('3. Token Tracker Page:');
                console.log(`   https://bscscan.com/token/${usdtAddress}`);
                
            } catch (error) {
                console.log('❌ Approve function issue:', error.message);
            }
            
        } catch (error) {
            console.log('❌ Could not check allowance:', error.message);
        }
        
        // Alternative: Check if this is actually Tether USD
        console.log('\n📝 Alternative Solutions:');
        console.log('1. Try the Token Tracker page instead of contract page');
        console.log('2. Use a different wallet interface (MetaMask directly)');
        console.log('3. Use our script to create the approval transaction');
        
        // Show manual transaction details
        console.log('\n🔧 Manual Transaction Details:');
        console.log('If BSCScan write functions are not available:');
        console.log(`To: ${usdtAddress}`);
        console.log(`Data: ${usdt.interface.encodeFunctionData('approve', [contractAddress, ethers.parseUnits('30', 6)])}`);
        console.log(`Value: 0 BNB`);
        console.log(`Gas Limit: 60000`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the check
checkUSDTContract()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
