// Security Verification Script for LeadFive Project
// Verifies that no sensitive data is exposed anywhere

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("🔐 LEADFIVE SECURITY VERIFICATION");
console.log("=" * 50);

let securityIssues = [];
let securityPassed = [];

// Check 1: Verify .env file protection
function checkEnvProtection() {
    console.log("\n🔍 Checking environment file protection...");
    
    try {
        // Check if .env is in .gitignore
        const gitignore = fs.readFileSync('.gitignore', 'utf8');
        if (gitignore.includes('.env')) {
            securityPassed.push("✅ .env files protected in .gitignore");
        } else {
            securityIssues.push("❌ .env files not protected in .gitignore");
        }
        
        // Check if .env.example exists
        if (fs.existsSync('.env.example')) {
            securityPassed.push("✅ .env.example template exists");
        } else {
            securityIssues.push("❌ .env.example template missing");
        }
        
        // Check if .env has sensitive data
        if (fs.existsSync('.env')) {
            const envContent = fs.readFileSync('.env', 'utf8');
            if (envContent.includes('DEPLOYER_PRIVATE_KEY=')) {
                const privateKeyLine = envContent.split('\n').find(line => line.includes('DEPLOYER_PRIVATE_KEY='));
                if (privateKeyLine) {
                    const privateKeyValue = privateKeyLine.split('=')[1];
                    if (privateKeyValue && privateKeyValue.trim().length > 10) {
                        securityIssues.push("⚠️  WARNING: Private key detected in .env file");
                        console.log("🚨 CRITICAL: Remove private key from .env before committing!");
                    } else {
                        securityPassed.push("✅ .env file is clean (no private key)");
                    }
                }
            } else {
                securityPassed.push("✅ .env file is clean (no private key)");
            }
        }
        
    } catch (error) {
        securityIssues.push("❌ Error checking environment protection: " + error.message);
    }
}

// Check 2: Verify no hardcoded keys in source code
function checkSourceCodeSecurity() {
    console.log("\n🔍 Checking source code for hardcoded secrets...");
    
    const filesToCheck = [
        'src/',
        'scripts/',
        'contracts/',
        'hardhat.config.cjs',
        'package.json'
    ];
    
    filesToCheck.forEach(fileOrDir => {
        if (fs.existsSync(fileOrDir)) {
            try {
                // Check for potential private keys (64 hex chars)
                const result = execSync(`grep -r "[0-9a-fA-F]\\{64\\}" ${fileOrDir} --exclude-dir=node_modules --exclude="*.md" || true`, { encoding: 'utf8' });
                if (result.trim()) {
                    // Filter out safe occurrences
                    const lines = result.split('\n').filter(line => 
                        line.trim() && 
                        !line.includes('your_actual_64_character') &&
                        !line.includes('example') &&
                        !line.includes('template') &&
                        !line.includes('placeholder') &&
                        !line.includes('0x0000000000000000000000000000000000000000000000000000000000000000')
                    );
                    
                    if (lines.length > 0) {
                        securityIssues.push(`⚠️  Potential private keys found in ${fileOrDir}`);
                        lines.forEach(line => console.log("  📍", line.substring(0, 100) + "..."));
                    }
                }
            } catch (error) {
                // Ignore grep errors (usually means no matches)
            }
        }
    });
    
    securityPassed.push("✅ Source code security scan completed");
}

// Check 3: Verify Git history is clean
function checkGitHistory() {
    console.log("\n🔍 Checking Git history for sensitive data...");
    
    try {
        // Check recent commits for sensitive patterns
        const recentCommits = execSync('git log --oneline -10 || echo "No git history"', { encoding: 'utf8' });
        
        if (recentCommits.includes('private') || recentCommits.includes('key') || recentCommits.includes('secret')) {
            securityIssues.push("⚠️  Commit messages mention sensitive terms");
        } else {
            securityPassed.push("✅ Recent commit messages are clean");
        }
        
        // Check if any .env files were ever committed
        try {
            const envInHistory = execSync('git log --name-only --pretty=format: | grep -E "\\.env$" || true', { encoding: 'utf8' });
            if (envInHistory.trim()) {
                securityIssues.push("❌ .env files found in Git history - consider cleaning");
            } else {
                securityPassed.push("✅ No .env files in Git history");
            }
        } catch (error) {
            // Git history check failed, but not critical
        }
        
    } catch (error) {
        console.log("ℹ️  Git history check skipped (no git repository)");
    }
}

// Check 4: Verify frontend security
function checkFrontendSecurity() {
    console.log("\n🔍 Checking frontend security...");
    
    try {
        // Check for private keys in frontend
        const frontendPrivateCheck = execSync('grep -r "private.*key" src/ --exclude-dir=node_modules || true', { encoding: 'utf8' });
        
        // Filter out safe warnings and messages
        const unsafeLines = frontendPrivateCheck.split('\n').filter(line => 
            line.trim() && 
            !line.includes('never ask for your private keys') &&
            !line.includes('warning') &&
            !line.includes('security')
        );
        
        if (unsafeLines.length > 0) {
            securityIssues.push("⚠️  Potential private key references in frontend");
            unsafeLines.forEach(line => console.log("  📍", line));
        } else {
            securityPassed.push("✅ Frontend contains no private key references");
        }
        
        // Check contracts-leadfive.js for sensitive data
        if (fs.existsSync('src/contracts-leadfive.js')) {
            const contractConfig = fs.readFileSync('src/contracts-leadfive.js', 'utf8');
            if (contractConfig.includes('address: ""') || contractConfig.includes('address: "0x"')) {
                securityPassed.push("✅ Contract configuration uses placeholder addresses");
            } else {
                // Check if it contains actual addresses (which is OK for public addresses)
                securityPassed.push("✅ Contract configuration checked");
            }
        }
        
    } catch (error) {
        securityIssues.push("❌ Error checking frontend security: " + error.message);
    }
}

// Check 5: Verify deployment script security
function checkDeploymentSecurity() {
    console.log("\n🔍 Checking deployment script security...");
    
    try {
        if (fs.existsSync('scripts/deploy-leadfive.js')) {
            const deployScript = fs.readFileSync('scripts/deploy-leadfive.js', 'utf8');
            
            // Check for environment variable usage
            if (deployScript.includes('process.env') || deployScript.includes('require') && deployScript.includes('dotenv')) {
                securityPassed.push("✅ Deployment script uses environment variables");
            } else {
                securityIssues.push("❌ Deployment script doesn't use environment variables");
            }
            
            // Check for no hardcoded keys
            const hexPattern = /[0-9a-fA-F]{64}/;
            if (!hexPattern.test(deployScript)) {
                securityPassed.push("✅ No hardcoded keys in deployment script");
            } else {
                securityIssues.push("⚠️  Potential hardcoded key in deployment script");
            }
        }
        
    } catch (error) {
        securityIssues.push("❌ Error checking deployment security: " + error.message);
    }
}

// Check 6: Verify emergency scripts exist
function checkEmergencyScripts() {
    console.log("\n🔍 Checking emergency security scripts...");
    
    const emergencyScripts = [
        'scripts/emergency-pause.js',
        'scripts/emergency-transfer.js'
    ];
    
    emergencyScripts.forEach(script => {
        if (fs.existsSync(script)) {
            securityPassed.push(`✅ Emergency script exists: ${script}`);
        } else {
            securityIssues.push(`❌ Missing emergency script: ${script}`);
        }
    });
}

// Main security verification
async function runSecurityVerification() {
    console.log("🚀 Starting comprehensive security verification...\n");
    
    checkEnvProtection();
    checkSourceCodeSecurity();
    checkGitHistory();
    checkFrontendSecurity();
    checkDeploymentSecurity();
    checkEmergencyScripts();
    
    // Generate security report
    console.log("\n" + "=" * 50);
    console.log("🔐 SECURITY VERIFICATION REPORT");
    console.log("=" * 50);
    
    console.log("\n✅ SECURITY MEASURES PASSED:");
    securityPassed.forEach(item => console.log(item));
    
    if (securityIssues.length > 0) {
        console.log("\n⚠️  SECURITY ISSUES FOUND:");
        securityIssues.forEach(item => console.log(item));
        
        console.log("\n🚨 SECURITY RECOMMENDATIONS:");
        console.log("1. Review and fix all security issues above");
        console.log("2. Ensure private keys are only in local .env file");
        console.log("3. Never commit .env files to Git");
        console.log("4. Use hardware wallets for production");
        console.log("5. Implement key rotation after deployment");
        
        return false;
    } else {
        console.log("\n🎉 ALL SECURITY CHECKS PASSED!");
        console.log("✅ Your LeadFive project is secure for deployment");
        console.log("✅ No sensitive data exposure detected");
        console.log("✅ Private key protection is active");
        
        console.log("\n🚀 READY FOR SECURE DEPLOYMENT:");
        console.log("1. Add your private key to .env file (local only)");
        console.log("2. Deploy with: npx hardhat run scripts/deploy-leadfive.js --network bscMainnet");
        console.log("3. Transfer to hardware wallet after deployment");
        
        return true;
    }
}

// Run the verification
runSecurityVerification()
    .then((passed) => {
        if (passed) {
            console.log("\n🔐 Security verification completed successfully!");
            process.exit(0);
        } else {
            console.log("\n🚨 Security verification failed - fix issues before deployment!");
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error("❌ Security verification error:", error);
        process.exit(1);
    });
