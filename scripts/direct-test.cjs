// scripts/direct-test.cjs
const { ethers } = require("ethers");
require("dotenv").config();

// Direct test of ethers connection
async function testDirectConnection() {
  console.log("🔍 Direct Ethers.js Test");
  console.log("=" .repeat(40));
  
  try {
    // Create provider
    const provider = new ethers.JsonRpcProvider("https://bsc-testnet.blockpi.network/v1/rpc/public");
    
    // Test basic connection
    const network = await provider.getNetwork();
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId.toString());
    
    const blockNumber = await provider.getBlockNumber();
    console.log("Block number:", blockNumber);
    
    // Test wallet
    const crypto = require('crypto');
    
    function decryptPrivateKey(encryptedKey, password = 'mk3R4^=l%cirS=K_orphisol') {
        try {
            const ALGORITHM = 'aes-256-cbc';
            const KEY_LENGTH = 32;
            const IV_LENGTH = 16;
            
            const key = crypto.scryptSync(password, 'salt', KEY_LENGTH);
            const combined = Buffer.from(encryptedKey, 'base64');
            const iv = combined.slice(0, IV_LENGTH);
            const encrypted = combined.slice(IV_LENGTH);
            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            
            let decrypted = decipher.update(encrypted, null, 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted.startsWith('0x') ? decrypted : `0x${decrypted}`;
        } catch (error) {
            console.error('Decryption failed:', error.message);
            return null;
        }
    }
    
    const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;
    const privateKey = encryptedKey ? decryptPrivateKey(encryptedKey) : null;
    
    if (privateKey) {
      const wallet = new ethers.Wallet(privateKey, provider);
      console.log("Wallet address:", wallet.address);
      
      const balance = await provider.getBalance(wallet.address);
      console.log("Balance:", ethers.formatEther(balance), "BNB");
      
      if (parseFloat(ethers.formatEther(balance)) === 0) {
        console.log("\n💰 Need testnet BNB? Get some here:");
        console.log("🔗 https://testnet.bnbchain.org/faucet-smart");
        console.log("📝 Address to fund:", wallet.address);
      }
      
    } else {
      console.log("❌ Failed to decrypt private key");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testDirectConnection();
