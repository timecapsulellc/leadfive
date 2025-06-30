# 🚀 LEADFIVE MAINNET DEPLOYMENT GUIDE

## ⚠️ **PRE-DEPLOYMENT CHECKLIST**

### 1. **Environment Setup**
- [ ] ✅ Contract tested on BSC Testnet
- [ ] ✅ Advanced testing completed (80% success rate)
- [ ] ✅ Security audit completed
- [ ] ✅ BSCScan API key ready
- [ ] ✅ Sufficient BNB for deployment (minimum 0.1 BNB recommended)

### 2. **Wallet Preparation**
- [ ] 🔐 MetaMask wallet with sufficient BNB
- [ ] 🔐 Trezor wallet address ready for ownership transfer
- [ ] 🔐 New private key generated (rotate after deployment)
- [ ] 🔐 New BSCScan API key generated (rotate after deployment)

---

## 🔧 **DEPLOYMENT PROCESS**

### **Step 1: Final Environment Setup**

1. **Update `.env` file with new credentials:**
```bash
# New private key (to be rotated)
DEPLOYER_PRIVATE_KEY=your_new_private_key_here

# New BSCScan API key (to be rotated)
BSCSCAN_API_KEY=your_new_api_key_here

# BSC Mainnet configuration
BSC_MAINNET_RPC_URL=https://bsc-dataseed.binance.org/
```

2. **Verify network configuration:**
```bash
npx hardhat console --network bsc_mainnet
```

### **Step 2: Deploy to BSC Mainnet**

1. **Run deployment script:**
```bash
npx hardhat run scripts/deploy-mainnet.cjs --network bsc_mainnet
```

2. **Expected output:**
```
🚀 LEADFIVE MAINNET DEPLOYMENT
============================================================
🔍 Deploying with account: 0x...
💰 Deployer balance: X.X BNB

📋 MAINNET CONFIGURATION:
- USDT Address: 0x55d398326f99059fF775485246999027B3197955
- Price Feed Address: 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE
- Network: BSC Mainnet
- Chain ID: 56

🔄 Starting deployment...
📚 Deploying Libraries...
✅ DataStructures deployed at: 0x...
✅ MatrixManagementLib deployed at: 0x...
...
🏗️  Deploying Main Contract...
✅ LeadFive Contract deployed at: 0x...
```

3. **Save deployment address immediately!**

### **Step 3: Transfer Ownership to Trezor**

1. **Update transfer script with your Trezor address:**
```javascript
// In scripts/transfer-ownership.cjs, replace:
const NEW_OWNER_ADDRESS = "YOUR_TREZOR_WALLET_ADDRESS";
// With your actual Trezor address:
const NEW_OWNER_ADDRESS = "0xYourTrezorWalletAddress";
```

2. **Run ownership transfer:**
```bash
npx hardhat run scripts/transfer-ownership.cjs --network bsc_mainnet
```

3. **Verify ownership transfer:**
```bash
npx hardhat console --network bsc_mainnet
const contract = await ethers.getContractAt("LeadFive", "YOUR_CONTRACT_ADDRESS");
await contract.owner(); // Should return your Trezor address
```

### **Step 4: Verify Contract on BSCScan**

1. **Automatic verification (if configured):**
```bash
npx hardhat verify --network bsc_mainnet YOUR_CONTRACT_ADDRESS "0x55d398326f99059fF775485246999027B3197955" "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"
```

2. **Manual verification (if automatic fails):**
- Go to: https://bscscan.com/verifyContract
- Enter contract address
- Select compiler version: 0.8.22
- Upload source code or use Hardhat verification

---

## 🔐 **POST-DEPLOYMENT SECURITY**

### **Immediate Actions (Within 1 hour):**

1. **✅ Rotate Credentials:**
   - Generate new private key
   - Generate new BSCScan API key
   - Update all systems with new credentials
   - Securely delete old credentials

2. **✅ Verify Deployment:**
   - Check contract on BSCScan
   - Verify ownership transferred to Trezor
   - Test basic functions

3. **✅ Update Systems:**
   - Update frontend configuration
   - Update monitoring systems
   - Update documentation

### **Security Verification:**

1. **Check ownership:**
```bash
# Contract owner should be your Trezor address
npx hardhat console --network bsc_mainnet
const contract = await ethers.getContractAt("LeadFive", "CONTRACT_ADDRESS");
await contract.owner();
```

2. **Test Trezor connectivity:**
- Connect Trezor to MetaMask
- Try a small transaction (like viewing contract state)
- Confirm Trezor prompts for approval

---

## 📊 **MONITORING SETUP**

### **Contract Monitoring:**
- Set up BSCScan API monitoring
- Monitor contract balance
- Monitor user registrations
- Monitor transaction volume

### **Security Monitoring:**
- Monitor owner transactions
- Monitor admin function calls
- Set up alerts for unusual activity

---

## 🎯 **FRONTEND INTEGRATION**

### **Update Frontend Configuration:**

1. **Contract addresses:**
```javascript
// Update in your frontend config
VITE_CONTRACT_ADDRESS=YOUR_MAINNET_CONTRACT_ADDRESS
VITE_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
VITE_CHAIN_ID=56
VITE_NETWORK_NAME=BSC Mainnet
VITE_RPC_URL=https://bsc-dataseed.binance.org/
VITE_EXPLORER_URL=https://bscscan.com
```

2. **Test frontend integration:**
- Connect MetaMask to BSC Mainnet
- Test contract interaction
- Verify all functions work correctly

---

## 🚨 **EMERGENCY PROCEDURES**

### **If Something Goes Wrong:**

1. **Contract Issues:**
   - Use Trezor wallet to pause contract
   - Contact development team
   - Implement emergency fixes

2. **Ownership Issues:**
   - Verify Trezor connectivity
   - Check transaction status on BSCScan
   - Use backup procedures if needed

3. **Security Issues:**
   - Pause contract immediately
   - Investigate issue
   - Implement fixes before resuming

---

## ✅ **DEPLOYMENT CHECKLIST**

- [ ] 🚀 Contract deployed to BSC Mainnet
- [ ] 🔐 Ownership transferred to Trezor wallet
- [ ] 🔍 Contract verified on BSCScan
- [ ] 🔑 Credentials rotated
- [ ] 🔗 Frontend updated
- [ ] 📊 Monitoring set up
- [ ] 🧪 Basic functions tested
- [ ] 📋 Documentation updated
- [ ] 👥 Team notified
- [ ] 🎯 Ready for launch!

---

## 📞 **SUPPORT CONTACTS**

- **Development Team:** Available for technical issues
- **Security Team:** Available for security concerns
- **BSCScan Support:** For verification issues

---

**🎉 READY FOR MAINNET LAUNCH! 🎉**
