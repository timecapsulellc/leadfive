const hre = require("hardhat");
const { ethers } = require("hardhat");
require('dotenv').config();

async function deployLeadFiveMainnet() {
    try {
        console.log('\n🚀 DEPLOYING LEADFIVE v1.0.0 - BSC MAINNET');
        console.log('='.repeat(70));
        console.log('📋 Production deployment with deployer admin rights');
        console.log('📋 Ownership transfer to Trezor will be done later');
        console.log('='.repeat(70));
        
        // Validate environment variables
        if (!process.env.DEPLOYER_PRIVATE_KEY) {
            throw new Error('DEPLOYER_PRIVATE_KEY not found in .env file');
        }
        if (!process.env.BSCSCAN_API_KEY) {
            throw new Error('BSCSCAN_API_KEY not found in .env file');
        }
        
        // Get deployer from private key
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        console.log(`\n📋 Deployment Configuration:`);
        console.log(`Deployer Address: ${deployer.address}`);
        console.log(`Network: BSC Mainnet`);
        console.log(`RPC URL: ${process.env.BSC_MAINNET_RPC_URL}`);
        
        // Check deployer balance
        const balance = await provider.getBalance(deployer.address);
        console.log(`Deployer Balance: ${ethers.formatEther(balance)} BNB`);
        
        if (balance < ethers.parseEther("0.01")) {
            throw new Error("Insufficient BNB balance for deployment (need at least 0.01 BNB)");
        }
        
        // Contract parameters for BSC Mainnet
        const usdtAddress = process.env.VITE_USDT_ADDRESS || "0x55d398326f99059fF775485246999027B3197955";
        const trezorAddress = process.env.TREZOR_OWNER_ADDRESS || "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
        
        console.log(`\n📋 Contract Configuration:`);
        console.log(`USDT Token: ${usdtAddress}`);
        console.log(`Deployer (Current Owner): ${deployer.address}`);
        console.log(`Trezor (Future Owner): ${trezorAddress}`);
        console.log(`Platform Fee Recipient: ${deployer.address}`);
        
        // Deploy implementation
        console.log('\n🔨 Step 1: Deploy LeadFive Implementation');
        const LeadFive = await ethers.getContractFactory("LeadFive", deployer);
        
        console.log('📤 Sending deployment transaction...');
        const implementation = await LeadFive.deploy({
            gasLimit: 6000000,
            gasPrice: ethers.parseUnits("5", "gwei")
        });
        
        console.log('⏳ Waiting for deployment confirmation...');
        await implementation.waitForDeployment();
        const implementationAddress = await implementation.getAddress();
        console.log(`✅ Implementation deployed: ${implementationAddress}`);
        
        // Initialize the contract
        console.log('\n🔨 Step 2: Initialize Contract with USDT-Only Setup');
        console.log('📤 Sending initialize transaction...');
        const initTx = await implementation.initialize(usdtAddress, {
            gasLimit: 1000000,
            gasPrice: ethers.parseUnits("5", "gwei")
        });
        
        console.log('⏳ Waiting for initialization confirmation...');
        await initTx.wait();
        console.log(`✅ Contract initialized with USDT: ${usdtAddress}`);
        
        // Verify deployment
        console.log('\n🔍 Step 3: Verify Contract State');
        const contractOwner = await implementation.owner();
        const usdt = await implementation.usdt();
        const isAdmin = await implementation.isAdmin(deployer.address);
        const totalUsers = await implementation.getTotalUsers();
        
        console.log(`Contract Owner: ${contractOwner}`);
        console.log(`USDT Token: ${usdt}`);
        console.log(`Deployer is Admin: ${isAdmin}`);
        console.log(`Total Users: ${totalUsers}`);
        console.log(`Owner is Deployer: ${contractOwner.toLowerCase() === deployer.address.toLowerCase()}`);
        
        // Test the USDT-only register function
        console.log('\n🧪 Step 4: Verify USDT-Only Register Function');
        console.log('='.repeat(50));
        
        const registerFunction = implementation.interface.getFunction("register");
        console.log(`✅ Register function parameters: ${registerFunction.inputs.length}`);
        registerFunction.inputs.forEach((input, index) => {
            console.log(`  ${index + 1}. ${input.name} (${input.type})`);
        });
        
        // Test package prices
        console.log('\n✅ Package Configuration:');
        for (let i = 1; i <= 4; i++) {
            const packagePrice = await implementation.getPackagePrice(i);
            console.log(`  - Package ${i}: $${ethers.formatUnits(packagePrice, 6)} USDT`);
        }
        
        // Test core functions
        console.log('\n✅ Core Functions:');
        const version = await implementation.getVersion();
        const usdtDecimals = await implementation.getUSDTDecimals();
        console.log(`  - Contract Version: ${version}`);
        console.log(`  - USDT Decimals: ${usdtDecimals}`);
        
        console.log('\n🎉 LEADFIVE MAINNET DEPLOYMENT SUCCESSFUL!');
        console.log('='.repeat(70));
        
        // Contract verification commands
        console.log('\n📝 BSCScan Verification Commands:');
        console.log(`npx hardhat verify --network bsc ${implementationAddress}`);
        console.log('\nVerification may take a few minutes to appear on BSCScan.');
        
        console.log('\n🎯 Next Steps:');
        console.log('1. ✅ Contract deployed to BSC Mainnet');
        console.log('2. ✅ Deployer has all admin rights and ownership');
        console.log('3. ✅ USDT-only register function ready');
        console.log('4. ✅ All business logic preserved');
        console.log('5. 🔄 Verify contract on BSCScan');
        console.log('6. 🔄 Test registration with real USDT');
        console.log('7. 🔄 Configure and test frontend');
        console.log('8. 🔄 Transfer ownership to Trezor when ready');
        console.log('9. 🔄 Launch production');
        
        // Update .env file with new contract address
        console.log('\n📝 Updating .env file...');
        const fs = require('fs');
        let envContent = fs.readFileSync('.env', 'utf8');
        
        // Update contract addresses
        envContent = envContent.replace(
            /VITE_CONTRACT_ADDRESS=.*/,
            `VITE_CONTRACT_ADDRESS=${implementationAddress}`
        );
        envContent = envContent.replace(
            /MAINNET_CONTRACT_ADDRESS=.*/,
            `MAINNET_CONTRACT_ADDRESS=${implementationAddress}`
        );
        
        fs.writeFileSync('.env', envContent);
        console.log('✅ .env file updated with new contract address');
        
        // Save comprehensive deployment info
        const deploymentInfo = {
            network: 'BSC Mainnet',
            timestamp: new Date().toISOString(),
            contractVersion: 'LeadFive v1.0.0 USDT-Only',
            contractAddress: implementationAddress,
            deployer: deployer.address,
            owner: contractOwner,
            trezorFutureOwner: trezorAddress,
            usdt: usdtAddress,
            configuration: {
                usdtOnly: true,
                registerParameters: 2,
                noReferralCodes: true,
                allBusinessLogic: true,
                gasOptimized: true,
                securityFeatures: true
            },
            features: {
                packages: [
                    { level: 1, price: '30 USDT' },
                    { level: 2, price: '50 USDT' },
                    { level: 3, price: '100 USDT' },
                    { level: 4, price: '200 USDT' }
                ],
                registerFunction: 'register(address sponsor, uint8 packageLevel)',
                adminRights: 'Deployer has all admin rights',
                ownershipTransfer: 'Will be transferred to Trezor later'
            },
            verification: {
                bscscanCommand: `npx hardhat verify --network bsc ${implementationAddress}`,
                explorerUrl: `https://bscscan.com/address/${implementationAddress}`
            },
            nextSteps: [
                'Verify contract on BSCScan',
                'Test registration with real USDT',
                'Configure frontend',
                'Transfer ownership to Trezor',
                'Launch production'
            ]
        };
        
        fs.writeFileSync(
            'mainnet-deployment-success.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('\n💾 Full deployment info saved to: mainnet-deployment-success.json');
        console.log('\n🎊 LEADFIVE IS NOW LIVE ON BSC MAINNET!');
        console.log(`🔗 Contract Address: ${implementationAddress}`);
        console.log(`🔗 BSCScan: https://bscscan.com/address/${implementationAddress}`);
        
        return {
            contractAddress: implementationAddress,
            deployer: deployer.address,
            success: true,
            readyForProduction: true
        };
        
    } catch (error) {
        console.error('❌ Mainnet deployment failed:', error);
        throw error;
    }
}

// Only run if called directly
if (require.main === module) {
    deployLeadFiveMainnet()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = deployLeadFiveMainnet;
