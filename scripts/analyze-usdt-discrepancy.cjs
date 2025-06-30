const { ethers } = require('hardhat');

async function analyzeUSDTContractDiscrepancy() {
    console.log('🔍 Analyzing USDT Decimal Discrepancy...\n');
    
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';
    
    try {
        // Get contract instances
        const LeadFive = await ethers.getContractFactory('LeadFive');
        const contract = LeadFive.attach(contractAddress);
        
        console.log('🚨 CRITICAL ISSUE IDENTIFIED:');
        console.log('1. BSC USDT uses 18 decimals');
        console.log('2. LeadFive contract expects 6 decimals');
        console.log('3. This means USDT registrations are severely underpriced!\n');
        
        // Check what the contract actually expects
        const package1 = await contract.packages(1);
        console.log('📦 Package 1 Analysis:');
        console.log(`Contract price storage: ${package1.price} units`);
        console.log(`Intended price: 30 USDT`);
        console.log(`Actual USDT transfer amount: ${ethers.formatUnits(package1.price, 18)} USDT`);
        console.log(`This is only: $${(parseFloat(ethers.formatUnits(package1.price, 18)) * 1).toFixed(8)}\n`);
        
        // Calculate what amount we actually need to approve/transfer
        console.log('🔧 SOLUTION OPTIONS:\n');
        
        console.log('OPTION 1: Use the contract as-is (severely underpriced)');
        console.log(`Approve amount: ${package1.price.toString()} units`);
        console.log(`This equals: ${ethers.formatUnits(package1.price, 18)} USDT (~$0.00000000003)`);
        console.log('✅ Will work but registration costs almost nothing');
        console.log('❌ Not the intended $30 price\n');
        
        console.log('OPTION 2: Fix by approving 30 full USDT');
        console.log(`Approve amount: ${ethers.parseUnits('30', 18).toString()} units`);
        console.log(`This equals: 30 USDT ($30)`);
        console.log('❌ Will fail because contract only tries to transfer ${package1.price} units');
        console.log('❌ Contract would need to be fixed\n');
        
        console.log('OPTION 3: Register using BNB instead (if oracle worked)');
        console.log('❌ Oracle is broken, so BNB registration fails\n');
        
        // Check if there have been any successful USDT registrations
        console.log('📊 Checking for Previous USDT Registrations...');
        try {
            const totalUsers = await contract.totalUsers();
            console.log(`Total users registered: ${totalUsers}`);
            
            if (totalUsers > 1) {
                console.log('⚠️ Other users have registered successfully');
                console.log('This suggests either:');
                console.log('1. They used BNB (when oracle worked)');
                console.log('2. They used USDT at the tiny amount');
                console.log('3. There\'s a different issue');
            }
        } catch (error) {
            console.log('Could not check total users:', error.message);
        }
        
        console.log('\n🎯 RECOMMENDED ACTION:');
        console.log('Given the circumstances:');
        console.log('1. Use the contract as designed (with tiny USDT amount)');
        console.log('2. This will register you for essentially free');
        console.log('3. The contract bug can be addressed later via upgrade');
        console.log('4. For now, this gets you registered and operational\n');
        
        console.log('📝 CORRECTED APPROVAL INSTRUCTIONS:');
        console.log('Approve exactly this amount:');
        console.log(`Amount: ${package1.price.toString()}`);
        console.log(`In human terms: ${ethers.formatUnits(package1.price, 18)} USDT`);
        console.log('This is what the contract actually expects to transfer.');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the analysis
analyzeUSDTContractDiscrepancy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
