import { ethers } from 'ethers';

// Configuration
const CONTRACT_ADDRESS = '0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569';
const BSC_RPC = 'https://bsc-dataseed.binance.org/';

// Contract ABI for the setPackageInfo function
const CONTRACT_ABI = [
    'function setPackageInfo(uint8 packageId, uint256 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus) external',
    'function packages(uint8) view returns (uint256 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus)',
    'function owner() view returns (address)'
];

// Package configurations to set
const PACKAGES_TO_SET = [
    {
        id: 0,
        name: "Entry Level ($30)",
        price: "111000000000000000", // 0.111 BNB
        directBonus: 4000,
        levelBonus: 1000,
        uplineBonus: 1000,
        leaderBonus: 1000,
        helpBonus: 3000,
        clubBonus: 0
    },
    {
        id: 1,
        name: "Standard ($50)",
        price: "185000000000000000", // 0.185 BNB
        directBonus: 4000,
        levelBonus: 1000,
        uplineBonus: 1000,
        leaderBonus: 1000,
        helpBonus: 3000,
        clubBonus: 0
    },
    {
        id: 2,
        name: "Advanced ($100)",
        price: "370000000000000000", // 0.370 BNB
        directBonus: 4000,
        levelBonus: 1000,
        uplineBonus: 1000,
        leaderBonus: 1000,
        helpBonus: 3000,
        clubBonus: 0
    },
    {
        id: 3,
        name: "Premium ($200)",
        price: "741000000000000000", // 0.741 BNB
        directBonus: 4000,
        levelBonus: 1000,
        uplineBonus: 1000,
        leaderBonus: 1000,
        helpBonus: 3000,
        clubBonus: 0
    }
];

async function executeContractSetup() {
    console.log('🚀 LEADFIVE CONTRACT SETUP EXECUTOR');
    console.log('===================================\n');

    // Check if private key is provided
    const privateKey = process.argv[2];
    if (!privateKey) {
        console.log('❌ No private key provided!');
        console.log('\n📋 USAGE:');
        console.log('node setup-executor.js YOUR_PRIVATE_KEY');
        console.log('\n⚠️  SECURITY WARNING:');
        console.log('• Only use this on testnet or with deployer wallet');
        console.log('• Never share your private key');
        console.log('• Delete this script after use if it contains keys\n');
        
        console.log('🔗 ALTERNATIVE: Manual BSCScan Setup');
        console.log('=====================================');
        console.log('1. Go to: https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#writeContract');
        console.log('2. Connect your wallet');
        console.log('3. Use setPackageInfo function with these values:\n');
        
        PACKAGES_TO_SET.forEach(pkg => {
            console.log(`${pkg.name}:`);
            console.log(`  packageId: ${pkg.id}`);
            console.log(`  price: ${pkg.price}`);
            console.log(`  directBonus: ${pkg.directBonus}`);
            console.log(`  levelBonus: ${pkg.levelBonus}`);
            console.log(`  uplineBonus: ${pkg.uplineBonus}`);
            console.log(`  leaderBonus: ${pkg.leaderBonus}`);
            console.log(`  helpBonus: ${pkg.helpBonus}`);
            console.log(`  clubBonus: ${pkg.clubBonus}\n`);
        });
        
        return;
    }

    try {
        console.log('🔗 Connecting to BSC...');
        const provider = new ethers.JsonRpcProvider(BSC_RPC);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

        console.log(`💰 Wallet Address: ${wallet.address}`);
        
        // Check if wallet is the owner
        const owner = await contract.owner();
        console.log(`👑 Contract Owner: ${owner}`);
        
        if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
            console.log('❌ ERROR: Wallet is not the contract owner!');
            console.log('Only the contract owner can set package information.');
            return;
        }
        
        console.log('✅ Wallet is confirmed as contract owner\n');

        // Check current balance
        const balance = await provider.getBalance(wallet.address);
        console.log(`💳 Wallet Balance: ${ethers.formatEther(balance)} BNB\n`);

        if (parseFloat(ethers.formatEther(balance)) < 0.01) {
            console.log('⚠️  WARNING: Low BNB balance. You may need more BNB for gas fees.\n');
        }

        // Execute package setups
        for (let i = 0; i < PACKAGES_TO_SET.length; i++) {
            const pkg = PACKAGES_TO_SET[i];
            
            console.log(`📦 Setting up ${pkg.name}...`);
            console.log(`   Package ID: ${pkg.id}`);
            console.log(`   Price: ${ethers.formatEther(pkg.price)} BNB`);
            console.log(`   Commission: ${pkg.directBonus/100}%/${pkg.levelBonus/100}%/${pkg.uplineBonus/100}%/${pkg.leaderBonus/100}%/${pkg.helpBonus/100}%/${pkg.clubBonus/100}%`);

            try {
                // Estimate gas
                const gasEstimate = await contract.setPackageInfo.estimateGas(
                    pkg.id,
                    pkg.price,
                    pkg.directBonus,
                    pkg.levelBonus,
                    pkg.uplineBonus,
                    pkg.leaderBonus,
                    pkg.helpBonus,
                    pkg.clubBonus
                );

                console.log(`   Estimated Gas: ${gasEstimate.toString()}`);

                // Execute transaction
                const tx = await contract.setPackageInfo(
                    pkg.id,
                    pkg.price,
                    pkg.directBonus,
                    pkg.levelBonus,
                    pkg.uplineBonus,
                    pkg.leaderBonus,
                    pkg.helpBonus,
                    pkg.clubBonus,
                    { gasLimit: gasEstimate * 120n / 100n } // Add 20% buffer
                );

                console.log(`   Transaction Hash: ${tx.hash}`);
                console.log(`   ⏳ Waiting for confirmation...`);

                const receipt = await tx.wait();
                console.log(`   ✅ Confirmed! Block: ${receipt.blockNumber}`);
                console.log(`   Gas Used: ${receipt.gasUsed.toString()}\n`);

                // Verify the package was set correctly
                const packageInfo = await contract.packages(pkg.id);
                const priceInBNB = ethers.formatEther(packageInfo.price);
                console.log(`   🔍 Verification: Price set to ${priceInBNB} BNB ✅\n`);

            } catch (error) {
                console.log(`   ❌ Failed to set package ${pkg.id}: ${error.message}\n`);
                return;
            }
        }

        console.log('🎉 ALL PACKAGES SUCCESSFULLY CONFIGURED!');
        console.log('========================================\n');
        console.log('✅ Next Steps:');
        console.log('1. Run: node verify-pdf-packages.js');
        console.log('2. Run: node test-registration.js');
        console.log('3. Transfer ownership to Trezor when ready');
        console.log('4. Platform ready for users! 🚀');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('• Check your private key is correct');
        console.log('• Ensure you have enough BNB for gas');
        console.log('• Verify you are the contract owner');
        console.log('• Try again with higher gas limit');
    }
}

executeContractSetup();
