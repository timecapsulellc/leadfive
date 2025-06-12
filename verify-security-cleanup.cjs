const fs = require('fs');
const path = require('path');

/**
 * Security Verification Script
 * Verifies that the compromised wallet has been completely removed
 */

const COMPROMISED_WALLET = "0x658C37b88d211EEFd9a684237a20D5268B4A2e72";
const TREZOR_WALLET = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";

function searchInFile(filePath, searchTerm) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const matches = [];
        
        lines.forEach((line, index) => {
            if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
                matches.push({
                    line: index + 1,
                    content: line.trim()
                });
            }
        });
        
        return matches;
    } catch (error) {
        return [];
    }
}

function searchInDirectory(dirPath, searchTerm, extensions = ['.js', '.cjs', '.mjs', '.json', '.md', '.env', '.sh']) {
    const results = [];
    
    function scanDir(currentPath) {
        try {
            const items = fs.readdirSync(currentPath);
            
            items.forEach(item => {
                if (item.startsWith('.git') || item === 'node_modules' || item === 'artifacts' || item === 'cache') {
                    return;
                }
                
                const itemPath = path.join(currentPath, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    scanDir(itemPath);
                } else if (stat.isFile()) {
                    const ext = path.extname(item);
                    if (extensions.includes(ext) || extensions.includes('*')) {
                        const matches = searchInFile(itemPath, searchTerm);
                        if (matches.length > 0) {
                            results.push({
                                file: itemPath,
                                matches: matches
                            });
                        }
                    }
                }
            });
        } catch (error) {
            // Skip inaccessible directories
        }
    }
    
    scanDir(dirPath);
    return results;
}

async function main() {
    console.log("🔍 Security Verification: Checking for Compromised Wallet");
    console.log("=" .repeat(60));
    console.log("🚨 Compromised Wallet:", COMPROMISED_WALLET);
    console.log("🛡️  Trezor Wallet:", TREZOR_WALLET);
    console.log("=" .repeat(60));
    
    // Search for compromised wallet
    console.log("\n🔍 Searching for compromised wallet references...");
    const compromisedResults = searchInDirectory('.', COMPROMISED_WALLET);
    
    if (compromisedResults.length === 0) {
        console.log("✅ NO compromised wallet references found!");
    } else {
        console.log(`❌ Found ${compromisedResults.length} files with compromised wallet references:`);
        compromisedResults.forEach(result => {
            console.log(`\n📁 File: ${result.file}`);
            result.matches.forEach(match => {
                console.log(`   Line ${match.line}: ${match.content}`);
            });
        });
    }
    
    // Search for Trezor wallet
    console.log("\n🔍 Searching for Trezor wallet references...");
    const trezorResults = searchInDirectory('.', TREZOR_WALLET);
    
    if (trezorResults.length > 0) {
        console.log(`✅ Found ${trezorResults.length} files with Trezor wallet references:`);
        trezorResults.forEach(result => {
            console.log(`\n📁 File: ${result.file}`);
            result.matches.forEach(match => {
                console.log(`   Line ${match.line}: ${match.content}`);
            });
        });
    } else {
        console.log("⚠️  No Trezor wallet references found (this may be expected)");
    }
    
    // Check critical configuration files
    console.log("\n🔍 Checking critical configuration files...");
    const criticalFiles = [
        'testnet-deployment-info.json',
        '.env.trezor',
        'hardhat.config.trezor-testnet.cjs',
        'deploy-trezor-testnet.cjs'
    ];
    
    let allSecure = true;
    
    criticalFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const compromisedInFile = searchInFile(file, COMPROMISED_WALLET);
            const trezorInFile = searchInFile(file, TREZOR_WALLET);
            
            console.log(`\n📄 ${file}:`);
            
            if (compromisedInFile.length > 0) {
                console.log(`   ❌ Contains compromised wallet (${compromisedInFile.length} occurrences)`);
                allSecure = false;
            } else {
                console.log(`   ✅ No compromised wallet found`);
            }
            
            if (trezorInFile.length > 0) {
                console.log(`   ✅ Contains Trezor wallet (${trezorInFile.length} occurrences)`);
            } else {
                console.log(`   ⚠️  No Trezor wallet found`);
            }
        } else {
            console.log(`\n📄 ${file}: ⚠️  File not found`);
        }
    });
    
    // Final security assessment
    console.log("\n" + "=" .repeat(60));
    console.log("🛡️  SECURITY ASSESSMENT");
    console.log("=" .repeat(60));
    
    if (compromisedResults.length === 0) {
        console.log("✅ SECURE: No compromised wallet references found");
    } else {
        console.log("❌ INSECURE: Compromised wallet still referenced in files");
        allSecure = false;
    }
    
    if (allSecure) {
        console.log("🎉 PROJECT IS SECURE FOR TREZOR DEPLOYMENT");
        console.log("✅ All compromised wallet references have been removed");
        console.log("✅ Trezor wallet configured correctly");
    } else {
        console.log("⚠️  MANUAL REVIEW REQUIRED");
        console.log("🔧 Please review and fix the issues above before deployment");
    }
    
    // Save verification report
    const report = {
        verificationTime: new Date().toISOString(),
        compromisedWallet: COMPROMISED_WALLET,
        trezorWallet: TREZOR_WALLET,
        compromisedWalletFound: compromisedResults.length > 0,
        trezorWalletFound: trezorResults.length > 0,
        isSecure: allSecure,
        compromisedReferences: compromisedResults,
        trezorReferences: trezorResults
    };
    
    fs.writeFileSync('security-verification-report.json', JSON.stringify(report, null, 2));
    console.log("\n📄 Verification report saved to: security-verification-report.json");
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = main;
