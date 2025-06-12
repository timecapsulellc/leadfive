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
            } else {
                console.log("❌ Error: No result in response", response);
            }
        } catch (e) {
            console.log("❌ Error parsing response:", e);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Problem with request: ${e.message}`);
});

req.write(data);
req.end();
