# 🚀 LEADFIVE CONTRACT SETUP GUIDE

## 📋 CONTRACT INITIALIZATION STATUS

**Current Status**: ❌ **PACKAGES NOT PROPERLY INITIALIZED**

The LeadFive contract at `0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569` needs to be properly initialized with the correct package information according to business requirements.

---

## � BUSINESS REQUIREMENTS (FROM PDF DOCUMENTATION)

### **✅ Package Structure**
| Package | Name | Price | BNB Equivalent* | Description |
|---------|------|-------|----------------|-------------|
| 1 | Entry Level | $30 | ~0.111 BNB | Web3 Starter |
| 2 | Standard | $50 | ~0.185 BNB | Community Builder |
| 3 | Advanced | $100 | ~0.370 BNB | DAO Contributor |
| 4 | Premium | $200 | ~0.741 BNB | Ecosystem Pioneer |

*Based on $270 BNB price

### **✅ Commission Structure**
- **Direct Bonus**: 40% (4000 basis points)
- **Level Bonus**: 10% (1000 basis points)
- **Upline Bonus**: 10% (1000 basis points)
- **Leader Pool**: 10% (1000 basis points)
- **Help Pool**: 30% (3000 basis points)
- **Club Pool**: 0% (0 basis points)

---

## 🔧 STEP-BY-STEP INITIALIZATION

### **STEP 1: Connect to BSCScan**
1. Go to: https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#writeContract
2. Click "Connect to Web3"
3. Connect your Trezor wallet
4. **VERIFY**: You are connected as the contract owner

### **STEP 2: Initialize Package 1 (Entry Level - $30)**
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

### **STEP 3: Initialize Package 2 (Standard - $50)**
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

### **STEP 4: Initialize Package 3 (Advanced - $100)**
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

### **STEP 5: Initialize Package 4 (Premium - $200)**
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

## ✅ VERIFICATION STEPS

### **After Each Package Initialization:**
1. Check transaction confirmation on BSCScan
2. Verify package was set correctly
3. Continue to next package

### **Final Verification:**
Run this command to verify all packages:
```bash
node verify-pdf-packages.js
```

**Expected Result:** All 4 packages should show ✅ CORRECT status

---

## 🎯 ROOT USER REGISTRATION

**After successful initialization**, test with ROOT user registration:

### **Registration Parameters:**
- **Package**: 1 (Entry Level - $30)
- **Referrer**: `0x0000000000000000000000000000000000000000` (zero address for root)
- **Payment**: BNB (approximately 0.111 BNB + gas)

### **Test Command:**
```bash
node test-registration.js
```

---

## ⚠️ IMPORTANT NOTES

### **Before You Start:**
- ✅ Ensure Trezor is connected and unlocked
- ✅ You have sufficient BNB for gas fees
- ✅ You are the verified contract owner
- ✅ Contract is not paused

### **During Initialization:**
- 📝 Initialize ALL 4 packages in order (0, 1, 2, 3)
- 🔄 Wait for each transaction to confirm before proceeding
- 💰 Keep exact parameter values (no modifications)
- 🚫 Do not skip any packages

### **After Initialization:**
- ✅ Run verification script to confirm setup
- ✅ Test ROOT user registration
- ✅ Verify commission calculations
- ✅ Ready for production users

---

## 🚨 TROUBLESHOOTING

### **If Initialization Fails:**
1. **Check Connection**: Ensure wallet is connected as owner
2. **Check Gas**: Increase gas limit if transaction fails
3. **Check Function**: Look for `setPackageInfo` function
4. **Check Parameters**: Verify exact values above

### **If Verification Fails:**
1. **Re-run**: `node verify-pdf-packages.js`
2. **Check Values**: Ensure all 4 packages are initialized
3. **Re-initialize**: Any missing/incorrect packages

### **Support:**
- Run `node analyze-contract.js` for detailed contract state
- Check BSCScan for transaction history
- Verify owner address matches your Trezor

---

## 🎉 SUCCESS CRITERIA

**✅ Contract Ready When:**
- All 4 packages initialized with correct values
- Verification script shows 100% success
- ROOT user registration test passes
- Commission calculations are accurate

**Ready for production users and business launch! 🚀**

### Step 4: Test Registration
```bash
node test-registration.js
```
This tests if registration works after initialization.

## 📁 Script Files

### 1. `analyze-contract.js`
- **Purpose**: Check if contract packages are properly initialized
- **Usage**: `node analyze-contract.js`
- **Output**: Shows package prices, bonuses, and initialization status

### 2. `initialize-contract.js`
- **Purpose**: Provides step-by-step initialization guide
- **Usage**: `node initialize-contract.js`
- **Output**: Manual instructions for BSCScan contract initialization

### 3. `test-registration.js`
- **Purpose**: Test contract registration functionality
- **Usage**: 
  - `node test-registration.js` (check only)
  - `node test-registration.js YOUR_PRIVATE_KEY` (actual test)

## 🎯 Complete Fix Process

### Phase 1: Analysis
```bash
node analyze-contract.js
```
**Expected Output:**
- ❌ Packages NOT Initialized (if first time)
- ✅ All packages initialized (if already done)

### Phase 2: Initialization (If Needed)
```bash
node initialize-contract.js
```
**Follow the manual instructions:**
1. Connect Trezor to BSCScan
2. Find initialization function
3. Input provided values for all 4 packages
4. Execute transactions

### Phase 3: Verification
```bash
node analyze-contract.js
```
**Expected Output:**
- ✅ All packages properly initialized
- Package prices > 0
- Bonuses configured correctly

### Phase 4: Registration Test
```bash
node test-registration.js
```
**Expected Output:**
- ✅ Package 1 price shown
- Manual registration instructions provided

## 🔧 Package Configuration

The scripts configure 4 packages with these values:

| Package | Price (USD) | Price (BNB) | Direct Bonus |
|---------|-------------|-------------|--------------|
| 1       | $30         | 0.111 BNB   | 50%          |
| 2       | $60         | 0.222 BNB   | 50%          |
| 3       | $120        | 0.444 BNB   | 50%          |
| 4       | $200        | 0.741 BNB   | 50%          |

## ⚠️ Important Notes

### Security
- **Never share private keys** in production
- **Test with small amounts** first
- **Use Trezor for all admin functions**

### Gas Fees
- **Initialization**: ~0.01 BNB per transaction (4 transactions total)
- **Registration**: ~0.001 BNB gas fee + package price

### Troubleshooting

**Error: "Packages not initialized"**
- Solution: Run initialization process via BSCScan

**Error: "Insufficient balance"**
- Solution: Add more BNB to wallet (package price + gas)

**Error: "Transaction likely to fail"**
- Solution: Ensure packages are initialized first

**Error: "Contract not found"**
- Solution: Check contract address is correct

## 📞 Support

If you encounter issues:

1. **Check contract status**: `node analyze-contract.js`
2. **Verify BSC connection**: Check RPC endpoint
3. **Confirm wallet connection**: Ensure Trezor is connected
4. **Review gas fees**: Ensure sufficient BNB balance

## 🎉 Success Indicators

✅ **Contract initialized**: All package prices > 0
✅ **Registration possible**: Test script shows package prices
✅ **Root user created**: First registration successful
✅ **Platform ready**: Users can register and participate

After successful initialization, your LeadFive platform will be fully operational!
