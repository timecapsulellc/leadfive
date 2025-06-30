// Frontend Integration Checklist for LeadFiveOptimized Contract

export const CONTRACT_CONFIG = {
  // BSC Testnet Configuration
  TESTNET: {
    contractAddress: "0x1E95943b022dde7Ce7e0F54ced25599e0c6D8b9b",
    chainId: 97,
    rpcUrl: "https://bsc-testnet-rpc.publicnode.com",
    explorerUrl: "https://testnet.bscscan.com",
    usdtAddress: "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684"
  },
  
  // Contract ABI Key Functions (you'll need the full ABI)
  KEY_FUNCTIONS: [
    "initialize(address,address)",
    "registerUser(address,uint8)",
    "upgradePackage(uint8)",
    "withdraw(uint96)",
    "users(address)",
    "packages(uint8)",
    "totalUsers()",
    "owner()",
    "feeRecipient()",
    "registrationOpen()",
    "withdrawalEnabled()"
  ],
  
  // Package Information
  PACKAGES: {
    1: { price: "300", name: "Starter" },
    2: { price: "500", name: "Basic" },
    3: { price: "1000", name: "Premium" },
    4: { price: "2000", name: "Elite" }
  }
};

// Frontend Integration Steps:
/*
1. Update contract address in your frontend to: 0x1E95943b022dde7Ce7e0F54ced25599e0c6D8b9b
2. Ensure you're connecting to BSC Testnet (Chain ID: 97)
3. Update the contract ABI to match LeadFiveOptimized
4. Test all user functions:
   - Registration
   - Package upgrades
   - Withdrawals
   - User info display
5. Test admin functions (if applicable)
6. Verify gas estimation works correctly
7. Test error handling for failed transactions
*/
