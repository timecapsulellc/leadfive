// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LeadFiveTestnet - Simplified Testnet Version
 * @dev Testnet version with withdrawal functions for testing
 */
contract LeadFiveTestnet is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {
    
    // ========== STATE VARIABLES ==========
    
    struct User {
        bool isRegistered;
        bool isBlacklisted;
        address referrer;
        uint96 balance;
        uint96 totalInvestment;
        uint96 totalEarnings;
        uint96 earningsCap;
        uint32 directReferrals;
        uint32 teamSize;
        uint8 packageLevel;
        uint8 rank;
        uint8 withdrawalRate;
        uint32 lastHelpPoolClaim;
        bool isEligibleForHelpPool;
        uint32 registrationTime;
        string referralCode;
        uint96 pendingRewards;
        uint32 lastWithdrawal;
        bool isActive;
    }
    
    struct Package {
        uint96 price;
        uint16 directBonus;
        uint16 levelBonus;
        uint16 uplineBonus;
        uint16 leaderBonus;
        uint16 helpBonus;
        uint16 clubBonus;
    }
    
    struct Pool {
        uint96 balance;
        uint32 lastDistribution;
        uint32 interval;
    }
    
    // Core mappings
    mapping(address => User) public users;
    mapping(uint8 => Package) public packages;
    mapping(address => address[]) public directReferrals;
    mapping(string => address) public referralCodeToUser;
    
    // Pools
    Pool public leaderPool;
    Pool public helpPool;
    Pool public clubPool;
    
    // Core contracts
    IERC20 public usdt;
    
    // Essential tracking
    uint32 public totalUsers;
    address public rootUser;
    bool public rootUserSet;
    address public adminFeeRecipient;
    uint96 public totalAdminFeesCollected;
    
    // Enhanced withdrawal state variables
    address public treasuryWallet;
    mapping(address => bool) public autoCompoundEnabled;
    address public xpContract;
    uint256 public constant ADMIN_FEE_PERCENT = 5;
    mapping(address => address[]) public userReferrals;
    
    // Ownership transfer preparation
    address public pendingOwner;
    address public pendingTreasuryWallet;
    
    // Constants
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant EARNINGS_MULTIPLIER = 4;
    uint256 private constant ADMIN_FEE_RATE = 500; // 5%
    
    // ========== EVENTS ==========
    
    event UserRegistered(address indexed user, address indexed referrer, uint8 packageLevel, uint96 amount);
    event PackageUpgraded(address indexed user, uint8 newLevel, uint96 amount);
    event BonusDistributed(address indexed recipient, uint96 amount, uint8 bonusType);
    event Withdrawal(address indexed user, uint96 amount);
    event AdminFeeCollected(uint96 amount, address indexed user);
    event TreasuryWalletSet(address indexed treasury);
    event AutoCompoundToggled(address indexed user, bool enabled);
    event EnhancedWithdrawal(address indexed user, uint256 amount, uint256 adminFee, uint256 userReceives, uint256 reinvestAmount);
    event PoolReinvestment(address indexed user, uint256 amount, string poolType);
    event AutoCompoundBonus(address indexed user, uint256 reinvestAmount, uint256 bonus);
    event OwnershipTransferInitiated(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferCompleted(address indexed previousOwner, address indexed newOwner);
    
    // ========== MODIFIERS ==========
    
    modifier antiMEV() {
        _;
    }
    
    // ========== INITIALIZATION ==========
    
    function initialize(address _usdt) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        usdt = IERC20(_usdt);
        
        // Initialize packages (same as business plan)
        packages[1] = Package(30e18, 4000, 1000, 1000, 1000, 3000, 0);
        packages[2] = Package(50e18, 4000, 1000, 1000, 1000, 3000, 0);
        packages[3] = Package(100e18, 4000, 1000, 1000, 1000, 3000, 0);
        packages[4] = Package(200e18, 4000, 1000, 1000, 1000, 3000, 0);
        
        // Initialize pools
        leaderPool = Pool(0, uint32(block.timestamp), 604800);
        helpPool = Pool(0, uint32(block.timestamp), 604800);
        clubPool = Pool(0, uint32(block.timestamp), 2592000);
        
        // Initialize deployer
        users[msg.sender] = User({
            isRegistered: true,
            isBlacklisted: false,
            referrer: address(0),
            balance: 0,
            totalInvestment: 0,
            totalEarnings: 0,
            earningsCap: type(uint96).max,
            directReferrals: 0,
            teamSize: 0,
            packageLevel: 4,
            rank: 5,
            withdrawalRate: 80,
            lastHelpPoolClaim: 0,
            isEligibleForHelpPool: true,
            registrationTime: uint32(block.timestamp),
            referralCode: "",
            pendingRewards: 0,
            lastWithdrawal: 0,
            isActive: true
        });
        
        totalUsers = 1;
    }
    
    // ========== CORE FUNCTIONS ==========
    
    function register(address referrer, uint8 packageLevel) external payable nonReentrant whenNotPaused {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(packageLevel >= 1 && packageLevel <= 4, "Invalid package");
        require(referrer == address(0) || users[referrer].isRegistered, "Invalid referrer");
        
        uint96 amount = packages[packageLevel].price;
        require(usdt.transferFrom(msg.sender, address(this), amount), "USDT transfer failed");
        
        totalUsers++;
        
        // Create user
        users[msg.sender] = User({
            isRegistered: true,
            isBlacklisted: false,
            referrer: referrer,
            balance: 0,
            totalInvestment: amount,
            totalEarnings: 0,
            earningsCap: uint96(amount * EARNINGS_MULTIPLIER),
            directReferrals: 0,
            teamSize: 0,
            packageLevel: packageLevel,
            rank: 0,
            withdrawalRate: 70,
            lastHelpPoolClaim: 0,
            isEligibleForHelpPool: true,
            registrationTime: uint32(block.timestamp),
            referralCode: "",
            pendingRewards: 0,
            lastWithdrawal: 0,
            isActive: true
        });
        
        if(referrer != address(0)) {
            directReferrals[referrer].push(msg.sender);
            users[referrer].directReferrals++;
            users[referrer].teamSize++;
            
            // Add to referral tracking for withdrawal splits
            userReferrals[referrer].push(msg.sender);
        }
        
        _distributeBonuses(msg.sender, amount, packageLevel);
        emit UserRegistered(msg.sender, referrer, packageLevel, amount);
    }
    
    // ========== ENHANCED WITHDRAWAL FUNCTIONS ==========
    
    /**
     * @dev Enhanced withdrawal with treasury fees and referral-based splits
     */
    function withdrawEnhanced(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(users[msg.sender].balance >= amount, "Insufficient balance");
        require(treasuryWallet != address(0), "Treasury wallet not set");
        
        User storage user = users[msg.sender];
        require(user.isRegistered && !user.isBlacklisted, "Invalid user");
        
        // Get withdrawal split based on referrals and auto-compound setting
        (uint256 withdrawPercent, uint256 reinvestPercent) = _getWithdrawalSplit(msg.sender);
        
        // Calculate amounts as per corrected specification
        uint256 withdrawAmount = (amount * withdrawPercent) / 100;
        uint256 adminFee = (withdrawAmount * 5) / 100; // 5% fee ONLY on withdrawn portion
        uint256 amountAfterFee = withdrawAmount - adminFee;
        uint256 reinvestAmount = (amount * reinvestPercent) / 100;
        
        // Update user balance
        user.balance -= uint96(amount);
        
        // Send fees to treasury
        if (adminFee > 0) {
            bool feeSuccess = usdt.transfer(treasuryWallet, adminFee);
            require(feeSuccess, "Fee transfer failed");
            totalAdminFeesCollected += uint96(adminFee);
        }
        
        // Send to user
        if (amountAfterFee > 0) {
            bool userSuccess = usdt.transfer(msg.sender, amountAfterFee);
            require(userSuccess, "Transfer failed");
        }
        
        // Handle reinvestment
        if (reinvestAmount > 0) {
            if (autoCompoundEnabled[msg.sender]) {
                // Auto-compound: Add to user balance with 5% bonus
                uint256 compoundBonus = (reinvestAmount * 5) / 100;
                user.balance += uint96(reinvestAmount + compoundBonus);
                emit AutoCompoundBonus(msg.sender, reinvestAmount, compoundBonus);
            } else {
                // Default: Send reinvestment to Help Pool
                helpPool.balance += uint96(reinvestAmount);
                emit PoolReinvestment(msg.sender, reinvestAmount, "helpPool");
                
                // Track for pool distribution eligibility
                if (!user.isEligibleForHelpPool) {
                    user.isEligibleForHelpPool = true;
                }
            }
        }
        
        emit EnhancedWithdrawal(msg.sender, amount, adminFee, amountAfterFee, reinvestAmount);
    }
    
    /**
     * @dev Helper to calculate splits based on referrals
     */
    function _getWithdrawalSplit(address user) internal view returns (uint256, uint256) {
        if (autoCompoundEnabled[user]) return (0, 100); // 0% withdraw, 100% reinvest
        uint256 referralCount = userReferrals[user].length;
        if (referralCount >= 20) return (80, 20);
        if (referralCount >= 5) return (75, 25);
        return (70, 30); // Default
    }
    
    /**
     * @dev Toggle auto-compound functionality
     */
    function toggleAutoCompound(bool enabled) external {
        require(users[msg.sender].isRegistered, "User not registered");
        autoCompoundEnabled[msg.sender] = enabled;
        emit AutoCompoundToggled(msg.sender, enabled);
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function setTreasuryWallet(address _treasuryWallet) external onlyOwner {
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        treasuryWallet = _treasuryWallet;
        emit TreasuryWalletSet(_treasuryWallet);
    }
    
    function setAdminFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid address");
        adminFeeRecipient = _recipient;
    }
    
    // ========== CLIENT HANDOVER FUNCTIONS ==========
    
    function initiateOwnershipTransfer(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        require(newOwner != owner(), "Already the owner");
        pendingOwner = newOwner;
        emit OwnershipTransferInitiated(owner(), newOwner);
    }
    
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Not the pending owner");
        address previousOwner = owner();
        _transferOwnership(pendingOwner);
        pendingOwner = address(0);
        emit OwnershipTransferCompleted(previousOwner, owner());
    }
    
    function transferToClient(address clientOwner, address clientTreasury) external onlyOwner {
        require(clientOwner != address(0), "Invalid client owner");
        require(clientTreasury != address(0), "Invalid client treasury");
        
        // Transfer treasury first
        treasuryWallet = clientTreasury;
        emit TreasuryWalletSet(clientTreasury);
        
        // Transfer ownership
        address previousOwner = owner();
        _transferOwnership(clientOwner);
        emit OwnershipTransferCompleted(previousOwner, clientOwner);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function getUserInfo(address user) external view returns (User memory) {
        return users[user];
    }
    
    function getWithdrawalSplit(address user) external view returns (uint256 withdrawPercent, uint256 reinvestPercent) {
        return _getWithdrawalSplit(user);
    }
    
    function isAutoCompoundEnabled(address user) external view returns (bool) {
        return autoCompoundEnabled[user];
    }
    
    function getUserReferralCount(address user) external view returns (uint256) {
        return userReferrals[user].length;
    }
    
    function getTreasuryWallet() external view returns (address) {
        return treasuryWallet;
    }
    
    function getPendingTransfers() external view returns (address pendingOwnerAddress, address pendingTreasuryAddress) {
        return (pendingOwner, pendingTreasuryWallet);
    }
    
    function getPoolBalances() external view returns (uint96, uint96, uint96) {
        return (leaderPool.balance, helpPool.balance, clubPool.balance);
    }
    
    // ========== INTERNAL FUNCTIONS ==========
    
    function _distributeBonuses(address user, uint96 amount, uint8 packageLevel) internal {
        Package memory pkg = packages[packageLevel];
        
        // Direct bonus
        if(users[user].referrer != address(0)) {
            uint96 directBonus = uint96((uint256(amount) * pkg.directBonus) / BASIS_POINTS);
            _addEarnings(users[user].referrer, directBonus, 1);
        }
        
        // Pool allocations
        leaderPool.balance += uint96((uint256(amount) * pkg.leaderBonus) / BASIS_POINTS);
        helpPool.balance += uint96((uint256(amount) * pkg.helpBonus) / BASIS_POINTS);
        clubPool.balance += uint96((uint256(amount) * pkg.clubBonus) / BASIS_POINTS);
    }
    
    function _addEarnings(address user, uint96 amount, uint8 bonusType) internal {
        if(amount == 0) return;
        
        User storage u = users[user];
        uint96 allowedAmount = amount;
        
        if (u.totalEarnings + amount > u.earningsCap) {
            allowedAmount = u.earningsCap - u.totalEarnings;
        }
        
        if (allowedAmount > 0) {
            u.balance += allowedAmount;
            u.totalEarnings += allowedAmount;
            emit BonusDistributed(user, allowedAmount, bonusType);
        }
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    receive() external payable {}
}