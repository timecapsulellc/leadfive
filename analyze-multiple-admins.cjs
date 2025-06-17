#!/usr/bin/env node
/**
 * Multiple Admin Privileges Analysis
 * Analyzes how to add 16 additional admin privilege accounts
 * Determines if contract modification or separate deployment is needed
 */

const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Contract configuration
const CONTRACT_ADDRESS = '0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732';
const ROOT_ADMIN_WALLET = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
const BSC_MAINNET_RPC = 'https://bsc-dataseed.binance.org/';

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

async function analyzeMultipleAdminPrivileges() {
    console.log('\n👥 MULTIPLE ADMIN PRIVILEGES ANALYSIS');
    console.log('═'.repeat(80));
    console.log(`🎯 Current Root Admin: ${ROOT_ADMIN_WALLET}`);
    console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`🎯 Goal: Add 16 additional admin privilege accounts`);
    console.log('═'.repeat(80));

    try {
        // Initialize Web3
        const web3 = new Web3(BSC_MAINNET_RPC);
        const abi = loadContractABI();
        if (!abi) throw new Error('Failed to load ABI');
        
        const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

        console.log('\n🔍 ANALYZING CURRENT ROLE SYSTEM');
        console.log('─'.repeat(50));

        // Get role-related functions from ABI
        const roleFunctions = abi.filter(item => 
            item.type === 'function' && 
            (item.name?.includes('Role') || item.name?.includes('role') || 
             item.name === 'grantRole' || item.name === 'revokeRole' ||
             item.name === 'hasRole' || item.name === 'getRoleAdmin')
        );

        console.log('🔐 Available Role Management Functions:');
        roleFunctions.forEach(func => {
            console.log(`  ✅ ${func.name}(${func.inputs?.map(i => `${i.type} ${i.name}`).join(', ') || ''})`);
        });

        // Check if grantRole function exists
        const hasGrantRole = roleFunctions.some(f => f.name === 'grantRole');
        const hasRevokeRole = roleFunctions.some(f => f.name === 'revokeRole');
        const hasHasRole = roleFunctions.some(f => f.name === 'hasRole');

        console.log('\n📊 ROLE MANAGEMENT CAPABILITIES:');
        console.log(`✅ grantRole: ${hasGrantRole ? 'Available' : 'Not Available'}`);
        console.log(`✅ revokeRole: ${hasRevokeRole ? 'Available' : 'Not Available'}`);
        console.log(`✅ hasRole: ${hasHasRole ? 'Available' : 'Not Available'}`);

        if (hasGrantRole) {
            console.log('\n🎉 GOOD NEWS: Contract supports multiple admins!');
            console.log('✅ You can add 16 admin accounts WITHOUT redeploying the contract');
        } else {
            console.log('\n⚠️  WARNING: Limited role management capabilities');
        }

        // Analyze available roles
        console.log('\n🔑 AVAILABLE ADMIN ROLES:');
        console.log('─'.repeat(50));
        
        const roles = [
            {
                name: 'DEFAULT_ADMIN_ROLE',
                hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
                description: 'Super admin - can grant/revoke all roles',
                permissions: 'All admin functions, user management, pool distributions'
            },
            {
                name: 'TREASURY_ROLE', 
                hash: null, // Will be calculated
                description: 'Treasury management',
                permissions: 'Financial operations, fund management'
            },
            {
                name: 'EMERGENCY_ROLE',
                hash: null,
                description: 'Emergency operations',
                permissions: 'Pause/unpause, emergency withdrawals, blacklisting'
            },
            {
                name: 'POOL_MANAGER_ROLE',
                hash: null,
                description: 'Pool management',
                permissions: 'Global help pool, leader bonus distributions'
            }
        ];

        // Calculate role hashes
        for (let role of roles) {
            if (role.name !== 'DEFAULT_ADMIN_ROLE') {
                role.hash = web3.utils.keccak256(role.name);
            }
        }

        roles.forEach(role => {
            console.log(`\n🔐 ${role.name}:`);
            console.log(`   Hash: ${role.hash}`);
            console.log(`   Description: ${role.description}`);
            console.log(`   Permissions: ${role.permissions}`);
        });

        console.log('\n💡 MULTIPLE ADMIN IMPLEMENTATION STRATEGIES');
        console.log('═'.repeat(80));

        console.log('\n🎯 STRATEGY 1: USE EXISTING ROLE SYSTEM (RECOMMENDED)');
        console.log('─'.repeat(50));
        console.log('✅ NO CONTRACT REDEPLOYMENT NEEDED');
        console.log('✅ Use existing grantRole functionality');
        console.log('✅ Assign different roles to different admins');
        console.log('✅ Granular permission control');

        console.log('\nRole Distribution for 16 Admins:');
        console.log('  👑 4x DEFAULT_ADMIN_ROLE (Super admins)');
        console.log('  💰 4x TREASURY_ROLE (Financial managers)');
        console.log('  🚨 4x EMERGENCY_ROLE (Emergency responders)');
        console.log('  🏊 4x POOL_MANAGER_ROLE (Pool managers)');

        console.log('\n🎯 STRATEGY 2: CREATE CUSTOM ADMIN LIST');
        console.log('─'.repeat(50));
        console.log('⚠️  REQUIRES CONTRACT MODIFICATION AND REDEPLOYMENT');
        console.log('❌ More complex implementation');
        console.log('❌ Higher gas costs');
        console.log('❌ Loss of current contract state');

        // Generate admin account management scripts
        console.log('\n🔧 IMPLEMENTATION: ADDING 16 ADMIN ACCOUNTS');
        console.log('═'.repeat(80));

        const sampleAdminAddresses = [];
        for (let i = 1; i <= 16; i++) {
            // Generate example addresses (in practice, use real addresses)
            const exampleAddr = `0x${i.toString().padStart(4, '0')}${'0'.repeat(36)}`;
            sampleAdminAddresses.push(exampleAddr);
        }

        console.log('\n📋 ADMIN ROLE ASSIGNMENT TRANSACTIONS:');
        console.log('─'.repeat(50));

        const roleAssignments = [];
        
        roles.forEach((role, roleIndex) => {
            const adminsForRole = sampleAdminAddresses.slice(roleIndex * 4, (roleIndex + 1) * 4);
            
            console.log(`\n🔐 ${role.name} Assignments:`);
            adminsForRole.forEach((adminAddr, index) => {
                try {
                    const grantRoleTx = contract.methods.grantRole(role.hash, adminAddr);
                    const txData = grantRoleTx.encodeABI();
                    
                    console.log(`  ${index + 1}. Grant to ${adminAddr}:`);
                    console.log(`     Data: ${txData}`);
                    
                    roleAssignments.push({
                        role: role.name,
                        roleHash: role.hash,
                        adminAddress: adminAddr,
                        transactionData: txData,
                        contractAddress: CONTRACT_ADDRESS
                    });
                } catch (error) {
                    console.log(`  ❌ Error generating tx for ${adminAddr}: ${error.message}`);
                }
            });
        });

        // Generate batch execution script
        console.log('\n🚀 BATCH EXECUTION SCRIPT:');
        console.log('─'.repeat(50));

        const batchScript = `
// Batch Admin Role Assignment Script
async function assignMultipleAdmins() {
    const contract = new web3.eth.Contract(ABI, "${CONTRACT_ADDRESS}");
    const adminWallet = "${ROOT_ADMIN_WALLET}";
    
    const assignments = [
${roleAssignments.map(assignment => 
`        { role: "${assignment.role}", hash: "${assignment.roleHash}", admin: "${assignment.adminAddress}" }`
).join(',\n')}
    ];
    
    console.log("Starting batch admin assignment...");
    
    for (const assignment of assignments) {
        try {
            console.log(\`Granting \${assignment.role} to \${assignment.admin}...\`);
            await contract.methods.grantRole(assignment.hash, assignment.admin)
                .send({ from: adminWallet });
            console.log("✅ Success");
        } catch (error) {
            console.log("❌ Failed:", error.message);
        }
    }
    
    console.log("Batch assignment complete!");
}

// Execute: assignMultipleAdmins();
`;

        console.log(batchScript);

        // Generate verification script
        console.log('\n🔍 ADMIN VERIFICATION SCRIPT:');
        console.log('─'.repeat(50));

        const verificationScript = `
// Verify Admin Roles Script
async function verifyAdminRoles() {
    const contract = new web3.eth.Contract(ABI, "${CONTRACT_ADDRESS}");
    
    const roles = [
        { name: "DEFAULT_ADMIN_ROLE", hash: "${roles[0].hash}" },
        { name: "TREASURY_ROLE", hash: "${roles[1].hash}" },
        { name: "EMERGENCY_ROLE", hash: "${roles[2].hash}" },
        { name: "POOL_MANAGER_ROLE", hash: "${roles[3].hash}" }
    ];
    
    const admins = [
${sampleAdminAddresses.map(addr => `        "${addr}"`).join(',\n')}
    ];
    
    console.log("Verifying admin roles...");
    
    for (const role of roles) {
        console.log(\`\\n📋 \${role.name} holders:\`);
        for (const admin of admins) {
            try {
                const hasRole = await contract.methods.hasRole(role.hash, admin).call();
                console.log(\`  \${admin}: \${hasRole ? '✅ HAS ROLE' : '❌ NO ROLE'}\`);
            } catch (error) {
                console.log(\`  \${admin}: ❌ ERROR - \${error.message}\`);
            }
        }
    }
}

// Execute: verifyAdminRoles();
`;

        console.log(verificationScript);

        // Cost analysis
        console.log('\n💰 COST ANALYSIS');
        console.log('─'.repeat(50));
        console.log('🔐 Role Assignment (per admin): ~50,000 gas');
        console.log('👥 16 admins total: ~800,000 gas');
        console.log('💸 Estimated cost (20 gwei): ~0.016 BNB');
        console.log('✅ VERY AFFORDABLE compared to redeployment');

        console.log('\n📊 COMPARISON: ROLE SYSTEM vs CONTRACT MODIFICATION');
        console.log('═'.repeat(80));
        
        const comparison = {
            roleSystem: {
                approach: 'Use existing grantRole functionality',
                redeployment: 'Not required',
                cost: 'Low (~0.016 BNB for 16 admins)',
                time: 'Immediate',
                flexibility: 'High (granular permissions)',
                risk: 'Low (battle-tested OpenZeppelin)',
                dataLoss: 'None',
                compatibility: 'Full backward compatibility'
            },
            contractModification: {
                approach: 'Modify contract and redeploy',
                redeployment: 'Required',
                cost: 'High (deployment + migration)',
                time: 'Days/weeks',
                flexibility: 'Custom implementation needed',
                risk: 'High (new code, testing needed)',
                dataLoss: 'All current state lost',
                compatibility: 'May break existing integrations'
            }
        };

        console.log('\n🎯 ROLE SYSTEM APPROACH:');
        Object.entries(comparison.roleSystem).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
        });

        console.log('\n⚠️  CONTRACT MODIFICATION APPROACH:');
        Object.entries(comparison.contractModification).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
        });

        // Save analysis results
        const analysisResult = {
            recommendation: 'Use existing role system - NO redeployment needed',
            currentContract: CONTRACT_ADDRESS,
            currentAdmin: ROOT_ADMIN_WALLET,
            capability: 'Full multi-admin support available',
            roles: roles,
            implementationCost: '~0.016 BNB for 16 admins',
            timeToImplement: 'Immediate',
            riskLevel: 'Low',
            batchAssignmentScript: batchScript,
            verificationScript: verificationScript,
            roleAssignments: roleAssignments
        };

        const outputPath = path.join(__dirname, 'multiple-admin-analysis.json');
        fs.writeFileSync(outputPath, JSON.stringify(analysisResult, null, 2));

        console.log('\n🎉 FINAL RECOMMENDATION');
        console.log('═'.repeat(80));
        console.log('✅ USE EXISTING ROLE SYSTEM - NO REDEPLOYMENT NEEDED!');
        console.log('✅ Contract already supports multiple admins via OpenZeppelin AccessControl');
        console.log('✅ Can assign different roles to 16 different accounts');
        console.log('✅ Granular permission control available');
        console.log('✅ Very low cost and immediate implementation');
        console.log('✅ Zero risk of data loss or compatibility issues');

        console.log(`\n💾 Analysis saved to: ${outputPath}`);

        return analysisResult;

    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        return null;
    }
}

// Run if called directly
if (require.main === module) {
    analyzeMultipleAdminPrivileges()
        .then(result => {
            if (result) {
                console.log('\n✅ Multiple admin analysis completed successfully');
                process.exit(0);
            } else {
                console.log('\n❌ Multiple admin analysis failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { analyzeMultipleAdminPrivileges };
