// OrphiCrowdFund Frontend Integration - Mainnet Ready
// Contract: 0xE93db0753A90b495e8FE31f9793c9D4dbf2E29C7 (BSC Mainnet)

class OrphiCrowdFundWeb3 {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.usdtContract = null;
        this.account = null;
        this.network = null;
        
        // Mainnet Configuration
        this.config = {
            BSC_MAINNET: {
                chainId: '0x38', // 56 in hex
                chainName: 'BSC Mainnet',
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com/'],
                nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18
                },
                contracts: {
                    OrphiCrowdFund: {
                        address: '0xE93db0753A90b495e8FE31f9793c9D4dbf2E29C7',
                        abi: [
                            // Essential functions for frontend
                            {"inputs":[{"internalType":"address","name":"sponsor","type":"address"},{"internalType":"uint8","name":"_tier","type":"uint8"}],"name":"register","outputs":[],"stateMutability":"nonpayable","type":"function"},
                            {"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},
                            {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"bool","name":"isRegistered","type":"bool"},{"internalType":"address","name":"sponsor","type":"address"},{"internalType":"uint8","name":"currentTier","type":"uint8"},{"internalType":"uint256","name":"totalInvestment","type":"uint256"},{"internalType":"uint256","name":"totalEarnings","type":"uint256"},{"internalType":"uint256","name":"withdrawableBalance","type":"uint256"},{"internalType":"uint256","name":"directReferrals","type":"uint256"},{"internalType":"uint256","name":"teamSize","type":"uint256"},{"internalType":"uint256","name":"teamVolume","type":"uint256"},{"internalType":"uint256","name":"registrationTime","type":"uint256"},{"internalType":"uint8","name":"rank","type":"uint8"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"bool","name":"isBlacklisted","type":"bool"},{"internalType":"uint256","name":"lastWithdrawal","type":"uint256"},{"internalType":"uint256","name":"earningsCap","type":"uint256"},{"internalType":"address","name":"leftChild","type":"address"},{"internalType":"address","name":"rightChild","type":"address"},{"internalType":"uint256","name":"leftVolume","type":"uint256"},{"internalType":"uint256","name":"rightVolume","type":"uint256"},{"internalType":"bool","name":"clubMember","type":"bool"},{"internalType":"uint256","name":"clubJoinTime","type":"uint256"}],"stateMutability":"view","type":"function"},
                            {"inputs":[],"name":"totalUsers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
                            {"inputs":[],"name":"totalInvestments","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
                            {"inputs":[{"internalType":"uint8","name":"_tier","type":"uint8"}],"name":"getPackageAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
                            {"inputs":[],"name":"registrationOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
                            {"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
                            {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getDirectReferrals","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"}
                        ]
                    },
                    USDT: {
                        address: '0x55d398326f99059fF775485246999027B3197955',
                        abi: [
                            {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
                            {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
                            {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
                            {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
                        ]
                    }
                }
            }
        };
        
        // Package configurations
        this.packages = {
            1: { amount: 30, name: 'Basic Package' },
            2: { amount: 50, name: 'Standard Package' },
            3: { amount: 100, name: 'Premium Package' },
            4: { amount: 200, name: 'Advanced Package' },
            5: { amount: 300, name: 'Professional Package' },
            6: { amount: 500, name: 'Elite Package' },
            7: { amount: 1000, name: 'VIP Package' },
            8: { amount: 2000, name: 'Diamond Package' }
        };
    }

    // Initialize Web3 and connect wallet
    async init() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                this.web3 = new Web3(window.ethereum);
                await this.connectWallet();
                await this.initializeContracts();
                return true;
            } else {
                throw new Error('MetaMask not detected');
            }
        } catch (error) {
            console.error('Web3 initialization failed:', error);
            throw error;
        }
    }

    // Connect wallet
    async connectWallet() {
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            this.account = accounts[0];
            
            // Check network and switch if needed
            await this.ensureBSCMainnet();
            
            console.log('✅ Wallet connected:', this.account);
            return this.account;
        } catch (error) {
            console.error('Wallet connection failed:', error);
            throw error;
        }
    }

    // Ensure BSC Mainnet network
    async ensureBSCMainnet() {
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            if (chainId !== this.config.BSC_MAINNET.chainId) {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: this.config.BSC_MAINNET.chainId }]
                });
            }
            
            this.network = 'BSC_MAINNET';
        } catch (error) {
            if (error.code === 4902) {
                // Network not added, add it
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [this.config.BSC_MAINNET]
                });
                this.network = 'BSC_MAINNET';
            } else {
                throw error;
            }
        }
    }

    // Initialize contracts
    async initializeContracts() {
        const config = this.config[this.network];
        
        this.contract = new this.web3.eth.Contract(
            config.contracts.OrphiCrowdFund.abi,
            config.contracts.OrphiCrowdFund.address
        );
        
        this.usdtContract = new this.web3.eth.Contract(
            config.contracts.USDT.abi,
            config.contracts.USDT.address
        );
        
        console.log('✅ Contracts initialized');
    }

    // Get user information
    async getUserInfo(address = null) {
        try {
            const userAddr = address || this.account;
            if (!userAddr) throw new Error('No address provided');
            
            const userInfo = await this.contract.methods.users(userAddr).call();
            const usdtBalance = await this.getUSDTBalance(userAddr);
            
            return {
                isRegistered: userInfo.isRegistered,
                sponsor: userInfo.sponsor,
                currentTier: parseInt(userInfo.currentTier),
                totalInvestment: this.web3.utils.fromWei(userInfo.totalInvestment, 'ether'),
                totalEarnings: this.web3.utils.fromWei(userInfo.totalEarnings, 'ether'),
                withdrawableBalance: this.web3.utils.fromWei(userInfo.withdrawableBalance, 'ether'),
                directReferrals: parseInt(userInfo.directReferrals),
                teamSize: parseInt(userInfo.teamSize),
                teamVolume: this.web3.utils.fromWei(userInfo.teamVolume, 'ether'),
                registrationTime: parseInt(userInfo.registrationTime),
                rank: parseInt(userInfo.rank),
                isActive: userInfo.isActive,
                isBlacklisted: userInfo.isBlacklisted,
                lastWithdrawal: parseInt(userInfo.lastWithdrawal),
                earningsCap: this.web3.utils.fromWei(userInfo.earningsCap, 'ether'),
                leftChild: userInfo.leftChild,
                rightChild: userInfo.rightChild,
                leftVolume: this.web3.utils.fromWei(userInfo.leftVolume, 'ether'),
                rightVolume: this.web3.utils.fromWei(userInfo.rightVolume, 'ether'),
                clubMember: userInfo.clubMember,
                clubJoinTime: parseInt(userInfo.clubJoinTime),
                usdtBalance: usdtBalance,
                packageName: this.packages[parseInt(userInfo.currentTier)]?.name || 'Unknown'
            };
        } catch (error) {
            console.error('Error getting user info:', error);
            throw error;
        }
    }

    // Get USDT balance
    async getUSDTBalance(address = null) {
        try {
            const userAddr = address || this.account;
            const balance = await this.usdtContract.methods.balanceOf(userAddr).call();
            return parseFloat(this.web3.utils.fromWei(balance, 'ether')).toFixed(2);
        } catch (error) {
            console.error('Error getting USDT balance:', error);
            return '0.00';
        }
    }

    // Get contract statistics
    async getContractStats() {
        try {
            const totalUsers = await this.contract.methods.totalUsers().call();
            const totalInvestments = await this.contract.methods.totalInvestments().call();
            const registrationOpen = await this.contract.methods.registrationOpen().call();
            const paused = await this.contract.methods.paused().call();
            
            return {
                totalUsers: parseInt(totalUsers),
                totalInvestments: this.web3.utils.fromWei(totalInvestments, 'ether'),
                registrationOpen: registrationOpen,
                paused: paused
            };
        } catch (error) {
            console.error('Error getting contract stats:', error);
            throw error;
        }
    }

    // Register user
    async register(sponsorAddress, tier) {
        try {
            if (!this.account) throw new Error('Wallet not connected');
            
            // Get package amount
            const packageAmount = await this.contract.methods.getPackageAmount(tier).call();
            
            // Check USDT balance
            const usdtBalance = await this.usdtContract.methods.balanceOf(this.account).call();
            if (this.web3.utils.toBN(usdtBalance).lt(this.web3.utils.toBN(packageAmount))) {
                throw new Error(`Insufficient USDT balance. Required: ${this.web3.utils.fromWei(packageAmount, 'ether')} USDT`);
            }
            
            // Check allowance
            const allowance = await this.usdtContract.methods.allowance(
                this.account,
                this.config[this.network].contracts.OrphiCrowdFund.address
            ).call();
            
            // Approve if needed
            if (this.web3.utils.toBN(allowance).lt(this.web3.utils.toBN(packageAmount))) {
                console.log('Approving USDT...');
                await this.usdtContract.methods.approve(
                    this.config[this.network].contracts.OrphiCrowdFund.address,
                    packageAmount
                ).send({ from: this.account });
            }
            
            // Register
            console.log('Registering user...');
            const tx = await this.contract.methods.register(sponsorAddress, tier).send({
                from: this.account
            });
            
            console.log('✅ Registration successful:', tx.transactionHash);
            return tx;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    // Withdraw funds
    async withdraw() {
        try {
            if (!this.account) throw new Error('Wallet not connected');
            
            const tx = await this.contract.methods.withdraw().send({
                from: this.account
            });
            
            console.log('✅ Withdrawal successful:', tx.transactionHash);
            return tx;
        } catch (error) {
            console.error('Withdrawal failed:', error);
            throw error;
        }
    }

    // Get direct referrals
    async getDirectReferrals(address = null) {
        try {
            const userAddr = address || this.account;
            return await this.contract.methods.getDirectReferrals(userAddr).call();
        } catch (error) {
            console.error('Error getting direct referrals:', error);
            return [];
        }
    }

    // Utility functions
    formatAddress(address) {
        if (!address || address === '0x0000000000000000000000000000000000000000') return 'None';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    formatDate(timestamp) {
        if (!timestamp || timestamp === 0) return 'Never';
        return new Date(timestamp * 1000).toLocaleDateString();
    }

    getTxUrl(txHash) {
        return `https://bscscan.com/tx/${txHash}`;
    }

    getAddressUrl(address) {
        return `https://bscscan.com/address/${address}`;
    }
}

// Global instance
window.OrphiWeb3 = new OrphiCrowdFundWeb3();

// Auto-initialize when document loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Initializing OrphiCrowdFund Web3...');
        await window.OrphiWeb3.init();
        console.log('✅ OrphiCrowdFund Web3 initialized successfully');
        
        // Trigger custom event for other scripts
        window.dispatchEvent(new CustomEvent('OrphiWeb3Ready'));
    } catch (error) {
        console.error('❌ OrphiCrowdFund Web3 initialization failed:', error);
    }
});
