# 🔒 LeadFive Security & Environment Guide

## ⚠️ CRITICAL SECURITY WARNINGS

### 🚨 NEVER COMMIT THESE TO GITHUB:
- `.env` files with real values
- Private keys in any form
- API keys with sensitive access
- Seed phrases or mnemonics
- Database credentials
- Any file containing actual secrets

### 🌐 Frontend vs Backend Variables

#### 🔴 BACKEND ONLY (Private):
```bash
# These are PRIVATE and should NEVER be exposed to frontend
DEPLOYER_PRIVATE_KEY=xxxxx
BSCSCAN_API_KEY=xxxxx
BSC_MAINNET_RPC_URL=xxxxx (if contains auth)
DATABASE_URL=xxxxx
API_SECRET=xxxxx
```

#### 🟢 FRONTEND SAFE (Public):
```bash
# These are PUBLIC and will be visible to users
VITE_CONTRACT_ADDRESS=0x7FEEA22942407407801cCDA55a4392f25975D998
VITE_CHAIN_ID=56
VITE_NETWORK_NAME=BSC Mainnet
VITE_RPC_URL=https://bsc-dataseed.binance.org/
VITE_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
```

## 🛡️ Security Best Practices

### 1. Environment Files
- ✅ Keep `.env.example` updated with safe examples
- ✅ Never commit `.env` with real values
- ✅ Use different `.env` files for different environments
- ✅ Regularly rotate API keys and secrets

### 2. Frontend Variables (VITE_*)
- ⚠️ **ALL VITE_* variables are PUBLIC**
- ⚠️ They are bundled into your frontend code
- ⚠️ Anyone can see them in browser dev tools
- ✅ Only use for non-sensitive configuration
- ✅ Contract addresses are OK (they're public on blockchain)
- ✅ Network IDs and RPC URLs are OK (public info)

### 3. Private Keys & Deployment
- 🔴 **NEVER** put private keys in frontend code
- 🔴 **NEVER** commit private keys to Git
- ✅ Use hardware wallets for mainnet deployments
- ✅ Use separate keys for testnet vs mainnet
- ✅ Store keys in secure password managers
- ✅ Use environment variables only on secure servers

### 4. Contract Verification
- ✅ BSCScan API keys are safe to use for verification
- ✅ Contract source code will be public after verification
- ✅ Constructor arguments are public on blockchain
- ⚠️ Don't put sensitive data in constructor arguments

## 🔧 Setup Instructions

### 1. Create Your .env File
```bash
# Copy the example file
cp .env.example .env

# Edit with your actual values (NEVER commit this file)
nano .env
```

### 2. For Local Development
```bash
# Minimal .env for frontend development
VITE_CONTRACT_ADDRESS=0x7FEEA22942407407801cCDA55a4392f25975D998
VITE_CHAIN_ID=56
VITE_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
```

### 3. For Contract Verification
```bash
# Add these to your .env (keep private!)
BSCSCAN_API_KEY=your_api_key_here
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

### 4. For Production Deployment
- Use platform-specific environment variable settings
- DigitalOcean: Set in App Platform dashboard
- Vercel: Set in project settings
- **NEVER** put sensitive data in `app.yaml` or public configs

## 🔍 Current Project Status

### ✅ Properly Secured:
- `.gitignore` excludes all `.env` files
- Frontend uses `APP_CONFIG` for public contract data
- No private keys in frontend code
- Sensitive variables clearly marked in `.env.example`

### 🔧 For Contract Verification:
```bash
# Create .env with these values (don't commit!)
BSCSCAN_API_KEY=your_key_here
DEPLOYER_PRIVATE_KEY=your_key_here

# Run verification
npm run verify
```

## 🚨 If You Accidentally Commit Secrets:

### Immediate Actions:
1. **Rotate the compromised keys immediately**
2. Remove from Git history:
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```
3. **Change all passwords/keys that were exposed**
4. Check for any unauthorized access

### Prevention:
- Use git hooks to prevent committing `.env` files
- Enable GitHub secret scanning
- Regular security audits of repository

## 📞 Emergency Contacts

If you suspect a security breach:
1. Immediately rotate all compromised credentials
2. Check wallet/contract activity on BSCScan
3. Monitor for any unauthorized transactions
4. Document the incident for future prevention

---

**Remember: When in doubt, assume it's sensitive and keep it private!**
