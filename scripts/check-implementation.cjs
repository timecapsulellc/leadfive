const { ethers, upgrades } = require("hardhat");

async function main() {
    try {
        console.log('\n🔍 CHECKING PROXY IMPLEMENTATION');
        console.log('='.repeat(40));
        
        const proxyAddress = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
        
        console.log(`📍 Proxy Address: ${proxyAddress}`);
        
        // Method 1: Use OpenZeppelin upgrades plugin
        try {
            const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
            console.log(`🏭 Implementation (OZ): ${implementationAddress}`);
        } catch (e) {
            console.log(`❌ OZ method failed: ${e.message}`);
        }
        
        // Method 2: Direct storage read
        try {
            const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
            const implSlot = await ethers.provider.getStorage(proxyAddress, IMPLEMENTATION_SLOT);
            console.log(`📊 Implementation Slot: ${implSlot}`);
            
            if (implSlot !== '0x' + '0'.repeat(64)) {
                const implAddress = '0x' + implSlot.slice(-40);
                console.log(`🏭 Implementation (Direct): ${implAddress}`);
                
                // Check implementation code
                const implCode = await ethers.provider.getCode(implAddress);
                console.log(`📋 Implementation has code: ${implCode !== '0x'}`);
                console.log(`📋 Code length: ${implCode.length}`);
            }
        } catch (e) {
            console.log(`❌ Direct storage read failed: ${e.message}`);
        }
        
        // Method 3: Try getting admin address
        try {
            const ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
            const adminSlot = await ethers.provider.getStorage(proxyAddress, ADMIN_SLOT);
            console.log(`👑 Admin Slot: ${adminSlot}`);
            
            if (adminSlot !== '0x' + '0'.repeat(64)) {
                const adminAddress = '0x' + adminSlot.slice(-40);
                console.log(`👑 Admin Address: ${adminAddress}`);
            }
        } catch (e) {
            console.log(`❌ Admin check failed: ${e.message}`);
        }
        
        // Method 4: Test contract functionality
        console.log('\n🧪 Testing contract functionality...');
        try {
            const contract = await ethers.getContractAt("LeadFive", proxyAddress);
            
            const owner = await contract.owner();
            console.log(`👤 Owner: ${owner}`);
            
            const version = await contract.getVersion();
            console.log(`📊 Version: ${version}`);
            
            const usdt = await contract.usdt();
            console.log(`💰 USDT: ${usdt}`);
            
            const totalUsers = await contract.getTotalUsers();
            console.log(`👥 Total Users: ${totalUsers}`);
            
            console.log('✅ Contract is responding correctly');
            
        } catch (e) {
            console.log(`❌ Contract interaction failed: ${e.message}`);
        }
        
        // Method 5: Check OpenZeppelin network files
        console.log('\n📁 Checking OpenZeppelin network configuration...');
        try {
            const fs = require('fs');
            const path = require('path');
            
            const ozDir = path.join(__dirname, '.openzeppelin');
            if (fs.existsSync(ozDir)) {
                const files = fs.readdirSync(ozDir);
                console.log(`📋 OZ files found: ${files.join(', ')}`);
                
                // Check BSC mainnet config
                const bscFile = path.join(ozDir, 'bsc.json');
                if (fs.existsSync(bscFile)) {
                    const config = JSON.parse(fs.readFileSync(bscFile, 'utf8'));
                    const proxy = config.proxies?.find(p => p.address.toLowerCase() === proxyAddress.toLowerCase());
                    if (proxy) {
                        console.log(`📊 Proxy found in OZ config:`, proxy);
                    } else {
                        console.log(`⚠️ Proxy not found in OZ config`);
                    }
                }
            } else {
                console.log(`❌ .openzeppelin directory not found`);
            }
        } catch (e) {
            console.log(`❌ OZ config check failed: ${e.message}`);
        }
        
    } catch (error) {
        console.error('\n❌❌❌ IMPLEMENTATION CHECK FAILED ❌❌❌');
        console.error('Error:', error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
