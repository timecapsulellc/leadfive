# 🚀 Unified Deployment System - Quick Reference

## **Available Commands**

### **Testnet Deployment**
```bash
# Standard testnet deployment
npm run deploy:testnet

# Trezor-secured testnet deployment
npm run deploy:testnet:trezor
```

### **Mainnet Deployment**
```bash
# Standard mainnet deployment
npm run deploy:mainnet

# Trezor-secured mainnet deployment (RECOMMENDED)
npm run deploy:mainnet:trezor
```

### **Utility Commands**
```bash
# Check existing deployment
npm run deploy:check

# Estimate gas costs
npm run deploy:estimate
```

## **What Each Command Does**

### **`npm run deploy:testnet:trezor`**
- ✅ Deploys to BSC Testnet
- ✅ Uses Trezor wallet for all admin roles
- ✅ Automatically detects network and validates connection
- ✅ Checks deployer balance and gas requirements
- ✅ Saves deployment info to `deployments/` folder
- ✅ Provides verification and next steps

### **Output Example**
```
============================================================
🎯 OrphiCrowdFund Unified Deployment
============================================================
ℹ️  Network: BSC Testnet (Chain ID: 97)
ℹ️  Deployment Mode: 🔐 TREZOR
ℹ️  Deployer: 0x...
ℹ️  Balance: 0.15 BNB
```

## **Configuration**

### **Environment Files**
- `.env.trezor` - Contains Trezor wallet address and deployer key
- `.env` - Fallback environment variables

### **Network Detection**
The script automatically detects:
- **Network** from Hardhat configuration
- **Trezor Mode** from `DEPLOYMENT_MODE=trezor` environment variable
- **Admin Addresses** based on deployment mode

## **Deployment Results**

### **Files Created**
```
deployments/
├── deployment-testnet-2025-06-12T16-30-45-123Z.json
├── deployment-mainnet-2025-06-12T16-35-22-456Z.json
├── latest-testnet.json
└── latest-mainnet.json
```

### **Information Saved**
- Contract address and transaction hash
- Network details and explorer links
- Admin role assignments (Trezor vs standard)
- Gas usage and deployment costs
- Verification status and next steps

## **Troubleshooting**

### **Common Issues**

#### **"Insufficient BNB balance"**
```bash
❌ Insufficient BNB balance! Need at least 0.05 BNB
```
**Solution:** Fund the deployer account with testnet BNB

#### **"Network doesn't exist"**
```bash
Error HH100: Network bsc_testnet doesn't exist
```
**Solution:** Check `hardhat.config.cjs` has the correct network configuration

#### **"No deployer account found"**
```bash
❌ No deployer account found! Check your private key configuration.
```
**Solution:** Verify `DEPLOYER_PRIVATE_KEY` in `.env.trezor`

## **Security Notes**

### **Trezor Mode vs Standard Mode**

#### **Trezor Mode (`DEPLOYMENT_MODE=trezor`)**
- 🔐 **Treasury:** Trezor wallet
- 🔐 **Emergency:** Trezor wallet  
- 🔐 **Pool Manager:** Trezor wallet
- 🔐 **Owner:** Trezor wallet

#### **Standard Mode**
- 🔑 **All Roles:** Deployer account
- ⚠️ **Note:** Less secure, requires manual transfer later

### **Best Practices**
1. **Always use Trezor mode** for mainnet deployments
2. **Test on testnet first** before mainnet deployment
3. **Verify contract** on block explorer after deployment
4. **Save deployment files** securely
5. **Monitor contract** activity after deployment

## **Migration from Old Scripts**

### **Before (76 scattered files)**
```bash
# Confusion - which one to use?
./deploy-trezor-testnet.sh
./alternative-trezor-deployment.sh
node scripts/deploy-pure-trezor.js
# ... and 73 more!
```

### **After (1 unified system)**
```bash
# Clear and simple
npm run deploy:testnet:trezor
```

---

**🎯 You now have a professional, enterprise-grade deployment system that replaces 76 scattered scripts with one unified, secure, and maintainable solution!**
