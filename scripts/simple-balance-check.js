const https = require('https');

// Test account from Hardhat (this is a well-known test private key, safe to use on testnet)
const testAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Account #1 from Hardhat test accounts

console.log("🔍 Checking BSC Testnet Account Status");
console.log("👤 Address:", testAddress);

// RPC call data
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
                    console.log("✅ Account has balance");
                } else {
                    console.log("❌ No BNB balance");
                    console.log("🔗 Get testnet BNB at: https://testnet.binance.org/faucet-smart");
                    console.log("📍 Fund this address:", testAddress);
                }
            } else {
                console.log("❌ Error:", response.error || "Unknown error");
            }
        } catch (error) {
            console.log("❌ Parse error:", error.message);
        }
    });
});

req.on('error', (error) => {
    console.log("❌ Network error:", error.message);
});

req.setTimeout(10000, () => {
    console.log("❌ Timeout - RPC not responding");
    req.destroy();
});

req.write(data);
req.end();
