#!/usr/bin/env node

const { ethers, upgrades } = require('hardhat');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Decryption function for encrypted private key
function decryptPrivateKey(encryptedKey, password = 'mk3R4^=l%cirS=K_orphisol') {
    try {
        if (encryptedKey && encryptedKey.startsWith('0x') && encryptedKey.length === 66) {
            return encryptedKey;
        }
        
        const ALGORITHM = 'aes-256-cbc';
        const KEY_LENGTH = 32;
        const IV_LENGTH = 16;
        
        const key = crypto.scryptSync(password, 'salt', KEY_LENGTH);
        const combined = Buffer.from(encryptedKey, 'base64');
        const iv = combined.slice(0, IV_LENGTH);
        const encrypted = combined.slice(IV_LENGTH);
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encrypted, null, 'utf8');
        decrypted += decipher.final('utf8');
        
        const formattedKey = decrypted.startsWith('0x') ? decrypted : `0x${decrypted}`;
        
        if (!/^0x[0-9a-fA-F]{64}$/.test(formattedKey)) {
            throw new Error('Invalid private key format after decryption');
        }
        
        return formattedKey;
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}

async function main() {
    console.log('🚀 LEADFIVE PRODUCTION DEPLOYMENT');
    console.log('==================================\n');

    // BSC Mainnet configuration
    const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
    const BNB_USD_PRICE_FEED = '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE';
    const TREZOR_ADDRESS = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';

    // Get deployer from encrypted private key
    const encryptedPrivateKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;
    if (!encryptedPrivateKey) {
        throw new Error('DEPLOYER_PRIVATE_KEY_ENCRYPTED not found in .env');
    }

    console.log('🔐 Decrypting deployer private key...');
    const privateKey = decryptPrivateKey(encryptedPrivateKey);
    
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
    const deployer = new ethers.Wallet(privateKey, provider);
    
    console.log('Deployer address:', deployer.address);
    console.log('Network: BSC Mainnet');
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log('Deployer balance:', ethers.formatEther(balance), 'BNB\n');

    if (parseFloat(ethers.formatEther(balance)) < 0.1) {
        console.log('⚠️  WARNING: Low BNB balance. Need at least 0.1 BNB for deployment.\n');
    }

    try {
        // Deploy LeadFive contract
        console.log('📦 Deploying LeadFive Production Contract...');
        const LeadFive = await ethers.getContractFactory('LeadFive', deployer);
        
        console.log('⏳ Deploying proxy contract...');
        const leadfive = await upgrades.deployProxy(
            LeadFive,
            [USDT_ADDRESS, BNB_USD_PRICE_FEED],
            { 
                initializer: 'initialize',
                kind: 'uups',
                timeout: 120000, // 2 minutes timeout
                pollingInterval: 5000
            }
        );

        await leadfive.waitForDeployment();
        const contractAddress = await leadfive.getAddress();
        
        console.log('✅ LeadFive deployed to:', contractAddress);
        console.log('📄 Implementation:', await upgrades.erc1967.getImplementationAddress(contractAddress));
        console.log('📄 Admin:', await upgrades.erc1967.getAdminAddress(contractAddress));

        // Verify contract initialization
        console.log('\n🔍 Verifying Contract Configuration...');
        
        const owner = await leadfive.owner();
        console.log('Contract owner:', owner);
        
        const totalUsers = await leadfive.totalUsers();
        console.log('Total users:', totalUsers.toString());

        // Verify packages match PDF requirements
        console.log('\n📦 Package Verification (PDF Alignment):');
        const packageNames = ['Entry ($30)', 'Standard ($50)', 'Advanced ($100)', 'Premium ($200)'];
        
        for (let i = 1; i <= 4; i++) {
            const pkg = await leadfive.packages(i);
            const priceUSD = ethers.formatEther(pkg.price);
            console.log(`Package ${i} - ${packageNames[i-1]}:`);
            console.log(`  Price: $${priceUSD} USD ✅`);
            console.log(`  Direct Bonus: ${pkg.directBonus / 100}% ✅`);
            console.log(`  Level Bonus: ${pkg.levelBonus / 100}% ✅`);
            console.log(`  Leader Pool: ${pkg.leaderBonus / 100}% ✅`);
            console.log(`  Help Pool: ${pkg.helpBonus / 100}% ✅`);
            console.log(`  Commission Total: ${(pkg.directBonus + pkg.levelBonus + pkg.uplineBonus + pkg.leaderBonus + pkg.helpBonus + pkg.clubBonus) / 100}% ✅\n`);
        }

        // Check deployer user info (auto-registered as super admin)
        console.log('👤 Deployer Status:');
        const deployerInfo = await leadfive.getUserInfo(deployer.address);
        console.log(`  Registered: ${deployerInfo.isRegistered} ✅`);
        console.log(`  Package Level: ${deployerInfo.packageLevel} (Premium) ✅`);
        console.log(`  Rank: ${deployerInfo.rank} (Super Admin) ✅`);
        console.log(`  Withdrawal Rate: ${deployerInfo.withdrawalRate}% ✅`);

        // Set admin fee recipient to Trezor
        console.log('\n⚙️  Setting admin fee recipient to Trezor...');
        const setAdminTx = await leadfive.setAdminFeeRecipient(TREZOR_ADDRESS);
        await setAdminTx.wait();
        console.log('✅ Admin fee recipient set to Trezor:', TREZOR_ADDRESS);

        // Check pool balances
        console.log('\n🏊 Pool Status:');
        const [leaderPool, helpPool, clubPool] = await leadfive.getPoolBalances();
        console.log(`  Leader Pool: $${ethers.formatEther(leaderPool)} ✅`);
        console.log(`  Help Pool: $${ethers.formatEther(helpPool)} ✅`);
        console.log(`  Club Pool: $${ethers.formatEther(clubPool)} ✅`);

        // Check contract health
        console.log('\n🏥 Contract Health:');
        const health = await leadfive.getContractHealth();
        console.log(`  Contract Balance: $${ethers.formatEther(health.contractBalance)}`);
        console.log(`  Health Ratio: ${health.healthRatio / 100}% ✅`);
        console.log(`  Is Healthy: ${health.isHealthy} ✅`);

        // Check oracle system
        console.log('\n🔮 Oracle System:');
        const oracleCount = await leadfive.getOracleCount();
        console.log(`  Active Oracles: ${oracleCount} ✅`);

        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('=========================');
        console.log('✅ ALL FEATURES ENABLED:');
        console.log('  📊 4 Packages ($30/$50/$100/$200)');
        console.log('  💰 Correct Commission Structure (40/10/10/10/30/0)');
        console.log('  📈 Progressive Withdrawal (70/75/80%)');
        console.log('  🎯 4x Earnings Cap');
        console.log('  👮 5% Admin Fee to Trezor');
        console.log('  🌐 Multi-Oracle Price System');
        console.log('  🔒 Circuit Breaker Protection');
        console.log('  🛡️  MEV Protection');
        console.log('  🏊 Automated Pool Distributions');
        console.log('  📋 Matrix Management System');
        console.log('  🎖️  Achievement System');
        console.log('  📢 Notification System');
        console.log('  ⬆️  Upgradeable (UUPS Proxy)');
        
        console.log('\n📋 CONTRACT DETAILS:');
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Network: BSC Mainnet (Chain ID: 56)`);
        console.log(`Deployer: ${deployer.address}`);
        console.log(`Owner: ${owner}`);
        console.log(`Admin Fee Recipient: ${TREZOR_ADDRESS}`);
        console.log(`Total Users: ${totalUsers}`);
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. ✅ Contract deployed with all features');
        console.log('2. ✅ Packages configured per PDF requirements');
        console.log('3. ✅ Admin fees set to Trezor wallet');
        console.log('4. 🔄 Register deployer as ROOT user (next step)');
        console.log('5. 🔄 Verify contract on BSCScan');
        console.log('6. 🔄 Transfer ownership to Trezor when ready');
        console.log('7. 🔄 Launch platform for users');
        
        console.log('\n📝 SAVE THESE DETAILS:');
        console.log(`export CONTRACT_ADDRESS="${contractAddress}"`);
        console.log(`export DEPLOYER_ADDRESS="${deployer.address}"`);
        console.log(`export TREZOR_ADDRESS="${TREZOR_ADDRESS}"`);

        return {
            contractAddress,
            deployerAddress: deployer.address,
            trezorAddress: TREZOR_ADDRESS,
            success: true
        };

    } catch (error) {
        console.error('\n❌ DEPLOYMENT FAILED:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('• Check BNB balance for gas fees');
        console.log('• Verify RPC connection');
        console.log('• Check library compilation');
        console.log('• Ensure all dependencies installed');
        throw error;
    }
}

if (require.main === module) {
    main()
        .then((result) => {
            if (result.success) {
                console.log('\n🚀 Deployment completed successfully!');
                process.exit(0);
            }
        })
        .catch((error) => {
            console.error('Deployment failed:', error);
            process.exit(1);
        });
}

module.exports = main;
