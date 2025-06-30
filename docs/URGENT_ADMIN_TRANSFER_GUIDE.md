🚨 URGENT: TRANSFER ADMIN IDS TO TREZOR
==========================================

CURRENT SECURITY RISK:
❌ Hot Wallet (0x0faF67B6E49827EcB42244b4C00F9962922Eb931) has ALL admin powers
✅ Trezor Wallet (0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29) should have admin powers

STEP 1: GO TO BSCSCAN
====================
https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#writeContract

STEP 2: CONNECT TREZOR
======================
1. Click "Connect to Web3"
2. Connect your Trezor wallet (0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29)
3. Verify you're the contract owner

STEP 3: TRANSFER ADMIN IDS (EXECUTE THESE)
=========================================

Transfer Admin ID 0:
Function: setAdminId
Parameters: 0, 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29

Transfer Admin ID 1:
Function: setAdminId  
Parameters: 1, 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29

Transfer Admin ID 2:
Function: setAdminId
Parameters: 2, 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29

Transfer Admin ID 3:
Function: setAdminId
Parameters: 3, 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29

Transfer Admin ID 4:
Function: setAdminId
Parameters: 4, 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29

Transfer Admin ID 5:
Function: setAdminId
Parameters: 5, 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29

Transfer Admin ID 6:
Function: setAdminId
Parameters: 6, 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29

Transfer Admin ID 7:
Function: setAdminId
Parameters: 7, 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29

Transfer Admin ID 8:
Function: setAdminId
Parameters: 8, 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29

Transfer Admin ID 9:
Function: setAdminId
Parameters: 9, 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29

RESULT AFTER TRANSFER:
=====================
✅ All admin IDs (0-9) controlled by Trezor
✅ Hot wallet has no admin access
✅ Contract is secure from hot wallet compromise
✅ You maintain full admin control via Trezor

ESTIMATED TIME: 10-15 minutes
ESTIMATED COST: $15-25 in gas fees
SECURITY IMPACT: CRITICAL vulnerability fixed

VERIFICATION:
============
After completing, run: node scripts/check-admin-ids.cjs
Expected: All admin IDs show your Trezor address

URGENCY: DO THIS NOW!
====================
Every minute this hot wallet has admin access is a security risk.
This should be your #1 priority before any other tasks.
