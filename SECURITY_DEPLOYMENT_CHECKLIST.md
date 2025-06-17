# 🛡️ ORPHI CROWDFUND MAINNET DEPLOYMENT SECURITY CHECKLIST

## 🔐 Pre-Deployment Security Requirements

### ✅ **1. Environment Security**
- [ ] `.env*` files are in `.gitignore`
- [ ] No `.env` files committed to Git
- [ ] Private keys/mnemonics are encrypted or secure
- [ ] BSCScan API key is valid and configured

### ✅ **2. Hardware Wallet Configuration** 
```bash
# Copy .env.mainnet.secure to .env
cp .env.mainnet.secure .env

# Configure your hardware wallet mnemonic
MNEMONIC=your_hardware_wallet_12_or_24_word_phrase_here
```

### ✅ **3. Fund Deployer Wallet**
- [ ] Deployer wallet (`0x6CCF588dBA15134d7b3647F8237183958Ae87647`) has ≥0.2 BNB
- [ ] Gas fees calculated and budget approved
- [ ] Backup funds available if needed

### ✅ **4. Network Configuration**
- [ ] BSC Mainnet RPC URL is working
- [ ] Network connectivity verified
- [ ] Chain ID is 56 (BSC Mainnet)

### ✅ **5. Contract Security**
- [ ] Admin wallet is MetaMask address: `0xD29ef4aE187AB9E07B7E0839CF64508A3D70A229`
- [ ] All contracts compile without errors
- [ ] Security functions are present and working
- [ ] USDT contract address verified: `0x55d398326f99059fF775485246999027B3197955`

---

## 🚀 Deployment Steps

### **Step 1: Run Security Validation**
```bash
npx hardhat run scripts/security-validation.cjs --network bsc
```
> ✅ Must show "SECURITY VALIDATION SUCCESSFUL" before proceeding

### **Step 2: Execute Mainnet Deployment**
```bash
npx hardhat run scripts/deploy-mainnet-comprehensive.cjs --network bsc
```

### **Step 3: Verify Contract on BSCScan**
```bash
npx hardhat verify --network bsc [CONTRACT_ADDRESS] \
  "0x55d398326f99059fF775485246999027B3197955" \
  "0xD29ef4aE187AB9E07B7E0839CF64508A3D70A229" \
  "0xD29ef4aE187AB9E07B7E0839CF64508A3D70A229" \
  "0xD29ef4aE187AB9E07B7E0839CF64508A3D70A229"
```

---

## 🔒 Post-Deployment Security Actions

### **Immediate Actions (Within 5 minutes)**
1. **Transfer Admin Rights**
   - Transfer contract ownership to MetaMask wallet
   - Grant all admin roles to MetaMask wallet
   - Revoke all deployer privileges

2. **Verify Deployment**
   - Check contract is verified on BSCScan
   - Test basic contract functions
   - Confirm ownership transfer completed

3. **Secure Private Keys**
   - Delete `.env` file or encrypt it
   - Remove private keys from any devices
   - Store hardware wallet securely

### **Security Verification Commands**
```bash
# Check contract owner
npx hardhat run scripts/check-contract-ownership.cjs --network bsc

# Verify all admin roles
npx hardhat run scripts/verify-admin-roles.cjs --network bsc
```

---

## 🚨 Emergency Procedures

### **If Deployment Fails**
1. **Check Error Logs**
   - Review deployment error details
   - Check gas fees and network status
   - Verify wallet balance and connectivity

2. **Retry Deployment**
   - Increase gas limit if needed
   - Try alternative RPC endpoints
   - Use backup deployer wallet if necessary

### **If Security Breach Detected**
1. **Emergency Pause** (if contract is deployed)
   ```bash
   # Using MetaMask wallet
   contract.emergencyPause()
   ```

2. **Contact Security Team**
   - Document the security issue
   - Implement immediate mitigation
   - Plan security patch deployment

---

## 📋 Final Security Checklist

### **Before Going Live**
- [ ] Contract successfully deployed
- [ ] Contract verified on BSCScan
- [ ] Admin rights transferred to MetaMask wallet
- [ ] Deployer privileges revoked
- [ ] All tests passed on mainnet
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Team notified of successful deployment

### **Ongoing Security**
- [ ] Monitor contract activity
- [ ] Set up alerting for admin functions
- [ ] Regular security reviews scheduled
- [ ] Backup admin procedures documented
- [ ] Emergency response plan activated

---

## 🔗 Important Links

- **BSCScan Contract**: https://bscscan.com/address/[CONTRACT_ADDRESS]
- **BSC Mainnet Explorer**: https://bscscan.com/
- **USDT Contract**: https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955
- **Admin Wallet**: https://bscscan.com/address/0xD29ef4aE187AB9E07B7E0839CF64508A3D70A229

---

## ⚠️ Critical Security Reminders

1. **NEVER** commit `.env` files to Git
2. **ALWAYS** use hardware wallet for mainnet
3. **IMMEDIATELY** transfer admin rights after deployment
4. **VERIFY** all transactions before confirming
5. **BACKUP** all important data and keys
6. **MONITOR** contract activity post-deployment
7. **UPDATE** security measures regularly

---

**🎯 Deployment Target**: BSC Mainnet  
**🔐 Admin Wallet**: MetaMask (`0xD29ef4aE187AB9E07B7E0839CF64508A3D70A229`)  
**💰 Required Funds**: ≥0.2 BNB for deployment  
**⏰ Deployment Window**: Immediate after security validation passes
