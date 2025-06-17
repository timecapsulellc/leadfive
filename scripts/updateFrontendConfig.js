import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateFrontendConfig(contractAddress) {
  console.log("🔧 Updating frontend configuration with new contract address...");
  console.log("📍 New contract address:", contractAddress);

  const updates = [];

  // Files to update
  const configFiles = [
    'src/config/contractConfig.js',
    'src/utils/contractUtils.js',
    'src/components/Web3Provider.jsx',
    '.env.local',
    '.env.production'
  ];

  configFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Replace old contract addresses with new one
        const oldAddresses = [
          '0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732', // Old mainnet
          // Add any other old addresses here
        ];
        
        let updated = false;
        oldAddresses.forEach(oldAddress => {
          if (content.includes(oldAddress)) {
            content = content.replace(new RegExp(oldAddress, 'g'), contractAddress);
            updated = true;
          }
        });
        
        if (updated) {
          fs.writeFileSync(fullPath, content, 'utf8');
          updates.push(filePath);
          console.log("✅ Updated:", filePath);
        }
      } catch (error) {
        console.log("⚠️ Could not update:", filePath, "- File might not exist or be accessible");
      }
    }
  });

  // Create new environment configuration
  const envConfig = `
# OrphiCrowdFund New Contract Configuration
REACT_APP_CONTRACT_ADDRESS=${contractAddress}
REACT_APP_NETWORK=bsc
REACT_APP_CHAIN_ID=56
REACT_APP_RPC_URL=https://bsc-dataseed.binance.org/

# Admin addresses (from .env)
REACT_APP_ADMIN_ADDRESS=${process.env.ADMIN_ADDRESS}
REACT_APP_TREASURY_ADDRESS=${process.env.TREASURY_ADDRESS}
REACT_APP_DISTRIBUTOR_ADDRESS=${process.env.DISTRIBUTOR_ADDRESS}
REACT_APP_PLATFORM_ADDRESS=${process.env.PLATFORM_ADDRESS}
REACT_APP_AUDIT_ADDRESS=${process.env.AUDIT_ADDRESS}
`;

  // Write to .env.production
  fs.writeFileSync(path.join(__dirname, '..', '.env.production'), envConfig.trim(), 'utf8');
  console.log("✅ Created: .env.production");

  console.log("\n📋 Frontend Update Summary:");
  console.log("├── Files updated:", updates.length);
  updates.forEach(file => console.log("│   ├──", file));
  console.log("└── New environment file: .env.production");

  console.log("\n🚀 Next steps for frontend:");
  console.log("1. npm run build");
  console.log("2. Deploy to production");
  console.log("3. Update any hardcoded addresses in documentation");
}

// Get contract address from command line
const contractAddress = process.argv[2];

if (!contractAddress) {
  console.log("❌ Usage: node updateFrontendConfig.js <CONTRACT_ADDRESS>");
  process.exit(1);
}

if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
  console.log("❌ Invalid contract address format");
  process.exit(1);
}

updateFrontendConfig(contractAddress);
console.log("✅ Frontend configuration update completed!");
