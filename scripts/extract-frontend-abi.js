#!/usr/bin/env node

/**
 * LeadFive Frontend ABI Extractor
 * Extracts the ABI from Hardhat artifacts and creates frontend-ready exports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Paths
const artifactPath = path.join(projectRoot, 'artifacts/contracts/LeadFive.sol/LeadFive.json');
const frontendExportsDir = path.join(projectRoot, 'frontend-exports');
const frontendConfigPath = path.join(projectRoot, 'frontend-config.json');

// Ensure frontend-exports directory exists
if (!fs.existsSync(frontendExportsDir)) {
    fs.mkdirSync(frontendExportsDir, { recursive: true });
}

try {
    // Read the artifact file
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const abi = artifact.abi;
    
    // Read frontend config
    const frontendConfig = JSON.parse(fs.readFileSync(frontendConfigPath, 'utf8'));
    
    // Create LeadFive.json (pure ABI)
    const abiJson = {
        contractName: "LeadFive",
        abi: abi,
        networks: {
            "56": {
                address: frontendConfig.contractAddress
            }
        },
        metadata: {
            compiler: artifact.metadata?.compiler || "Unknown",
            language: "Solidity",
            version: artifact.metadata?.version || "Unknown"
        }
    };
    
    fs.writeFileSync(
        path.join(frontendExportsDir, 'LeadFive.json'),
        JSON.stringify(abiJson, null, 2)
    );
    
    // Create LeadFive.js (JavaScript module export)
    const jsContent = `/**
 * LeadFive Smart Contract ABI and Configuration
 * Auto-generated for frontend integration
 * Network: BSC Mainnet (Chain ID: 56)
 * Contract Address: ${frontendConfig.contractAddress}
 */

export const LEADFIVE_CONTRACT_ADDRESS = "${frontendConfig.contractAddress}";
export const USDT_CONTRACT_ADDRESS = "${frontendConfig.contracts.usdt}";
export const NETWORK_CHAIN_ID = ${frontendConfig.network.chainId};
export const NETWORK_NAME = "${frontendConfig.network.name}";
export const RPC_URL = "${frontendConfig.network.rpcUrl}";
export const EXPLORER_URL = "${frontendConfig.network.explorerUrl}";

export const LEADFIVE_ABI = ${JSON.stringify(abi, null, 2)};

// Contract configuration
export const CONTRACT_CONFIG = {
    address: LEADFIVE_CONTRACT_ADDRESS,
    abi: LEADFIVE_ABI,
    network: {
        chainId: NETWORK_CHAIN_ID,
        name: NETWORK_NAME,
        rpcUrl: RPC_URL,
        explorerUrl: EXPLORER_URL
    },
    tokens: {
        usdt: USDT_CONTRACT_ADDRESS
    },
    admin: {
        owner: "${frontendConfig.ownerAddress}",
        feeRecipient: "${frontendConfig.admin.feeRecipient}",
        rootAdmin: "${frontendConfig.admin.rootAdmin}"
    }
};

// Default export
export default CONTRACT_CONFIG;
`;
    
    fs.writeFileSync(
        path.join(frontendExportsDir, 'LeadFive.js'),
        jsContent
    );
    
    // Create TypeScript definition file
    const tsContent = `/**
 * LeadFive Smart Contract TypeScript Definitions
 * Auto-generated for frontend integration
 */

export interface LeadFiveConfig {
    address: string;
    abi: any[];
    network: {
        chainId: number;
        name: string;
        rpcUrl: string;
        explorerUrl: string;
    };
    tokens: {
        usdt: string;
    };
    admin: {
        owner: string;
        feeRecipient: string;
        rootAdmin: string;
    };
}

export declare const LEADFIVE_CONTRACT_ADDRESS: string;
export declare const USDT_CONTRACT_ADDRESS: string;
export declare const NETWORK_CHAIN_ID: number;
export declare const NETWORK_NAME: string;
export declare const RPC_URL: string;
export declare const EXPLORER_URL: string;
export declare const LEADFIVE_ABI: any[];
export declare const CONTRACT_CONFIG: LeadFiveConfig;

export default CONTRACT_CONFIG;
`;
    
    fs.writeFileSync(
        path.join(frontendExportsDir, 'LeadFive.d.ts'),
        tsContent
    );
    
    // Create a simple HTML example
    const htmlExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LeadFive Contract Integration Example</title>
    <script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>
</head>
<body>
    <h1>LeadFive Smart Contract Integration</h1>
    <div id="status">Loading...</div>
    <button id="connectWallet">Connect Wallet</button>
    <button id="getInfo">Get Contract Info</button>
    
    <script type="module">
        // Example usage of the exported configuration
        import CONFIG from './LeadFive.js';
        
        console.log('LeadFive Contract Config:', CONFIG);
        
        document.getElementById('status').textContent = 
            \`Contract: \${CONFIG.address} on \${CONFIG.network.name}\`;
            
        document.getElementById('connectWallet').onclick = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    console.log('Wallet connected!');
                } catch (error) {
                    console.error('Failed to connect wallet:', error);
                }
            } else {
                alert('Please install MetaMask!');
            }
        };
        
        document.getElementById('getInfo').onclick = async () => {
            if (typeof window.ethereum !== 'undefined') {
                const web3 = new Web3(window.ethereum);
                const contract = new web3.eth.Contract(CONFIG.abi, CONFIG.address);
                
                try {
                    // Example: Get contract owner
                    const owner = await contract.methods.owner().call();
                    console.log('Contract Owner:', owner);
                    alert(\`Contract Owner: \${owner}\`);
                } catch (error) {
                    console.error('Failed to get contract info:', error);
                }
            }
        };
    </script>
</body>
</html>`;
    
    fs.writeFileSync(
        path.join(frontendExportsDir, 'example.html'),
        htmlExample
    );
    
    // Create README for frontend integration
    const readmeContent = `# LeadFive Frontend Integration

This directory contains all the necessary files for integrating the LeadFive smart contract with your frontend application.

## Files Generated

1. **LeadFive.json** - Pure ABI file with contract metadata
2. **LeadFive.js** - JavaScript/ES6 module with ABI and configuration
3. **LeadFive.d.ts** - TypeScript definitions
4. **example.html** - Simple HTML integration example

## Contract Details

- **Contract Address:** ${frontendConfig.contractAddress}
- **Network:** ${frontendConfig.network.name} (Chain ID: ${frontendConfig.network.chainId})
- **USDT Token:** ${frontendConfig.contracts.usdt}
- **Owner:** ${frontendConfig.ownerAddress}
- **Fee Recipient:** ${frontendConfig.admin.feeRecipient}

## Usage Examples

### JavaScript/ES6
\`\`\`javascript
import { LEADFIVE_CONTRACT_ADDRESS, LEADFIVE_ABI, CONTRACT_CONFIG } from './LeadFive.js';

// Use with ethers.js
import { ethers } from 'ethers';
const contract = new ethers.Contract(LEADFIVE_CONTRACT_ADDRESS, LEADFIVE_ABI, provider);

// Use with web3.js
import Web3 from 'web3';
const web3 = new Web3(window.ethereum);
const contract = new web3.eth.Contract(LEADFIVE_ABI, LEADFIVE_CONTRACT_ADDRESS);
\`\`\`

### React Hook Example
\`\`\`javascript
import { useContract } from 'wagmi';
import { CONTRACT_CONFIG } from './LeadFive.js';

function useLeadFiveContract() {
    return useContract({
        address: CONTRACT_CONFIG.address,
        abi: CONTRACT_CONFIG.abi,
    });
}
\`\`\`

### Vue.js Composition API
\`\`\`javascript
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
\`\`\`

## Security Notes

- Always validate user inputs before calling contract methods
- Use the official BSC Mainnet RPC endpoints
- Verify all transaction details before signing
- The contract is deployed on BSC Mainnet - ensure users are connected to the correct network

## Support

For technical support and integration help, refer to the main project documentation.
`;
    
    fs.writeFileSync(
        path.join(frontendExportsDir, 'README.md'),
        readmeContent
    );
    
    console.log('✅ Frontend ABI extraction completed successfully!');
    console.log('\n📁 Generated files in ./frontend-exports/:');
    console.log('   - LeadFive.json (Pure ABI)');
    console.log('   - LeadFive.js (JavaScript module)');
    console.log('   - LeadFive.d.ts (TypeScript definitions)');
    console.log('   - example.html (Integration example)');
    console.log('   - README.md (Documentation)');
    console.log('\n🔗 Contract Address:', frontendConfig.contractAddress);
    console.log('🌐 Network:', frontendConfig.network.name);
    console.log('💰 USDT Token:', frontendConfig.contracts.usdt);
    console.log('\n🚀 Ready for frontend integration!');
    
} catch (error) {
    console.error('❌ Error extracting ABI:', error.message);
    process.exit(1);
}
