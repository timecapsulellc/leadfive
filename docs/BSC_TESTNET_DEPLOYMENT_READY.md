# BSC Testnet Deployment Guide

## 🔐 New Deployment Wallet Created

**Wallet Address:** `0x59dE075ec584C16Fee3836c0eacEf8eD571f539d`  
**Private Key:** `0x36362f4f60303034552deb7fff09b3b4681311e8aab5ca5cb3fd0f4da801da89`

## 💰 Step 1: Fund the Wallet

### Option A: BSC Testnet Faucet (Recommended)
1. Go to: https://testnet.bnbchain.org/faucet-smart
2. Enter wallet address: `0x59dE075ec584C16Fee3836c0eacEf8eD571f539d`
3. Request 0.1 BNB (sufficient for deployment)
4. Wait for transaction confirmation (usually 1-2 minutes)

### Option B: Alternative Faucets
- https://testnet.binance.org/faucet-smart
- https://faucet.quicknode.com/binance-smart-chain/bnb-testnet

## 🚀 Step 2: Deploy to BSC Testnet

Once wallet is funded, run:
```bash
npx hardhat run scripts/deploy-testnet-complete.cjs --network bscTestnet
```

## 📋 Deployment Configuration

- **Network:** BSC Testnet (Chain ID: 97)
- **RPC URL:** https://bsc-testnet-rpc.publicnode.com
- **USDT Contract:** 0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684
- **Price Feed:** 0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526
- **Admin/Fee Recipient:** 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29 (Trezor)

## ✅ After Deployment

1. **Verify Contracts:** Use BSCScan Testnet verification
2. **Test Functions:** Run comprehensive tests
3. **Frontend Integration:** Test with UI
4. **Security Review:** Final security checks
5. **Mainnet Preparation:** Only after successful testnet validation

## 🔍 Check Wallet Balance

To check if wallet is funded:
```bash
node scripts/test-direct-connection.cjs
```

## ⚠️ Security Notes

- This is a testnet-only wallet
- Keep private key secure until deployment is complete
- Transfer ownership to Trezor wallet after setup
- Do not use for mainnet deployment
