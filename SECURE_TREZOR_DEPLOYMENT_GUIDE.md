# 🔐 SECURE TREZOR DEPLOYMENT GUIDE

## 🚨 URGENT: Deploying New Secure Contract

Your previous contract `0x8F826B18096Dcf7AF4515B06Cb563475d189ab50` has been compromised. 
This guide will help you deploy a new, secure contract using your Trezor hardware wallet.

## 📋 PREREQUISITES

### Hardware Requirements:
- ✅ Trezor device (Model T or One)
- ✅ Trezor connected and unlocked
- ✅ Latest Trezor firmware installed
- ✅ Trezor Bridge or Trezor Suite running

### Software Requirements:
- ✅ MetaMask browser extension
- ✅ Trezor connected to MetaMask ("Connect Hardware Wallet")
- ✅ BSC Mainnet network configured in MetaMask
- ✅ Your Trezor address `0xeB652c4523f3Cf615D3F3694b14E551145953aD0` selected

### Financial Requirements:
- ✅ Minimum **0.015 BNB** in your Trezor address for gas fees
- ✅ Current balance check: https://bscscan.com/address/0xeB652c4523f3Cf615D3F3694b14E551145953aD0

## 🔧 DEPLOYMENT METHOD

You have **two secure deployment options**:

### Option 1: Direct MetaMask + Trezor Deployment (Recommended)
This is the most secure method as it uses your Trezor for signing all transactions.

### Option 2: Remix IDE + Trezor (Alternative)
Use Remix IDE with MetaMask connected to your Trezor.

---

## 🚀 OPTION 1: COMMAND-LINE DEPLOYMENT

### Step 1: Prepare Environment
```bash
# Navigate to your project
cd "/Users/dadou/Orphi CrowdFund"

# Install dependencies if needed
npm install

# Check your Trezor balance
curl -s "https://api.bscscan.com/api?module=account&action=balance&address=0xeB652c4523f3Cf615D3F3694b14E551145953aD0&tag=latest&apikey=YourApiKeyToken" | jq
```

### Step 2: Configure MetaMask
1. Open MetaMask
2. Click "Connect Hardware Wallet"
3. Select "Trezor"
4. Choose your account: `0xeB652c4523f3Cf615D3F3694b14E551145953aD0`
5. Switch to **BSC Mainnet** network
6. Ensure sufficient BNB balance (min 0.015 BNB)

### Step 3: Deploy New Contract
```bash
# Deploy using the secure Trezor script
npx hardhat run scripts/deploy-with-trezor.js --network bscMainnet --config hardhat.mainnet.trezor.config.js
```

### Step 4: Confirm on Trezor
- Your Trezor screen will show transaction details
- **Verify the recipient address and gas amount**
- **Confirm on your Trezor device by pressing the button**
- Wait for deployment confirmation

---

## 🌐 OPTION 2: REMIX IDE DEPLOYMENT

### Step 1: Open Remix IDE
1. Go to https://remix.ethereum.org/
2. Create new file: `OrphiCrowdFund.sol`
3. Copy your contract code from `contracts/OrphiCrowdFund.sol`

### Step 2: Compile Contract
1. Go to "Solidity Compiler" tab
2. Set compiler version to `0.8.22`
3. Enable optimization (200 runs)
4. Click "Compile OrphiCrowdFund.sol"

### Step 3: Connect Trezor
1. Go to "Deploy & Run Transactions" tab
2. Environment: Select "Injected Provider - MetaMask"
3. MetaMask will connect (ensure Trezor account is selected)
4. Verify account shows: `0xeB652c4523f3Cf615D3F3694b14E551145953aD0`

### Step 4: Deploy Contract
1. Select "OrphiCrowdFund" from contract dropdown
2. Set constructor parameters:
   - `_usdtToken`: `0x55d398326f99059fF775485246999027B3197955`
   - `_treasury`: `0xeB652c4523f3Cf615D3F3694b14E551145953aD0`
   - `_emergency`: `0xeB652c4523f3Cf615D3F3694b14E551145953aD0`
   - `_poolManager`: `0xeB652c4523f3Cf615D3F3694b14E551145953aD0`
3. Click "Deploy"
4. Confirm transaction on Trezor device

---

## ✅ DEPLOYMENT VERIFICATION

After successful deployment:

### 1. Check Contract Address
- Note the new contract address from deployment logs
- Verify on BSCScan: https://bscscan.com/address/[NEW_CONTRACT_ADDRESS]

### 2. Verify Ownership
```bash
# Check owner (should be your Trezor address)
npx hardhat console --network bscMainnet --config hardhat.mainnet.trezor.config.js
```

In console:
```javascript
const contract = await ethers.getContractAt("OrphiCrowdFund", "NEW_CONTRACT_ADDRESS");
const owner = await contract.owner();
console.log("Owner:", owner);
// Should output: 0xeB652c4523f3Cf615D3F3694b14E551145953aD0
```

### 3. Verify Initial State
```javascript
const usdtToken = await contract.usdtToken();
const treasury = await contract.treasury();
console.log("USDT Token:", usdtToken);
console.log("Treasury:", treasury);
```

---

## 🔧 POST-DEPLOYMENT ACTIONS

### 1. Update Frontend Configuration
Update your dashboard to use the new contract address:

```javascript
// In your frontend config
const NEW_CONTRACT_ADDRESS = "0x[NEW_SECURE_ADDRESS]";

// Update Web3Service.js
this.contractAddress = NEW_CONTRACT_ADDRESS;
```

### 2. Verify Contract on BSCScan (Optional)
```bash
npx hardhat verify --network bscMainnet NEW_CONTRACT_ADDRESS "0x55d398326f99059fF775485246999027B3197955" "0xeB652c4523f3Cf615D3F3694b14E551145953aD0" "0xeB652c4523f3Cf615D3F3694b14E551145953aD0" "0xeB652c4523f3Cf615D3F3694b14E551145953aD0"
```

### 3. Announce New Contract
Create an announcement for your users:

```
🚨 IMPORTANT SECURITY UPDATE

Due to a security incident, we have deployed a new, secure contract:
• Old (COMPROMISED): 0x8F826B18096Dcf7AF4515B06Cb563475d189ab50
• New (SECURE): 0x[NEW_CONTRACT_ADDRESS]

Please DO NOT interact with the old contract.
Use only the new contract address for all future transactions.
```

---

## 🛡️ SECURITY NOTES

### ✅ What This Deployment Achieves:
- New contract owned by your secure Trezor wallet
- No connection to the compromised deployer wallet
- All admin functions controlled by your Trezor
- Fresh start with clean ownership

### ⚠️ Important Reminders:
- Never use the compromised wallet `0x7FB9622c6b2480Fd75b611b87b16c556A10baA01` again
- Always verify transaction details on your Trezor screen
- Keep your Trezor firmware updated
- Store your Trezor recovery seed securely

### 🔍 Migration Considerations:
- User balances from the old contract may need manual migration
- Consider creating a migration mechanism if users had deposits
- Communicate clearly about the transition to users

---

## 🆘 TROUBLESHOOTING

### Issue: "Insufficient funds for gas"
**Solution:** Ensure at least 0.015 BNB in your Trezor address

### Issue: "Transaction rejected"
**Solution:** Check Trezor screen and confirm the transaction

### Issue: "Wrong network"
**Solution:** Switch MetaMask to BSC Mainnet (Chain ID: 56)

### Issue: "Account not found"
**Solution:** Reconnect Trezor to MetaMask and select correct account

### Issue: "Compilation failed"
**Solution:** Check Solidity version (0.8.22) and optimization settings

---

## 📞 EMERGENCY CONTACT

If you encounter any issues during deployment:
1. **STOP** the deployment process
2. Do not proceed with compromised security
3. Double-check all addresses and configurations
4. Ensure Trezor device security before retrying

---

**🔐 Remember: Your security is paramount. Take your time and verify each step.**
