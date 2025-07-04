const fs = require('fs');
const path = require('path');

console.log("🔍 ANALYZING FRONTEND INTEGRATION FOR V1.10");
console.log("===========================================");

// Check critical frontend files
const filesToCheck = [
    'src/config/contract.js',
    'src/config/index.js', 
    'src/constants/abi.js',
    'src/constants/addresses.js',
    'src/hooks/useContract.js',
    'src/hooks/useLeadFive.js',
    'src/components/Register.jsx',
    'src/components/Registration.jsx',
    'src/components/Dashboard.jsx',
    'src/utils/web3.js',
    'src/utils/contract.js'
];

const issues = [];
const recommendations = [];

console.log("📁 CHECKING FRONTEND FILES:");
console.log("-".repeat(50));

filesToCheck.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} - EXISTS`);
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for old contract addresses
            const oldAddresses = content.match(/0x[a-fA-F0-9]{40}/g);
            if (oldAddresses) {
                const hasCurrentContract = oldAddresses.includes('0x29dcCb502D10C042BcC6a02a7762C49595A9E498');
                if (!hasCurrentContract && oldAddresses.length > 0) {
                    issues.push(`${file}: Contains old contract addresses - ${oldAddresses.slice(0, 2).join(', ')}`);
                }
                if (hasCurrentContract) {
                    console.log(`   ✅ Contains current contract address`);
                }
            }
            
            // Check for hardcoded localhost
            if (content.includes('localhost') && !content.includes('VITE_')) {
                issues.push(`${file}: Contains hardcoded localhost URLs`);
            }
            
            // Check for old function calls
            if (content.includes('registerUser') || content.includes('getUserDetails')) {
                issues.push(`${file}: Uses old contract function names`);
            }
            
            // Check for proper error handling
            if (content.includes('try') && content.includes('catch')) {
                console.log(`   ✅ Has error handling`);
            } else if (content.includes('await') || content.includes('.call')) {
                issues.push(`${file}: Missing error handling for async operations`);
            }
            
        } catch (error) {
            console.log(`   ⚠️  Error reading file: ${error.message}`);
        }
    } else {
        console.log(`❌ ${file} - MISSING`);
        recommendations.push(`Create ${file} with proper v1.10 integration`);
    }
});

console.log("\n🚨 ISSUES FOUND:");
console.log("-".repeat(50));
if (issues.length === 0) {
    console.log("✅ No critical issues detected!");
} else {
    issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
    });
}

console.log("\n💡 RECOMMENDATIONS:");
console.log("-".repeat(50));
if (recommendations.length === 0) {
    console.log("✅ All critical files exist!");
} else {
    recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
    });
}

// Check package.json for Web3 dependencies
console.log("\n📦 WEB3 DEPENDENCIES:");
console.log("-".repeat(50));
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const web3Deps = ['ethers', 'web3', '@web3-react/core', 'wagmi'];
    
    web3Deps.forEach(dep => {
        if (packageJson.dependencies[dep]) {
            console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
        } else {
            console.log(`❌ ${dep}: Not installed`);
        }
    });
} catch (error) {
    console.log("❌ Error reading package.json");
}

console.log("\n🎯 NEXT STEPS:");
console.log("-".repeat(50));
console.log("1. Update contract ABI to v1.10");
console.log("2. Fix contract integration");
console.log("3. Update registration flow");
console.log("4. Test all components");
console.log("5. Deploy to production");

module.exports = { issues, recommendations };
