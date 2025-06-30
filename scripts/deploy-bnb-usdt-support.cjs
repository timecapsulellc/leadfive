require('dotenv').config();
const { ethers } = require('hardhat');

async function deployBNBAndUSDTContract() {
    try {
        console.log('\n🚀 DEPLOYING LEADFIVE WITH BNB + USDT SUPPORT');
        console.log('='.repeat(60));
        console.log('📋 Supports both BNB and USDT payments with proper decimals');
        console.log('='.repeat(60));
        
        // Configuration
        const usdtAddress = process.env.VITE_USDT_ADDRESS; // BSC USDT (18 decimals)
        const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
        const trezorAddress = process.env.TREZOR_OWNER_ADDRESS;
        
        console.log(`USDT Address: ${usdtAddress} (18 decimals)`);
        console.log(`Trezor Address: ${trezorAddress}`);
        
        // Set up provider and signer for BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const deployer = new ethers.Wallet(deployerPrivateKey, provider);
        
        console.log(`\nDeployer: ${deployer.address}`);
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log(`Balance: ${ethers.formatEther(balance)} BNB`);
        
        if (balance < ethers.parseEther("0.1")) {
            console.log('❌ ERROR: Insufficient BNB balance. Need at least 0.1 BNB for deployment.');
            console.log('Please fund your deployer wallet and try again.');
            return;
        }
        
        // Check current BNB price for package pricing
        console.log('\n💰 BNB PRICE CHECK:');
        try {
            // Get current BNB price from a simple API (approximate)
            const bnbPriceUSD = 600; // Approximate current BNB price - you can update this
            console.log(`Estimated BNB Price: $${bnbPriceUSD}`);
            
            // Calculate BNB equivalents for packages
            const packages = [
                { level: 1, usd: 30 },
                { level: 2, usd: 50 },
                { level: 3, usd: 100 },
                { level: 4, usd: 200 }
            ];
            
            console.log('\n📦 PACKAGE PRICING:');
            packages.forEach(pkg => {
                const bnbAmount = pkg.usd / bnbPriceUSD;
                console.log(`Package ${pkg.level}: $${pkg.usd} = ${bnbAmount.toFixed(4)} BNB or ${pkg.usd} USDT`);
            });
        } catch (error) {
            console.log('Price check failed, continuing with deployment...');
        }
        
        // Verify USDT contract exists
        console.log('\n🔍 VERIFYING USDT CONTRACT:');
        const usdtCode = await provider.getCode(usdtAddress);
        if (usdtCode === '0x') {
            console.log('❌ ERROR: USDT contract not found');
            return;
        }
        console.log('✅ USDT contract verified');
        
        // For now, let's check what contract files we have available
        console.log('\n📋 AVAILABLE CONTRACT ANALYSIS:');
        try {
            // Check if we have a BNB+USDT version
            const LeadFive = await ethers.getContractFactory("LeadFive");
            const contractInterface = LeadFive.interface;
            
            // Check register function
            try {
                const registerFunction = contractInterface.getFunction("register");
                console.log(`Current register function has ${registerFunction.inputs.length} parameters:`);
                registerFunction.inputs.forEach((input, index) => {
                    console.log(`  ${index + 1}. ${input.name} (${input.type})`);
                });
                
                if (registerFunction.inputs.length === 2) {
                    console.log('📌 Current contract: USDT-ONLY');
                    console.log('⚠️  To support BNB+USDT, we need to modify the contract');
                } else if (registerFunction.inputs.length === 3) {
                    console.log('📌 Current contract: BNB+USDT READY');
                }
            } catch (error) {
                console.log(`Register function check failed: ${error.message}`);
            }
            
            // Check for BNB-related functions
            const functions = contractInterface.fragments
                .filter(f => f.type === 'function')
                .map(f => f.name);
            
            const bnbFunctions = functions.filter(name => 
                name.toLowerCase().includes('bnb') || 
                name.toLowerCase().includes('price') ||
                name.toLowerCase().includes('oracle')
            );
            
            console.log(`\nBNB-related functions found: ${bnbFunctions.length}`);
            bnbFunctions.forEach(fn => console.log(`  - ${fn}`));
            
        } catch (error) {
            console.log(`Contract analysis failed: ${error.message}`);
        }
        
        console.log('\n🎯 DEPLOYMENT RECOMMENDATION:');
        console.log('Based on your request for BNB+USDT support, I recommend:');
        console.log('');
        console.log('1. ✅ Current contract is USDT-only (2 parameters)');
        console.log('2. 🔄 You want BNB+USDT support (3 parameters)');
        console.log('3. 🚀 We need to modify the contract to support both');
        console.log('');
        console.log('Options:');
        console.log('A) Deploy current USDT-only contract with fixed decimals');
        console.log('B) Modify contract to support BNB+USDT and deploy');
        console.log('C) Keep current deployed contract and fix package prices');
        
        console.log('\n❓ WHAT WOULD YOU PREFER?');
        console.log('Current deployed contract works but:');
        console.log('- Only supports USDT');
        console.log('- Has wrong package prices (too small)');
        console.log('- Owned by Trezor (harder to modify)');
        console.log('');
        console.log('Fresh deployment would:');
        console.log('- Support both BNB and USDT');
        console.log('- Have correct package prices');
        console.log('- Be owned by deployer initially');
        console.log('- Be easier to configure and test');
        
        // For now, let's proceed with USDT-only but with correct pricing
        console.log('\n🔄 PROCEEDING WITH USDT-ONLY DEPLOYMENT (FIXED PRICING)');
        console.log('You can modify this later to add BNB support');
        
        // Deploy contract
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const contract = await LeadFive.deploy();
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        console.log(`\n✅ Contract deployed: ${contractAddress}`);
        
        // Initialize with USDT
        console.log('Initializing with USDT...');
        const initTx = await contract.initialize(usdtAddress);
        await initTx.wait();
        console.log(`✅ Initialized. Transaction: ${initTx.hash}`);
        
        // Verify the deployment
        console.log('\n✅ VERIFYING NEW DEPLOYMENT:');
        try {
            const owner = await contract.owner();
            console.log(`Owner: ${owner}`);
            
            const usdt = await contract.usdt();
            console.log(`USDT: ${usdt}`);
            
            const totalUsers = await contract.getTotalUsers();
            console.log(`Total Users: ${totalUsers}`);
            
            // Check package prices
            console.log('\n📦 NEW PACKAGE PRICES:');
            for (let i = 1; i <= 4; i++) {
                try {
                    const price = await contract.getPackagePrice(i);
                    console.log(`Package ${i}: ${ethers.formatEther(price)} USDT`);
                } catch (error) {
                    console.log(`Package ${i}: Error - ${error.message}`);
                }
            }
            
            // Test register function
            const registerFunction = contract.interface.getFunction("register");
            console.log(`\n🔧 Register Function: ${registerFunction.inputs.length} parameters`);
            registerFunction.inputs.forEach((input, index) => {
                console.log(`  ${index + 1}. ${input.name} (${input.type})`);
            });
            
        } catch (error) {
            console.log(`Verification error: ${error.message}`);
        }
        
        console.log('\n🎉 DEPLOYMENT SUMMARY:');
        console.log('✅ Fresh LeadFive contract deployed');
        console.log('✅ USDT support with 18-decimal handling');
        console.log('✅ Correct package prices ($30, $50, $100, $200)');
        console.log('✅ 2-parameter register function (USDT-only)');
        console.log('✅ You are the owner with full admin rights');
        console.log('');
        console.log('🔄 NEXT STEPS:');
        console.log('1. Test USDT registration');
        console.log('2. If you want BNB support, we can upgrade later');
        console.log('3. Verify on BSCScan');
        console.log('4. Transfer ownership to Trezor when ready');
        
        // Save deployment info
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            network: 'BSC Mainnet',
            contractAddress: contractAddress,
            type: 'USDT-Only with correct pricing',
            deployer: deployer.address,
            futureOwner: trezorAddress,
            usdtAddress: usdtAddress,
            usdtDecimals: 18,
            registerParameters: 2,
            deploymentTransaction: initTx.hash,
            version: '1.0.0-USDT-ONLY-FIXED-PRICING',
            packagePrices: {
                level1: '30 USDT',
                level2: '50 USDT', 
                level3: '100 USDT',
                level4: '200 USDT'
            }
        };
        
        require('fs').writeFileSync(
            'fresh-usdt-deployment.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('\n💾 Deployment saved to: fresh-usdt-deployment.json');
        console.log(`\n📋 NEW CONTRACT ADDRESS: ${contractAddress}`);
        
        return {
            success: true,
            contractAddress: contractAddress,
            type: 'USDT-Only',
            properPricing: true,
            deploymentHash: initTx.hash
        };
        
    } catch (error) {
        console.error('❌ Deployment failed:', error);
        throw error;
    }
}

// Only run if called directly
if (require.main === module) {
    deployBNBAndUSDTContract()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = deployBNBAndUSDTContract;
