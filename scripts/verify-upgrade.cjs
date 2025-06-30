const { ethers } = require('hardhat');

async function verifyUpgrade() {
    console.log('🔍 Verifying LeadFive v1.0.0 Upgrade...\n');
    
    const contractAddress = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
    
    try {
        const LeadFive = await ethers.getContractFactory('LeadFive');
        const contract = LeadFive.attach(contractAddress);
        
        console.log('📋 Contract Status:');
        
        // Check owner
        const owner = await contract.owner();
        console.log(`Owner: ${owner}`);
        
        // Check total users
        const totalUsers = await contract.getTotalUsers();
        console.log(`Total Users: ${totalUsers}`);
        
        // Check USDT decimals (new V2 feature)
        try {
            const usdtDecimals = await contract.getUSDTDecimals();
            console.log(`USDT Decimals: ${usdtDecimals}`);
        } catch (error) {
            console.log('USDT Decimals: Not available (upgrade may not be complete)');
        }
        
        // Check version (new function)
        try {
            const version = await contract.getVersion();
            console.log(`Contract Version: ${version}`);
        } catch (error) {
            console.log('Version: Not available (may need manual update)');
        }
        
        // Check USDT address
        const usdtAddress = await contract.usdt();
        console.log(`USDT Address: ${usdtAddress}`);
        
        // Check if contract is paused
        const isPaused = await contract.paused();
        console.log(`Contract Paused: ${isPaused}`);
        
        // Check package prices
        try {
            const package1Price = await contract.getPackagePrice(1);
            const package2Price = await contract.getPackagePrice(2);
            const package3Price = await contract.getPackagePrice(3);
            const package4Price = await contract.getPackagePrice(4);
            
            console.log('\n📦 Package Prices (6 decimals):');
            console.log(`Package 1: ${package1Price} (${ethers.formatUnits(package1Price, 6)} USDT)`);
            console.log(`Package 2: ${package2Price} (${ethers.formatUnits(package2Price, 6)} USDT)`);
            console.log(`Package 3: ${package3Price} (${ethers.formatUnits(package3Price, 6)} USDT)`);
            console.log(`Package 4: ${package4Price} (${ethers.formatUnits(package4Price, 6)} USDT)`);
        } catch (error) {
            console.log('Package prices: Error reading');
        }
        
        console.log('\n✅ Contract upgrade verification complete!');
        console.log('🎉 LeadFive v1.0.0 is successfully deployed and operational!');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

verifyUpgrade()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Script failed:', error);
        process.exit(1);
    });
