# 🚀 BSC MAINNET DEPLOYMENT INSTRUCTIONS

## ✅ **Script Tested Successfully on Testnet**
- Contract Address: `0x15F53E08a4F4732192778CCEB532694349D26684`
- All security features working
- Delayed ownership transfer configured
- Ready for mainnet deployment

## 🔧 **Step 1: Environment Setup**

Create a `.env` file in your project root with these variables:

```bash
# BSC Mainnet Configuration
BSC_MAINNET_RPC_URL=https://bsc-dataseed.binance.org/
DEPLOYER_PRIVATE_KEY=your_mainnet_private_key_here

# Future contract owner (can be same as deployer initially)
FINAL_OWNER_ADDRESS=0x_your_final_owner_address

# BSCScan API Key for verification
BSCSCAN_API_KEY=your_bscscan_api_key

# Optional: Additional admins
ADMIN_1_ADDRESS=0x_additional_admin_1
ADMIN_2_ADDRESS=0x_additional_admin_2
```

## 💰 **Step 2: Prepare Mainnet Wallet**

Ensure your deployer wallet has:
- ✅ **Minimum 0.1 BNB** for deployment gas
- ✅ **Additional 0.05 BNB** for verification and testing
- ✅ **Private key securely stored** (never commit to git)

## 🚀 **Step 3: Deploy to Mainnet**

```bash
# Deploy the contract
npx hardhat run scripts/deploy-mainnet-secure.cjs --network bsc_mainnet
```

## 🔍 **Step 4: Verify Contract**

```bash
# Verify on BSCScan (address provided by deployment script)
npx hardhat verify --network bsc_mainnet <CONTRACT_ADDRESS>
```

## 🧪 **Step 5: Test Deployment**

```bash
# Test the deployed contract
npx hardhat run test-quick.cjs --network bsc_mainnet
```

## 🔒 **Security Features Included**

### ✅ **Delayed Ownership Transfer**
- Contract deploys with you as owner
- Ownership transfer script generated but NOT executed
- 7-day delay built into process
- Manual execution required after frontend completion

### ✅ **Admin Controls**
- You're automatically set as admin
- All admin functions available immediately
- Emergency controls accessible
- Additional admins configurable

### ✅ **Contract Security**
- UUPS upgradeable pattern
- MEV protection enabled
- Pause/unpause functionality
- Blacklist management
- Emergency withdrawal functions

## 📋 **What Happens During Deployment**

1. **Security Checks**: Validates addresses, balance, network
2. **Contract Deployment**: Deploys proxy + implementation
3. **Verification**: Tests basic functionality
4. **Transfer Setup**: Creates ownership transfer script (doesn't execute)
5. **Documentation**: Generates deployment report and scripts

## 📄 **Files Generated**

- `scripts/transfer-ownership-XXXXXX.cjs` - Execute when ready to transfer ownership
- `deployment-mainnet-XXXXXX.json` - Complete deployment report
- Console output with all addresses and next steps

## ⏰ **Timeline**

- **Immediate**: Contract deployed and functional
- **Day 1-7**: Complete frontend integration and testing
- **After 7 days**: Execute ownership transfer when ready

## 🎯 **Contract Features Deployed**

✅ **8-tier package system** ($30-$2000)  
✅ **40% direct sponsor bonus**  
✅ **10-level bonus distribution**  
✅ **30-level upline chain**  
✅ **Binary matrix (2×∞)**  
✅ **Global pools** (Leader, Help, Club)  
✅ **4× earnings cap system**  
✅ **Progressive withdrawal rates** (70-80%)  
✅ **Auto-reinvestment logic**  

## 🔗 **Useful Commands**

```bash
# Check contract on BSCScan
https://bscscan.com/address/<CONTRACT_ADDRESS>

# Test contract functions
npx hardhat console --network bsc_mainnet

# Transfer ownership (when ready)
npx hardhat run scripts/transfer-ownership-XXXXXX.cjs --network bsc_mainnet
```

## ⚠️ **Important Reminders**

1. **Test thoroughly** before ownership transfer
2. **Keep private keys secure** - never share or commit
3. **Monitor contract activity** after deployment
4. **Have emergency procedures** ready
5. **Document everything** for your team

---

**Ready to deploy?** Run the command above when you're prepared! 🚀 