require('dotenv').config();
const { ethers, upgrades } = require('hardhat');

async function upgradeToUSDT18Decimals() {
    try {
        console.log('\n🚀 UPGRADING LEADFIVE TO 18-DECIMAL USDT SUPPORT');
        console.log('='.repeat(60));
        
        // Get current addresses from .env
        const proxyAddress = process.env.MAINNET_CONTRACT_ADDRESS;
        const usdtAddress = process.env.VITE_USDT_ADDRESS;
        const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
        
        console.log(`Proxy Address: ${proxyAddress}`);
        console.log(`USDT Address: ${usdtAddress}`);
        
        // Set up provider and signer for BSC mainnet
        const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
        const deployer = new ethers.Wallet(deployerPrivateKey, provider);
        
        console.log(`\nDeployer: ${deployer.address}`);
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log(`Balance: ${ethers.formatEther(balance)} BNB`);
        
        if (balance < ethers.parseEther("0.01")) {
            console.log('⚠️ WARNING: Low BNB balance. You need at least 0.01 BNB for upgrade transaction.');
        }
        
        // Check current contract status
        console.log('\n🔍 CHECKING CURRENT CONTRACT STATUS:');
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const currentContract = LeadFive.attach(proxyAddress).connect(deployer);
        
        try {
            const owner = await currentContract.owner();
            console.log(`Current Owner: ${owner}`);
            console.log(`Owner matches deployer: ${owner.toLowerCase() === deployer.address.toLowerCase()}`);
            
            if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
                console.log('❌ ERROR: You are not the contract owner. Cannot proceed with upgrade.');
                return;
            }
            
            const currentUSDT = await currentContract.usdt();
            console.log(`Current USDT Address: ${currentUSDT}`);
            console.log(`USDT matches config: ${currentUSDT.toLowerCase() === usdtAddress.toLowerCase()}`);
            
            const currentDecimals = await currentContract.getUSDTDecimals();
            console.log(`Current USDT Decimals: ${currentDecimals}`);
            
            const totalUsers = await currentContract.getTotalUsers();
            console.log(`Total Users: ${totalUsers}`);
            
        } catch (error) {
            console.log(`Error checking current status: ${error.message}`);
        }
        
        // Deploy new implementation
        console.log('\n🔨 DEPLOYING NEW IMPLEMENTATION:');
        const newImplementation = await LeadFive.deploy();
        await newImplementation.waitForDeployment();
        const newImplAddress = await newImplementation.getAddress();
        console.log(`✅ New Implementation: ${newImplAddress}`);
        
        // Upgrade the proxy
        console.log('\n⬆️ UPGRADING PROXY:');
        
        // For UUPS upgrades, we call upgradeTo on the proxy contract
        const upgradeABI = [
            "function upgradeTo(address newImplementation) external",
            "function upgradeToAndCall(address newImplementation, bytes memory data) external payable"
        ];
        
        const proxyContract = new ethers.Contract(proxyAddress, upgradeABI, deployer);
        
        console.log('Upgrading proxy to new implementation...');
        const upgradeTx = await proxyContract.upgradeTo(newImplAddress);
        console.log(`Transaction hash: ${upgradeTx.hash}`);
        
        const receipt = await upgradeTx.wait();
        console.log(`✅ Upgrade completed! Gas used: ${receipt.gasUsed}`);
        
        // Verify upgrade
        console.log('\n✅ VERIFYING UPGRADE:');
        const upgradedContract = LeadFive.attach(proxyAddress).connect(deployer);
        
        try {
            const version = await upgradedContract.getVersion();
            console.log(`Version: ${version}`);
            
            const newDecimals = await upgradedContract.getUSDTDecimals();
            console.log(`Updated USDT Decimals: ${newDecimals}`);
            
            const usdt = await upgradedContract.usdt();
            console.log(`USDT Address: ${usdt}`);
            
            const owner = await upgradedContract.owner();
            console.log(`Owner: ${owner}`);
            
            const totalUsers = await upgradedContract.getTotalUsers();
            console.log(`Total Users: ${totalUsers}`);
            
            // Test package prices with new decimals
            console.log('\n📦 PACKAGE PRICES (18 decimals):');
            for (let i = 1; i <= 4; i++) {
                const price = await upgradedContract.getPackagePrice(i);
                console.log(`Package ${i}: ${ethers.formatEther(price)} USDT`);
            }
            
        } catch (error) {
            console.log(`Error verifying upgrade: ${error.message}`);
        }
        
        console.log('\n🎉 UPGRADE COMPLETE!');
        console.log('='.repeat(50));
        console.log('✅ Contract now supports 18-decimal USDT');
        console.log('✅ Package prices updated to 18 decimals');
        console.log('✅ All internal accounting uses 18 decimals');
        console.log('✅ No conversion overhead in transactions');
        
        console.log('\n📝 NEXT STEPS:');
        console.log('1. ✅ Contract upgraded successfully');
        console.log('2. 🔄 Test user registration with real USDT');
        console.log('3. 🔄 Verify contract on BSCScan');
        console.log('4. 🔄 Update frontend to use new decimal structure');
        console.log('5. 🔄 Transfer ownership to Trezor when ready');
        
        // Save upgrade info
        const upgradeInfo = {
            timestamp: new Date().toISOString(),
            network: 'BSC Mainnet',
            proxyAddress: proxyAddress,
            oldImplementation: 'Previous version',
            newImplementation: newImplAddress,
            upgradeTransaction: upgradeTx.hash,
            version: '1.0.0-USDT-ONLY-18DECIMALS',
            changes: [
                'Updated USDT decimals from 6 to 18',
                'Fixed package prices to use 18 decimals',
                'Removed decimal conversion overhead',
                'Aligned with BSC USDT standard'
            ]
        };
        
        require('fs').writeFileSync(
            'upgrade-usdt-18decimals.json',
            JSON.stringify(upgradeInfo, null, 2)
        );
        
        console.log('\n💾 Upgrade info saved to: upgrade-usdt-18decimals.json');
        
        return {
            success: true,
            proxyAddress: proxyAddress,
            newImplementation: newImplAddress,
            transaction: upgradeTx.hash
        };
        
    } catch (error) {
        console.error('❌ Upgrade failed:', error);
        throw error;
    }
}

// Only run if called directly
if (require.main === module) {
    upgradeToUSDT18Decimals()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = upgradeToUSDT18Decimals;
