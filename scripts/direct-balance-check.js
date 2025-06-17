const https = require('https');

// Direct RPC call to check account balance
const privateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const ethers = require('ethers');

// Calculate address from private key
const wallet = new ethers.Wallet(privateKey);
const address = wallet.address;

console.log("🔍 Checking BSC Testnet Account Status");
console.log("👤 Address:", address);

// RPC call data
const data = JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [address, "latest"],
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
    }
};

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
                const balanceEth = Number(balanceWei) / 1e18;
                console.log("💰 Balance:", balanceEth.toFixed(6), "BNB");
                
                if (balanceWei > 0) {
                    console.log("✅ Account has balance - proceeding with deployment");
                    console.log("\n🚀 READY FOR TESTNET DEPLOYMENT");
                } else {
                    console.log("❌ No BNB balance detected!");
                    console.log("🔗 Get testnet BNB at: https://testnet.binance.org/faucet-smart");
                    console.log("📍 Fund this address:", address);
                }
            } else {
                console.log("❌ Error getting balance:", response.error);
            }
        } catch (error) {
            console.log("❌ Parse error:", error.message);
        }
    });
});

req.on('error', (error) => {
    console.log("❌ Request error:", error.message);
});

req.write(data);
req.end();
