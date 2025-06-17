# 🚀 OrphiCrowdFund Mainnet Dashboard Testing Guide

## Quick Start
1. Open `mainnet-dashboard-testing.html` in your browser
2. Connect your MetaMask wallet (0xBcae617E213145BB76fD8023B3D9d7d4F97013e5)
3. Ensure you're connected to BSC Mainnet
4. Start testing!

## Testing Checklist

### Phase 1: Connection & Basic Setup ✅
- [ ] Connect MetaMask wallet
- [ ] Switch to BSC Mainnet (Chain ID: 56)
- [ ] Verify contract connection (0xE93db0753A90b495e8FE31f9793c9D4dbf2E29C7)
- [ ] Check USDT balance and contract integration
- [ ] Refresh all data successfully

### Phase 2: Contract State Verification ✅
- [ ] Verify total users count
- [ ] Check total investments amount
- [ ] Confirm registration is open
- [ ] Verify contract is not paused
- [ ] Check contract ownership

### Phase 3: User Information Testing ✅
- [ ] Check your account info (should show root user if registered)
- [ ] Verify user registration status
- [ ] Check sponsor relationship (should be zero address for root)
- [ ] Verify tier and investment amounts
- [ ] Check earnings and withdrawable balance

### Phase 4: Root User Registration (If Not Done) ⚠️
**Only if you haven't registered as root user yet:**
- [ ] Set sponsor address to: `0x0000000000000000000000000000000000000000`
- [ ] Select Tier 1 ($10 USDT)
- [ ] Approve 10 USDT for the contract
- [ ] Complete root registration
- [ ] Verify registration success

### Phase 5: Financial Functions Testing 💰
- [ ] Check withdrawable balance
- [ ] Test withdrawal function (if balance > 0)
- [ ] Verify USDT balance changes after withdrawal
- [ ] Check earnings tracking

### Phase 6: Network & Referral Testing 🌐
- [ ] Get direct referrals list
- [ ] Check team data and volumes
- [ ] Verify binary tree positions
- [ ] Test referral counting

### Phase 7: Package & Pricing Testing 📊
- [ ] Check all package amounts (Tier 1-8)
- [ ] Verify USDT integration for payments
- [ ] Test allowance checking
- [ ] Verify pricing accuracy

### Phase 8: Advanced Testing 🔬
- [ ] Run Basic Function Tests
- [ ] Run Comprehensive Tests
- [ ] Simulate Complete User Journey
- [ ] Test error handling and edge cases

## Expected Results

### For Root User (First Registration):
```
✅ Registered: true
✅ Sponsor: 0x0000000000000000000000000000000000000000
✅ Current Tier: 1
✅ Total Investment: 10 USDT
✅ Direct Referrals: 0 (initially)
✅ Team Size: 1
✅ Is Active: true
```

### Contract State:
```
✅ Total Users: 1+ (after root registration)
✅ Registration Open: true
✅ Contract Paused: false
✅ Owner: 0xBcae617E213145BB76fD8023B3D9d7d4F97013e5
```

### Package Amounts:
```
✅ Tier 1: 10 USDT
✅ Tier 2: 25 USDT
✅ Tier 3: 50 USDT
✅ Tier 4: 100 USDT
✅ Tier 5: 250 USDT
✅ Tier 6: 500 USDT
✅ Tier 7: 1000 USDT
✅ Tier 8: 2500 USDT
```

## Testing Commands

### Connection Test:
1. Click "Connect MetaMask"
2. Click "Switch to BSC Mainnet"
3. Click "Refresh All Data"

### User Registration Test (Root):
1. Leave sponsor field empty (will use zero address)
2. Select "Tier 1 - $10 USDT"
3. Click "Check Package Amount" (should show 10 USDT)
4. Click "Approve USDT" (approve 10 USDT)
5. Click "Register User"

### Comprehensive Testing:
1. Click "Run Basic Function Tests"
2. Click "Run Comprehensive Tests"
3. Click "Simulate User Journey"

## Troubleshooting

### Common Issues:
1. **"Transaction reverted"**: Check USDT balance and allowance
2. **"Already registered"**: You're already registered (good!)
3. **"Insufficient allowance"**: Increase USDT approval
4. **"Registration closed"**: Contact admin (unlikely)

### Network Issues:
- Ensure BSC Mainnet connection (Chain ID: 56)
- Use these RPC URLs if needed:
  - https://bsc-dataseed.binance.org/
  - https://bsc-dataseed1.defibit.io/

### USDT Issues:
- USDT Contract: 0x55d398326f99059fF775485246999027B3197955
- Ensure sufficient USDT balance for testing
- Check allowance before registration

## Next Steps After Testing

1. **If all tests pass**: Contract is ready for production use
2. **Document any issues**: Note any errors or unexpected behavior
3. **Test with second account**: Register a user under your root account
4. **Frontend integration**: Integrate the working functions into your main dApp
5. **User acceptance testing**: Have real users test the flow

## Support

If you encounter any issues:
1. Check the browser console for detailed error messages
2. Verify your wallet is connected to BSC Mainnet
3. Ensure sufficient USDT balance and gas (BNB)
4. Check transaction status on BSCScan

## Security Notes

⚠️ **Important**: This is mainnet testing with real funds
- Start with small amounts
- Double-check all addresses
- Verify transactions on BSCScan
- Keep your private keys secure

---

**Ready to test? Open `mainnet-dashboard-testing.html` and let's validate your OrphiCrowdFund contract! 🚀**
