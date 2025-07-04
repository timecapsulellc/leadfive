# Frontend Integration Test Plan for Enhanced Withdrawal Functions

## 🎯 Test Objectives
Test the frontend integration with the new enhanced withdrawal functions deployed on BSC Testnet.

## 📋 Test Environment
- **Frontend URL**: http://localhost:5176/testnet-withdrawal  
- **Testnet Contract**: `0x3e0de8CBc717311dbe1E0333B65c2fAb1e277736`
- **BSC Testnet RPC**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **Testnet USDT**: `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd`

## 🔧 Pre-Test Setup
1. ✅ Install MetaMask browser extension
2. ✅ Add BSC Testnet to MetaMask
3. ✅ Get testnet BNB from BSC faucet
4. ✅ Get testnet USDT (if available)
5. ✅ Import test account with sufficient balance

## 🧪 Test Cases

### 1. Wallet Connection & Network Setup
- [ ] **TC1.1**: Connect MetaMask wallet
- [ ] **TC1.2**: Verify network detection (should prompt for BSC Testnet)
- [ ] **TC1.3**: Auto-switch to BSC Testnet
- [ ] **TC1.4**: Contract initialization status
- [ ] **TC1.5**: Display contract address and network info

### 2. User Data Loading
- [ ] **TC2.1**: Load user registration status
- [ ] **TC2.2**: Display user balance correctly
- [ ] **TC2.3**: Show package level and referral count
- [ ] **TC2.4**: Display withdrawal split (should be 70%/30% for 0 referrals)
- [ ] **TC2.5**: Show auto-compound status (should be false initially)
- [ ] **TC2.6**: Display treasury wallet address

### 3. Withdrawal Split Testing
- [ ] **TC3.1**: Test calculation for 0 referrals (70%/30% split)
- [ ] **TC3.2**: Verify 5% fee calculation on withdrawal portion only
- [ ] **TC3.3**: Display reinvestment amount correctly
- [ ] **TC3.4**: Show final user receives amount after fee

### 4. Auto-Compound Functionality
- [ ] **TC4.1**: Toggle auto-compound from false to true
- [ ] **TC4.2**: Verify withdrawal split changes to 0%/100%
- [ ] **TC4.3**: Toggle back to false
- [ ] **TC4.4**: Verify split returns to referral-based calculation
- [ ] **TC4.5**: Confirm transaction success messages

### 5. Enhanced Withdrawal Testing (Requires Balance)
- [ ] **TC5.1**: Test withdrawal with insufficient balance (should show warning)
- [ ] **TC5.2**: Test withdrawal calculation preview
- [ ] **TC5.3**: Execute actual enhanced withdrawal (if balance available)
- [ ] **TC5.4**: Verify event parsing from transaction receipt
- [ ] **TC5.5**: Check balance updates after withdrawal

### 6. Pool Information Display
- [ ] **TC6.1**: Display Leader Pool balance
- [ ] **TC6.2**: Display Help Pool balance  
- [ ] **TC6.3**: Display Club Pool balance
- [ ] **TC6.4**: Format USDT amounts correctly

### 7. Error Handling & Edge Cases
- [ ] **TC7.1**: Handle network connection errors
- [ ] **TC7.2**: Handle contract call failures
- [ ] **TC7.3**: Display meaningful error messages
- [ ] **TC7.4**: Graceful handling of wallet disconnection
- [ ] **TC7.5**: Proper loading states during transactions

### 8. UI/UX Testing
- [ ] **TC8.1**: Responsive design on mobile devices
- [ ] **TC8.2**: Clear status indicators (connected/disconnected)
- [ ] **TC8.3**: Intuitive button states (enabled/disabled)
- [ ] **TC8.4**: Proper loading animations
- [ ] **TC8.5**: Test results display formatting

## 📊 Expected Results

### Withdrawal Split Scenarios:
1. **0 referrals**: 70% withdrawal / 30% reinvestment
2. **5+ referrals**: 75% withdrawal / 25% reinvestment  
3. **20+ referrals**: 80% withdrawal / 20% reinvestment
4. **Auto-compound enabled**: 0% withdrawal / 100% reinvestment

### Fee Calculation Example (100 USDT):
- **Withdrawal portion**: 70 USDT (for 0 referrals)
- **Admin fee (5%)**: 3.5 USDT (5% of 70, not 100)
- **User receives**: 66.5 USDT
- **Reinvestment**: 30 USDT

## 🚨 Critical Test Points
1. **Fee Logic**: Ensure 5% fee applies ONLY to withdrawal portion, not total amount
2. **Auto-Compound**: Verify it changes split to 0/100 and provides 5% bonus
3. **Treasury**: Confirm treasury wallet receives admin fees
4. **Help Pool**: Verify reinvestments go to Help Pool (except auto-compound)

## 📝 Test Execution Notes
- Document any UI issues or inconsistencies
- Note performance of contract calls
- Check browser console for any errors
- Verify all calculations match expected business logic

## ✅ Success Criteria
- All wallet connection flows work smoothly
- User data loads correctly from testnet contract  
- Withdrawal calculations are accurate per business rules
- Auto-compound toggle functions properly
- Error handling provides clear feedback
- UI is responsive and user-friendly

## 🔄 Post-Test Actions
1. Document any issues found
2. Fix any UI/calculation problems
3. Verify all enhanced functions work as designed
4. Prepare for mainnet deployment after successful testing