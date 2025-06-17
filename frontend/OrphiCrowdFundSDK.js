// OrphiCrowdFund JavaScript SDK
// Updated for BSC Mainnet Integration

import { ethers } from 'ethers';

export class OrphiCrowdFundSDK {
    constructor(provider, signer = null) {
        this.provider = provider;
        this.signer = signer;
        
        // MAINNET CONFIGURATION
        this.contractAddress = "0x4965197b430343daec1042B413Dd6e20D06dAdba"; // LIVE MAINNET CONTRACT
        this.usdtAddress = "0x55d398326f99059fF775485246999027B3197955"; // BSC Mainnet USDT
        this.networkId = 56; // BSC Mainnet
        this.networkName = "BSC Mainnet";
        this.explorerUrl = "https://bscscan.com";
        
        // Simplified ABI for the optimized contract
        this.abi = [
            "function getUserInfo(address user) view returns (tuple(bool isRegistered, bool isBlacklisted, address referrer, uint96 balance, uint96 totalInvestment, uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals, uint32 teamSize, uint8 packageLevel, uint8 rank, uint8 withdrawalRate))",
            "function getPoolBalances() view returns (uint96, uint96, uint96)",
            "function packages(uint8) view returns (tuple(uint96 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus))",
            "function register(address referrer, uint8 packageLevel, bool useUSDT) payable",
            "function upgradePackage(uint8 newLevel, bool useUSDT) payable",
            "function withdraw(uint96 amount)",
            "function paused() view returns (bool)",
            "function owner() view returns (address)",
            "function getDirectReferrals(address user) view returns (address[])",
            "function getUplineChain(address user) view returns (address[30])",
            "function getBinaryMatrix(address user) view returns (address[2])",
            
            // Events
            "event UserRegistered(address indexed user, address indexed referrer, uint8 packageLevel, uint96 amount)",
            "event PackageUpgraded(address indexed user, uint8 newLevel, uint96 amount)",
            "event BonusDistributed(address indexed recipient, uint96 amount, uint8 bonusType)",
            "event Withdrawal(address indexed user, uint96 amount)"
        ];
        
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

    // READ FUNCTIONS - Updated for optimized contract
    async getUserInfo(userAddress) {
        const info = await this.contract.getUserInfo(userAddress);
        
        // Transform to match your existing frontend expectations
        return {
            isRegistered: info.isRegistered,
            sponsor: info.referrer,
            currentTier: info.packageLevel,
            totalInvestment: info.totalInvestment,
            totalEarnings: info.totalEarnings,
            withdrawableBalance: info.balance,
            directReferrals: info.directReferrals,
            teamSize: info.teamSize,
            rank: info.rank,
            isActive: !info.isBlacklisted,
            isBlacklisted: info.isBlacklisted,
            earningsCap: info.earningsCap,
            withdrawalRate: info.withdrawalRate
        };
    }

    async getPackageAmounts() {
        // Return the 8 package amounts in USD
        return [
            ethers.parseUnits("30", 18),   // Package 1: $30
            ethers.parseUnits("50", 18),   // Package 2: $50
            ethers.parseUnits("100", 18),  // Package 3: $100
            ethers.parseUnits("200", 18),  // Package 4: $200
            ethers.parseUnits("300", 18),  // Package 5: $300
            ethers.parseUnits("500", 18),  // Package 6: $500
            ethers.parseUnits("1000", 18), // Package 7: $1000
            ethers.parseUnits("2000", 18)  // Package 8: $2000
        ];
    }

    async getContractStats() {
        try {
            const poolBalances = await this.contract.getPoolBalances();
            
            // Calculate total pool balance
            const totalPoolBalance = poolBalances[0] + poolBalances[1] + poolBalances[2];
            
            return {
                totalUsers: 1, // Start with 1 (admin)
                totalContributed: ethers.parseEther("0"),
                totalWithdrawn: ethers.parseEther("0"),
                globalPoolBalance: totalPoolBalance
            };
        } catch (error) {
            console.error("Error getting contract stats:", error);
            return {
                totalUsers: 1,
                totalContributed: ethers.parseEther("0"),
                totalWithdrawn: ethers.parseEther("0"),
                globalPoolBalance: ethers.parseEther("0")
            };
        }
    }

    async getPoolBalances() {
        return await this.contract.getPoolBalances();
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

    // WRITE FUNCTIONS (require signer) - Updated for optimized contract
    async registerUser(sponsorAddress, packageTier, paymentAmount) {
        if (!this.signer) throw new Error("Signer required for write operations");
        
        // Convert tier (0-based to 1-based)
        const packageLevel = packageTier + 1;
        
        return await this.contract.register(
            sponsorAddress || ethers.ZeroAddress,
            packageLevel,
            false, // Use BNB payment
            { value: paymentAmount }
        );
    }

    async upgradePackage(newTier, paymentAmount) {
        if (!this.signer) throw new Error("Signer required for write operations");
        
        // Convert tier (0-based to 1-based)
        const packageLevel = newTier + 1;
        
        return await this.contract.upgradePackage(
            packageLevel,
            false, // Use BNB payment
            { value: paymentAmount }
        );
    }

    async withdraw(amount) {
        if (!this.signer) throw new Error("Signer required for write operations");
        
        return await this.contract.withdraw(amount);
    }

    // UTILITY FUNCTIONS
    formatUSDT(amount) {
        return ethers.formatUnits(amount, 18); // Updated for 18 decimals
    }

    parseUSDT(amount) {
        return ethers.parseUnits(amount.toString(), 18); // Updated for 18 decimals
    }

    formatBNB(amount) {
        return ethers.formatEther(amount);
    }

    parseBNB(amount) {
        return ethers.parseEther(amount.toString());
    }

    // Convert USD to BNB (assuming 1 BNB = $300 for now)
    usdToBNB(usdAmount) {
        const bnbPrice = 300; // This should come from price oracle in production
        return (parseFloat(usdAmount) / bnbPrice).toString();
    }

    // EVENT LISTENERS
    onUserRegistered(callback) {
        this.contract.on("UserRegistered", callback);
    }

    onPackageUpgraded(callback) {
        this.contract.on("PackageUpgraded", callback);
    }

    onWithdrawalMade(callback) {
        this.contract.on("Withdrawal", callback);
    }

    onBonusDistributed(callback) {
        this.contract.on("BonusDistributed", callback);
    }

    // PACKAGE HELPERS - Updated for mainnet
    getPackageInfo(tier) {
        const packages = [
            { tier: 0, name: "Starter Package", amount: "30", bnbAmount: this.usdToBNB("30") },
            { tier: 1, name: "Basic Package", amount: "50", bnbAmount: this.usdToBNB("50") },
            { tier: 2, name: "Standard Package", amount: "100", bnbAmount: this.usdToBNB("100") },
            { tier: 3, name: "Advanced Package", amount: "200", bnbAmount: this.usdToBNB("200") },
            { tier: 4, name: "Professional Package", amount: "300", bnbAmount: this.usdToBNB("300") },
            { tier: 5, name: "Premium Package", amount: "500", bnbAmount: this.usdToBNB("500") },
            { tier: 6, name: "Elite Package", amount: "1000", bnbAmount: this.usdToBNB("1000") },
            { tier: 7, name: "Ultimate Package", amount: "2000", bnbAmount: this.usdToBNB("2000") }
        ];
        return packages[tier] || null;
    }

    // Network helpers
    async checkNetwork() {
        if (!this.provider) return false;
        
        try {
            const network = await this.provider.getNetwork();
            return Number(network.chainId) === this.networkId;
        } catch (error) {
            return false;
        }
    }

    async switchToMainnet() {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask not installed');
        }

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${this.networkId.toString(16)}` }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: `0x${this.networkId.toString(16)}`,
                        chainName: this.networkName,
                        rpcUrls: ['https://bsc-dataseed.binance.org/'],
                        blockExplorerUrls: [this.explorerUrl],
                        nativeCurrency: {
                            name: 'BNB',
                            symbol: 'BNB',
                            decimals: 18
                        }
                    }],
                });
            } else {
                throw switchError;
            }
        }
    }

    // Get contract URL on explorer
    getContractUrl() {
        return `${this.explorerUrl}/address/${this.contractAddress}`;
    }

    // Get transaction URL
    getTxUrl(txHash) {
        return `${this.explorerUrl}/tx/${txHash}`;
    }
}

export default OrphiCrowdFundSDK;
