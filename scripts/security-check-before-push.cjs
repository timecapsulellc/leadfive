const fs = require('fs');
const path = require('path');

async function securityCheck() {
    console.log("🔒 SECURITY CHECK BEFORE GITHUB PUSH");
    console.log("=" * 50);
    
    const sensitivePatterns = [
        /private.*key/i,
        /secret/i,
        /password/i,
        /token.*[a-zA-Z0-9]{20,}/,
        /api.*key.*[a-zA-Z0-9]{20,}/i,
        /0x[a-fA-F0-9]{64}/,  // Private keys
        /sk_[a-zA-Z0-9]{32,}/, // Secret keys
    ];
    
    const sensitiveFiles = [
        '.env',
        '.env.production',
        '.env.development',
        '.env.local',
        '.openzeppelin/bsc.json',
        '.openzeppelin/bsc-testnet.json'
    ];
    
    let foundIssues = [];
    
    console.log("📋 CHECKING FOR SENSITIVE FILES...");
    
    // Check if sensitive files exist
    for (const file of sensitiveFiles) {
        if (fs.existsSync(file)) {
            foundIssues.push(`❌ Sensitive file exists: ${file}`);
        } else {
            console.log(`✅ Safe: ${file} not found`);
        }
    }
    
    console.log("");
    console.log("📋 CHECKING FOR SENSITIVE CONTENT IN SOURCE FILES...");
    
    const sourceExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md'];
    
    function scanDirectory(dir) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                // Skip node_modules, .git, dist, etc.
                if (!['node_modules', '.git', 'dist', 'build', 'artifacts', 'cache'].includes(file)) {
                    scanDirectory(filePath);
                }
            } else if (sourceExtensions.includes(path.extname(file))) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    
                    for (const pattern of sensitivePatterns) {
                        if (pattern.test(content)) {
                            foundIssues.push(`⚠️  Potential sensitive data in: ${filePath}`);
                            break;
                        }
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }
        }
    }
    
    // Scan from root directory
    scanDirectory('.');
    
    console.log("");
    console.log("📊 SECURITY CHECK RESULTS:");
    console.log("=" * 30);
    
    if (foundIssues.length === 0) {
        console.log("✅ NO SECURITY ISSUES FOUND!");
        console.log("✅ Repository is safe to push to GitHub");
        console.log("");
        console.log("🔒 VERIFIED SAFE:");
        console.log("   • No .env files included");
        console.log("   • No private keys detected");
        console.log("   • No API tokens found");
        console.log("   • No sensitive configurations");
        return true;
    } else {
        console.log("❌ SECURITY ISSUES FOUND:");
        foundIssues.forEach(issue => console.log("   " + issue));
        console.log("");
        console.log("🚨 DO NOT PUSH UNTIL ISSUES ARE RESOLVED!");
        return false;
    }
}

if (require.main === module) {
    securityCheck().then(isSafe => {
        process.exit(isSafe ? 0 : 1);
    });
}

module.exports = { securityCheck };