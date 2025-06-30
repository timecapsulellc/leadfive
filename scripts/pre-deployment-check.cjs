#!/usr/bin/env node

/**
 * 🔧 PRE-DEPLOYMENT VERIFICATION SCRIPT
 * 
 * This script verifies that everything is ready for fresh BSC Mainnet deployment
 * with the corrected marketing plan allocations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🔧 PRE-DEPLOYMENT VERIFICATION');
console.log('=' .repeat(60));
console.log(`📅 Check Date: ${new Date().toLocaleDateString()}`);

let allChecksPass = true;
const issues = [];

// Check 1: Environment Setup
console.log('\n📋 ENVIRONMENT CHECKS');
console.log('-'.repeat(40));

try {
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion >= 18) {
        console.log(`✅ Node.js Version: ${nodeVersion}`);
    } else {
        console.log(`❌ Node.js Version: ${nodeVersion} (Need 18+)`);
        issues.push('Upgrade Node.js to version 18 or higher');
        allChecksPass = false;
    }
} catch (error) {
    console.log(`❌ Node.js check failed: ${error.message}`);
    issues.push('Node.js installation issue');
    allChecksPass = false;
}

try {
    // Check if package.json exists
    if (fs.existsSync('package.json')) {
        console.log('✅ package.json found');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if ((pkg.dependencies && pkg.dependencies.hardhat) || (pkg.devDependencies && pkg.devDependencies.hardhat)) {
            console.log('✅ Hardhat dependency found');
        } else {
            console.log('❌ Hardhat dependency missing');
            issues.push('Install Hardhat: npm install --save-dev hardhat');
            allChecksPass = false;
        }
    } else {
        console.log('❌ package.json not found');
        issues.push('Initialize npm project: npm init');
        allChecksPass = false;
    }
} catch (error) {
    console.log(`❌ Package check failed: ${error.message}`);
    issues.push('Package.json issue');
    allChecksPass = false;
}

// Check 2: Contract Source Verification
console.log('\n📄 CONTRACT SOURCE VERIFICATION');
console.log('-'.repeat(40));

try {
    const contractPath = path.join(__dirname, 'contracts', 'LeadFive.sol');
    if (fs.existsSync(contractPath)) {
        console.log('✅ LeadFive.sol found');
        
        const contractSource = fs.readFileSync(contractPath, 'utf8');
        
        // Check for marketing plan compliance in source
        const marketingChecks = [
            { pattern: /directBonus:\s*4000/g, name: 'Direct Bonus (40%)', expected: 4 },
            { pattern: /levelBonus:\s*1000/g, name: 'Level Bonus (10%)', expected: 4 },
            { pattern: /uplineBonus:\s*1000/g, name: 'Upline Bonus (10%)', expected: 4 },
            { pattern: /leaderBonus:\s*1000/g, name: 'Leader Bonus (10%)', expected: 4 },
            { pattern: /helpBonus:\s*3000/g, name: 'Help Pool (30%)', expected: 4 }
        ];
        
        let sourceCompliant = true;
        
        marketingChecks.forEach(check => {
            const matches = contractSource.match(check.pattern);
            const count = matches ? matches.length : 0;
            if (count >= check.expected) {
                console.log(`✅ ${check.name}: ${count}/${check.expected} occurrences`);
            } else {
                console.log(`❌ ${check.name}: ${count}/${check.expected} occurrences`);
                issues.push(`Fix ${check.name} allocation in contract source`);
                sourceCompliant = false;
                allChecksPass = false;
            }
        });
        
        if (sourceCompliant) {
            console.log('✅ Source code marketing compliance: VERIFIED');
        } else {
            console.log('❌ Source code marketing compliance: ISSUES FOUND');
        }
        
    } else {
        console.log('❌ LeadFive.sol not found');
        issues.push('Contract source file missing');
        allChecksPass = false;
    }
} catch (error) {
    console.log(`❌ Contract verification failed: ${error.message}`);
    issues.push('Contract source verification issue');
    allChecksPass = false;
}

// Check 3: Environment Configuration
console.log('\n🔐 ENVIRONMENT CONFIGURATION');
console.log('-'.repeat(40));

try {
    if (fs.existsSync('.env')) {
        console.log('✅ .env file found');
        const envContent = fs.readFileSync('.env', 'utf8');
        
        const requiredVars = ['PRIVATE_KEY', 'BSC_RPC_URL'];
        let envComplete = true;
        
        requiredVars.forEach(varName => {
            if (envContent.includes(varName)) {
                console.log(`✅ ${varName} configured`);
            } else {
                console.log(`❌ ${varName} missing`);
                issues.push(`Add ${varName} to .env file`);
                envComplete = false;
                allChecksPass = false;
            }
        });
        
        if (envComplete) {
            console.log('✅ Environment variables: COMPLETE');
        }
        
    } else {
        console.log('❌ .env file not found');
        issues.push('Create .env file with PRIVATE_KEY and BSC_RPC_URL');
        allChecksPass = false;
    }
} catch (error) {
    console.log(`❌ Environment check failed: ${error.message}`);
    issues.push('Environment configuration issue');
    allChecksPass = false;
}

// Check 4: Hardhat Configuration
console.log('\n⚙️ HARDHAT CONFIGURATION');
console.log('-'.repeat(40));

try {
    const hardhatConfigPaths = ['hardhat.config.js', 'hardhat.config.ts'];
    let configFound = false;
    
    for (const configPath of hardhatConfigPaths) {
        if (fs.existsSync(configPath)) {
            console.log(`✅ ${configPath} found`);
            configFound = true;
            
            const configContent = fs.readFileSync(configPath, 'utf8');
            if (configContent.includes('bsc') || configContent.includes('56')) {
                console.log('✅ BSC network configuration found');
            } else {
                console.log('❌ BSC network configuration missing');
                issues.push('Add BSC network to Hardhat config');
                allChecksPass = false;
            }
            break;
        }
    }
    
    if (!configFound) {
        console.log('❌ Hardhat config not found');
        issues.push('Create hardhat.config.js with BSC network');
        allChecksPass = false;
    }
    
} catch (error) {
    console.log(`❌ Hardhat config check failed: ${error.message}`);
    issues.push('Hardhat configuration issue');
    allChecksPass = false;
}

// Check 5: Dependencies
console.log('\n📦 DEPENDENCY VERIFICATION');
console.log('-'.repeat(40));

try {
    if (fs.existsSync('node_modules')) {
        console.log('✅ node_modules directory found');
        
        const requiredDeps = [
            'hardhat',
            '@openzeppelin/contracts',
            '@openzeppelin/contracts-upgradeable',
            'ethers'
        ];
        
        let depsComplete = true;
        
        requiredDeps.forEach(dep => {
            const depPath = path.join('node_modules', dep);
            if (fs.existsSync(depPath)) {
                console.log(`✅ ${dep} installed`);
            } else {
                console.log(`❌ ${dep} missing`);
                issues.push(`Install ${dep}: npm install ${dep}`);
                depsComplete = false;
                allChecksPass = false;
            }
        });
        
        if (depsComplete) {
            console.log('✅ All required dependencies: INSTALLED');
        }
        
    } else {
        console.log('❌ node_modules directory not found');
        issues.push('Install dependencies: npm install');
        allChecksPass = false;
    }
} catch (error) {
    console.log(`❌ Dependency check failed: ${error.message}`);
    issues.push('Dependency verification issue');
    allChecksPass = false;
}

// Check 6: Compilation Test
console.log('\n🔨 COMPILATION TEST');
console.log('-'.repeat(40));

try {
    console.log('🔄 Testing contract compilation...');
    execSync('npx hardhat compile', { stdio: 'pipe' });
    console.log('✅ Contracts compile successfully');
} catch (error) {
    console.log('❌ Compilation failed');
    console.log(`Error: ${error.message}`);
    issues.push('Fix compilation errors before deployment');
    allChecksPass = false;
}

// Check 7: Gas Estimation
console.log('\n⛽ GAS ESTIMATION');
console.log('-'.repeat(40));

console.log('📊 Estimated Gas Costs (3 gwei):');
console.log('   • Implementation Deploy: ~3,500,000 gas (~0.0105 BNB)');
console.log('   • Proxy Deploy: ~1,500,000 gas (~0.0045 BNB)');
console.log('   • Initialization: ~500,000 gas (~0.0015 BNB)');
console.log('   • Total Estimated: ~5,500,000 gas (~0.0165 BNB)');
console.log('   • Recommended Balance: 0.1 BNB (safety margin)');

// Final Results
console.log('\n🎯 VERIFICATION SUMMARY');
console.log('=' .repeat(60));

if (allChecksPass) {
    console.log('🎉 ALL CHECKS PASSED - READY FOR DEPLOYMENT!');
    console.log('✅ Environment Setup: COMPLETE');
    console.log('✅ Contract Source: MARKETING COMPLIANT');
    console.log('✅ Configuration: PROPER');
    console.log('✅ Dependencies: INSTALLED');
    console.log('✅ Compilation: SUCCESS');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Ensure you have at least 0.1 BNB in your deployer wallet');
    console.log('2. Run: node fresh-mainnet-deployment.cjs');
    console.log('3. Verify deployment on BSCScan');
    console.log('4. Test basic functionality');
    
} else {
    console.log('❌ ISSUES FOUND - DEPLOYMENT NOT READY');
    console.log(`📋 ${issues.length} issue(s) need to be resolved:`);
    
    issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
    });
    
    console.log('\n🔧 RESOLVE ALL ISSUES BEFORE DEPLOYMENT');
}

console.log('\n📋 Pre-deployment verification complete');
console.log(`⏰ Completed at: ${new Date().toLocaleString()}`);

process.exit(allChecksPass ? 0 : 1);
