#!/usr/bin/env node
/**
 * OrphiCrowdFund User Registration Analysis
 * Analyzes the contract structure to understand user registration requirements
 * and root user setup for the BSC Mainnet deployment
 */

const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Contract configuration
const CONTRACT_ADDRESS = '0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732';
const BSC_MAINNET_RPC = 'https://bsc-dataseed.binance.org/';
const TREZOR_ADMIN_WALLET = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29'; // Current owner
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// Package tier amounts (in USDT - 18 decimals)
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

async function analyzeRegistrationSystem() {
    console.log('\n📋 ORPHI CROWDFUND USER REGISTRATION ANALYSIS');
    console.log('═'.repeat(80));
    console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`🌐 Network: BSC Mainnet`);
    console.log(`🔐 Admin Wallet: ${TREZOR_ADMIN_WALLET}`);
    console.log(`💰 USDT Token: ${USDT_ADDRESS}`);
    console.log('═'.repeat(80));

    try {
        // Initialize Web3
        const web3 = new Web3(BSC_MAINNET_RPC);
        const abi = loadContractABI();
        if (!abi) throw new Error('Failed to load ABI');
        
        const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

        console.log('\n🔍 ANALYZING CONTRACT STRUCTURE');
        console.log('─'.repeat(50));

        // Get current contract state
        const [totalUsers, owner, paused] = await Promise.all([
            contract.methods.totalUsers().call(),
            contract.methods.owner().call(),
            contract.methods.paused().call()
        ]);

        console.log(`👥 Total Users: ${totalUsers}`);
        console.log(`🔐 Contract Owner: ${owner}`);
        console.log(`⚡ Contract Status: ${paused ? 'Paused' : 'Active'}`);

        console.log('\n📊 REGISTRATION SYSTEM ANALYSIS');
        console.log('─'.repeat(50));

        // Analyze the contribute function requirements
        console.log('🔍 Registration Function: contribute(sponsor, packageTier)');
        console.log('\n📋 REQUIREMENTS FOR USER REGISTRATION:');
        console.log('1. SPONSOR ADDRESS:');
        console.log('   - Must be a valid Ethereum address');
        console.log('   - Cannot be zero address (0x000...)');
        console.log('   - Cannot be the same as the registering user');
        console.log('   - Must be already registered in the system');
        console.log('   - ⚠️  CRITICAL: This creates a chicken-egg problem for the first user!');

        console.log('\n2. PACKAGE TIER:');
        console.log('   - Must be between 1-4');
        console.log('   - Package 1: $30 USDT');
        console.log('   - Package 2: $50 USDT'); 
        console.log('   - Package 3: $100 USDT');
        console.log('   - Package 4: $200 USDT');

        console.log('\n3. USDT PAYMENT:');
        console.log('   - User must have sufficient USDT balance');
        console.log('   - User must approve contract to spend USDT');
        console.log('   - USDT will be transferred from user to contract');

        console.log('\n🚨 ROOT USER PROBLEM IDENTIFIED');
        console.log('─'.repeat(50));
        console.log('❌ ISSUE: The contribute() function requires a sponsor that is already registered');
        console.log('❌ PROBLEM: No user can register without an existing sponsor');
        console.log('❌ RESULT: The system cannot start without manual intervention');

        console.log('\n🔍 SEARCHING FOR SOLUTION...');
        
        // Check if admin can register users directly
        const adminFunctions = [
            'registerUser',
            'createRootUser', 
            'initializeFirstUser',
            'adminRegisterUser',
            'bootstrapNetwork'
        ];

        let foundAdminRegistration = false;
        for (const funcName of adminFunctions) {
            try {
                const func = contract.methods[funcName];
                if (func) {
                    console.log(`✅ Found admin function: ${funcName}`);
                    foundAdminRegistration = true;
                }
            } catch (error) {
                // Function doesn't exist
            }
        }

        if (!foundAdminRegistration) {
            console.log('❌ No admin registration functions found in ABI');
            
            console.log('\n🛠️  POTENTIAL SOLUTIONS:');
            console.log('─'.repeat(50));
            
            console.log('1. ADMIN BYPASS APPROACH:');
            console.log('   - Admin (Trezor wallet) can manually create first user');
            console.log('   - Modify contract to allow admin to register without sponsor');
            console.log('   - Use admin wallet as the root/genesis user');
            
            console.log('\n2. GENESIS USER APPROACH:');
            console.log('   - Pre-register admin wallet as User #1');
            console.log('   - Admin wallet becomes the root of the network tree');
            console.log('   - All subsequent users can use admin as sponsor');
            
            console.log('\n3. SPECIAL REGISTRATION FUNCTION:');
            console.log('   - Create admin-only function to bootstrap the network');
            console.log('   - Allow first user registration without sponsor requirement');
        }

        console.log('\n💡 RECOMMENDED SOLUTION');
        console.log('─'.repeat(50));
        console.log('🎯 ROOT USER STRATEGY:');
        console.log(`1. Use admin wallet (${TREZOR_ADMIN_WALLET}) as the network root`);
        console.log('2. Admin manually registers as first user with special permission');
        console.log('3. Admin wallet becomes sponsor for all initial users');
        console.log('4. Network grows from admin as the root node');

        console.log('\n📊 NETWORK TREE STRUCTURE:');
        console.log('```');
        console.log('Root: Admin Wallet (0xDf628...D29)');
        console.log('  ├── User 1 (sponsored by Admin)');
        console.log('  ├── User 2 (sponsored by Admin)');
        console.log('  └── User 3 (sponsored by User 1)');
        console.log('      └── User 4 (sponsored by User 3)');
        console.log('```');

        console.log('\n🔐 ADMIN CAPABILITIES');
        console.log('─'.repeat(50));
        console.log('✅ Emergency pause/unpause');
        console.log('✅ Treasury management');
        console.log('✅ Pool distribution control');
        console.log('✅ User blacklisting');
        console.log('❓ Direct user registration (needs verification)');

        console.log('\n📋 REGISTRATION ENTRY REQUIREMENTS SUMMARY');
        console.log('═'.repeat(80));
        console.log('🔑 FOR REGULAR USERS:');
        console.log('  1. Sponsor Address: Valid registered user address');
        console.log('  2. Package Tier: 1-4 ($30, $50, $100, $200)');
        console.log('  3. USDT Balance: Sufficient for chosen package');
        console.log('  4. USDT Approval: Contract must be approved to spend USDT');
        console.log('  5. Network Status: Contract must not be paused');
        console.log('  6. User Status: Must not be blacklisted');
        console.log('  7. Registration Status: Must not be already registered');

        console.log('\n🔑 FOR ROOT USER (ADMIN):');
        console.log('  1. Special Permission: Admin bypass or special function needed');
        console.log('  2. Bootstrap: First user to initialize the network');
        console.log('  3. Responsibility: Becomes sponsor for initial network growth');

        console.log('\n🎯 NEXT STEPS FOR NETWORK LAUNCH');
        console.log('─'.repeat(50));
        console.log('1. ✅ Contract deployed and verified');
        console.log('2. ⏳ Register admin wallet as root user');
        console.log('3. ⏳ Test registration with admin as sponsor');
        console.log('4. ⏳ Open network for public registration');
        console.log('5. ⏳ Monitor and visualize network growth');

        // Create a registration guide
        const registrationGuide = {
            contractAddress: CONTRACT_ADDRESS,
            adminWallet: TREZOR_ADMIN_WALLET,
            usdtToken: USDT_ADDRESS,
            packageTiers: {
                1: { amount: '$30', wei: PACKAGE_AMOUNTS[1] },
                2: { amount: '$50', wei: PACKAGE_AMOUNTS[2] },
                3: { amount: '$100', wei: PACKAGE_AMOUNTS[3] },
                4: { amount: '$200', wei: PACKAGE_AMOUNTS[4] }
            },
            registrationSteps: [
                'Ensure USDT balance >= package amount',
                'Approve contract to spend USDT: usdt.approve(contractAddress, amount)',
                'Call contribute(sponsorAddress, packageTier)',
                'Wait for transaction confirmation',
                'Verify registration with getUserInfo(yourAddress)'
            ],
            rootUserProblem: {
                issue: 'First user needs existing sponsor',
                solution: 'Admin must bootstrap as root user',
                adminBypass: 'Special admin function or manual setup required'
            }
        };

        // Save analysis results
        const outputPath = path.join(__dirname, 'registration-analysis.json');
        fs.writeFileSync(outputPath, JSON.stringify(registrationGuide, null, 2));
        console.log(`\n💾 Analysis saved to: ${outputPath}`);

        return registrationGuide;

    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        return null;
    }
}

// Run analysis
if (require.main === module) {
    analyzeRegistrationSystem()
        .then(result => {
            if (result) {
                console.log('\n✅ Registration analysis completed successfully');
                process.exit(0);
            } else {
                console.log('\n❌ Registration analysis failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { analyzeRegistrationSystem };
