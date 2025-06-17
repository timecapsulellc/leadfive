// OrphiCrowdFund JavaScript SDK - LIVE MAINNET VERSION
// Contract: 0x4965197b430343daec1042B413Dd6e20D06dAdba

import { ethers } from 'ethers';

export class OrphiCrowdFundSDK {
    constructor(provider, signer = null) {
        this.provider = provider;
        this.signer = signer;
        
        // LIVE MAINNET CONFIGURATION
        this.contractAddress = "0x4965197b430343daec1042B413Dd6e20D06dAdba";
        this.usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
        this.networkId = 56;
        this.networkName = "BSC Mainnet";
        this.explorerUrl = "https://bscscan.com";
        
        // Optimized ABI for live contract
        this.abi = [
            "function getUserInfo(address user) view returns (tuple(bool isRegistered, bool isBlacklisted, address referrer, uint96 balance, uint96 totalInvestment, uint96 totalEarnings, uint96 earningsCap, uint32 directReferrals, uint32 teamSize, uint8 packageLevel, uint8 rank, uint8 withdrawalRate))",
            "function getPoolBalances() view returns (uint96, uint96, uint96)",
            "function packages(uint8) view returns (tuple(uint96 price, uint16 directBonus, uint16 levelBonus, uint16 uplineBonus, uint16 leaderBonus, uint16 helpBonus, uint16 clubBonus))",
            "function register(address referrer, uint8 packageLevel, bool useUSDT) payable",
            "function upgradePackage(uint8 newLevel, bool useUSDT) payable",
            "function withdraw(uint96 amount)",
            "function paused() view returns (bool)",
            "function owner() view returns (address)"
        ];
        
        this.contract = new ethers.Contract(this.contractAddress, this.abi, signer || provider);
    }

    connect(signer) {
        this.signer = signer;
        this.contract = this.contract.connect(signer);
        return this;
    }

    async getUserInfo(userAddress) {
        const info = await this.contract.getUserInfo(userAddress);
        
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
            withdrawalRate: info.withdrawalRate,
            registrationTime: Date.now(),
            lastWithdrawal: 0,
            leftChild: ethers.ZeroAddress,
            rightChild: ethers.ZeroAddress,
            leftVolume: 0,
            rightVolume: 0,
            clubMember: false,
            clubJoinTime: 0
        };
    }

    async getPackageAmounts() {
        return [
            ethers.parseUnits("30", 18),
            ethers.parseUnits("50", 18),
            ethers.parseUnits("100", 18),
            ethers.parseUnits("200", 18),
            ethers.parseUnits("300", 18),
            ethers.parseUnits("500", 18),
            ethers.parseUnits("1000", 18),
            ethers.parseUnits("2000", 18)
        ];
    }

    async getContractStats() {
        try {
            const poolBalances = await this.contract.getPoolBalances();
            const totalPoolBalance = poolBalances[0] + poolBalances[1] + poolBalances[2];
            
            return {
                totalUsers: 1,
                totalContributed: ethers.parseEther("0"),
                totalWithdrawn: ethers.parseEther("0"),
                globalPoolBalance: totalPoolBalance
            };
        } catch (error) {
            return {
                totalUsers: 1,
                totalContributed: ethers.parseEther("0"),
                totalWithdrawn: ethers.parseEther("0"),
                globalPoolBalance: ethers.parseEther("0")
            };
        }
    }

    async registerUser(sponsorAddress, packageTier, paymentAmount) {
        if (!this.signer) throw new Error("Signer required");
        
        const packageLevel = packageTier + 1;
        return await this.contract.register(
            sponsorAddress || ethers.ZeroAddress,
            packageLevel,
            false,
            { value: paymentAmount }
        );
    }

    async withdraw(amount) {
        if (!this.signer) throw new Error("Signer required");
        return await this.contract.withdraw(amount);
    }

    formatUSDT(amount) {
        return ethers.formatUnits(amount, 18);
    }

    parseUSDT(amount) {
        return ethers.parseUnits(amount.toString(), 18);
    }

    formatBNB(amount) {
        return ethers.formatEther(amount);
    }

    parseBNB(amount) {
        return ethers.parseEther(amount.toString());
    }

    getPackageInfo(tier) {
        const packages = [
            { tier: 0, name: "Starter Package", amount: "30" },
            { tier: 1, name: "Basic Package", amount: "50" },
            { tier: 2, name: "Standard Package", amount: "100" },
            { tier: 3, name: "Advanced Package", amount: "200" },
            { tier: 4, name: "Professional Package", amount: "300" },
            { tier: 5, name: "Premium Package", amount: "500" },
            { tier: 6, name: "Elite Package", amount: "1000" },
            { tier: 7, name: "Ultimate Package", amount: "2000" }
        ];
        return packages[tier] || null;
    }

    getContractUrl() {
        return `${this.explorerUrl}/address/${this.contractAddress}`;
    }

    getTxUrl(txHash) {
        return `${this.explorerUrl}/tx/${txHash}`;
    }
}

export default OrphiCrowdFundSDK; 