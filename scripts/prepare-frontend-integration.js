import hre from "hardhat";
import fs from 'fs';

const { ethers } = hre;

async function main() {
    console.log("🔗 PREPARING FRONTEND INTEGRATION");
    console.log("=" .repeat(60));

    // Contract addresses and details
    const CONTRACT_ADDRESS = "0x70147f13E7e2363071A85772A0a4f08065BE993F";
    const IMPLEMENTATION_ADDRESS = "0x55a4355F729A400A2C4d47aC696F460D8bD7D085";
    const USDT_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";

    console.log("\n📋 Contract Information:");
    console.log(`   Main Contract (Proxy): ${CONTRACT_ADDRESS}`);
    console.log(`   Implementation: ${IMPLEMENTATION_ADDRESS}`);
    console.log(`   USDT Token: ${USDT_ADDRESS}`);
    console.log(`   Network: BSC Testnet (ChainID: 97)`);

    // Get the contract ABI
    const contract = await ethers.getContractAt("OrphiCrowdFundDeployable", CONTRACT_ADDRESS);
    
    console.log("\n📄 Generating ABI and Contract Interface...");

    // Get the contract interface
    const contractInterface = contract.interface;
    const abi = contractInterface.formatJson();

    // Create frontend integration package
    const frontendConfig = {
        network: {
            name: "BSC Testnet",
            chainId: 97,
            rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
            blockExplorer: "https://testnet.bscscan.com"
        },
        contracts: {
            OrphiCrowdFund: {
                address: CONTRACT_ADDRESS,
                implementation: IMPLEMENTATION_ADDRESS,
                abi: JSON.parse(abi)
            },
            USDT: {
                address: USDT_ADDRESS,
                decimals: 6,
                symbol: "USDT"
            }
        },
        features: {
            packages: [
                { tier: 0, name: "Package 1", amount: "30", currency: "USDT" },
                { tier: 1, name: "Package 2", amount: "50", currency: "USDT" },
                { tier: 2, name: "Package 3", amount: "100", currency: "USDT" },
                { tier: 3, name: "Package 4", amount: "200", currency: "USDT" },
                { tier: 4, name: "Package 5", amount: "300", currency: "USDT" },
                { tier: 5, name: "Package 6", amount: "500", currency: "USDT" },
                { tier: 6, name: "Package 7", amount: "1000", currency: "USDT" },
                { tier: 7, name: "Package 8", amount: "2000", currency: "USDT" }
            ],
            compensation: {
                sponsorBonus: "40%",
                levelBonuses: {
                    level1: "3%",
                    level2: "1%", 
                    level3: "1%",
                    levels4to10: "0.5% each"
                },
                globalHelpPool: "30%",
                earningsCap: "300% of investment"
            },
            paymentMethods: ["BNB", "USDT"]
        },
        functions: {
            read: [
                "getUserInfo(address)",
                "getPackageAmounts()",
                "getContractStats()",
                "owner()",
                "VERSION()",
                "usdtMode()"
            ],
            write: [
                "registerUser(address,uint8)",
                "withdraw(uint256)",
                "setUSDTMode(bool)"
            ]
        }
    };

    // Save ABI separately
    fs.writeFileSync('frontend/OrphiCrowdFund.abi.json', abi);
    
    // Save frontend configuration
    fs.writeFileSync('frontend/contract-config.json', JSON.stringify(frontendConfig, null, 2));

    // Create JavaScript SDK template
    const sdkTemplate = `
// OrphiCrowdFund JavaScript SDK
// For BSC Testnet Integration

import { ethers } from 'ethers';

export class OrphiCrowdFundSDK {
    constructor(provider, signer = null) {
        this.provider = provider;
        this.signer = signer;
        this.contractAddress = "${CONTRACT_ADDRESS}";
        this.usdtAddress = "${USDT_ADDRESS}";
        
        // Load ABI
        this.abi = ${abi};
        
        // Create contract instance
        this.contract = new ethers.Contract(
            this.contractAddress, 
            this.abi, 
            signer || provider
        );
    }

    // Connect with signer for write operations
    connect(signer) {
        this.signer = signer;
        this.contract = this.contract.connect(signer);
        return this;
    }

    // READ FUNCTIONS
    async getUserInfo(userAddress) {
        return await this.contract.getUserInfo(userAddress);
    }

    async getPackageAmounts() {
        return await this.contract.getPackageAmounts();
    }

    async getContractStats() {
        return await this.contract.getContractStats();
    }

    async isUserRegistered(userAddress) {
        const userInfo = await this.getUserInfo(userAddress);
        return userInfo.isRegistered;
    }

    async getUserBalance(userAddress) {
        const userInfo = await this.getUserInfo(userAddress);
        return {
            withdrawable: userInfo.withdrawableBalance,
            totalEarnings: userInfo.totalEarnings,
            totalInvestment: userInfo.totalInvestment
        };
    }

    // WRITE FUNCTIONS (require signer)
    async registerUser(sponsorAddress, packageTier, paymentAmount) {
        if (!this.signer) throw new Error("Signer required for write operations");
        
        return await this.contract.registerUser(
            sponsorAddress || ethers.ZeroAddress,
            packageTier,
            { value: paymentAmount }
        );
    }

    async withdraw(amount) {
        if (!this.signer) throw new Error("Signer required for write operations");
        
        return await this.contract.withdraw(amount);
    }

    // UTILITY FUNCTIONS
    formatUSDT(amount) {
        return ethers.formatUnits(amount, 6);
    }

    parseUSDT(amount) {
        return ethers.parseUnits(amount.toString(), 6);
    }

    formatBNB(amount) {
        return ethers.formatEther(amount);
    }

    parseBNB(amount) {
        return ethers.parseEther(amount.toString());
    }

    // EVENT LISTENERS
    onUserRegistered(callback) {
        this.contract.on("UserRegistered", callback);
    }

    onContributionMade(callback) {
        this.contract.on("ContributionMade", callback);
    }

    onWithdrawalMade(callback) {
        this.contract.on("WithdrawalMade", callback);
    }

    // PACKAGE HELPERS
    getPackageInfo(tier) {
        const packages = [
            { tier: 0, name: "Package 1", amount: "30" },
            { tier: 1, name: "Package 2", amount: "50" },
            { tier: 2, name: "Package 3", amount: "100" },
            { tier: 3, name: "Package 4", amount: "200" },
            { tier: 4, name: "Package 5", amount: "300" },
            { tier: 5, name: "Package 6", amount: "500" },
            { tier: 6, name: "Package 7", amount: "1000" },
            { tier: 7, name: "Package 8", amount: "2000" }
        ];
        return packages[tier] || null;
    }
}

// Usage Example:
/*
// Initialize with provider
const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
const sdk = new OrphiCrowdFundSDK(provider);

// Connect wallet for write operations
const signer = new ethers.Wallet(privateKey, provider);
sdk.connect(signer);

// Read user info
const userInfo = await sdk.getUserInfo('0x...');

// Register user
const tx = await sdk.registerUser('0x...', 0, sdk.parseBNB('30'));
await tx.wait();
*/

export default OrphiCrowdFundSDK;
`;

    fs.writeFileSync('frontend/OrphiCrowdFundSDK.js', sdkTemplate);

    // Create React component example
    const reactComponentTemplate = `
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import OrphiCrowdFundSDK from './OrphiCrowdFundSDK';

const OrphiCrowdFundDashboard = () => {
    const [sdk, setSdk] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        initializeSDK();
    }, []);

    const initializeSDK = async () => {
        try {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const newSdk = new OrphiCrowdFundSDK(provider);
                setSdk(newSdk);
            }
        } catch (error) {
            console.error('Failed to initialize SDK:', error);
        }
    };

    const connectWallet = async () => {
        try {
            setLoading(true);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            
            sdk.connect(signer);
            setIsConnected(true);
            
            // Load user info
            const info = await sdk.getUserInfo(address);
            setUserInfo(info);
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const registerUser = async (sponsorAddress, packageTier) => {
        try {
            setLoading(true);
            const packageInfo = sdk.getPackageInfo(packageTier);
            const amount = sdk.parseBNB(packageInfo.amount);
            
            const tx = await sdk.registerUser(sponsorAddress, packageTier, amount);
            await tx.wait();
            
            // Refresh user info
            const signer = await sdk.provider.getSigner();
            const address = await signer.getAddress();
            const info = await sdk.getUserInfo(address);
            setUserInfo(info);
        } catch (error) {
            console.error('Registration failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const withdraw = async (amount) => {
        try {
            setLoading(true);
            const tx = await sdk.withdraw(amount);
            await tx.wait();
            
            // Refresh user info
            const signer = await sdk.provider.getSigner();
            const address = await signer.getAddress();
            const info = await sdk.getUserInfo(address);
            setUserInfo(info);
        } catch (error) {
            console.error('Withdrawal failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="orphi-dashboard">
            <h1>Orphi CrowdFund Dashboard</h1>
            
            {!isConnected ? (
                <button onClick={connectWallet} disabled={loading}>
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
            ) : (
                <div>
                    <h2>User Information</h2>
                    {userInfo && (
                        <div>
                            <p>Registered: {userInfo.isRegistered.toString()}</p>
                            <p>Current Tier: {userInfo.currentTier.toString()}</p>
                            <p>Total Investment: {sdk.formatUSDT(userInfo.totalInvestment)} USDT</p>
                            <p>Total Earnings: {sdk.formatUSDT(userInfo.totalEarnings)} USDT</p>
                            <p>Withdrawable: {sdk.formatUSDT(userInfo.withdrawableBalance)} USDT</p>
                            <p>Direct Referrals: {userInfo.directReferrals.toString()}</p>
                        </div>
                    )}
                    
                    {!userInfo?.isRegistered && (
                        <div>
                            <h3>Register</h3>
                            <button onClick={() => registerUser('', 0)} disabled={loading}>
                                Register Package 1 ($30)
                            </button>
                        </div>
                    )}
                    
                    {userInfo?.withdrawableBalance > 0 && (
                        <div>
                            <h3>Withdraw</h3>
                            <button 
                                onClick={() => withdraw(userInfo.withdrawableBalance)} 
                                disabled={loading}
                            >
                                Withdraw All ({sdk.formatUSDT(userInfo.withdrawableBalance)} USDT)
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrphiCrowdFundDashboard;
`;

    fs.writeFileSync('frontend/OrphiCrowdFundDashboard.jsx', reactComponentTemplate);

    console.log("\n✅ Frontend integration files generated:");
    console.log("   📄 frontend/OrphiCrowdFund.abi.json - Contract ABI");
    console.log("   📄 frontend/contract-config.json - Configuration file"); 
    console.log("   📄 frontend/OrphiCrowdFundSDK.js - JavaScript SDK");
    console.log("   📄 frontend/OrphiCrowdFundDashboard.jsx - React component example");

    console.log("\n🔧 Integration Instructions:");
    console.log("   1. Copy frontend/ folder to your web project");
    console.log("   2. Install dependencies: npm install ethers");
    console.log("   3. Import and use OrphiCrowdFundSDK in your app");
    console.log("   4. Connect to BSC Testnet in MetaMask");
    console.log("   5. Test with the provided React component");

    console.log("\n🌐 BSC Testnet Configuration:");
    console.log("   Network Name: BSC Testnet");
    console.log("   RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/");
    console.log("   Chain ID: 97");
    console.log("   Symbol: BNB");
    console.log("   Block Explorer: https://testnet.bscscan.com");

    console.log("\n🎉 FRONTEND INTEGRATION READY!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
