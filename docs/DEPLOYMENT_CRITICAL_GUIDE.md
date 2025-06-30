# 🚀 CRITICAL: Deploy Correct LeadFive Contract

## ⚠️ URGENT ACTION REQUIRED

Your current deployed contract is **WRONG**! It's missing critical features:
- ❌ No admin fees (5%)
- ❌ No pool system (leader/help/club pools)
- ❌ No referral codes
- ❌ No progressive withdrawal rates
- ❌ Wrong package structure

## 🔧 **STEP 1: Add Your Private Key**

**CRITICAL**: You need to add your wallet's private key to deploy the correct contract.

1. **Open your wallet** (MetaMask, Trust Wallet, etc.)
2. **Export your private key** (usually in Settings > Security)
3. **Edit your .env file** and replace:
   ```bash
   DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
   ```
   With your actual private key:
   ```bash
   DEPLOYER_PRIVATE_KEY=0x1234567890abcdef... (your real private key)
   ```

## 🚀 **STEP 2: Deploy the Correct Contract**

Once you've added your private key:

```bash
npm run deploy:correct
```

## 📋 **What Will Happen:**

1. **Deploy LeadFive.sol** (the correct contract with ALL features)
2. **Get new contract address** (use this in frontend)
3. **Auto-verify on BSCScan**
4. **Set admin fee recipient**
5. **Save deployment info**

## 💰 **Requirements:**

- **BNB Balance**: Minimum 0.05 BNB for deployment
- **Private Key**: Your wallet's private key in .env
- **BSCScan API Key**: Already set ✅

## 🎯 **After Deployment:**

1. **Update frontend** with new contract address
2. **Set root user** (your address)
3. **Test with small amount**
4. **Launch to users**

## 🛡️ **Security:**

- ✅ Private key only used for deployment
- ✅ Contract will be verified and transparent
- ✅ Remove private key from .env after deployment
- ✅ All features properly implemented

## 🚨 **IMPORTANT:**

The current contract `0x7FEEA22942407407801cCDA55a4392f25975D998` is **DEPRECATED** and missing critical features. You MUST deploy the correct contract for your MLM system to work properly.

---

**Ready? Add your private key to .env and run: `npm run deploy:correct`**
