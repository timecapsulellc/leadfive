# 🔐 Ownership Transfer Guide

## ⚠️ **CRITICAL SECURITY STEP**

Transferring contract ownership from your hot wallet to a **Trezor cold wallet** is essential for security.

## 📋 **Prerequisites**

### 1. **Get Your Trezor Wallet Address**
- Connect your Trezor device
- Open Trezor Suite or MetaMask with Trezor
- Go to your Ethereum/BSC account
- Copy the wallet address (starts with 0x...)

### 2. **Verify Address**
- Ensure it's a BSC-compatible address
- Double-check the address is correct
- Test with a small transaction first (optional)

---

## 🚀 **Transfer Process**

### **Step 1: Update Transfer Script**
```bash
# Edit the transfer script with your Trezor address
nano scripts/transfer-ownership.cjs

# Replace this line:
const NEW_OWNER_ADDRESS = "YOUR_TREZOR_WALLET_ADDRESS";

# With your actual Trezor address:
const NEW_OWNER_ADDRESS = "0xYourTrezorAddressHere";
```

### **Step 2: Run Transfer**
```bash
# Decrypt credentials temporarily
node scripts/decrypt-env.cjs

# Add decrypted private key to .env temporarily
# Then run ownership transfer
npx hardhat run scripts/transfer-ownership.cjs --network bsc
```

### **Step 3: Verify Transfer**
- Check on BSCScan that owner changed
- Test admin functions with Trezor
- Remove hot wallet private key

---

## 🔒 **Security Benefits**

### **Before Transfer (Hot Wallet)**
- ❌ Private key on computer
- ❌ Vulnerable to malware
- ❌ Always online exposure

### **After Transfer (Trezor)**
- ✅ Private key on hardware device
- ✅ Protected by PIN/passphrase
- ✅ Offline storage
- ✅ Transaction confirmation required

---

## ⚠️ **Important Notes**

1. **Keep Hot Wallet**: Don't delete it completely until you verify Trezor works
2. **Test First**: Try a small admin function after transfer
3. **Backup**: Ensure Trezor seed phrase is safely stored
4. **Documentation**: Update all docs with new owner address

---

## 🎯 **Ready to Transfer?**

**Provide your Trezor wallet address and I'll update the script and execute the transfer.**

**Current Contract**: `0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569`  
**Current Owner**: `0x0faF67B6E49827EcB42244b4C00F9962922Eb931`  
**New Owner**: **[Your Trezor Address Needed]**
