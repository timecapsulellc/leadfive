# 🚀 LeadFive Frontend Integration Guide

## 📋 Files to Update in Your Existing Frontend

Replace or update these files in your DigitalOcean deployment:

### 1. **Contract Configuration** (`contractConfig.js`)
```javascript
// Update your contract config file with these new addresses
LEADFIVE_ADDRESS: '0x29dcCb502D10C042BcC6a02a7762C49595A9E498'
USDT_ADDRESS: '0x55d398326f99059fF775485246999027B3197955'
DEFAULT_SPONSOR: '0xCeaEfDaDE5a0D574bFd5577665dC58d132995335'
```

### 2. **Contract ABI** (`contractABI.js`)
- Updated with all new LeadFive functions
- Includes all events for frontend listening
- USDT ABI for token interactions

### 3. **React Hooks** (`useLeadFive.js`)
- `useWallet()` - Wallet connection and network management
- `useLeadFiveContract()` - Contract interaction hook
- `useUSDTContract()` - USDT token operations
- `useUserData()` - User information fetching
- `useRegistration()` - User registration flow
- `useWithdrawal()` - Withdrawal operations

### 4. **Utility Functions** (`utils.js`)
- Amount formatting helpers
- Address formatting
- Error parsing
- Withdrawal calculations
- Event listeners setup

---

## 🔧 Quick Integration Steps

### Step 1: Update Configuration
Replace your existing contract config with:
```javascript
import { CONTRACT_CONFIG } from './contractConfig.js';

// Use these in your existing components
const contractAddress = CONTRACT_CONFIG.LEADFIVE_ADDRESS;
const usdtAddress = CONTRACT_CONFIG.USDT_ADDRESS;
const defaultSponsor = CONTRACT_CONFIG.DEFAULT_SPONSOR;
```

### Step 2: Update Your Existing Hooks
Replace your contract interaction hooks with the new ones:
```javascript
import { 
  useWallet, 
  useLeadFiveContract, 
  useUserData,
  useRegistration,
  useWithdrawal 
} from './useLeadFive.js';
```

### Step 3: Update Components
In your existing React components, replace the contract calls:

**Before:**
```javascript
// Old way
const contract = new ethers.Contract(oldAddress, oldABI, signer);
```

**After:**
```javascript
// New way
const { contract } = useLeadFiveContract(signer);
const { userInfo, loading } = useUserData(contract, account);
const { register } = useRegistration(contract, usdtContract, account);
```

### Step 4: Update Network Configuration
Ensure your app connects to BSC Mainnet:
```javascript
const { isCorrectNetwork, switchToCorrectNetwork } = useWallet();

if (!isCorrectNetwork) {
  await switchToCorrectNetwork();
}
```

---

## 📱 Example Usage in Your Existing Components

### Registration Component Update:
```javascript
import { useRegistration } from './useLeadFive.js';
import { CONTRACT_CONFIG } from './contractConfig.js';

const YourRegistrationComponent = () => {
  const { register, loading, error } = useRegistration(contract, usdtContract, account);
  
  const handleRegister = async (packageLevel) => {
    const result = await register(packageLevel, CONTRACT_CONFIG.DEFAULT_SPONSOR);
    if (result.success) {
      // Handle success
    }
  };
  
  // Rest of your component...
};
```

### User Dashboard Update:
```javascript
import { useUserData } from './useLeadFive.js';
import { formatAmount } from './utils.js';

const YourDashboardComponent = () => {
  const { userInfo, loading } = useUserData(contract, account);
  
  return (
    <div>
      {userInfo && (
        <>
          <p>Balance: {formatAmount(userInfo.balance)} USDT</p>
          <p>Package: Level {userInfo.packageLevel}</p>
          <p>Referrals: {userInfo.directReferrals}</p>
        </>
      )}
    </div>
  );
};
```

---

## 🌐 Deployment Updates

### 1. Upload New Files
Upload these files to your DigitalOcean server:
- `contractConfig.js`
- `contractABI.js` 
- `useLeadFive.js`
- `utils.js`

### 2. Update Imports
Update your existing component imports to use the new files.

### 3. Test Functions
Test these key functions:
- ✅ Wallet connection to BSC Mainnet
- ✅ User registration with USDT
- ✅ Balance display
- ✅ Withdrawal functionality

### 4. Environment Variables
Update any environment variables:
```bash
REACT_APP_CONTRACT_ADDRESS=0x29dcCb502D10C042BcC6a02a7762C49595A9E498
REACT_APP_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
REACT_APP_DEFAULT_SPONSOR=0xCeaEfDaDE5a0D574bFd5577665dC58d132995335
REACT_APP_CHAIN_ID=56
```

---

## ✅ Testing Checklist

After updating your frontend:

- [ ] Wallet connects to BSC Mainnet (Chain ID: 56)
- [ ] Contract address points to: `0x29dcCb502D10C042BcC6a02a7762C49595A9E498`
- [ ] USDT address points to: `0x55d398326f99059fF775485246999027B3197955`
- [ ] Default sponsor is: `0xCeaEfDaDE5a0D574bFd5577665dC58d132995335`
- [ ] User registration works with real USDT
- [ ] Balance and earnings display correctly
- [ ] Withdrawal functionality works
- [ ] Error handling shows user-friendly messages

---

## 🆘 Quick Fixes

### If registration fails:
1. Check USDT balance
2. Verify USDT approval
3. Ensure BSC Mainnet connection
4. Check sponsor address is valid

### If balance doesn't show:
1. Verify contract address is correct
2. Check network connection
3. Refresh user data

### If withdrawal fails:
1. Check daily withdrawal limit
2. Verify sufficient balance
3. Ensure minimum 1 USDT withdrawal

---

**Your LeadFive frontend is now ready for mainnet with the deployed contract!** 🎉
