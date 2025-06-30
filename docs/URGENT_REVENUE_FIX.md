# 🚨 URGENT: Fix Revenue Loss - 2 Minute Setup

## Current Problem
- **Admin fee recipient is set to ZERO ADDRESS**
- **You're losing 5% of ALL user withdrawals** 💸
- **Every withdrawal burns money instead of paying you**

## Quick Fix (2 minutes)

### Step 1: Open BSCScan
Click this link:
```
https://bscscan.com/address/0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569#writeContract
```

### Step 2: Connect Trezor
- Click "Connect to Web3"
- Select your Trezor wallet
- Confirm connection

### Step 3: Set Admin Fee Recipient
1. Scroll to function: **`setAdminFeeRecipient`**
2. Click to expand it
3. In the `_recipient` field, enter:
   ```
   0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29
   ```
4. Click **"Write"**
5. Confirm transaction on Trezor (~$1-2 gas)

### Step 4: Verify (30 seconds)
Run this to confirm:
```bash
node scripts/check-admin-fee.cjs
```

## Revenue Impact

### Before Fix
```
User withdraws $1,000
├── Admin Fee: $50 → 🔥 BURNED (lost forever)
└── User gets: $950
```

### After Fix
```
User withdraws $1,000  
├── Admin Fee: $50 → 💰 YOUR TREZOR WALLET
└── User gets: $950
```

## Why This Matters
- **5% of every withdrawal** goes to you after fix
- **Currently 0%** (all burned)
- **Immediate revenue stream** activation
- **No code changes needed**

---

**Time to fix: 2 minutes | Revenue impact: Immediate | Risk: Zero**

*Do this NOW before any more withdrawals happen!*
