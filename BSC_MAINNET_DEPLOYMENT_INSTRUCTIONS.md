# 🚀 BSC MAINNET DEPLOYMENT INSTRUCTIONS

## ⚠️ **IMPORTANT: PRIVATE KEY SETUP REQUIRED**

To deploy your OrphiCrowdFund contract to BSC mainnet, you need to add your deployer wallet's private key to the environment file.

---

## 📋 **STEP-BY-STEP DEPLOYMENT GUIDE**

### **Step 1: Set Up Your Private Key**

1. **Open the `.env.trezor` file** in your project root
2. **Replace `your_deployer_private_key_here`** with your actual private key:

```bash
# In .env.trezor file, replace this line:
DEPLOYER_PRIVATE_KEY=your_deployer_private_key_here

# With your actual private key (example format):
DEPLOYER_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### **Step 2: Verify Wallet Setup**

**Deployer Wallet Requirements:**
- ✅ **Address:** `0x7FB9622c6b2480Fd75b611b87b16c556A10baA01`
- ✅ **Minimum Balance:** 0.1 BNB (~$60 USD)
- ✅ **Purpose:** Deploy contract only
- ✅ **Network:** BSC Mainnet (Chain ID: 56)

**Trezor Wallet (Admin):**
- ✅ **Address:** `0xeB652c4523f3Cf615D3F3694b14E551145953aD0`
- ✅ **Purpose:** All admin functions after deployment
- ✅ **Roles:** Owner, Treasury, Emergency, Pool Manager

### **Step 3: Optional - Set BSCScan API Key**

For contract verification, add your BSCScan API key:

```bash
# In .env.trezor file:
BSCSCAN_API_KEY=your_actual_bscscan_api_key_here
```

Get your API key from: https://bscscan.com/apis

---

## 🚀 **DEPLOYMENT COMMAND**

Once you've set up your private key, run:

```bash
npx hardhat run scripts/deploy-trezor-bsc-mainnet.js --network bsc
```

---

## 💰 **DEPLOYMENT COSTS**

| Item | Amount | USD (BNB=$600) |
|------|--------|----------------|
| **Gas Limit** | 3,000,000 | - |
| **Gas Price** | 5 Gwei | - |
| **Total Cost** | ~0.05-0.1 BNB | ~$30-60 |
| **Min Balance** | 0.1 BNB | ~$60 |

---

## 🔐 **SECURITY NOTES**

### **Private Key Security:**
- ⚠️ **NEVER** commit your private key to version control
- ⚠️ **NEVER** share your private key with anyone
- ✅ **ONLY** use for deployment, then remove from file
- ✅ **BACKUP** your private key securely

### **Deployment Process:**
1. **Deployer wallet** pays gas and deploys contract
2. **Contract ownership** immediately transfers to Trezor wallet
3. **All admin functions** require Trezor confirmation
4. **Deployer wallet** has no ongoing access to contract

---

## 📊 **WHAT HAPPENS DURING DEPLOYMENT**

### **Contract Deployment:**
```
✅ Deploy OrphiCrowdFund with UUPS proxy
✅ Initialize with BSC mainnet USDT address
✅ Set all admin roles to Trezor wallet
✅ Verify deployment on BSCScan
✅ Save deployment info to file
```

### **Admin Roles Assignment:**
```
Owner: 0xeB652c4523f3Cf615D3F3694b14E551145953aD0 (Trezor)
Treasury: 0xeB652c4523f3Cf615D3F3694b14E551145953aD0 (Trezor)
Emergency: 0xeB652c4523f3Cf615D3F3694b14E551145953aD0 (Trezor)
Pool Manager: 0xeB652c4523f3Cf615D3F3694b14E551145953aD0 (Trezor)
```

---

## 📈 **POST-DEPLOYMENT STEPS**

### **Immediate Actions (Day 1):**

1. **Verify Contract on BSCScan:**
```bash
npx hardhat verify --network bsc [CONTRACT_ADDRESS] "0x55d398326f99059fF775485246999027B3197955" "0xeB652c4523f3Cf615D3F3694b14E551145953aD0" "0xeB652c4523f3Cf615D3F3694b14E551145953aD0" "0xeB652c4523f3Cf615D3F3694b14E551145953aD0"
```

2. **Update Frontend Configuration:**
   - Replace contract address in frontend
   - Update ABI files
   - Test all user interactions

3. **Run Integration Tests:**
   - Test user registration
   - Test package purchases
   - Test commission distributions
   - Test withdrawal functions

### **Security Setup (Week 1):**

1. **Remove Private Key:**
   - Delete private key from `.env.trezor` file
   - Secure backup of private key offline

2. **Set Up Monitoring:**
   - Contract balance monitoring
   - Transaction volume tracking
   - Error rate monitoring
   - Gas usage optimization

3. **Test Admin Functions:**
   - Test emergency pause with Trezor
   - Test pool management functions
   - Test treasury operations

---

## 🎯 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment:**
- [ ] Private key added to `.env.trezor`
- [ ] Deployer wallet has 0.1+ BNB
- [ ] BSCScan API key added (optional)
- [ ] Contract compiles successfully
- [ ] Network connectivity verified

### **During Deployment:**
- [ ] Monitor deployment progress
- [ ] Confirm transaction on BSC
- [ ] Wait for block confirmations
- [ ] Verify contract deployment

### **Post-Deployment:**
- [ ] Contract verified on BSCScan
- [ ] Admin roles confirmed on Trezor
- [ ] Frontend updated with new address
- [ ] Integration tests passed
- [ ] Private key removed from file

---

## 🆘 **TROUBLESHOOTING**

### **Common Issues:**

**"No signers available"**
- ✅ Add your private key to `.env.trezor`
- ✅ Ensure private key starts with `0x`
- ✅ Check private key is 64 characters (+ 0x prefix)

**"Insufficient funds"**
- ✅ Add more BNB to deployer wallet
- ✅ Minimum 0.1 BNB required

**"Network error"**
- ✅ Check internet connection
- ✅ Try different BSC RPC endpoint
- ✅ Wait and retry deployment

**"Contract verification failed"**
- ✅ Add BSCScan API key
- ✅ Wait 1-2 minutes after deployment
- ✅ Retry verification command

---

## 📞 **SUPPORT**

If you encounter any issues during deployment:

1. **Check the troubleshooting section above**
2. **Review the deployment logs for error messages**
3. **Ensure all prerequisites are met**
4. **Contact support with specific error messages**

---

## 🎉 **SUCCESS INDICATORS**

**Deployment Successful When:**
- ✅ Contract address generated
- ✅ Transaction confirmed on BSC
- ✅ Admin roles assigned to Trezor
- ✅ Contract verified on BSCScan
- ✅ All functions working correctly

**Your OrphiCrowdFund platform will be live on BSC mainnet!**

---

*Last Updated: June 10, 2025*  
*Status: Ready for Deployment*
