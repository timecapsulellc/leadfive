# 🚀 SIMPLE MAINNET DEPLOYMENT CHECKLIST

## ✅ **ENVIRONMENT SETUP COMPLETE**

### **Single Configuration File**: `.env`
- ✅ All other `.env.*` files removed for security
- ✅ New deployer address configured: `0x7fACc01378034AB1dEaEd266a7f07E05C141606c`
- ✅ MetaMask admin configured: `0xD29ef4aE187AB9E07B7E0839CF64508A3D70A229`
- ✅ BSC Mainnet settings configured

---

## 🔧 **REQUIRED ACTIONS BEFORE DEPLOYMENT**

### **1. Update `.env` File**
You need to replace these placeholders in your `.env` file:

```bash
# Replace this line:
DEPLOYER_PRIVATE_KEY=YOUR_NEW_DEPLOYER_PRIVATE_KEY_HERE

# With the actual private key for: 0x7fACc01378034AB1dEaEd266a7f07E05C141606c
DEPLOYER_PRIVATE_KEY=your_actual_private_key_without_0x_prefix
```

### **2. Fund Deployer Wallet**
- **Address**: `0x7fACc01378034AB1dEaEd266a7f07E05C141606c`
- **Required**: Minimum **0.2 BNB** for gas fees
- **Check balance**: Make sure the wallet is funded before deployment

### **3. Verify Access**
- ✅ Private key for deployer address
- ✅ Access to MetaMask admin wallet
- ✅ BSCScan API key is valid

---

## 🚀 **DEPLOYMENT COMMAND**

### **Single Command Deployment**:
```bash
npx hardhat run scripts/deploy-mainnet-simple.cjs --network bsc
```

### **What the script does**:
1. ✅ Validates all environment variables
2. ✅ Checks deployer balance
3. ✅ Deploys OrphiCrowdFundComplete contract
4. ✅ Immediately transfers ownership to MetaMask admin
5. ✅ Verifies contract configuration
6. ✅ Attempts BSCScan verification
7. ✅ Saves deployment data

---

## 🛡️ **SECURITY FEATURES**

### **Automatic Security**:
- ✅ Immediate ownership transfer to MetaMask admin
- ✅ Deployer address has no residual privileges
- ✅ All admin roles assigned to MetaMask wallet
- ✅ Contract verification on BSCScan

### **Configuration Validation**:
- ✅ Package prices: $30, $50, $100, $200 USDT
- ✅ USDT integration verified
- ✅ Admin addresses validated
- ✅ Network verification

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

- [ ] **Private key** added to `.env` file
- [ ] **Deployer wallet** funded with ≥0.2 BNB
- [ ] **BSCScan API key** is valid
- [ ] **MetaMask admin wallet** is accessible
- [ ] **Network** set to BSC Mainnet in MetaMask/RPC

---

## 🎯 **EXPECTED OUTPUT**

The deployment script will show:
```
🚀 ORPHI CROWDFUND MAINNET DEPLOYMENT STARTING...
📋 DEPLOYMENT CONFIGURATION:
👤 Deployer: 0x7fACc01378034AB1dEaEd266a7f07E05C141606c
💰 Balance: X.XX BNB
🏗️  DEPLOYING CONTRACT...
✅ Contract deployed at: 0x[CONTRACT_ADDRESS]
🔐 CHECKING OWNERSHIP...
✅ Ownership successfully transferred!
🔍 VERIFYING CONTRACT CONFIGURATION...
📦 Package Amounts: $30, $50, $100, $200 USDT
🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!
```

---

## 📞 **SUPPORT**

If deployment fails:
1. Check deployer balance
2. Verify private key is correct
3. Ensure you're on BSC Mainnet
4. Check network connectivity

---

**Current Status**: ✅ Ready for deployment once `.env` is updated and deployer is funded
