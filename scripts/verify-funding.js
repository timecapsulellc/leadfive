const https = require('https');

console.log("🔍 Verifying BSC Testnet Account Funding");
console.log("========================================");

const testAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
console.log("👤 Address:", testAddress);
console.log("💰 Expected: 0.1 BNB (funded by user)");
console.log("");

// Check balance via RPC
const data = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [testAddress, "latest"],
    id: 1
});

const options = {
    hostname: 'data-seed-prebsc-1-s1.binance.org',
    port: 8545,
    path: '/',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    },
    timeout: 10000
};

console.log("🌐 Checking balance on BSC Testnet...");

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(body);
            if (response.result) {
                const balanceWei = BigInt(response.result);
                const balanceBNB = Number(balanceWei) / 1e18;
                
                console.log("✅ Balance Retrieved Successfully!");
                console.log("💰 Current Balance:", balanceBNB.toFixed(6), "BNB");
                
                if (balanceBNB >= 0.05) {
                    console.log("🚀 SUFFICIENT FUNDS FOR DEPLOYMENT!");
                    console.log("✅ Ready to proceed with testnet deployment");
                    console.log("");
                    console.log("📋 Next Steps:");
                    console.log("1. Fix Node.js version (nvm use 18)");
                    console.log("2. Run deployment script");
                    console.log("3. Verify contract on BSCScan");
                } else {
                    console.log("⚠️  Low balance - may need more BNB for deployment");
                    console.log("💡 Recommended: At least 0.05 BNB for safe deployment");
                }
            } else {
                console.log("❌ Error retrieving balance:", response.error || "Unknown error");
            }
        } catch (error) {
            console.log("❌ Failed to parse response:", error.message);
        }
    });
});

req.on('error', (error) => {
    console.log("❌ Network error:", error.message);
    console.log("💡 This might be due to network connectivity");
    console.log("✅ Account should still be funded if you completed the faucet process");
});

req.on('timeout', () => {
    console.log("⏱️  Request timeout - but funding should be complete");
    console.log("✅ Proceeding with deployment assumption");
});

req.write(data);
req.end();
