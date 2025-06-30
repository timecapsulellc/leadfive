# 💰 UPDATED BNB REQUIREMENTS FOR MAINNET DEPLOYMENT

## ✅ **OPTIMIZED GAS REQUIREMENTS**

### **Deployment Costs:**
- **Contract Deployment:** ~0.03-0.05 BNB
- **Ownership Transfer:** ~0.001-0.002 BNB
- **Contract Verification:** Free (BSCScan)
- **Buffer for Gas Price Fluctuations:** ~0.02-0.03 BNB

### **💡 RECOMMENDED BNB AMOUNTS:**

| Purpose | Minimum Required | Recommended | 
|---------|------------------|-------------|
| **Contract Deployment** | 0.05 BNB | 0.08 BNB |
| **Ownership Transfer** | 0.005 BNB | 0.01 BNB |
| **Total for Deployment** | **0.055 BNB** | **0.1 BNB** |

### **📊 DEPLOYMENT BREAKDOWN:**

**What uses the most gas:**
1. **Library Deployments** (~60% of gas cost)
   - DataStructures, MatrixManagementLib, PoolDistributionLib, etc.
2. **Main Contract Deployment** (~35% of gas cost)
   - LeadFive contract with UUPS proxy
3. **Initialization** (~5% of gas cost)
   - Contract setup and configuration

### **⚡ GAS OPTIMIZATION:**

Our deployment is optimized with:
- ✅ **Aggressive compiler optimization** (runs: 1)
- ✅ **Library modularization** (reduces main contract size)
- ✅ **UUPS proxy pattern** (efficient upgrades)
- ✅ **Optimized gas price** (5 gwei for BSC mainnet)

### **🔧 UPDATED SCRIPT REQUIREMENTS:**

- **`deploy-mainnet.cjs`:** Minimum 0.05 BNB
- **`transfer-ownership.cjs`:** Minimum 0.005 BNB
- **Total Safety Buffer:** 0.1 BNB recommended

---

## 🎯 **FINAL DEPLOYMENT CHECKLIST:**

- [ ] **0.1 BNB** in deployer wallet ✅
- [ ] **Trezor address** ready for ownership transfer
- [ ] **BSCScan API key** configured
- [ ] **Private key** ready (to be rotated after deployment)

---

**💡 Pro Tip:** 0.1 BNB provides a comfortable safety margin for deployment and ownership transfer, even during network congestion periods!
