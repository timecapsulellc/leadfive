/**
 * Frontend Integration Configuration for OrphiCrowdFund
 * 
 * This file contains the configuration and integration code
 * to connect the frontend with the deployed OrphiCrowdFund contract
 */

// Contract Configuration
const ORPHI_CROWDFUND_CONFIG = {
    // Deployed Contract Details
    contractAddress: "0x2A5CDeEc5dF5AE5137AF46920b2B4C4Aa9b0aEA0",
    usdtTokenAddress: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
    
    // Network Configuration
    network: {
        name: "BSC Testnet",
        chainId: 97,
        rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        blockExplorer: "https://testnet.bscscan.com",
        nativeCurrency: {
            name: "BNB",
            symbol: "BNB",
            decimals: 18
        }
    },
    
    // Contract Features
    features: {
        mevProtection: true,
        circuitBreaker: true,
        timelockEnabled: true,
        upgradeProtection: true,
        accessControl: true,
        reentrancyGuard: true
    },
    
    // Package Configuration
    packages: {
        1: { price: "10", name: "Starter Package" },
        2: { price: "20", name: "Professional Package" },
        3: { price: "40", name: "Premium Package" }
    },
    
    // Pool Distribution
    poolDistribution: {
        1: { percentage: 40, name: "Main Pool" },
        2: { percentage: 10, name: "Level 2 Pool" },
        3: { percentage: 10, name: "Level 3 Pool" },
        4: { percentage: 10, name: "Level 4 Pool" },
        5: { percentage: 30, name: "Final Pool" }
    }
};

// Contract ABI (Essential functions for frontend)
const ORPHI_CROWDFUND_ABI = [
    // User Management
    "function isUserExists(address user) external view returns (bool)",
    "function users(address user) external view returns (uint256 id, address referrer, uint256 partnersCount, uint256 totalEarnings, bool active)",
    "function registrationExt(address referrerAddress) external payable",
    "function lastUserId() external view returns (uint256)",
    
    // Package and Level Management
    "function buyNewLevel(uint8 matrix, uint8 level) external payable",
    "function usersActiveX3Levels(address user, uint8 level) external view returns (bool)",
    "function usersActiveX6Levels(address user, uint8 level) external view returns (bool)",
    "function usersX3Matrix(address user, uint8 level) external view returns (address, address[] memory, bool)",
    "function usersX6Matrix(address user, uint8 level) external view returns (address, address[] memory, address[] memory, bool, address)",
    
    // Pricing and Economics
    "function getCurrentPrice() external view returns (uint256)",
    "function levelPrice(uint8 level) external view returns (uint256)",
    
    // Security and Administration
    "function owner() external view returns (address)",
    "function paused() external view returns (bool)",
    "function hasRole(bytes32 role, address account) external view returns (bool)",
    "function TREASURY_ROLE() external view returns (bytes32)",
    "function EMERGENCY_ROLE() external view returns (bytes32)",
    "function POOL_MANAGER_ROLE() external view returns (bytes32)",
    
    // Events
    "event Registration(address indexed user, address indexed referrer, uint256 indexed userId, uint256 referrerId)",
    "event Reinvest(address indexed user, address indexed currentReferrer, address indexed caller, uint8 matrix, uint8 level)",
    "event Upgrade(address indexed user, address indexed referrer, uint8 matrix, uint8 level)",
    "event NewUserPlace(address indexed user, address indexed referrer, uint8 matrix, uint8 level, uint8 place)",
    "event MissedEthReceive(address indexed receiver, address indexed from, uint8 matrix, uint8 level)",
    "event SentExtraEthDividends(address indexed from, address indexed receiver, uint8 matrix, uint8 level)"
];

// USDT Token ABI
const USDT_ABI = [
    "function balanceOf(address account) external view returns (uint256)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)",
    "function name() external view returns (string)"
];

/**
 * OrphiCrowdFund Frontend Integration Class
 */
class OrphiCrowdFundIntegration {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.usdtContract = null;
        this.userAddress = null;
        this.isConnected = false;
    }

    /**
     * Initialize the integration
     */
    async initialize() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
                console.log("✅ Web3 provider initialized");
                return true;
            } else {
                throw new Error("MetaMask not found");
            }
        } catch (error) {
            console.error("❌ Initialization failed:", error);
            return false;
        }
    }

    /**
     * Connect to MetaMask wallet
     */
    async connectWallet() {
        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Check if we're on the correct network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            if (chainId !== `0x${ORPHI_CROWDFUND_CONFIG.network.chainId.toString(16)}`) {
                await this.switchToCorrectNetwork();
            }

            this.signer = this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();
            
            // Initialize contracts
            this.contract = new ethers.Contract(
                ORPHI_CROWDFUND_CONFIG.contractAddress,
                ORPHI_CROWDFUND_ABI,
                this.signer
            );
            
            this.usdtContract = new ethers.Contract(
                ORPHI_CROWDFUND_CONFIG.usdtTokenAddress,
                USDT_ABI,
                this.signer
            );
            
            this.isConnected = true;
            
            console.log(`✅ Wallet connected: ${this.userAddress}`);
            return this.userAddress;
            
        } catch (error) {
            console.error("❌ Wallet connection failed:", error);
            throw error;
        }
    }

    /**
     * Switch to the correct network (BSC Testnet)
     */
    async switchToCorrectNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${ORPHI_CROWDFUND_CONFIG.network.chainId.toString(16)}` }],
            });
        } catch (switchError) {
            // If the network doesn't exist, add it
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: `0x${ORPHI_CROWDFUND_CONFIG.network.chainId.toString(16)}`,
                        chainName: ORPHI_CROWDFUND_CONFIG.network.name,
                        nativeCurrency: ORPHI_CROWDFUND_CONFIG.network.nativeCurrency,
                        rpcUrls: [ORPHI_CROWDFUND_CONFIG.network.rpcUrl],
                        blockExplorerUrls: [ORPHI_CROWDFUND_CONFIG.network.blockExplorer]
                    }]
                });
            }
        }
    }

    /**
     * Check if user is registered
     */
    async isUserRegistered(address = null) {
        try {
            const userAddr = address || this.userAddress;
            if (!userAddr) throw new Error("No address provided");
            
            return await this.contract.isUserExists(userAddr);
        } catch (error) {
            console.error("❌ Error checking user registration:", error);
            return false;
        }
    }

    /**
     * Get user information
     */
    async getUserInfo(address = null) {
        try {
            const userAddr = address || this.userAddress;
            if (!userAddr) throw new Error("No address provided");
            
            const userInfo = await this.contract.users(userAddr);
            
            return {
                id: userInfo.id.toString(),
                referrer: userInfo.referrer,
                partnersCount: userInfo.partnersCount.toString(),
                totalEarnings: ethers.utils.formatEther(userInfo.totalEarnings),
                active: userInfo.active
            };
        } catch (error) {
            console.error("❌ Error getting user info:", error);
            return null;
        }
    }

    /**
     * Register new user
     */
    async registerUser(referrerAddress = null) {
        try {
            if (!this.isConnected) throw new Error("Wallet not connected");
            
            const referrer = referrerAddress || ethers.constants.AddressZero;
            const registrationFee = await this.contract.getCurrentPrice();
            
            const tx = await this.contract.registrationExt(referrer, {
                value: registrationFee
            });
            
            console.log(`🔄 Registration transaction sent: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ Registration successful! Block: ${receipt.blockNumber}`);
            
            return receipt;
            
        } catch (error) {
            console.error("❌ Registration failed:", error);
            throw error;
        }
    }

    /**
     * Buy a package/level
     */
    async buyPackage(matrix, level) {
        try {
            if (!this.isConnected) throw new Error("Wallet not connected");
            
            const price = await this.contract.levelPrice(level);
            
            const tx = await this.contract.buyNewLevel(matrix, level, {
                value: price
            });
            
            console.log(`🔄 Package purchase transaction sent: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ Package purchase successful! Block: ${receipt.blockNumber}`);
            
            return receipt;
            
        } catch (error) {
            console.error("❌ Package purchase failed:", error);
            throw error;
        }
    }

    /**
     * Get user's active levels
     */
    async getUserActiveLevels(address = null) {
        try {
            const userAddr = address || this.userAddress;
            if (!userAddr) throw new Error("No address provided");
            
            const activeLevels = {
                x3: {},
                x6: {}
            };
            
            for (let level = 1; level <= 12; level++) {
                try {
                    activeLevels.x3[level] = await this.contract.usersActiveX3Levels(userAddr, level);
                    activeLevels.x6[level] = await this.contract.usersActiveX6Levels(userAddr, level);
                } catch (e) {
                    activeLevels.x3[level] = false;
                    activeLevels.x6[level] = false;
                }
            }
            
            return activeLevels;
            
        } catch (error) {
            console.error("❌ Error getting active levels:", error);
            return { x3: {}, x6: {} };
        }
    }

    /**
     * Get matrix information for a user
     */
    async getUserMatrix(matrix, level, address = null) {
        try {
            const userAddr = address || this.userAddress;
            if (!userAddr) throw new Error("No address provided");
            
            if (matrix === 3) {
                const matrixInfo = await this.contract.usersX3Matrix(userAddr, level);
                return {
                    referrer: matrixInfo[0],
                    referrals: matrixInfo[1],
                    blocked: matrixInfo[2]
                };
            } else if (matrix === 6) {
                const matrixInfo = await this.contract.usersX6Matrix(userAddr, level);
                return {
                    referrer: matrixInfo[0],
                    firstLevelReferrals: matrixInfo[1],
                    secondLevelReferrals: matrixInfo[2],
                    blocked: matrixInfo[3],
                    closedPart: matrixInfo[4]
                };
            }
            
        } catch (error) {
            console.error("❌ Error getting matrix info:", error);
            return null;
        }
    }

    /**
     * Get contract statistics
     */
    async getContractStats() {
        try {
            const owner = await this.contract.owner();
            const isPaused = await this.contract.paused();
            const lastUserId = await this.contract.lastUserId();
            const currentPrice = await this.contract.getCurrentPrice();
            
            return {
                owner,
                isPaused,
                totalUsers: lastUserId.toString(),
                currentPrice: ethers.utils.formatEther(currentPrice)
            };
            
        } catch (error) {
            console.error("❌ Error getting contract stats:", error);
            return null;
        }
    }

    /**
     * Get USDT token information
     */
    async getTokenInfo() {
        try {
            if (!this.userAddress) throw new Error("Wallet not connected");
            
            const balance = await this.usdtContract.balanceOf(this.userAddress);
            const allowance = await this.usdtContract.allowance(this.userAddress, ORPHI_CROWDFUND_CONFIG.contractAddress);
            const decimals = await this.usdtContract.decimals();
            const symbol = await this.usdtContract.symbol();
            
            return {
                balance: ethers.utils.formatUnits(balance, decimals),
                allowance: ethers.utils.formatUnits(allowance, decimals),
                decimals,
                symbol
            };
            
        } catch (error) {
            console.error("❌ Error getting token info:", error);
            return null;
        }
    }

    /**
     * Approve USDT tokens
     */
    async approveTokens(amount) {
        try {
            if (!this.isConnected) throw new Error("Wallet not connected");
            
            const decimals = await this.usdtContract.decimals();
            const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);
            
            const tx = await this.usdtContract.approve(ORPHI_CROWDFUND_CONFIG.contractAddress, amountWei);
            
            console.log(`🔄 Token approval transaction sent: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ Token approval successful! Block: ${receipt.blockNumber}`);
            
            return receipt;
            
        } catch (error) {
            console.error("❌ Token approval failed:", error);
            throw error;
        }
    }

    /**
     * Listen to contract events
     */
    setupEventListeners() {
        if (!this.contract) return;
        
        // Registration events
        this.contract.on("Registration", (user, referrer, userId, referrerId) => {
            console.log(`🎉 New Registration: User ${user} (ID: ${userId.toString()})`);
            this.onRegistration?.(user, referrer, userId, referrerId);
        });
        
        // Upgrade events
        this.contract.on("Upgrade", (user, referrer, matrix, level) => {
            console.log(`📈 User Upgrade: ${user} upgraded to Level ${level} in Matrix ${matrix}`);
            this.onUpgrade?.(user, referrer, matrix, level);
        });
        
        // Reinvest events
        this.contract.on("Reinvest", (user, currentReferrer, caller, matrix, level) => {
            console.log(`🔄 Reinvest: ${user} reinvested in Level ${level} of Matrix ${matrix}`);
            this.onReinvest?.(user, currentReferrer, caller, matrix, level);
        });
    }

    /**
     * Get transaction history (limited by RPC provider)
     */
    async getRecentTransactions(fromBlock = -1000) {
        try {
            const events = [];
            
            // Get registration events
            const registrationFilter = this.contract.filters.Registration();
            const registrationEvents = await this.contract.queryFilter(registrationFilter, fromBlock, 'latest');
            events.push(...registrationEvents.map(e => ({ type: 'Registration', ...e })));
            
            // Get upgrade events
            const upgradeFilter = this.contract.filters.Upgrade();
            const upgradeEvents = await this.contract.queryFilter(upgradeFilter, fromBlock, 'latest');
            events.push(...upgradeEvents.map(e => ({ type: 'Upgrade', ...e })));
            
            // Sort by block number
            events.sort((a, b) => b.blockNumber - a.blockNumber);
            
            return events;
            
        } catch (error) {
            console.error("❌ Error getting transaction history:", error);
            return [];
        }
    }
}

// Export configuration and integration class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ORPHI_CROWDFUND_CONFIG,
        ORPHI_CROWDFUND_ABI,
        USDT_ABI,
        OrphiCrowdFundIntegration
    };
}

// Global instance for browser usage
if (typeof window !== 'undefined') {
    window.OrphiCrowdFundConfig = ORPHI_CROWDFUND_CONFIG;
    window.OrphiCrowdFundIntegration = OrphiCrowdFundIntegration;
}
