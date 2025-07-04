<<<<<<< HEAD
// Web3 Integration for LeadFive - BSC Mainnet Production
import { CONTRACT_ADDRESS, USDT_ADDRESS, SPONSOR_ADDRESS, SUPPORTED_NETWORKS, CONTRACT_ABI } from './config/contracts.js';

// USDT ABI for approvals and transfers
const USDT_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "spender", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "address", "name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
        "stateMutability": "view",
        "type": "function"
    }
=======
// Web3 Integration for LeadFive Platform
import { CONTRACT_ADDRESS, CONTRACT_ABI, USDT_ADDRESS, SUPPORTED_NETWORKS } from './config/contracts.js';

// Package tiers for LeadFive
const PACKAGE_TIERS = {
  1: { amount: 10, name: 'Starter' },
  2: { amount: 50, name: 'Basic' },
  3: { amount: 100, name: 'Standard' },
  4: { amount: 500, name: 'Premium' },
  5: { amount: 1000, name: 'Elite' }
};

// USDT ABI (standard ERC20)
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
];

class LeadFiveWeb3 {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.contract = null;
        this.usdtContract = null;
<<<<<<< HEAD
        this.network = 'BSC_MAINNET';
=======
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
    }

    // Initialize Web3 connection
    async init() {
        if (typeof window.ethereum !== 'undefined') {
            this.web3 = new Web3(window.ethereum);
            
<<<<<<< HEAD
            // Setup contracts for BSC Mainnet
=======
            // Setup contracts
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
            this.contract = new this.web3.eth.Contract(
                CONTRACT_ABI, 
                CONTRACT_ADDRESS
            );
            this.usdtContract = new this.web3.eth.Contract(
                USDT_ABI, 
                USDT_ADDRESS
            );

            console.log('LeadFive Web3 initialized successfully');
<<<<<<< HEAD
            console.log('Contract Address:', CONTRACT_ADDRESS);
            console.log('USDT Address:', USDT_ADDRESS);
            console.log('Sponsor Address:', SPONSOR_ADDRESS, '(Trezor Wallet)');
=======
            console.log('LeadFive Contract Address:', CONTRACT_ADDRESS);
            console.log('USDT Address:', USDT_ADDRESS);
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
            
            return true;
        } else {
            console.error('MetaMask not found');
            return false;
        }
    }

    // Connect wallet
    async connectWallet() {
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            this.account = accounts[0];
            
<<<<<<< HEAD
            // Switch to BSC Mainnet if needed
=======
            // Switch to BSC Mainnet 
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
            await this.switchToBSCMainnet();
            
            console.log('LeadFive wallet connected:', this.account);
            return this.account;
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
    }

    // Switch to BSC Mainnet
    async switchToBSCMainnet() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x38' }], // BSC Mainnet
            });
        } catch (switchError) {
            // Chain not added, let's add it
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x38',
<<<<<<< HEAD
                        chainName: 'BNB Smart Chain',
                        rpcUrls: ['https://bsc-dataseed.binance.org/'],
=======
                        chainName: 'BSC Mainnet',
                        rpcUrls: ['https://bsc-dataseed1.binance.org/'],
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
                        nativeCurrency: {
                            name: 'BNB',
                            symbol: 'BNB',
                            decimals: 18
                        },
                        blockExplorerUrls: ['https://bscscan.com']
                    }]
                });
            }
        }
    }

    // Get user info from contract
    async getUserInfo(address = null) {
        const userAddress = address || this.account;
        if (!userAddress) throw new Error('No address provided');

        try {
            const userInfo = await this.contract.methods.getUserInfo(userAddress).call();
            return {
                id: userInfo.id,
                teamSize: userInfo.teamSize,
                directCount: userInfo.directCount,
                packageTier: userInfo.packageTier,
                totalEarnings: this.web3.utils.fromWei(userInfo.totalEarnings.toString(), 'mwei'), // 6 decimals
                withdrawable: this.web3.utils.fromWei(userInfo.withdrawable.toString(), 'mwei'),
                isCapped: userInfo.isCapped,
                leaderRank: userInfo.leaderRank,
                suspensionLevel: userInfo.suspensionLevel
            };
        } catch (error) {
            console.error('Error getting user info:', error);
            throw error;
        }
    }

    // Get contract state
    async getContractState() {
        try {
            const state = await this.contract.methods.state().call();
            return {
                totalUsers: state.totalUsers,
                lastUserId: state.lastUserId,
                automationOn: state.automationOn,
                systemLocked: state.systemLocked,
                totalVolume: this.web3.utils.fromWei(state.totalVolume.toString(), 'mwei')
            };
        } catch (error) {
            console.error('Error getting contract state:', error);
            throw error;
        }
    }

    // Get USDT balance
    async getUSDTBalance(address = null) {
        const userAddress = address || this.account;
        if (!userAddress) throw new Error('No address provided');

        try {
            const balance = await this.usdtContract.methods.balanceOf(userAddress).call();
            return this.web3.utils.fromWei(balance.toString(), 'mwei'); // 6 decimals
        } catch (error) {
            console.error('Error getting USDT balance:', error);
            throw error;
        }
    }

    // Mint test USDT (for testnet only)
    async mintTestUSDT(amount) {
        if (!this.account) throw new Error('Wallet not connected');

        try {
            const amountWei = this.web3.utils.toWei(amount.toString(), 'mwei');
            const tx = await this.usdtContract.methods.mint(this.account, amountWei).send({
                from: this.account
            });
            console.log('USDT minted:', tx.transactionHash);
            return tx;
        } catch (error) {
            console.error('Error minting USDT:', error);
            throw error;
        }
    }

    // Approve USDT spending
    async approveUSDT(amount) {
        if (!this.account) throw new Error('Wallet not connected');

        try {
<<<<<<< HEAD
            const amountWei = this.web3.utils.toWei(amount.toString(), 'ether'); // BSC USDT uses 18 decimals
=======
            const amountWei = this.web3.utils.toWei(amount.toString(), 'mwei');
>>>>>>> 4e21071 (🔐 Complete dashboard implementation with Trezor security integration)
            
            const tx = await this.usdtContract.methods.approve(CONTRACT_ADDRESS, amountWei).send({
                from: this.account
            });
            console.log('USDT approved:', tx.transactionHash);
            return tx;
        } catch (error) {
            console.error('Error approving USDT:', error);
            throw error;
        }
    }

    // Register user
    async register(sponsorAddress, packageTier) {
        if (!this.account) throw new Error('Wallet not connected');
        if (!PACKAGE_TIERS[packageTier]) throw new Error('Invalid package tier');

        try {
            // First approve USDT
            const packageAmount = PACKAGE_TIERS[packageTier].amount;
            await this.approveUSDT(packageAmount);

            // Then register
            const tx = await this.contract.methods.register(sponsorAddress, packageTier).send({
                from: this.account
            });
            console.log('LeadFive user registered:', tx.transactionHash);
            return tx;
        } catch (error) {
            console.error('Error registering with LeadFive:', error);
            throw error;
        }
    }

    // Withdraw earnings
    async withdraw() {
        if (!this.account) throw new Error('Wallet not connected');

        try {
            const tx = await this.contract.methods.withdraw().send({
                from: this.account
            });
            console.log('LeadFive withdrawal successful:', tx.transactionHash);
            return tx;
        } catch (error) {
            console.error('Error withdrawing from LeadFive:', error);
            throw error;
        }
    }

    // Format address for display
    formatAddress(address) {
        if (!address) return '';
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }

    // Get BSCScan URL for transaction
    getTxUrl(txHash) {
        return `https://bscscan.com/tx/${txHash}`;
    }

    // Get BSCScan URL for address
    getAddressUrl(address) {
        return `https://bscscan.com/address/${address}`;
    }
}

// Export instance
export const leadFiveWeb3 = new LeadFiveWeb3();

// Auto-initialize when DOM loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', async () => {
        await leadFiveWeb3.init();
    });
}
