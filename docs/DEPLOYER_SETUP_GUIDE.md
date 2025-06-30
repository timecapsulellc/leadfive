# 🚀 LEADFIVE DEPLOYER SETUP INSTRUCTIONS

## 📋 CURRENT STATUS

**Current Owner**: `0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29` (Deployer address)
**Setup Required**: Fix all 4 package prices and initialize Package 1

---

## 🔧 PHASE 1: PACKAGE INITIALIZATION (Deployer Address)

### **STEP 1: Connect to BSCScan**
1. Go to: https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#writeContract
2. Click "Connect to Web3"
3. Connect wallet with address: `0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29`
4. **VERIFY**: You are connected as the contract owner

### **STEP 2: Fix Package 1 (Entry Level - $30)**
Function: `setPackageInfo(uint8,uint256,uint16,uint16,uint16,uint16,uint16,uint16)`

**Parameters:**
```
packageId: 0
price: 111000000000000000 (0.111 BNB in wei)
directBonus: 4000 (40%)
levelBonus: 1000 (10%)
uplineBonus: 1000 (10%)
leaderBonus: 1000 (10%)
helpBonus: 3000 (30%)
clubBonus: 0 (0%)
```

### **STEP 3: Fix Package 2 (Standard - $50)**
**Current**: 30 BNB (~$8,100) ❌
**Correct**: 0.185 BNB (~$50) ✅

**Parameters:**
```
packageId: 1
price: 185000000000000000 (0.185 BNB in wei)
directBonus: 4000 (40%)
levelBonus: 1000 (10%)
uplineBonus: 1000 (10%)
leaderBonus: 1000 (10%)
helpBonus: 3000 (30%)
clubBonus: 0 (0%)
```

### **STEP 4: Fix Package 3 (Advanced - $100)**
**Current**: 50 BNB (~$13,500) ❌
**Correct**: 0.370 BNB (~$100) ✅

**Parameters:**
```
packageId: 2
price: 370000000000000000 (0.370 BNB in wei)
directBonus: 4000 (40%)
levelBonus: 1000 (10%)
uplineBonus: 1000 (10%)
leaderBonus: 1000 (10%)
helpBonus: 3000 (30%)
clubBonus: 0 (0%)
```

### **STEP 5: Fix Package 4 (Premium - $200)**
**Current**: 100 BNB (~$27,000) ❌
**Correct**: 0.741 BNB (~$200) ✅

**Parameters:**
```
packageId: 3
price: 741000000000000000 (0.741 BNB in wei)
directBonus: 4000 (40%)
levelBonus: 1000 (10%)
uplineBonus: 1000 (10%)
leaderBonus: 1000 (10%)
helpBonus: 3000 (30%)
clubBonus: 0 (0%)
```

---

## ✅ VERIFICATION AFTER EACH STEP

Run this command after each package setup:
```bash
node verify-pdf-packages.js
```

**Expected Result**: All 4 packages should show ✅ CORRECT status

---

## 🔄 PHASE 2: OWNERSHIP TRANSFER TO TREZOR

### **After All Packages Are Correctly Set:**

1. **Final Verification**:
   ```bash
   node verify-pdf-packages.js
   ```
   Ensure all packages show ✅ CORRECT

2. **Test Registration**:
   ```bash
   node test-registration.js
   ```
   Verify registration works with Package 1

3. **Transfer Ownership**:
   - Use BSCScan Write Contract
   - Function: `transferOwnership(address)`
   - New Owner: `[YOUR_TREZOR_ADDRESS]`

---

## 💡 WHY THIS APPROACH IS OPTIMAL

### **✅ Advantages of Deployer Setup First:**
- **Speed**: Fast transactions without Trezor confirmation delays
- **Cost**: Lower gas fees for multiple transactions
- **Flexibility**: Easy to fix mistakes if wrong values entered
- **Testing**: Can quickly test and verify before final transfer

### **✅ Advantages of Trezor Ownership After:**
- **Security**: Maximum security for production operations
- **Trust**: Users know contract is secured by hardware wallet
- **Compliance**: Best practice for production contracts

---

## 🎯 EXECUTION PLAN

### **TODAY: Setup Phase**
1. ✅ Connect deployer wallet to BSCScan
2. ✅ Execute 4 setPackageInfo transactions (fix all packages)
3. ✅ Verify all packages are correctly set
4. ✅ Test ROOT user registration

### **AFTER VERIFICATION: Security Phase**
1. ✅ Transfer ownership to Trezor address
2. ✅ Verify Trezor can control contract
3. ✅ Platform ready for production users

---

## 🚨 CRITICAL VALUES TO USE

**Package Prices (in wei):**
- Package 0: `111000000000000000` (0.111 BNB = $30)
- Package 1: `185000000000000000` (0.185 BNB = $50)
- Package 2: `370000000000000000` (0.370 BNB = $100)
- Package 3: `741000000000000000` (0.741 BNB = $200)

**Commission Rates (all packages):**
- directBonus: `4000` (40%)
- levelBonus: `1000` (10%)
- uplineBonus: `1000` (10%)
- leaderBonus: `1000` (10%)
- helpBonus: `3000` (30%)
- clubBonus: `0` (0%)

---

## 🤖 AUTOMATED SETUP OPTION

### **Option A: Automated Script (Faster)**
If you have the deployer private key, you can use the automated setup:

```bash
node setup-executor.js YOUR_PRIVATE_KEY
```

**⚠️ Security Notes:**
- Only use with deployer wallet (not production keys)
- Script will verify you're the owner before executing
- Automatically sets all 4 packages in sequence
- Includes verification after each step

### **Option B: Manual BSCScan (Safer)**
Follow the manual steps below if you prefer not to use private keys in scripts.

---

**This approach gives you the best of both worlds: efficient setup + maximum security! 🚀**
