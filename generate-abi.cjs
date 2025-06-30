const fs = require('fs');
const path = require('path');

// Extract ABI from compiled artifacts
function extractABI() {
    const artifactPath = path.join(__dirname, 'artifacts/contracts/LeadFive.sol/LeadFive.json');
    
    try {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        const abi = artifact.abi;
        
        // Create frontend-ready ABI with only essential functions
        const frontendABI = abi.filter(item => {
            // Include all events
            if (item.type === 'event') return true;
            
            // Include specific functions needed for frontend
            if (item.type === 'function') {
                const essentialFunctions = [
                    // Registration and package functions
                    'register',
                    'upgradePackage',
                    
                    // User information functions
                    'getUserBasicInfo',
                    'getUserEarnings', 
                    'getUserNetwork',
                    'calculateWithdrawalRate',
                    
                    // Package and system info
                    'getPackagePrice',
                    'getTotalUsers',
                    'getSystemHealth',
                    'verifyPackageAllocations',
                    
                    // Withdrawal functions
                    'withdraw',
                    
                    // Admin functions (for admin interface)
                    'setDailyWithdrawalLimit',
                    'emergencyPause',
                    'emergencyUnpause',
                    'addAdmin',
                    'removeAdmin',
                    
                    // View functions
                    'owner',
                    'paused',
                    'isAdmin',
                    'getContractBalance',
                    'getUSDTBalance',
                    'getTotalPlatformFees',
                    'getPoolBalance',
                    'dailyWithdrawalLimit',
                    'usdt'
                ];
                
                return essentialFunctions.includes(item.name);
            }
            
            return false;
        });
        
        // Save full ABI
        fs.writeFileSync(
            path.join(__dirname, 'frontend-integration/LeadFiveABI.json'), 
            JSON.stringify(abi, null, 2)
        );
        
        // Save frontend-optimized ABI
        fs.writeFileSync(
            path.join(__dirname, 'frontend-integration/LeadFiveABI-minimal.json'), 
            JSON.stringify(frontendABI, null, 2)
        );
        
        console.log('✅ ABI files generated successfully');
        console.log(`📁 Full ABI: ${frontendABI.length} items`);
        console.log(`📁 Minimal ABI: ${frontendABI.length} items`);
        
        return { fullABI: abi, minimalABI: frontendABI };
        
    } catch (error) {
        console.error('❌ Error extracting ABI:', error.message);
        return null;
    }
}

// Generate TypeScript interfaces
function generateTypeScriptInterfaces(abi) {
    const events = abi.filter(item => item.type === 'event');
    const functions = abi.filter(item => item.type === 'function');
    
    let tsContent = `// LeadFive Contract TypeScript Interfaces
// Generated automatically - do not edit manually

export interface LeadFiveConfig {
  contractAddress: string;
  implementationAddress: string;
  network: {
    name: string;
    chainId: number;
    rpcUrl: string;
    explorer: string;
  };
  tokens: {
    usdt: {
      address: string;
      decimals: number;
      symbol: string;
    };
  };
  sponsorAddress: string;
  dailyWithdrawalLimit: string;
}

export interface UserInfo {
  isRegistered: boolean;
  packageLevel: number;
  balance: string;
  totalEarnings: string;
  earningsCap: string;
  directReferrals: number;
  referrer: string;
  teamSize: number;
}

export interface PackageInfo {
  level: number;
  name: string;
  price: string;
  priceWei: string;
}

export interface SystemHealth {
  isOperational: boolean;
  userCount: number;
  totalFeesCollected: string;
  contractUSDTBalance: string;
  contractBNBBalance: string;
  circuitBreakerStatus: boolean;
}

// Contract Events
export interface ContractEvents {
`;

    // Add event interfaces
    events.forEach(event => {
        tsContent += `  ${event.name}: {\n`;
        event.inputs.forEach(input => {
            tsContent += `    ${input.name}: ${getTypeScriptType(input.type)};\n`;
        });
        tsContent += `  };\n`;
    });

    tsContent += `}

// Contract Functions Return Types
export interface ContractReturns {
`;

    // Add function return types
    functions.forEach(func => {
        if (func.outputs && func.outputs.length > 0) {
            tsContent += `  ${func.name}: `;
            if (func.outputs.length === 1) {
                tsContent += `${getTypeScriptType(func.outputs[0].type)};\n`;
            } else {
                tsContent += `{\n`;
                func.outputs.forEach((output, index) => {
                    const name = output.name || `value${index}`;
                    tsContent += `    ${name}: ${getTypeScriptType(output.type)};\n`;
                });
                tsContent += `  };\n`;
            }
        }
    });

    tsContent += `}

export const CONTRACT_ABI = ${JSON.stringify(abi, null, 2)} as const;
`;

    fs.writeFileSync(
        path.join(__dirname, 'frontend-integration/types.ts'), 
        tsContent
    );
    
    console.log('✅ TypeScript interfaces generated');
}

function getTypeScriptType(solidityType) {
    if (solidityType.includes('uint') || solidityType.includes('int')) {
        return 'string'; // Use string for big numbers
    }
    if (solidityType === 'bool') return 'boolean';
    if (solidityType === 'address') return 'string';
    if (solidityType === 'string') return 'string';
    if (solidityType.includes('bytes')) return 'string';
    if (solidityType.includes('[]')) return `${getTypeScriptType(solidityType.replace('[]', ''))}[]`;
    return 'any';
}

// Main execution
const result = extractABI();
if (result) {
    generateTypeScriptInterfaces(result.minimalABI);
}
