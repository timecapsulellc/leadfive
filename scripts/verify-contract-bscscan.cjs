const { run } = require('hardhat');

async function verifyContract() {
    console.log('🔍 Verifying LeadFive v1.0.0 on BSCScan...\n');
    
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
    
    try {
        console.log('📋 Contract Details:');
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`USDT Address: ${usdtAddress}`);
        console.log('Contract Name: LeadFive');
        console.log('Version: 1.0.0\n');
        
        console.log('🔄 Starting BSCScan verification...');
        
        // Verify the contract on BSCScan
        await run('verify:verify', {
            address: contractAddress,
            constructorArguments: [], // No constructor args for proxy
            contract: 'contracts/LeadFive.sol:LeadFive'
        });
        
        console.log('✅ Contract verified successfully on BSCScan!');
        console.log(`🔗 View on BSCScan: https://bscscan.com/address/${contractAddress}#code`);
        
    } catch (error) {
        if (error.message.includes('Already Verified')) {
            console.log('✅ Contract is already verified on BSCScan!');
            console.log(`🔗 View on BSCScan: https://bscscan.com/address/${contractAddress}#code`);
        } else {
            console.error('❌ Verification failed:', error.message);
            console.log('\n💡 Manual verification steps:');
            console.log('1. Go to https://bscscan.com/verifyContract');
            console.log(`2. Enter contract address: ${contractAddress}`);
            console.log('3. Select "Solidity (Single file)"');
            console.log('4. Compiler version: 0.8.22');
            console.log('5. Optimization: Yes (200 runs)');
            console.log('6. Upload the flattened contract source');
        }
    }
}

verifyContract()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
