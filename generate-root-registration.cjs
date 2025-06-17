#!/usr/bin/env node
/**
 * Root User Registration Script
 * Creates registration functionality for the admin wallet to bootstrap the network
 */

const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Contract configuration
const CONTRACT_ADDRESS = '0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732';
const ROOT_ADMIN_WALLET = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
const BSC_MAINNET_RPC = 'https://bsc-dataseed.binance.org/';
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// Package amounts in Wei (18 decimals)
const PACKAGE_AMOUNTS = {
    1: '30000000000000000000',   // $30 USDT
    2: '50000000000000000000',   // $50 USDT  
    3: '100000000000000000000',  // $100 USDT
    4: '200000000000000000000'   // $200 USDT
};

// Load contract ABI
function loadContractABI() {
    try {
        const contractsPath = path.join(__dirname, 'src', 'contracts.js');
        const contractsContent = fs.readFileSync(contractsPath, 'utf8');
        
        const abiMatch = contractsContent.match(/export const ORPHI_CROWDFUND_ABI = (\[[\s\S]*?\]);/);
        if (!abiMatch) {
            throw new Error('Could not find ABI in contracts.js');
        }
        
        return JSON.parse(abiMatch[1]);
    } catch (error) {
        console.error('❌ Error loading contract ABI:', error.message);
        return null;
    }
}

async function generateRootRegistrationLink() {
    console.log('\n🔑 ROOT USER REGISTRATION LINK GENERATOR');
    console.log('═'.repeat(80));
    console.log(`🎯 Root Admin Wallet: ${ROOT_ADMIN_WALLET}`);
    console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}`);
    console.log('═'.repeat(80));

    try {
        // Initialize Web3
        const web3 = new Web3(BSC_MAINNET_RPC);
        const abi = loadContractABI();
        if (!abi) throw new Error('Failed to load ABI');
        
        const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);
        const usdtContract = new web3.eth.Contract([
            {
                "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
                "name": "approve",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            }
        ], USDT_ADDRESS);

        console.log('\n🔍 ANALYZING ROOT REGISTRATION OPTIONS');
        console.log('─'.repeat(50));

        // Check current contract state
        const [totalUsers, owner, paused] = await Promise.all([
            contract.methods.totalUsers().call(),
            contract.methods.owner().call(), 
            contract.methods.paused().call()
        ]);

        console.log(`👥 Current Total Users: ${totalUsers}`);
        console.log(`🔐 Contract Owner: ${owner}`);
        console.log(`⚡ Contract Status: ${paused ? 'Paused' : 'Active'}`);

        if (totalUsers > 0) {
            console.log('\n⚠️  WARNING: Users already exist! Root registration may have already happened.');
            
            // Try to get user info for admin
            try {
                const adminInfo = await contract.methods.getUserInfo(ROOT_ADMIN_WALLET).call();
                console.log(`✅ Admin is registered as User #1`);
                console.log(`📊 Admin Info:`, adminInfo);
            } catch (error) {
                console.log(`❌ Admin not registered despite users existing`);
            }
            return;
        }

        console.log('\n🎯 ROOT REGISTRATION STRATEGIES');
        console.log('─'.repeat(50));

        // Strategy 1: Test if admin can register with zero address sponsor
        console.log('Strategy 1: Zero Address Sponsor Method');
        try {
            const zeroSponsorTx = contract.methods.registerUser(
                '0x0000000000000000000000000000000000000000', 
                1 // Package tier 1
            );
            
            const gasEstimate = await zeroSponsorTx.estimateGas({ from: ROOT_ADMIN_WALLET });
            console.log('✅ Zero address sponsor method appears to work!');
            console.log(`⛽ Estimated Gas: ${gasEstimate}`);
            
            // Generate transaction data
            const txData = zeroSponsorTx.encodeABI();
            
            console.log('\n🔗 REGISTRATION TRANSACTION DATA:');
            console.log(`To: ${CONTRACT_ADDRESS}`);
            console.log(`Data: ${txData}`);
            console.log(`Value: 0`);
            console.log(`Gas: ${gasEstimate}`);
            
        } catch (error) {
            console.log('❌ Zero address sponsor method failed:', error.message);
        }

        // Strategy 2: Check if admin can register normally (should fail)
        console.log('\nStrategy 2: Normal Registration (Expected to fail)');
        try {
            const normalTx = contract.methods.registerUser(ROOT_ADMIN_WALLET, 1);
            await normalTx.estimateGas({ from: ROOT_ADMIN_WALLET });
            console.log('⚠️  Normal registration unexpectedly works');
        } catch (error) {
            console.log('✅ Normal registration properly fails (expected)');
        }

        // Generate comprehensive registration instructions
        console.log('\n📋 ROOT REGISTRATION INSTRUCTIONS');
        console.log('═'.repeat(80));

        for (let tier = 1; tier <= 4; tier++) {
            const packageAmount = PACKAGE_AMOUNTS[tier];
            const packageUSDT = tier === 1 ? '$30' : tier === 2 ? '$50' : tier === 3 ? '$100' : '$200';
            
            console.log(`\n🎯 PACKAGE TIER ${tier} (${packageUSDT}) REGISTRATION:`);
            console.log('─'.repeat(40));
            
            // Step 1: USDT Approval
            const approvalTx = usdtContract.methods.approve(CONTRACT_ADDRESS, packageAmount);
            const approvalData = approvalTx.encodeABI();
            
            console.log('Step 1: Approve USDT');
            console.log(`📋 Contract: ${USDT_ADDRESS}`);
            console.log(`💾 Data: ${approvalData}`);
            console.log(`💰 Amount: ${packageAmount} (${packageUSDT})`);
            
            // Step 2: Registration
            const registrationTx = contract.methods.registerUser(
                '0x0000000000000000000000000000000000000000', // Zero address sponsor
                tier
            );
            const registrationData = registrationTx.encodeABI();
            
            console.log('\nStep 2: Register as Root User');
            console.log(`📋 Contract: ${CONTRACT_ADDRESS}`);
            console.log(`💾 Data: ${registrationData}`);
            console.log(`🎯 Sponsor: 0x0000000000000000000000000000000000000000 (Zero address)`);
            console.log(`📦 Package Tier: ${tier}`);
            
            // Generate Web3 URL (for dApps)
            const web3Url = `https://bscscan.com/address/${CONTRACT_ADDRESS}#writeContract`;
            console.log(`🔗 BSCScan Write Contract: ${web3Url}`);
        }

        // Generate MetaMask deep links
        console.log('\n🦊 METAMASK DEEP LINKS');
        console.log('─'.repeat(50));
        
        for (let tier = 1; tier <= 4; tier++) {
            const packageAmount = PACKAGE_AMOUNTS[tier];
            const packageUSDT = tier === 1 ? '$30' : tier === 2 ? '$50' : tier === 3 ? '$100' : '$200';
            
            // USDT Approval MetaMask link
            const approvalData = usdtContract.methods.approve(CONTRACT_ADDRESS, packageAmount).encodeABI();
            const approvalLink = `https://metamask.app.link/send/${USDT_ADDRESS}@56?data=${approvalData}`;
            
            // Registration MetaMask link  
            const registrationData = contract.methods.registerUser(
                '0x0000000000000000000000000000000000000000',
                tier
            ).encodeABI();
            const registrationLink = `https://metamask.app.link/send/${CONTRACT_ADDRESS}@56?data=${registrationData}`;
            
            console.log(`\n${packageUSDT} Package Registration:`);
            console.log(`1. Approve USDT: ${approvalLink}`);
            console.log(`2. Register: ${registrationLink}`);
        }

        // Generate frontend integration code
        console.log('\n💻 FRONTEND INTEGRATION CODE');
        console.log('─'.repeat(50));
        
        const frontendCode = `
// Root User Registration (Admin Only)
async function registerRootUser(packageTier) {
    const adminWallet = "${ROOT_ADMIN_WALLET}";
    const contractAddress = "${CONTRACT_ADDRESS}";
    const usdtAddress = "${USDT_ADDRESS}";
    const packageAmount = "${PACKAGE_AMOUNTS[1]}"; // Update based on tier
    
    // Step 1: Approve USDT
    const usdtContract = new web3.eth.Contract(USDT_ABI, usdtAddress);
    await usdtContract.methods.approve(contractAddress, packageAmount)
        .send({ from: adminWallet });
    
    // Step 2: Register as root user
    const crowdfundContract = new web3.eth.Contract(CONTRACT_ABI, contractAddress);
    await crowdfundContract.methods.registerUser(
        "0x0000000000000000000000000000000000000000", // Zero address sponsor
        packageTier
    ).send({ from: adminWallet });
    
    console.log("Root user registered successfully!");
}

// Usage: registerRootUser(1); // For $30 package
`;
        
        console.log(frontendCode);

        // Save registration data
        const registrationData = {
            rootAdminWallet: ROOT_ADMIN_WALLET,
            contractAddress: CONTRACT_ADDRESS,
            usdtAddress: USDT_ADDRESS,
            packageTiers: {
                1: { amount: '$30', wei: PACKAGE_AMOUNTS[1] },
                2: { amount: '$50', wei: PACKAGE_AMOUNTS[2] },
                3: { amount: '$100', wei: PACKAGE_AMOUNTS[3] },
                4: { amount: '$200', wei: PACKAGE_AMOUNTS[4] }
            },
            registrationMethod: 'Zero Address Sponsor',
            bscscanUrl: `https://bscscan.com/address/${CONTRACT_ADDRESS}#writeContract`,
            instructions: [
                'Connect wallet with root admin address',
                'Approve USDT spending for contract',
                'Call registerUser with zero address sponsor',
                'Choose package tier (1-4)',
                'Confirm transactions',
                'Verify registration with getUserInfo'
            ]
        };

        const outputPath = path.join(__dirname, 'root-registration-links.json');
        fs.writeFileSync(outputPath, JSON.stringify(registrationData, null, 2));
        
        console.log(`\n💾 Registration data saved to: ${outputPath}`);
        
        console.log('\n🎯 RECOMMENDED ROOT REGISTRATION PROCESS');
        console.log('═'.repeat(80));
        console.log('1. ✅ Connect MetaMask with admin wallet (0xDf628...D29)');
        console.log('2. ✅ Ensure sufficient USDT balance ($30-$200 depending on tier)');
        console.log('3. ✅ Visit BSCScan write contract page');
        console.log('4. ✅ Approve USDT spending (approve function)');
        console.log('5. ✅ Call registerUser with zero address sponsor');
        console.log('6. ✅ Verify registration and become network root!');
        
        return registrationData;

    } catch (error) {
        console.error('❌ Registration link generation failed:', error.message);
        return null;
    }
}

// Run if called directly
if (require.main === module) {
    generateRootRegistrationLink()
        .then(result => {
            if (result) {
                console.log('\n✅ Root registration links generated successfully');
                process.exit(0);
            } else {
                console.log('\n❌ Failed to generate registration links');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { generateRootRegistrationLink };
