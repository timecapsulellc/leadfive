# OrphiCrowdFund Frontend Integration Guide

## 🎯 Contract Ready for Frontend Integration

**Deployed Contract Details:**
- **Proxy Address**: `0xc42269Ff68ACBD6D6b72DB64d1a8AD4f3A1b7978`
- **USDT Address**: `0x0485c5962391d5d5D8A379B50B94eFC7Ca1cd0FA` (Testnet)
- **Network**: BSC Testnet (97) / BSC Mainnet (56)
- **ABI**: Available in `artifacts/contracts/OrphiCrowdFund.sol/OrphiCrowdFund.json`

---

## 🔧 Essential Frontend Functions

### 👤 User Registration
```javascript
// 1. Approve USDT spending
await usdtContract.approve(contractAddress, packageAmount);

// 2. Register user
await contract.register(sponsorAddress, packageTier, { from: userAddress });
```

### 💰 Check User Balance & Stats
```javascript
// Get user information
const userInfo = await contract.users(userAddress);
const withdrawable = await contract.getWithdrawableBalance(userAddress);
const directReferrals = await contract.getDirectReferrals(userAddress);
```

### 🏦 Withdrawal
```javascript
// Withdraw earnings
await contract.withdraw({ from: userAddress });
```

### 📊 MLM Tree Information
```javascript
// Get binary tree structure
const leftChild = await contract.getLeftChild(userAddress);
const rightChild = await contract.getRightChild(userAddress);
const leftVolume = await contract.getLeftVolume(userAddress);
const rightVolume = await contract.getRightVolume(userAddress);
```

---

## 🎮 Required Frontend Features

### 🔐 User Authentication
- [ ] MetaMask connection
- [ ] Network switching (BSC Testnet/Mainnet)
- [ ] User wallet validation

### 📝 Registration Flow
- [ ] Sponsor link validation
- [ ] Package selection (8 tiers: $30-$2000)
- [ ] USDT balance check
- [ ] USDT approval transaction
- [ ] Registration transaction
- [ ] Success confirmation

### 📊 User Dashboard
- [ ] Current balance display
- [ ] Total earnings
- [ ] Direct referrals count
- [ ] Level bonuses earned
- [ ] Binary tree visualization
- [ ] Withdrawal available amount

### 🌳 MLM Tree Visualization
- [ ] Binary tree structure
- [ ] Left/right volume display
- [ ] Direct referrals list
- [ ] Bonus calculation breakdown

### 🏦 Financial Operations
- [ ] Withdrawal button
- [ ] Transaction history
- [ ] Bonus breakdown
- [ ] Auto-reinvestment tracking

### 👑 Admin Panel (for admins only)
- [ ] Total users count
- [ ] Total investments
- [ ] Pool balances (GHP, Club)
- [ ] Emergency pause/unpause
- [ ] Registration control
- [ ] Root user registration

---

## 🔗 Web3 Integration Example

```javascript
// Contract initialization
import { ethers } from 'ethers';
import contractABI from './OrphiCrowdFund.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

// USDT contract
const usdtContract = new ethers.Contract(usdtAddress, usdtABI, signer);

// Example: Register user
async function registerUser(sponsorAddress, packageTier) {
    try {
        // Get package amount
        const packageAmount = await contract.getPackageAmount(packageTier);
        
        // Check USDT balance
        const userBalance = await usdtContract.balanceOf(userAddress);
        if (userBalance.lt(packageAmount)) {
            throw new Error('Insufficient USDT balance');
        }
        
        // Approve USDT
        const approveTx = await usdtContract.approve(contractAddress, packageAmount);
        await approveTx.wait();
        
        // Register
        const registerTx = await contract.register(sponsorAddress, packageTier);
        await registerTx.wait();
        
        console.log('Registration successful!');
    } catch (error) {
        console.error('Registration failed:', error);
    }
}
```

---

## 📋 Testing Checklist

### 🧪 User Flow Testing
- [ ] Connect wallet
- [ ] Switch to BSC Testnet
- [ ] Get testnet USDT (from faucet or mint function)
- [ ] Test registration with different packages
- [ ] Verify bonus calculations
- [ ] Test withdrawal functionality
- [ ] Check MLM tree updates

### 🔒 Admin Testing
- [ ] Connect admin wallet
- [ ] Test emergency pause
- [ ] Test registration control
- [ ] Register root user
- [ ] Monitor contract state

### 📱 UI/UX Testing
- [ ] Responsive design
- [ ] Error handling
- [ ] Loading states
- [ ] Transaction confirmations
- [ ] Network switching
- [ ] Wallet connection states

---

## 🚀 Deployment Steps

### 1. Frontend Development
- Build UI components for all required features
- Integrate Web3 wallet connection
- Implement contract interaction functions
- Add proper error handling and loading states

### 2. Testnet Testing
- Deploy frontend to staging environment
- Test all user flows on BSC Testnet
- Verify contract interactions
- Test with multiple user accounts

### 3. Mainnet Preparation
- Update contract addresses for mainnet
- Update USDT address to mainnet version
- Test with small amounts first
- Ensure admin functions work properly

### 4. Production Launch
- Deploy frontend to production
- Register root user through admin panel
- Monitor initial user registrations
- Be ready for emergency pause if needed

---

## ⚠️ Important Notes

### 🔐 Security Considerations
- Always validate transactions before sending
- Implement proper error handling
- Show clear transaction confirmations
- Validate network and contract addresses

### 💰 Financial Safety
- Show clear package amounts in USDT
- Display gas fees before transactions
- Implement transaction timeout handling
- Provide clear success/failure feedback

### 🎯 User Experience
- Make registration process simple and clear
- Provide helpful error messages
- Show loading states during transactions
- Implement responsive design for mobile

---

**The smart contract is production-ready and waiting for frontend integration!**

**Next Step**: Start building the frontend interface using this integration guide.
