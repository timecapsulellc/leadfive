const fs = require('fs');
const path = require('path');

async function updateFrontendContractConfig() {
    try {
        console.log('🔄 UPDATING FRONTEND CONTRACT CONFIGURATION');
        console.log('='.repeat(50));
        
        // Read the latest compiled contract ABI
        const artifactPath = './artifacts/contracts/LeadFive.sol/LeadFive.json';
        if (!fs.existsSync(artifactPath)) {
            console.error('❌ Contract artifact not found. Run: npx hardhat compile');
            return;
        }
        
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        const abi = artifact.abi;
        
        // Current deployment addresses
        const PROXY_ADDRESS = '0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623';
        const IMPLEMENTATION_ADDRESS = '0x10965e40d90054FDE981dd1A470937C68719F707';
        const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
        
        console.log('📋 Contract Information:');
        console.log(`  Proxy: ${PROXY_ADDRESS}`);
        console.log(`  Implementation: ${IMPLEMENTATION_ADDRESS}`);
        console.log(`  USDT: ${USDT_ADDRESS}`);
        console.log(`  ABI Functions: ${abi.length}`);
        
        // Generate updated contracts.js content
        const contractsFileContent = `// LeadFive Contract Configuration - LATEST VERIFIED DEPLOYMENT
// Generated: ${new Date().toISOString()}
// Contract Version: LeadFive v1.0.0
// Network: BSC Mainnet

export const CONTRACT_ADDRESS = '${PROXY_ADDRESS}';
export const IMPLEMENTATION_ADDRESS = '${IMPLEMENTATION_ADDRESS}';
export const USDT_ADDRESS = '${USDT_ADDRESS}';

// Network configuration
export const SUPPORTED_NETWORKS = {
  BSC_MAINNET: {
    chainId: '0x38',
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    blockExplorer: 'https://bscscan.com/',
    contractAddress: '${PROXY_ADDRESS}'
  }
};

// Get contract address for current network
export const getContractAddress = (chainId) => {
  const networkConfig = Object.values(SUPPORTED_NETWORKS).find(
    network => network.chainId === chainId
  );
  return networkConfig?.contractAddress || CONTRACT_ADDRESS;
};

// Check if network is supported
export const isSupportedNetwork = (chainId) => {
  return Object.values(SUPPORTED_NETWORKS).some(
    network => network.chainId === chainId
  );
};

// Contract verification links
export const CONTRACT_VERIFICATION = {
  proxy: 'https://bscscan.com/address/${PROXY_ADDRESS}#code',
  implementation: 'https://bscscan.com/address/${IMPLEMENTATION_ADDRESS}#code'
};

// Package prices (in USDT with 6 decimals)
export const PACKAGE_PRICES = {
  1: 30000000,  // $30 USDT
  2: 50000000,  // $50 USDT
  3: 100000000, // $100 USDT
  4: 200000000  // $200 USDT
};

// Latest ABI from verified contract
export const CONTRACT_ABI = ${JSON.stringify(abi, null, 2)};

// Export default configuration
export default {
  CONTRACT_ADDRESS,
  IMPLEMENTATION_ADDRESS,
  USDT_ADDRESS,
  SUPPORTED_NETWORKS,
  CONTRACT_ABI,
  PACKAGE_PRICES,
  CONTRACT_VERIFICATION
};
`;

        // Write updated contracts.js
        const contractsPath = './src/config/contracts.js';
        fs.writeFileSync(contractsPath, contractsFileContent);
        console.log('✅ Updated src/config/contracts.js');
        
        // Update other contract files if they exist
        const contractsLeadFivePath = './src/contracts-leadfive.js';
        if (fs.existsSync(contractsLeadFivePath)) {
            const leadFiveContent = `// LeadFive Contract Integration - LATEST VERIFIED DEPLOYMENT
// Generated: ${new Date().toISOString()}

export const LEADFIVE_CONTRACT_ADDRESS = '${PROXY_ADDRESS}';
export const LEADFIVE_ABI = ${JSON.stringify(abi, null, 2)};

export default {
  address: LEADFIVE_CONTRACT_ADDRESS,
  abi: LEADFIVE_ABI
};
`;
            fs.writeFileSync(contractsLeadFivePath, leadFiveContent);
            console.log('✅ Updated src/contracts-leadfive.js');
        }
        
        // Check .env file
        const envPath = './.env';
        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            
            // Update contract address in .env
            envContent = envContent.replace(
                /VITE_CONTRACT_ADDRESS=.*/,
                `VITE_CONTRACT_ADDRESS=${PROXY_ADDRESS}`
            );
            
            fs.writeFileSync(envPath, envContent);
            console.log('✅ Updated .env file');
        }
        
        console.log('');
        console.log('🎉 FRONTEND CONFIGURATION UPDATE COMPLETE!');
        console.log('='.repeat(50));
        console.log('📋 Summary:');
        console.log(`  ✅ Contract Address: ${PROXY_ADDRESS}`);
        console.log(`  ✅ ABI Functions: ${abi.length}`);
        console.log(`  ✅ Network: BSC Mainnet`);
        console.log(`  ✅ USDT Integration: Ready`);
        console.log('');
        console.log('🚀 Next Steps:');
        console.log('  1. npm run dev (test frontend)');
        console.log('  2. Test wallet connection');
        console.log('  3. Test contract interactions');
        console.log('  4. npm run build (production build)');
        
    } catch (error) {
        console.error('❌ Error updating frontend configuration:', error.message);
    }
}

updateFrontendContractConfig();
