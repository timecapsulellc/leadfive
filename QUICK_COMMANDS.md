# 🚀 QUICK COMMANDS - PURE TREZOR DEPLOYMENT

## 🔐 **ALL RIGHTS TO TREZOR WALLET: `0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29`**

---

## 🦊 **BROWSER DEPLOYMENT (RECOMMENDED)**

```bash
# 1. Compile contracts
npm run compile

# 2. Create browser interface
npm run deploy:metamask:testnet    # For testnet
npm run deploy:metamask:mainnet    # For mainnet

# 3. Open in browser
open deploy-trezor.html

# 4. Verify deployment
npm run check:ownership
```

---

## 🔐 **PURE TREZOR DEPLOYMENT**

```bash
# Direct Trezor deployment (requires Trezor Connect)
npm run deploy:pure:trezor:testnet
npm run deploy:pure:trezor:mainnet
```

---

## ✅ **VERIFICATION**

```bash
# Check contract ownership
npm run check:ownership

# Expected output:
# ✅ Is Trezor Owner: true
# ✅ Has Admin Role: true
# 🔒 Security Status: SECURED
```

---

## 📋 **AVAILABLE COMMANDS**

| Command | Purpose |
|---------|---------|
| `npm run compile` | Compile smart contracts |
| `npm run deploy:metamask:testnet` | Browser deployment (testnet) |
| `npm run deploy:metamask:mainnet` | Browser deployment (mainnet) |
| `npm run deploy:pure:trezor:testnet` | Pure Trezor (testnet) |
| `npm run deploy:pure:trezor:mainnet` | Pure Trezor (mainnet) |
| `npm run check:ownership` | Verify contract ownership |

---

## 🎯 **ONE-COMMAND DEPLOYMENT**

```bash
# Complete deployment flow
npm run compile && npm run deploy:metamask:testnet && open deploy-trezor.html
```

---

## 🔒 **SECURITY FEATURES**

- ✅ **NO private keys required**
- ✅ **ALL roles assigned to Trezor**
- ✅ **Hardware wallet signing only**
- ✅ **Browser-based interface**
- ✅ **Real-time verification**

---

*🔐 Maximum security with Trezor wallet control*
