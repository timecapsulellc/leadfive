# 🔐 OrphiCrowdFund Admin Setup & Referral Links Guide

## 📊 Contract Addresses
- **🧪 Testnet**: `0x01F1fCf1aA7072B6b9d95974174AecbF753795FF`
- **🌐 Mainnet**: `0x4965197b430343daec1042B413Dd6e20D06dAdba`

## 👥 Admin Account Structure

### 🔑 Root Admin (ID: 1)
- **Address**: `0xBcae617E213145BB76fD8023B3D9d7d4F97013e5`
- **Role**: ROOT_ADMIN
- **Package**: Ultimate ($2000)
- **Description**: Primary admin - Root of network tree
- **Referral Code**: `BCAE61`

### 💰 Treasury Admin (ID: 2)  
- **Address**: `0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29`
- **Role**: TREASURY_ADMIN
- **Package**: Elite ($1000)
- **Description**: Treasury management and financial operations
- **Referral Code**: `DF628E`

### ⚙️ Operations Admin (ID: 3)
- **Address**: `0x96264D29910eC58CD9fE4e9367931C191416b1e1`
- **Role**: OPERATIONS_ADMIN
- **Package**: Premium ($500)
- **Description**: Day-to-day operations and user management
- **Referral Code**: `96264D`

### 🎧 Support Admin (ID: 4)
- **Address**: `0xDB54f3f8F42e0165a15A33736550790BB0662Ac6`
- **Role**: SUPPORT_ADMIN
- **Package**: Professional ($300)
- **Description**: Customer support and user assistance
- **Referral Code**: `DB54F3`

### 📢 Marketing Admin (ID: 5)
- **Address**: `0xE347b326Af572a7115aec536EBf68F72b263D816`
- **Role**: MARKETING_ADMIN
- **Package**: Advanced ($200)
- **Description**: Marketing campaigns and referral management
- **Referral Code**: `E347B3`

## 🔗 Referral Links

### 🌐 Mainnet Links (https://crowdfund-lake.vercel.app)

#### Root Admin Links
```
Direct: https://crowdfund-lake.vercel.app?ref=0xBcae617E213145BB76fD8023B3D9d7d4F97013e5
Short:  https://crowdfund-lake.vercel.app?ref=BCAE61
```

#### Treasury Admin Links
```
Direct: https://crowdfund-lake.vercel.app?ref=0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29
Short:  https://crowdfund-lake.vercel.app?ref=DF628E
```

#### Operations Admin Links
```
Direct: https://crowdfund-lake.vercel.app?ref=0x96264D29910eC58CD9fE4e9367931C191416b1e1
Short:  https://crowdfund-lake.vercel.app?ref=96264D
```

#### Support Admin Links
```
Direct: https://crowdfund-lake.vercel.app?ref=0xDB54f3f8F42e0165a15A33736550790BB0662Ac6
Short:  https://crowdfund-lake.vercel.app?ref=DB54F3
```

#### Marketing Admin Links
```
Direct: https://crowdfund-lake.vercel.app?ref=0xE347b326Af572a7115aec536EBf68F72b263D816
Short:  https://crowdfund-lake.vercel.app?ref=E347B3
```

### 🧪 Testnet Links (for testing)
Replace `crowdfund-lake.vercel.app` with your testnet URL and use testnet contract address.

## 📦 Package-Specific Links

### Root Admin Package Links
```
Starter ($30):     https://crowdfund-lake.vercel.app?ref=BCAE61&pkg=1
Basic ($50):       https://crowdfund-lake.vercel.app?ref=BCAE61&pkg=2
Standard ($100):   https://crowdfund-lake.vercel.app?ref=BCAE61&pkg=3
Advanced ($200):   https://crowdfund-lake.vercel.app?ref=BCAE61&pkg=4
Professional ($300): https://crowdfund-lake.vercel.app?ref=BCAE61&pkg=5
Premium ($500):    https://crowdfund-lake.vercel.app?ref=BCAE61&pkg=6
Elite ($1000):     https://crowdfund-lake.vercel.app?ref=BCAE61&pkg=7
Ultimate ($2000):  https://crowdfund-lake.vercel.app?ref=BCAE61&pkg=8
```

## 🚀 Bootstrap Process

### Phase 1: Root Admin Registration
1. **Connect Root Admin Wallet** (`0xBcae617E213145BB76fD8023B3D9d7d4F97013e5`)
2. **Go to BSCScan Write Contract**:
   - Mainnet: https://bscscan.com/address/0x4965197b430343daec1042B413Dd6e20D06dAdba#writeContract
   - Testnet: https://testnet.bscscan.com/address/0x01F1fCf1aA7072B6b9d95974174AecbF753795FF#writeContract
3. **Call `register` function**:
   - `referrer`: `0x0000000000000000000000000000000000000000` (zero address)
   - `packageLevel`: `8` (Ultimate package)
   - `useUSDT`: `false` (use BNB)
   - **Value**: Send BNB equivalent of $2000 (approximately 3.33 BNB at $600/BNB)

### Phase 2: Admin Team Registration
After Root Admin is registered, other admins can register using Root Admin as sponsor:

#### Treasury Admin Registration
```
referrer: 0xBcae617E213145BB76fD8023B3D9d7d4F97013e5 (Root Admin)
packageLevel: 7 (Elite - $1000)
useUSDT: false
Value: ~1.67 BNB
```

#### Operations Admin Registration
```
referrer: 0xBcae617E213145BB76fD8023B3D9d7d4F97013e5 (Root Admin)
packageLevel: 6 (Premium - $500)
useUSDT: false
Value: ~0.83 BNB
```

#### Support Admin Registration
```
referrer: 0xBcae617E213145BB76fD8023B3D9d7d4F97013e5 (Root Admin)
packageLevel: 5 (Professional - $300)
useUSDT: false
Value: ~0.5 BNB
```

#### Marketing Admin Registration
```
referrer: 0xBcae617E213145BB76fD8023B3D9d7d4F97013e5 (Root Admin)
packageLevel: 4 (Advanced - $200)
useUSDT: false
Value: ~0.33 BNB
```

## 🎯 Network Tree Structure

```
ROOT: 0xBcae617E213145BB76fD8023B3D9d7d4F97013e5 (Ultimate $2000)
├── Treasury: 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29 (Elite $1000)
├── Operations: 0x96264D29910eC58CD9fE4e9367931C191416b1e1 (Premium $500)
├── Support: 0xDB54f3f8F42e0165a15A33736550790BB0662Ac6 (Professional $300)
└── Marketing: 0xE347b326Af572a7115aec536EBf68F72b263D816 (Advanced $200)
```

## 💰 Commission Structure

### Direct Referral Bonuses (40%)
- Root Admin earns 40% from all direct referrals
- Each admin earns 40% from their direct referrals

### Level Bonuses (10% across 10 levels)
- Root Admin receives level bonuses from entire network
- Multi-level compensation flows upward through tree

### Pool Distributions
- **Global Help Pool**: 30% of all contributions
- **Leader Bonus Pool**: 10% of all contributions  
- **Club Pool**: 5% of all contributions

## 📊 Admin Dashboard Access

### Root Admin Privileges
- Full contract control
- User management
- Financial oversight
- System configuration

### Specialized Admin Roles
- **Treasury**: Financial operations, withdrawals
- **Operations**: User support, system maintenance
- **Support**: Customer service, issue resolution
- **Marketing**: Campaign management, growth tracking

## 🔧 Technical Implementation

### Frontend Integration
Update your frontend to recognize admin referral codes:

```javascript
// In your OrphiCrowdFundApp.jsx
const ADMIN_CODES = {
  'BCAE61': '0xBcae617E213145BB76fD8023B3D9d7d4F97013e5', // Root
  'DF628E': '0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29', // Treasury
  '96264D': '0x96264D29910eC58CD9fE4e9367931C191416b1e1', // Operations
  'DB54F3': '0xDB54f3f8F42e0165a15A33736550790BB0662Ac6', // Support
  'E347B3': '0xE347b326Af572a7115aec536EBf68F72b263D816'  // Marketing
};

function getReferrerFromCode(code) {
  return ADMIN_CODES[code.toUpperCase()] || null;
}
```

### URL Parameter Handling
```javascript
// Parse referral parameters
const urlParams = new URLSearchParams(window.location.search);
const refParam = urlParams.get('ref');
const pkgParam = urlParams.get('pkg');

let referrer = null;
if (refParam) {
  if (refParam.startsWith('0x')) {
    referrer = refParam; // Direct address
  } else {
    referrer = getReferrerFromCode(refParam); // Short code
  }
}

const suggestedPackage = pkgParam ? parseInt(pkgParam) : 1;
```

## 📈 Growth Strategy

### Phase 1: Admin Bootstrap (Week 1)
- Register all 5 admin accounts
- Test all referral links
- Verify commission flows

### Phase 2: Soft Launch (Week 2-3)
- Invite trusted users via admin referral links
- Monitor system performance
- Gather feedback and optimize

### Phase 3: Public Launch (Week 4+)
- Open registration to general public
- Launch marketing campaigns
- Scale user acquisition

## 🔍 Monitoring & Analytics

### Key Metrics to Track
- Total users registered
- Package distribution
- Commission payouts
- Pool balances
- Network growth rate

### Admin Dashboards
Each admin should monitor:
- Direct referrals count
- Team size and volume
- Earnings and withdrawals
- Network health metrics

## 🛡️ Security Considerations

### Admin Account Security
- Use hardware wallets for admin accounts
- Enable multi-signature where possible
- Regular security audits
- Backup and recovery procedures

### Network Integrity
- Monitor for suspicious activity
- Implement fraud detection
- Regular contract audits
- Emergency pause capabilities

## 🎉 Launch Checklist

- [ ] Root Admin registered with Ultimate package
- [ ] All 4 sub-admins registered with appropriate packages
- [ ] Referral links tested and working
- [ ] Frontend updated with admin codes
- [ ] Commission flows verified
- [ ] Pool distributions confirmed
- [ ] Admin dashboards functional
- [ ] Security measures in place
- [ ] Marketing materials prepared
- [ ] Support systems ready

**Your OrphiCrowdFund admin structure is ready for launch! 🚀** 