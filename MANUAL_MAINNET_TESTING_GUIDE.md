# 🎯 Manual Mainnet Testing Guide - BSCScan Method

## 📍 Contract Information
- **Contract**: `0xE93db0753A90b495e8FE31f9793c9D4dbf2E29C7`
- **USDT**: `0x55d398326f99059fF775485246999027B3197955`
- **Admin Wallet**: `0xBcae617E213145BB76fD8023B3D9d7d4F97013e5` (Has 30 USDT)

## 🔧 Step-by-Step Manual Testing via BSCScan

### **Step 1: Connect MetaMask to BSCScan**

1. Go to: https://bscscan.com/address/0xE93db0753A90b495e8FE31f9793c9D4dbf2E29C7#writeContract
2. Click "Connect to Web3" 
3. Connect your MetaMask with the admin wallet (`0xBcae617E213145BB76fD8023B3D9d7d4F97013e5`)
4. Make sure you're on BSC Mainnet

### **Step 2: Approve USDT Spending**

1. Go to USDT contract: https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955#writeContract
2. Connect MetaMask
3. Find function `1. approve`
4. Enter:
   - **spender**: `0xE93db0753A90b495e8FE31f9793c9D4dbf2E29C7`
   - **amount**: `30000000000000000000` (30 USDT in wei - 18 decimals)
5. Click "Write" and confirm transaction

### **Step 3: Register Root User**

**Option A: Try Admin Registration**
1. Go back to OrphiCrowdFund: https://bscscan.com/address/0xE93db0753A90b495e8FE31f9793c9D4dbf2E29C7#writeContract
2. Find function `registerRootUser`
3. Enter:
   - **user**: `0xBcae617E213145BB76fD8023B3D9d7d4F97013e5` (your admin wallet)
   - **_tier**: `1` (Package 1 - $30)
4. Click "Write" and confirm

**Option B: Regular Registration (if Option A fails)**
1. Find function `register`
2. Enter:
   - **sponsor**: `0x0000000000000000000000000000000000000000` (zero address for root user)
   - **_tier**: `1` (Package 1)
3. Click "Write" and confirm

### **Step 4: Verify Registration**

1. Go to "Read Contract" tab: https://bscscan.com/address/0xE93db0753A90b495e8FE31f9793c9D4dbf2E29C7#readContract
2. Find function `users`
3. Enter your admin wallet: `0xBcae617E213145BB76fD8023B3D9d7d4F97013e5`
4. Click "Query" and check:
   - `exists`: should be `true`
   - `isActive`: should be `true`
   - `totalInvestment`: should be `30000000000000000000` (30 USDT)
   - `packageLevel`: should be `1`

### **Step 5: Check Contract Totals**

1. Check `totalUsers` - should be `1`
2. Check `totalInvestments` - should show your 30 USDT investment
3. Check `registrationOpen` - should be `true`

## 🎉 **Expected Results:**

✅ **USDT Approved**: 30 USDT approved for contract  
✅ **User Registered**: First user in the MLM system  
✅ **Investment Recorded**: 30 USDT investment confirmed  
✅ **Contract Active**: System ready for more users  

## 🔧 **If Registration Succeeds:**

### **Next Tests You Can Do:**

1. **Test Package Amounts**:
   - Read `getPackageAmount(1)` = 30 USDT
   - Read `getPackageAmount(3)` = 100 USDT

2. **Test User Data**:
   - Check your user struct for all MLM data
   - Verify binary tree placement

3. **Add Second User** (with different wallet):
   - Get another wallet with 30+ USDT
   - Register with your admin wallet as sponsor
   - Test bonus calculations

## 🚨 **Troubleshooting:**

### **If USDT Approval Fails:**
- Make sure you have enough BNB for gas (~0.001 BNB)
- Check USDT balance is actually 30+ USDT
- Try increasing gas limit

### **If Registration Fails:**
- Check if contract is paused: Read `paused()` 
- Check if registration is open: Read `registrationOpen()`
- Verify USDT approval worked: Check `allowance` on USDT contract

### **If You See "Execution Reverted":**
- Common reasons:
  - Insufficient USDT balance
  - USDT not approved
  - Invalid package tier
  - Contract paused

## 📊 **Success Indicators:**

When everything works:
- ✅ Transaction appears on BSCScan
- ✅ User struct shows your data
- ✅ totalUsers increases to 1
- ✅ totalInvestments shows 30 USDT
- ✅ Your USDT balance decreases by 30

## 🎯 **After Successful Registration:**

1. **Screenshot/Record** the successful transaction
2. **Document** the user data for verification
3. **Test Frontend Integration** with the working contract
4. **Add More Test Users** to test MLM features
5. **Test Withdrawal Functions** (if any bonuses are available)

---

**This manual method gives you full control and visibility into each step of the testing process!** 🚀
