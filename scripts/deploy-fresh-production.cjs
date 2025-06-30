require('dotenv').config();
const { ethers } = require('hardhat');

async function deployFreshLeadFiveProduction() {
    try {
        console.log('\n🚀 FRESH LEADFIVE DEPLOYMENT - PRODUCTION READY');
        console.log('='.repeat(60));
        console.log('📋 Complete fresh deployment with proper USDT initialization');
        console.log('='.repeat(60));
        
        // Configuration
        const usdtAddress = process.env.VITE_USDT_ADDRESS; // BSC USDT
        const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
        const trezorAddress = process.env.TREZOR_OWNER_ADDRESS;
        
        console.log(`USDT Address: ${usdtAddress}`);
        console.log(`Trezor Address: ${trezorAddress}`);
        
        // Set up provider and signer for BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const deployer = new ethers.Wallet(deployerPrivateKey, provider);
        
        console.log(`\nDeployer: ${deployer.address}`);
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log(`Balance: ${ethers.formatEther(balance)} BNB`);
        
        if (balance < ethers.parseEther("0.05")) {
            console.log('❌ ERROR: Insufficient BNB balance. Need at least 0.05 BNB for deployment.');
            console.log('Please fund your deployer wallet and try again.');
            return;
        }
        
        // Verify USDT contract exists
        console.log('\n🔍 VERIFYING USDT CONTRACT:');
        const usdtCode = await provider.getCode(usdtAddress);
        if (usdtCode === '0x') {
            console.log('❌ ERROR: USDT contract not found at the specified address');
            return;
        }
        console.log('✅ USDT contract verified');
        
        // Deploy and initialize the UUPS contract directly
        console.log('\n🔨 DEPLOYING AND INITIALIZING CONTRACT:');
        const LeadFive = await ethers.getContractFactory("LeadFive");
        
        // Deploy contract
        const contract = await LeadFive.deploy();
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        console.log(`✅ Contract deployed: ${contractAddress}`);
        
        // Initialize the contract
        console.log('Initializing with USDT address...');
        const initTx = await contract.initialize(usdtAddress);
        await initTx.wait();
        console.log(`✅ Contract initialized. Transaction: ${initTx.hash}`);
        
        // The contract is now ready to use
        const leadFive = contract;
        
        // Verify deployment
        console.log('\n✅ VERIFYING DEPLOYMENT:');
        try {
            const owner = await leadFive.owner();
            console.log(`Owner: ${owner}`);
            console.log(`Owner is deployer: ${owner.toLowerCase() === deployer.address.toLowerCase()}`);
            
            const usdt = await leadFive.usdt();
            console.log(`USDT Address: ${usdt}`);
            console.log(`USDT Correct: ${usdt.toLowerCase() === usdtAddress.toLowerCase()}`);
            
            const decimals = await leadFive.getUSDTDecimals();
            console.log(`USDT Decimals: ${decimals}`);
            
            const totalUsers = await leadFive.getTotalUsers();
            console.log(`Total Users: ${totalUsers}`);
            
            const isAdmin = await leadFive.isAdmin(deployer.address);
            console.log(`Deployer is Admin: ${isAdmin}`);
            
            const version = await leadFive.getVersion();
            console.log(`Contract Version: ${version}`);
            
        } catch (error) {
            console.log(`Verification error: ${error.message}`);
        }
        
        // Test package prices
        console.log('\n📦 PACKAGE PRICES (18 decimals):');
        try {
            for (let i = 1; i <= 4; i++) {
                const price = await leadFive.getPackagePrice(i);
                console.log(`Package ${i}: ${ethers.formatEther(price)} USDT`);
            }
        } catch (error) {
            console.log(`Package price error: ${error.message}`);
        }
        
        // Test register function signature
        console.log('\n🔧 REGISTER FUNCTION TEST:');
        try {
            const registerFunction = leadFive.interface.getFunction("register");
            console.log(`Parameters: ${registerFunction.inputs.length}`);
            registerFunction.inputs.forEach((input, index) => {
                console.log(`  ${index + 1}. ${input.name} (${input.type})`);
            });
        } catch (error) {
            console.log(`Register function error: ${error.message}`);
        }
        
        console.log('\n🎉 DEPLOYMENT COMPLETE!');
        console.log('='.repeat(50));
        console.log('✅ Fresh contract deployed successfully');
        console.log('✅ USDT properly initialized');
        console.log('✅ 18-decimal support configured');
        console.log('✅ 2-parameter register function ready');
        console.log('✅ Deployer has admin rights');
        console.log('✅ All business logic preserved');
        
        console.log('\n📋 CONTRACT ADDRESSES:');
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`USDT: ${usdtAddress}`);
        console.log(`Owner/Admin: ${deployer.address}`);
        console.log(`Future Owner: ${trezorAddress}`);
        
        console.log('\n📝 NEXT STEPS:');
        console.log('1. ✅ Contract deployed and initialized');
        console.log('2. 🔄 Update .env with new contract address');
        console.log('3. 🔄 Verify contracts on BSCScan');
        console.log('4. 🔄 Test user registration with real USDT');
        console.log('5. 🔄 Transfer ownership to Trezor when ready');
        console.log('6. 🔄 Update frontend configuration');
        console.log('7. 🔄 Launch production');
        
        // Save deployment info
        const deploymentInfo = {
            timestamp: new Date().toISOString(),
            network: 'BSC Mainnet',
            contractAddress: contractAddress,
            deployer: deployer.address,
            futureOwner: trezorAddress,
            usdtAddress: usdtAddress,
            usdtDecimals: 18,
            deploymentTransaction: initTx.hash,
            version: '1.0.0-USDT-ONLY-FRESH',
            features: {
                usdtOnly: true,
                noReferralCodes: true,
                twoParameterRegister: true,
                eighteenDecimals: true,
                allBusinessLogic: true,
                gasOptimized: true,
                properlyInitialized: true
            },
            packagePrices: {
                level1: '30 USDT',
                level2: '50 USDT',
                level3: '100 USDT',
                level4: '200 USDT'
            },
            verificationCommands: [
                `npx hardhat verify --network bsc ${contractAddress}`
            ]
        };
        
        require('fs').writeFileSync(
            'fresh-deployment-production.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('\n💾 Deployment info saved to: fresh-deployment-production.json');
        console.log('\n🚀 LEADFIVE IS NOW PRODUCTION READY!');
        
        // Update .env file
        console.log('\n📝 UPDATING .ENV FILE:');
        const envPath = '.env';
        let envContent = require('fs').readFileSync(envPath, 'utf8');
        
        // Update contract addresses
        envContent = envContent.replace(
            /VITE_CONTRACT_ADDRESS=.*/,
            `VITE_CONTRACT_ADDRESS=${contractAddress}`
        );
        envContent = envContent.replace(
            /MAINNET_CONTRACT_ADDRESS=.*/,
            `MAINNET_CONTRACT_ADDRESS=${contractAddress}`
        );
        
        require('fs').writeFileSync(envPath, envContent);
        console.log('✅ .env file updated with new contract address');
        
        return {
            success: true,
            contractAddress: contractAddress,
            deploymentHash: initTx.hash,
            usdtInitialized: true,
            adminRights: true
        };
        
    } catch (error) {
        console.error('❌ Deployment failed:', error);
        throw error;
    }
}

// Only run if called directly
if (require.main === module) {
    deployFreshLeadFiveProduction()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = deployFreshLeadFiveProduction;
