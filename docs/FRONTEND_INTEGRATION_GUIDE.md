# 🚀 LeadFive Frontend Integration & Admin Setup Guide

## 📋 **CURRENT STATUS**

### ✅ **Contract Deployed & Secured**
- **Contract Address**: `0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569`
- **Owner**: `0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29` (Your Trezor)
- **Network**: BSC Mainnet
- **Status**: Verified & Live

### ⚠️ **ADMIN SETUP REQUIRED**
- **Fee Recipient**: ❌ Not set (currently 0x000...)
- **Root Admin**: ❌ Not registered in MLM system
- **Frontend**: ❌ Needs configuration update

---

## 🔧 **STEP 1: TREZOR ADMIN SETUP**

### **Method A: Using BSCScan (Recommended)**

1. **Go to Contract Write Functions**:
   - Visit: https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#writeContract
   - Connect your Trezor wallet
   - Ensure you're on BSC Mainnet

2. **Set Admin Fee Recipient**:
   ```
   Function: setAdminFeeRecipient
   _recipient: 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29
   ```
   - This will collect all admin fees to your Trezor wallet

3. **Register Root Admin (Optional)**:
   ```
   Function: register
   referrer: 0x0000000000000000000000000000000000000000
   packageLevel: 4
   useUSDT: true
   Value: Send 200 USDT worth of BNB (or approve 200 USDT)
   ```

### **Method B: Using Frontend**
1. Update frontend with new contract address
2. Connect Trezor to frontend
3. Use admin panel to configure settings

---

## 🔗 **STEP 2: FRONTEND CONFIGURATION**

### **Environment Variables (.env)**
```env
# Contract Configuration
VITE_CONTRACT_ADDRESS=0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569
VITE_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# Admin Configuration
VITE_OWNER_ADDRESS=0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29
VITE_ADMIN_ADDRESS=0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29
VITE_FEE_RECIPIENT=0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29

# Network Configuration
VITE_CHAIN_ID=56
VITE_NETWORK_NAME=BSC Mainnet
VITE_RPC_URL=https://bsc-dataseed.binance.org/
VITE_EXPLORER_URL=https://bscscan.com
```

### **Frontend Config File (frontend-config.json)**
```json
{
  "contractAddress": "0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569",
  "ownerAddress": "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29",
  "adminAddress": "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29",
  "network": {
    "chainId": 56,
    "name": "BSC Mainnet",
    "rpcUrl": "https://bsc-dataseed.binance.org/",
    "explorerUrl": "https://bscscan.com"
  },
  "contracts": {
    "leadfive": "0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569",
    "usdt": "0x55d398326f99059fF775485246999027B3197955"
  },
  "admin": {
    "feeRecipient": "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29",
    "rootAdmin": "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29"
  }
}
```

---

## 🧪 **STEP 3: TESTING PLAN**

### **Basic Contract Functions**
1. **Read Functions Test**:
   - Check owner() returns your Trezor address
   - Check adminFeeRecipient() (after setting it)
   - Check getUserInfo() for various addresses

2. **Admin Functions Test**:
   - setAdminFeeRecipient (with Trezor)
   - blacklistUser (test with dummy address)
   - pause/unpause contract

3. **MLM Functions Test**:
   - register new user
   - upgrade package
   - withdraw funds
   - Pool distributions

### **Frontend Integration Test**
1. **Wallet Connection**:
   - Connect Trezor to frontend
   - Switch to BSC Mainnet
   - Display correct balances

2. **Contract Interaction**:
   - Read contract data
   - Execute transactions
   - Handle errors properly

---

## 🔐 **STEP 4: SECURITY CHECKLIST**

### **Admin Security**
- ✅ Ownership transferred to Trezor
- ⏳ Admin fee recipient to be set
- ⏳ Test admin functions with Trezor
- ⏳ Verify all admin controls work

### **Contract Security**
- ✅ Contract verified on BSCScan
- ✅ All credentials encrypted
- ✅ No plaintext secrets in code
- ⏳ Monitor contract activity

---

## 🎯 **IMMEDIATE ACTION ITEMS**

### **Priority 1 (Do Now)**
1. **Set Admin Fee Recipient**:
   - Use BSCScan Write Contract
   - Connect Trezor
   - Execute `setAdminFeeRecipient(0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29)`

2. **Update Frontend**:
   - Deploy with new contract address
   - Test wallet connection
   - Verify all functions work

### **Priority 2 (This Week)**
1. **Register Root Admin**:
   - Decide if you want to be in the MLM system
   - Register with package level 4 if yes

2. **Test Everything**:
   - Test all admin functions
   - Test user registration
   - Test payment flows

3. **Monitor & Maintain**:
   - Set up monitoring
   - Check for issues
   - Handle user support

---

## 🔗 **USEFUL LINKS**

### **Contract Links**
- **Main Contract**: https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569
- **Write Functions**: https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#writeContract
- **Read Functions**: https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#readContract

### **Admin Tools**
- **BSCScan**: https://bscscan.com
- **Trezor Suite**: https://suite.trezor.io
- **MetaMask**: https://metamask.io

---

## ✅ **SUCCESS CRITERIA**

Your LeadFive system will be fully configured when:

1. ✅ **Contract Owner**: Trezor wallet
2. ⏳ **Admin Fee Recipient**: Set to Trezor wallet
3. ⏳ **Frontend**: Updated and working
4. ⏳ **Admin Functions**: All tested and working
5. ⏳ **User Registration**: Working end-to-end
6. ⏳ **Payment Processing**: USDT and BNB working
7. ⏳ **Pool Distributions**: Automated and working

**Next Step**: Execute the admin setup with your Trezor wallet on BSCScan!
