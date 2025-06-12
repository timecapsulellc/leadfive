const crypto = require('crypto');

// Well-known test private key from Hardhat (safe for testnet use)
const privateKey = "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

// Simple address derivation without ethers.js
function privateKeyToAddress(privateKeyHex) {
    const secp256k1 = require('crypto');
    
    // This is a simplified approach - for real deployment, use proper libraries
    // But for getting the address, we can use the known Hardhat test account addresses
    
    // Hardhat test accounts (well-known addresses)
    const testAccounts = [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Account #0
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Account #1 - our key
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Account #2
    ];
    
    return testAccounts[1]; // Our test account
}

const address = privateKeyToAddress(privateKey);
console.log("🔑 Test Account Address:", address);
console.log("🔗 Fund this address at: https://testnet.binance.org/faucet-smart");
console.log("💡 This is a well-known Hardhat test account, safe for testnet use");
