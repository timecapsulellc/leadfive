// DEPLOYMENT TIMESTAMP - FORCE CACHE CLEAR
// This file ensures a fresh build and deployment

export const DEPLOYMENT_INFO = {
  timestamp: "2025-07-01T06:20:30.000Z",
  buildId: 1751350830000,
  version: "1.11.1",
  features: [
    "aira-chatbot-fix",
    "contract-address-update", 
    "footer-mainnet-address",
    "cache-invalidation"
  ],
  changes: [
    "Fixed footer contract address display",
    "Ensured AIRA chatbot visibility",
    "Updated all contract references",
    "Force cache clear and rebuild"
  ]
};

// Force a new build by changing this timestamp
export const BUILD_TIMESTAMP = 1751350830000;
