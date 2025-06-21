# LeadFive Frontend Integration

This directory contains all the necessary files for integrating the LeadFive smart contract with your frontend application.

## Files Generated

1. **LeadFive.json** - Pure ABI file with contract metadata
2. **LeadFive.js** - JavaScript/ES6 module with ABI and configuration
3. **LeadFive.d.ts** - TypeScript definitions
4. **example.html** - Simple HTML integration example

## Contract Details

- **Contract Address:** 0x423f0ecA4a4F8C350644c56eaCB383c4e69F0569
- **Network:** BSC Mainnet (Chain ID: 56)
- **USDT Token:** 0x55d398326f99059fF775485246999027B3197955
- **Owner:** 0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29
- **Fee Recipient:** 0xeB652c4523f3Cf615D3F3694b14E551145953aD0

## Usage Examples

### JavaScript/ES6
```javascript
import { LEADFIVE_CONTRACT_ADDRESS, LEADFIVE_ABI, CONTRACT_CONFIG } from './LeadFive.js';

// Use with ethers.js
import { ethers } from 'ethers';
const contract = new ethers.Contract(LEADFIVE_CONTRACT_ADDRESS, LEADFIVE_ABI, provider);

// Use with web3.js
import Web3 from 'web3';
const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(LEADFIVE_ABI, LEADFIVE_CONTRACT_ADDRESS);
```

### React Hook Example
```javascript
import { useContract } from 'wagmi';
import { CONTRACT_CONFIG } from './LeadFive.js';

function useLeadFiveContract() {
    return useContract({
        address: CONTRACT_CONFIG.address,
        abi: CONTRACT_CONFIG.abi,
    });
}
```

### Vue.js Composition API
```javascript
import { ref } from 'vue';
import { CONTRACT_CONFIG } from './LeadFive.js';

export function useLeadFive() {
    const contract = ref(null);
    const isConnected = ref(false);
    
    // Initialize contract logic here
    
    return {
        contract,
        isConnected,
        CONFIG: CONTRACT_CONFIG
    };
}
```

## Security Notes

- Always validate user inputs before calling contract methods
- Use the official BSC Mainnet RPC endpoints
- Verify all transaction details before signing
- The contract is deployed on BSC Mainnet - ensure users are connected to the correct network

## Support

For technical support and integration help, refer to the main project documentation.
