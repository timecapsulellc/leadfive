const { ethers } = require('hardhat');

async function verifyUSDTDecimals() {
    console.log('🔍 Verifying USDT Decimals and Contract Settings...\n');
    
    const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    
    try {
        // Check USDT decimals
        const usdtAbi = [
            'function decimals() view returns (uint8)',
            'function symbol() view returns (string)',
            'function name() view returns (string)'
        ];
        
        const usdt = new ethers.Contract(usdtAddress, usdtAbi, ethers.provider);
        
        console.log('📋 USDT Token Information:');
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
            
            // Check LeadFive contract package pricing
            const LeadFive = await ethers.getContractFactory('LeadFive');
            const contract = LeadFive.attach(contractAddress);
            
            console.log('\n📦 LeadFive Package Information:');
            const package1 = await contract.packages(1);
            console.log(`Package 1 Price (raw): ${package1.price}`);
            console.log(`Package 1 Price (formatted with 6 decimals): ${ethers.formatUnits(package1.price, 6)} USDT`);
            console.log(`Package 1 Price (formatted with ${decimals} decimals): ${ethers.formatUnits(package1.price, decimals)} USDT`);
            
            // Calculate correct approval amount
            console.log('\n🔧 Correct Approval Amount:');
            
            if (decimals == 6) {
                // BSC USDT uses 6 decimals, contract expects 6 decimals
                const correctAmount = ethers.parseUnits('30', 6);
                console.log(`✅ Correct amount for 6 decimals: ${correctAmount.toString()}`);
                console.log(`This equals: ${ethers.formatUnits(correctAmount, 6)} USDT`);
            } else if (decimals == 18) {
                // If USDT uses 18 decimals but contract expects 6, we need to adjust
                console.log('⚠️ Mismatch detected!');
                console.log(`USDT uses ${decimals} decimals but contract expects 6 decimals`);
                console.log('Need to check how the contract handles this...');
                
                // Check what amount would work
                const contractExpected = package1.price; // This is in 6 decimals
                console.log(`Contract expects: ${contractExpected.toString()} (6 decimals)`);
                
                // If USDT is 18 decimals, we need to send the actual USDT amount
                const actualUSDTAmount = ethers.parseUnits('30', decimals);
                console.log(`Actual USDT amount needed: ${actualUSDTAmount.toString()} (${decimals} decimals)`);
            }
            
        } catch (e) {
            console.log('Decimals: Could not fetch -', e.message);
        }
        
        // Try to read the contract source to understand the expectation
        console.log('\n📖 Contract Analysis:');
        console.log('Looking at the LeadFive contract code:');
        console.log('- Package prices are stored as: 30 * 10**6 (6 decimals)');
        console.log('- Daily withdrawal limit: 1000 * 10**6 (6 decimals)');
        console.log('- This suggests the contract expects USDT with 6 decimals');
        console.log('- But the transfer call is: usdt.transferFrom(msg.sender, address(this), packagePrice)');
        console.log('- So it depends on what decimals the actual USDT token uses');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the verification
verifyUSDTDecimals()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
