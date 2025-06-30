require('dotenv').config();
const { ethers } = require('hardhat');

async function comprehensiveProjectAnalysis() {
    console.log('🔍 COMPREHENSIVE PROJECT ANALYSIS');
    console.log('='.repeat(80));
    console.log('📋 Analyzing LeadFive project structure, configuration, and deployment status');
    console.log('='.repeat(80));
    
    const issues = [];
    const successes = [];
    
    try {
        // 1. Environment Configuration Check
        console.log('\n1️⃣ ENVIRONMENT CONFIGURATION CHECK');
        console.log('-'.repeat(50));
        
        const requiredEnvVars = [
            'DEPLOYER_PRIVATE_KEY',
            'BSC_MAINNET_RPC_URL',
            'MAINNET_CONTRACT_ADDRESS',
            'VITE_USDT_ADDRESS',
            'TREZOR_OWNER_ADDRESS',
            'BSCSCAN_API_KEY'
        ];
        
        requiredEnvVars.forEach(varName => {
            if (process.env[varName]) {
                console.log(`✅ ${varName}: Set`);
                successes.push(`Environment variable ${varName} configured`);
            } else {
                console.log(`❌ ${varName}: Missing`);
                issues.push(`Environment variable ${varName} not set`);
            }
        });
        
        // 2. Contract Compilation Check
        console.log('\n2️⃣ CONTRACT COMPILATION CHECK');
        console.log('-'.repeat(50));
        
        try {
            const LeadFive = await ethers.getContractFactory("LeadFive");
            console.log('✅ LeadFive contract compiles successfully');
            successes.push('Main contract compilation successful');
            
            // Check if it has USDT-only register function
            const registerFunction = LeadFive.interface.getFunction("register");
            if (registerFunction.inputs.length === 2) {
                console.log(`✅ USDT-only register function confirmed (${registerFunction.inputs.length} parameters)`);
                successes.push('USDT-only register function implemented');
            } else {
                console.log(`❌ Register function has ${registerFunction.inputs.length} parameters (expected 2)`);
                issues.push('Register function does not match USDT-only specification');
            }
        } catch (error) {
            console.log(`❌ Contract compilation failed: ${error.message}`);
            issues.push(`Contract compilation error: ${error.message}`);
        }
        
        // 3. Network Connectivity Check
        console.log('\n3️⃣ NETWORK CONNECTIVITY CHECK');
        console.log('-'.repeat(50));
        
        try {
            const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
            const blockNumber = await provider.getBlockNumber();
            console.log(`✅ BSC Mainnet connection successful (Block: ${blockNumber})`);
            successes.push('BSC Mainnet RPC connection working');
        } catch (error) {
            console.log(`❌ BSC Mainnet connection failed: ${error.message}`);
            issues.push(`Network connectivity issue: ${error.message}`);
        }
        
        // 4. Deployed Contract Status Check
        console.log('\n4️⃣ DEPLOYED CONTRACT STATUS CHECK');
        console.log('-'.repeat(50));
        
        if (process.env.MAINNET_CONTRACT_ADDRESS) {
            try {
                const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
                const contractAddress = process.env.MAINNET_CONTRACT_ADDRESS;
                
                // Check if contract exists
                const code = await provider.getCode(contractAddress);
                if (code !== '0x') {
                    console.log('✅ Contract deployed at specified address');
                    successes.push('Contract deployment confirmed');
                    
                    // Test contract functions
                    const LeadFive = await ethers.getContractFactory("LeadFive");
                    const contract = LeadFive.attach(contractAddress).connect(provider);
                    
                    try {
                        const owner = await contract.owner();
                        console.log(`✅ Contract owner: ${owner}`);
                        successes.push('Contract owner function accessible');
                        
                        const totalUsers = await contract.getTotalUsers();
                        console.log(`✅ Total users: ${totalUsers}`);
                        successes.push('Contract state functions working');
                        
                        const usdt = await contract.usdt();
                        console.log(`✅ USDT address: ${usdt}`);
                        if (usdt.toLowerCase() === process.env.VITE_USDT_ADDRESS.toLowerCase()) {
                            console.log('✅ USDT address matches configuration');
                            successes.push('USDT address correctly configured');
                        } else {
                            console.log('❌ USDT address mismatch');
                            issues.push('USDT address does not match environment configuration');
                        }
                        
                    } catch (error) {
                        console.log(`❌ Contract function calls failed: ${error.message}`);
                        issues.push(`Contract function access error: ${error.message}`);
                    }
                } else {
                    console.log('❌ No contract found at specified address');
                    issues.push('Contract not deployed at specified address');
                }
            } catch (error) {
                console.log(`❌ Contract status check failed: ${error.message}`);
                issues.push(`Contract status check error: ${error.message}`);
            }
        }
        
        // 5. Wallet Configuration Check
        console.log('\n5️⃣ WALLET CONFIGURATION CHECK');
        console.log('-'.repeat(50));
        
        if (process.env.DEPLOYER_PRIVATE_KEY) {
            try {
                const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY);
                console.log(`✅ Deployer address: ${wallet.address}`);
                
                const provider = new ethers.JsonRpcProvider(process.env.BSC_MAINNET_RPC_URL);
                const balance = await provider.getBalance(wallet.address);
                console.log(`✅ Deployer balance: ${ethers.formatEther(balance)} BNB`);
                
                if (parseFloat(ethers.formatEther(balance)) > 0.01) {
                    console.log('✅ Sufficient balance for transactions');
                    successes.push('Deployer wallet has sufficient funds');
                } else {
                    console.log('⚠️  Low balance - may need more BNB for transactions');
                    issues.push('Deployer wallet has low BNB balance');
                }
                
                successes.push('Deployer wallet configuration valid');
            } catch (error) {
                console.log(`❌ Wallet configuration invalid: ${error.message}`);
                issues.push(`Wallet configuration error: ${error.message}`);
            }
        }
        
        // 6. File Structure Check
        console.log('\n6️⃣ FILE STRUCTURE CHECK');
        console.log('-'.repeat(50));
        
        const fs = require('fs');
        const criticalFiles = [
            'contracts/LeadFive.sol',
            'contracts/libraries/CoreOptimized.sol',
            'contracts/libraries/Errors.sol',
            'hardhat.config.js',
            '.env',
            'package.json'
        ];
        
        criticalFiles.forEach(file => {
            if (fs.existsSync(file)) {
                console.log(`✅ ${file}: Present`);
                successes.push(`Critical file ${file} exists`);
            } else {
                console.log(`❌ ${file}: Missing`);
                issues.push(`Critical file ${file} missing`);
            }
        });
        
        // 7. Dependencies Check
        console.log('\n7️⃣ DEPENDENCIES CHECK');
        console.log('-'.repeat(50));
        
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const requiredDeps = [
                '@openzeppelin/contracts-upgradeable',
                'hardhat',
                'ethers',
                '@nomicfoundation/hardhat-ethers'
            ];
            
            requiredDeps.forEach(dep => {
                if (packageJson.devDependencies[dep] || packageJson.dependencies[dep]) {
                    console.log(`✅ ${dep}: Installed`);
                    successes.push(`Dependency ${dep} available`);
                } else {
                    console.log(`❌ ${dep}: Missing`);
                    issues.push(`Required dependency ${dep} not installed`);
                }
            });
        } catch (error) {
            console.log(`❌ Package.json read error: ${error.message}`);
            issues.push('Cannot read package.json');
        }
        
        // SUMMARY
        console.log('\n' + '='.repeat(80));
        console.log('📊 ANALYSIS SUMMARY');
        console.log('='.repeat(80));
        
        console.log(`\n✅ SUCCESSES (${successes.length}):`);
        successes.forEach((success, index) => {
            console.log(`   ${index + 1}. ${success}`);
        });
        
        console.log(`\n❌ ISSUES FOUND (${issues.length}):`);
        issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
        
        // RECOMMENDATIONS
        console.log('\n🎯 NEXT STEPS RECOMMENDATIONS:');
        console.log('-'.repeat(50));
        
        if (issues.length === 0) {
            console.log('✅ Project is ready for production deployment!');
            console.log('   Next steps:');
            console.log('   1. Run upgrade script on BSC mainnet');
            console.log('   2. Verify contracts on BSCScan');
            console.log('   3. Test functionality with small amounts');
            console.log('   4. Transfer ownership to Trezor when ready');
        } else {
            console.log('⚠️  Issues need to be resolved before production deployment:');
            
            const criticalIssues = issues.filter(issue => 
                issue.includes('compilation') || 
                issue.includes('contract') || 
                issue.includes('environment')
            );
            
            if (criticalIssues.length > 0) {
                console.log('\n🚨 CRITICAL ISSUES (resolve immediately):');
                criticalIssues.forEach((issue, index) => {
                    console.log(`   ${index + 1}. ${issue}`);
                });
            }
            
            const minorIssues = issues.filter(issue => !criticalIssues.includes(issue));
            if (minorIssues.length > 0) {
                console.log('\n⚠️  MINOR ISSUES (can be addressed later):');
                minorIssues.forEach((issue, index) => {
                    console.log(`   ${index + 1}. ${issue}`);
                });
            }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('🏁 ANALYSIS COMPLETE');
        console.log('='.repeat(80));
        
        return {
            issues,
            successes,
            isReady: issues.length === 0,
            criticalIssues: issues.filter(issue => 
                issue.includes('compilation') || 
                issue.includes('contract') || 
                issue.includes('environment')
            ).length === 0
        };
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        return { issues: [`Analysis error: ${error.message}`], successes: [], isReady: false };
    }
}

comprehensiveProjectAnalysis()
    .then((result) => {
        process.exit(result.isReady ? 0 : 1);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
