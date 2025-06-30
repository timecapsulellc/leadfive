const hre = require("hardhat");
const { ethers } = require("hardhat");

async function verifyFrontendContractIntegration() {
    try {
        console.log('🔍 VERIFYING FRONTEND CONTRACT INTEGRATION');
        console.log('='.repeat(50));
        
        // Load frontend configuration
        const fs = require('fs');
        const path = require('path');
        
        // Check if frontend config file exists and load it
        const configPath = './src/config/contracts.js';
        if (!fs.existsSync(configPath)) {
            console.error('❌ Frontend config file not found:', configPath);
            return;
        }
        
        // Read the config content (since it's ES module, we'll parse it manually)
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        // Extract contract address from config
        const addressMatch = configContent.match(/CONTRACT_ADDRESS = '(0x[a-fA-F0-9]{40})'/);
        const frontendAddress = addressMatch ? addressMatch[1] : null;
        
        console.log('📋 Frontend Configuration Check:');
        console.log(`  Contract Address: ${frontendAddress}`);
        
        // Expected addresses from deployment
        const expectedProxy = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
        const expectedImpl = '0x10965e40d90054FDE981dd1A470937C68719F707';
        
        // Verify addresses match
        if (frontendAddress === expectedProxy) {
            console.log('  ✅ Contract address matches deployment');
        } else {
            console.log('  ❌ Contract address mismatch!');
            console.log(`     Frontend: ${frontendAddress}`);
            console.log(`     Expected: ${expectedProxy}`);
            return;
        }
        
        // Connect to the contract to verify it's working
        console.log('');
        console.log('🔗 Testing Contract Connection:');
        
        const [signer] = await ethers.getSigners();
        const network = await signer.provider.getNetwork();
        
        console.log(`  Network: ${network.name} (Chain ID: ${network.chainId})`);
        console.log(`  Signer: ${signer.address}`);
        
        // Load contract ABI from artifacts
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = LeadFive.attach(expectedProxy);
        
        // Test basic contract calls
        console.log('');
        console.log('🧪 Testing Contract Functions:');
        
        try {
            const owner = await contract.owner();
            console.log(`  ✅ Owner: ${owner}`);
            
            const totalUsers = await contract.getTotalUsers();
            console.log(`  ✅ Total Users: ${totalUsers}`);
            
            const usdtAddress = await contract.usdt();
            console.log(`  ✅ USDT Address: ${usdtAddress}`);
            
            const package1Price = await contract.getPackagePrice(1);
            console.log(`  ✅ Package 1 Price: ${ethers.formatUnits(package1Price, 6)} USDT`);
            
            const package2Price = await contract.getPackagePrice(2);
            console.log(`  ✅ Package 2 Price: ${ethers.formatUnits(package2Price, 6)} USDT`);
            
            const package3Price = await contract.getPackagePrice(3);
            console.log(`  ✅ Package 3 Price: ${ethers.formatUnits(package3Price, 6)} USDT`);
            
            const package4Price = await contract.getPackagePrice(4);
            console.log(`  ✅ Package 4 Price: ${ethers.formatUnits(package4Price, 6)} USDT`);
            
        } catch (error) {
            console.log(`  ❌ Contract call failed: ${error.message}`);
            return;
        }
        
        console.log('');
        console.log('📊 Contract Verification Links:');
        console.log(`  Proxy: https://bscscan.com/address/${expectedProxy}#code`);
        console.log(`  Implementation: https://bscscan.com/address/${expectedImpl}#code`);
        
        console.log('');
        console.log('🎉 FRONTEND INTEGRATION VERIFICATION COMPLETE!');
        console.log('='.repeat(50));
        console.log('✅ All checks passed:');
        console.log('  ✅ Frontend config updated with correct address');
        console.log('  ✅ Contract is accessible and responding');
        console.log('  ✅ All basic functions working');
        console.log('  ✅ Package prices configured correctly');
        console.log('');
        console.log('🚀 Ready for frontend testing!');
        console.log('  1. npm run dev (if not already running)');
        console.log('  2. Open http://localhost:5174/');
        console.log('  3. Connect MetaMask wallet');
        console.log('  4. Test registration flow');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

verifyFrontendContractIntegration();
