# DigitalOcean Environment Variables Configuration

## Required Environment Variables for DigitalOcean Deployment

Based on your DigitalOcean dashboard, here are the environment variables you need to configure:

### 1. NODE_ENV
```
Key: NODE_ENV
Value: production
```

### 2. VITE_CONTRACT_ADDRESS (Updated from your image)
```
Key: VITE_CONTRACT_ADDRESS
Value: 0x742d35Cc6634C0532925a3b8D208800b3cea8574
```

### 3. VITE_NETWORK_ID
```
Key: VITE_NETWORK_ID
Value: 56
```

### 4. VITE_WEB3_PROVIDER_URL
```
Key: VITE_WEB3_PROVIDER_URL
Value: https://bsc-dataseed.binance.org/
```

### 5. VITE_DEBUG_MODE
```
Key: VITE_DEBUG_MODE
Value: false
```

## Additional Recommended Variables

### 6. VITE_CHAIN_ID
```
Key: VITE_CHAIN_ID
Value: 56
```

### 7. VITE_NETWORK_NAME
```
Key: VITE_NETWORK_NAME
Value: BSC Mainnet
```

### 8. VITE_RPC_URL
```
Key: VITE_RPC_URL
Value: https://bsc-dataseed.binance.org/
```

### 9. VITE_EXPLORER_URL
```
Key: VITE_EXPLORER_URL
Value: https://bscscan.com
```

### 10. VITE_USDT_ADDRESS
```
Key: VITE_USDT_ADDRESS
Value: 0x55d398326f99059fF775485246999027B3197955
```

## How to Set These Variables in DigitalOcean

1. Go to your DigitalOcean Apps dashboard
2. Select your LeadFive app
3. Go to Settings → App-Level Environment Variables
4. Click "Edit" and add each variable with the key-value pairs above
5. Make sure to check "Encrypt" for any sensitive values (though these are all public frontend variables)
6. Save the changes and trigger a new deployment

## Important Notes

- All `VITE_*` variables are public and will be visible in the frontend bundle
- The contract address `0x742d35Cc6634C0532925a3b8D208800b3cea8574` is from your image and should be your current deployed contract
- BSC Network ID 56 is for BSC Mainnet
- The USDT address is the official BSC USDT contract

## Quick Copy-Paste for DigitalOcean Dashboard

```
NODE_ENV=production
VITE_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D208800b3cea8574
VITE_NETWORK_ID=56
VITE_WEB3_PROVIDER_URL=https://bsc-dataseed.binance.org/
VITE_DEBUG_MODE=false
VITE_CHAIN_ID=56
VITE_NETWORK_NAME=BSC Mainnet
VITE_RPC_URL=https://bsc-dataseed.binance.org/
VITE_EXPLORER_URL=https://bscscan.com
VITE_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
```
