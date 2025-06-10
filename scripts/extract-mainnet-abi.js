const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

/**
 * Extract ABI from BSCScan for verified OrphiCrowdFund contract
 * This script fetches the ABI from the verified contract on BSCScan
 */

async function main() {
    console.log("🔍 Extracting ABI from BSC Mainnet Contract");
    console.log("============================================");

    const contractAddress = "0x8F826B18096Dcf7AF4515B06Cb563475d189ab50";
    const implementationAddress = "0xE9d76e821790c64d7563F6022b5F73eEAE57DB6C";
    
    console.log(`📋 Proxy Contract: ${contractAddress}`);
    console.log(`📋 Implementation: ${implementationAddress}`);

    try {
        // Method 1: Try to get ABI from artifacts if available
        console.log("\n🔄 Method 1: Checking local artifacts...");
        try {
            const artifact = await hre.artifacts.readArtifact("OrphiCrowdFund");
            console.log("✅ Found local artifact!");
            
            const abi = artifact.abi;
            await saveABI(abi, "local-artifact");
            
        } catch (error) {
            console.log("❌ Local artifact not found:", error.message);
        }

        // Method 2: Create ABI from contract interface
        console.log("\n🔄 Method 2: Creating ABI from contract interface...");
        
        const orphiCrowdFundABI = [
            // Constructor/Initializer
            {
                "type": "function",
                "name": "initialize",
                "inputs": [
                    {"name": "_usdtToken", "type": "address"},
                    {"name": "_treasuryAddress", "type": "address"},
                    {"name": "_emergencyAddress", "type": "address"},
                    {"name": "_poolManagerAddress", "type": "address"}
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            
            // Core Functions
            {
                "type": "function",
                "name": "registerUser",
                "inputs": [
                    {"name": "sponsor", "type": "address"},
                    {"name": "packageTier", "type": "uint8"}
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            
            {
                "type": "function",
                "name": "withdraw",
                "inputs": [
                    {"name": "amount", "type": "uint256"}
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            
            {
                "type": "function",
                "name": "upgradePackage",
                "inputs": [
                    {"name": "newTier", "type": "uint8"}
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            
            // Pool Distribution Functions
            {
                "type": "function",
                "name": "distributeGlobalHelpPool",
                "inputs": [],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            
            {
                "type": "function",
                "name": "distributeLeaderBonus",
                "inputs": [],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            
            // Rank Functions
            {
                "type": "function",
                "name": "checkRankAdvancement",
                "inputs": [
                    {"name": "user", "type": "address"}
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            
            // View Functions
            {
                "type": "function",
                "name": "getUserInfo",
                "inputs": [
                    {"name": "user", "type": "address"}
                ],
                "outputs": [
                    {"name": "totalInvested", "type": "uint256"},
                    {"name": "registrationTime", "type": "uint256"},
                    {"name": "teamSize", "type": "uint256"},
                    {"name": "totalEarnings", "type": "uint256"},
                    {"name": "withdrawableAmount", "type": "uint256"},
                    {"name": "packageTier", "type": "uint8"},
                    {"name": "leaderRank", "type": "uint8"},
                    {"name": "isCapped", "type": "bool"},
                    {"name": "isActive", "type": "bool"},
                    {"name": "sponsor", "type": "address"},
                    {"name": "directReferrals", "type": "uint32"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "getPoolEarnings",
                "inputs": [
                    {"name": "user", "type": "address"}
                ],
                "outputs": [
                    {"name": "", "type": "uint128[5]"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "getDirectReferrals",
                "inputs": [
                    {"name": "user", "type": "address"}
                ],
                "outputs": [
                    {"name": "", "type": "address[]"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "getUplineChain",
                "inputs": [
                    {"name": "user", "type": "address"}
                ],
                "outputs": [
                    {"name": "", "type": "address[30]"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "getMatrixChildren",
                "inputs": [
                    {"name": "user", "type": "address"}
                ],
                "outputs": [
                    {"name": "left", "type": "address"},
                    {"name": "right", "type": "address"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "getWithdrawalRate",
                "inputs": [
                    {"name": "user", "type": "address"}
                ],
                "outputs": [
                    {"name": "", "type": "uint256"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "isUserRegistered",
                "inputs": [
                    {"name": "user", "type": "address"}
                ],
                "outputs": [
                    {"name": "", "type": "bool"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "getPackageAmounts",
                "inputs": [],
                "outputs": [
                    {"name": "", "type": "uint256[4]"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "getLevelBonusRates",
                "inputs": [],
                "outputs": [
                    {"name": "", "type": "uint256[10]"}
                ],
                "stateMutability": "view"
            },
            
            // Public Variables (auto-generated getters)
            {
                "type": "function",
                "name": "owner",
                "inputs": [],
                "outputs": [
                    {"name": "", "type": "address"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "totalUsers",
                "inputs": [],
                "outputs": [
                    {"name": "", "type": "uint256"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "totalVolume",
                "inputs": [],
                "outputs": [
                    {"name": "", "type": "uint256"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "usdtToken",
                "inputs": [],
                "outputs": [
                    {"name": "", "type": "address"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "treasuryAddress",
                "inputs": [],
                "outputs": [
                    {"name": "", "type": "address"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "poolBalances",
                "inputs": [
                    {"name": "", "type": "uint256"}
                ],
                "outputs": [
                    {"name": "", "type": "uint256"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "globalHelpPoolBalance",
                "inputs": [],
                "outputs": [
                    {"name": "", "type": "uint256"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "leaderBonusPoolBalance",
                "inputs": [],
                "outputs": [
                    {"name": "", "type": "uint256"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "users",
                "inputs": [
                    {"name": "", "type": "address"}
                ],
                "outputs": [
                    {"name": "totalInvested", "type": "uint128"},
                    {"name": "registrationTime", "type": "uint64"},
                    {"name": "teamSize", "type": "uint32"},
                    {"name": "lastActivity", "type": "uint32"},
                    {"name": "totalEarnings", "type": "uint128"},
                    {"name": "withdrawableAmount", "type": "uint128"},
                    {"name": "packageTierValue", "type": "uint64"},
                    {"name": "leaderRankValue", "type": "uint32"},
                    {"name": "directReferrals", "type": "uint32"},
                    {"name": "isCapped", "type": "bool"},
                    {"name": "isActive", "type": "bool"},
                    {"name": "sponsor", "type": "address"},
                    {"name": "leftChild", "type": "address"},
                    {"name": "rightChild", "type": "address"}
                ],
                "stateMutability": "view"
            },
            
            // Admin Functions
            {
                "type": "function",
                "name": "updateAdminAddresses",
                "inputs": [
                    {"name": "_treasuryAddress", "type": "address"},
                    {"name": "_emergencyAddress", "type": "address"},
                    {"name": "_poolManagerAddress", "type": "address"}
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            
            {
                "type": "function",
                "name": "emergencyWithdraw",
                "inputs": [
                    {"name": "amount", "type": "uint256"}
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            
            {
                "type": "function",
                "name": "pause",
                "inputs": [],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            
            {
                "type": "function",
                "name": "unpause",
                "inputs": [],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            
            {
                "type": "function",
                "name": "paused",
                "inputs": [],
                "outputs": [
                    {"name": "", "type": "bool"}
                ],
                "stateMutability": "view"
            },
            
            {
                "type": "function",
                "name": "version",
                "inputs": [],
                "outputs": [
                    {"name": "", "type": "string"}
                ],
                "stateMutability": "pure"
            },
            
            // Events
            {
                "type": "event",
                "name": "UserRegistered",
                "inputs": [
                    {"name": "user", "type": "address", "indexed": true},
                    {"name": "sponsor", "type": "address", "indexed": true},
                    {"name": "packageTier", "type": "uint8", "indexed": true},
                    {"name": "amount", "type": "uint256", "indexed": false},
                    {"name": "timestamp", "type": "uint256", "indexed": false}
                ]
            },
            
            {
                "type": "event",
                "name": "PackageUpgraded",
                "inputs": [
                    {"name": "user", "type": "address", "indexed": true},
                    {"name": "oldTier", "type": "uint8", "indexed": true},
                    {"name": "newTier", "type": "uint8", "indexed": true},
                    {"name": "upgradeCost", "type": "uint256", "indexed": false},
                    {"name": "timestamp", "type": "uint256", "indexed": false}
                ]
            },
            
            {
                "type": "event",
                "name": "CommissionDistributed",
                "inputs": [
                    {"name": "recipient", "type": "address", "indexed": true},
                    {"name": "payer", "type": "address", "indexed": true},
                    {"name": "amount", "type": "uint256", "indexed": true},
                    {"name": "poolType", "type": "uint8", "indexed": false},
                    {"name": "poolName", "type": "string", "indexed": false},
                    {"name": "timestamp", "type": "uint256", "indexed": false}
                ]
            },
            
            {
                "type": "event",
                "name": "WithdrawalProcessed",
                "inputs": [
                    {"name": "user", "type": "address", "indexed": true},
                    {"name": "amount", "type": "uint256", "indexed": true},
                    {"name": "reinvestmentAmount", "type": "uint256", "indexed": false},
                    {"name": "timestamp", "type": "uint256", "indexed": false}
                ]
            },
            
            {
                "type": "event",
                "name": "GlobalHelpPoolDistributed",
                "inputs": [
                    {"name": "totalAmount", "type": "uint256", "indexed": true},
                    {"name": "eligibleUsers", "type": "uint256", "indexed": true},
                    {"name": "perUserAmount", "type": "uint256", "indexed": true},
                    {"name": "timestamp", "type": "uint256", "indexed": false}
                ]
            },
            
            {
                "type": "event",
                "name": "LeaderBonusDistributed",
                "inputs": [
                    {"name": "shiningStarAmount", "type": "uint256", "indexed": true},
                    {"name": "silverStarAmount", "type": "uint256", "indexed": true},
                    {"name": "shiningStarCount", "type": "uint256", "indexed": false},
                    {"name": "silverStarCount", "type": "uint256", "indexed": false},
                    {"name": "timestamp", "type": "uint256", "indexed": false}
                ]
            },
            
            {
                "type": "event",
                "name": "RankAdvancement",
                "inputs": [
                    {"name": "user", "type": "address", "indexed": true},
                    {"name": "oldRank", "type": "uint8", "indexed": true},
                    {"name": "newRank", "type": "uint8", "indexed": true},
                    {"name": "timestamp", "type": "uint256", "indexed": false}
                ]
            },
            
            {
                "type": "event",
                "name": "EarningsCapReached",
                "inputs": [
                    {"name": "user", "type": "address", "indexed": true},
                    {"name": "totalEarnings", "type": "uint256", "indexed": true},
                    {"name": "investmentAmount", "type": "uint256", "indexed": false},
                    {"name": "timestamp", "type": "uint256", "indexed": false}
                ]
            },
            
            {
                "type": "event",
                "name": "MatrixPlacement",
                "inputs": [
                    {"name": "user", "type": "address", "indexed": true},
                    {"name": "placedUnder", "type": "address", "indexed": true},
                    {"name": "position", "type": "string", "indexed": false},
                    {"name": "level", "type": "uint256", "indexed": false},
                    {"name": "timestamp", "type": "uint256", "indexed": false}
                ]
            }
        ];

        await saveABI(orphiCrowdFundABI, "manual-creation");

        // Method 3: Try to get from BSCScan API (if API key available)
        console.log("\n🔄 Method 3: Attempting BSCScan API fetch...");
        try {
            const bscscanApiKey = process.env.BSCSCAN_API_KEY;
            if (bscscanApiKey && bscscanApiKey !== "your_api_key_here") {
                const response = await fetch(`https://api.bscscan.com/api?module=contract&action=getabi&address=${implementationAddress}&apikey=${bscscanApiKey}`);
                const data = await response.json();
                
                if (data.status === "1") {
                    const abi = JSON.parse(data.result);
                    await saveABI(abi, "bscscan-api");
                    console.log("✅ Successfully fetched ABI from BSCScan API!");
                } else {
                    console.log("❌ BSCScan API error:", data.message);
                }
            } else {
                console.log("⚠️ BSCScan API key not configured");
            }
        } catch (error) {
            console.log("❌ BSCScan API fetch failed:", error.message);
        }

        console.log("\n🎉 ABI extraction completed!");
        console.log("\n📋 Next Steps:");
        console.log("1. Check the generated ABI files in docs/abi/");
        console.log("2. Update your frontend to use the new ABI");
        console.log("3. Test contract interactions");

    } catch (error) {
        console.error("❌ ABI extraction failed:", error);
    }
}

async function saveABI(abi, source) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Create ABI directory if it doesn't exist
    const abiDir = path.join(__dirname, '..', 'docs', 'abi');
    if (!fs.existsSync(abiDir)) {
        fs.mkdirSync(abiDir, { recursive: true });
    }

    // Save main ABI file
    const mainAbiPath = path.join(abiDir, 'OrphiCrowdFund_mainnet.json');
    const abiData = {
        contractName: "OrphiCrowdFund",
        contractAddress: "0x8F826B18096Dcf7AF4515B06Cb563475d189ab50",
        implementationAddress: "0xE9d76e821790c64d7563F6022b5F73eEAE57DB6C",
        network: "BSC Mainnet",
        chainId: 56,
        source: source,
        extractedAt: new Date().toISOString(),
        abi: abi
    };
    
    fs.writeFileSync(mainAbiPath, JSON.stringify(abiData, null, 2));
    console.log(`✅ Saved ABI to: ${mainAbiPath}`);

    // Save timestamped backup
    const backupPath = path.join(abiDir, `OrphiCrowdFund_mainnet_${source}_${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(abiData, null, 2));
    console.log(`✅ Saved backup to: ${backupPath}`);

    // Save just the ABI array for easy import
    const abiOnlyPath = path.join(abiDir, 'OrphiCrowdFund_abi_only.json');
    fs.writeFileSync(abiOnlyPath, JSON.stringify(abi, null, 2));
    console.log(`✅ Saved ABI-only to: ${abiOnlyPath}`);

    // Update src/contracts.js if it exists
    const contractsJsPath = path.join(__dirname, '..', 'src', 'contracts.js');
    if (fs.existsSync(contractsJsPath)) {
        const contractsContent = `// OrphiCrowdFund Contract Configuration
// Auto-generated on ${new Date().toISOString()}

export const ORPHI_CROWDFUND_CONFIG = {
    address: "0x8F826B18096Dcf7AF4515B06Cb563475d189ab50",
    implementationAddress: "0xE9d76e821790c64d7563F6022b5F73eEAE57DB6C",
    network: "BSC Mainnet",
    chainId: 56,
    usdtAddress: "0x55d398326f99059fF775485246999027B3197955",
    rpcUrl: "https://bsc-dataseed.binance.org/",
    blockExplorer: "https://bscscan.com",
    contractUrl: "https://bscscan.com/address/0x8F826B18096Dcf7AF4515B06Cb563475d189ab50",
    writeContractUrl: "https://bscscan.com/address/0x8F826B18096Dcf7AF4515B06Cb563475d189ab50#writeContract"
};

export const ORPHI_CROWDFUND_ABI = ${JSON.stringify(abi, null, 2)};

// Package Tiers
export const PACKAGE_TIERS = {
    NONE: 0,
    PACKAGE_30: 1,
    PACKAGE_50: 2,
    PACKAGE_100: 3,
    PACKAGE_200: 4
};

// Leader Ranks
export const LEADER_RANKS = {
    NONE: 0,
    SHINING_STAR: 1,
    SILVER_STAR: 2
};

// Package Amounts (USDT with 6 decimals)
export const PACKAGE_AMOUNTS = {
    [PACKAGE_TIERS.PACKAGE_30]: "30000000",   // 30 USDT
    [PACKAGE_TIERS.PACKAGE_50]: "50000000",   // 50 USDT
    [PACKAGE_TIERS.PACKAGE_100]: "100000000", // 100 USDT
    [PACKAGE_TIERS.PACKAGE_200]: "200000000"  // 200 USDT
};

export default {
    ORPHI_CROWDFUND_CONFIG,
    ORPHI_CROWDFUND_ABI,
    PACKAGE_TIERS,
    LEADER_RANKS,
    PACKAGE_AMOUNTS
};
`;
        
        fs.writeFileSync(contractsJsPath, contractsContent);
        console.log(`✅ Updated: ${contractsJsPath}`);
    }

    console.log(`📊 ABI contains ${abi.length} functions/events`);
}

main()
    .then(() => {
        console.log("\n🎉 ABI extraction completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ ABI extraction failed:", error);
        process.exit(1);
    });
