const https = require('https');

const TREZOR_WALLET = '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29';
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545';

async function checkBalance() {
    console.log('🔍 Checking Trezor Wallet Balance for Deployment');
    console.log(`👤 Trezor Wallet: ${TREZOR_WALLET}`);
    
    // Try BSC Testnet API
    try {
        const response = await fetch('https://api-testnet.bscscan.com/api?module=account&action=balance&address=' + TREZOR_WALLET + '&tag=latest&apikey=YourApiKeyToken');
        const data = await response.json();
        
        if (data.status === '1') {
            const balance = parseInt(data.result) / 1e18;
            console.log(`💰 Balance: ${balance.toFixed(4)} BNB`);
            
            if (balance > 0.01) {
                console.log('✅ Sufficient balance for deployment!');
                console.log('🚀 Ready to deploy NEW OrphiCrowdFund contract');
            } else {
                console.log('❌ Insufficient balance for deployment');
                console.log('💡 Need at least 0.01 BNB for gas fees');
            }
            return balance;
        }
    } catch (error) {
        console.log('⚠️ API check failed, trying direct RPC...');
    }
    
    // Fallback to direct RPC
    const payload = JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [TREZOR_WALLET, 'latest'],
        id: 1
    });

    const options = {
        hostname: 'data-seed-prebsc-1-s1.binance.org',
        port: 8545,
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    const balance = parseInt(response.result, 16);
                    const balanceInBNB = balance / 1e18;
                    
                    console.log(`💰 Balance: ${balanceInBNB.toFixed(4)} BNB`);
                    
                    if (balanceInBNB > 0.01) {
                        console.log('✅ Sufficient balance for deployment!');
                        console.log('🚀 Ready to deploy NEW OrphiCrowdFund contract');
                    } else {
                        console.log('❌ Insufficient balance for deployment');
                        console.log('💡 Need at least 0.01 BNB for gas fees');
                    }
                    
                    resolve(balanceInBNB);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(payload);
        req.end();
    });
}

checkBalance().catch(console.error);
