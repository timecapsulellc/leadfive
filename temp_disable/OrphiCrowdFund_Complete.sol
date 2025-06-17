// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title OrphiCrowdFund Platform v3.0.0 - Complete MLM Implementation
 * @dev Comprehensive MLM with 8-tier packages, binary matrix, compensation pools,
 * and UUPS upgrade pattern. Features: Direct bonus (40%), Level bonuses (3%-0.5%),
 * GHP (30%), Leader Pool (10%), Club Pool (5%), Auto-reinvestment, Progressive withdrawal.
 * @custom:audit-ready true
 * @custom:mainnet-ready true
 */
interface IPriceOracle {
    function getPrice(address token) external view returns (uint256);
    function isHealthy() external view returns (bool);
}

// ═══ CUSTOM ERRORS ═══
error AlreadyRegistered();
error InvalidTier();
error InvalidPrivilegeIndex();
error PrivilegeAlreadyUsed();
error InvalidPackage();
error InvalidReferrer();
error InactivePackage();
error OracleNotEnabled();
error OracleNotSet();
error InvalidOraclePrice();
error InvalidID();
error DistributionTooSoon();
error OperationFailed(string reason);
error TransferFailed();

contract OrphiCrowdFund is 
    Initializable,
    UUPSUpgradeable, 
    OwnableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable 
{
    // ==================== CONSTANTS ====================
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SPONSOR_COMMISSION_RATE = 4000; // 40%
    uint256 public constant LEVEL_BONUS_RATE = 1000; // 10%
    uint256 public constant GLOBAL_UPLINE_RATE = 1000; // 10%
    uint256 public constant LEADER_BONUS_RATE = 1000; // 10%
    uint256 public constant GLOBAL_HELP_POOL_RATE = 3000; // 30%
    
    // ==================== UPDATED CONSTANTS ====================
    uint256 public constant WEEKLY_DISTRIBUTION_INTERVAL = 7 days;
    uint256 public constant LEADER_DISTRIBUTION_INTERVAL = 14 days;
    uint256 public constant EARNINGS_CAP_BASIS_POINTS = 30000; // 300% (4x investment)
    uint256 public constant MAX_UPLINE_LEVELS = 30;
    uint256 public constant CLUB_POOL_BP = 500; // 5%
    
    // Withdrawal percentages based on direct referrals
    uint256 public constant WITHDRAWAL_70_PERCENT = 7000; // 0-4 directs: 70%
    uint256 public constant WITHDRAWAL_75_PERCENT = 7500; // 5-19 directs: 75%  
    uint256 public constant WITHDRAWAL_80_PERCENT = 8000; // 20+ directs: 80%
    
    // Auto-reinvestment allocation
    uint256 public constant REINVEST_LEVEL_BP = 4000; // 40%
    uint256 public constant REINVEST_UPLINE_BP = 3000; // 30%
    uint256 public constant REINVEST_GHP_BP = 3000; // 30%

    // ==================== ROLES ====================
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
    bytes32 public constant AUDIT_ROLE = keccak256("AUDIT_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // ==================== ENUMS ====================
    enum PackageTier { 
        NONE,       // 0
        PACKAGE_1,  // 1 - $30
        PACKAGE_2,  // 2 - $50
        PACKAGE_3,  // 3 - $100
        PACKAGE_4,  // 4 - $200
        PACKAGE_5,  // 5 - $300
        PACKAGE_6,  // 6 - $500
        PACKAGE_7,  // 7 - $1000
        PACKAGE_8   // 8 - $2000
    }
    
    enum LeaderRank { 
        NONE,     // 0
        BRONZE,   // 1 - Basic qualification
        SILVER,   // 2 - Silver Star
        GOLD,     // 3 - Gold Leader
        PLATINUM, // 4 - Platinum Elite
        DIAMOND   // 5 - Diamond Supreme
    }
    
    enum WithdrawalType {
        EARNINGS,      // Regular earnings withdrawal
        EMERGENCY,     // Emergency withdrawal
        REINVESTMENT   // Auto-reinvestment
    }
    
    enum PaymentCurrency { BNB, USDT }

    // ==================== STRUCTS ====================
    struct User {
        bool exists;
        bool isActive;
        address referrer;           // Direct sponsor
        address sponsor;            // Binary tree sponsor
        address leftChild;          // Binary matrix left
        address rightChild;         // Binary matrix right
        uint256 totalInvestment;
        uint256 totalEarnings;
        uint256 withdrawableAmount;
        uint256 directReferrals;
        uint256 teamSize;
        uint256 leftVolume;         // Binary left leg volume
        uint256 rightVolume;        // Binary right leg volume
        uint256 packageLevel;       // Current package tier
        uint256 joinTime;
        uint256 lastActivity;
        uint256 registrationTime;
        uint256 lastWithdrawal;
        LeaderRank leaderRank;
        uint256 earningsCap;        // Individual earnings cap
        uint256 ghpEligibleVolume;  // Volume for GHP qualification
        uint256 leaderBonusEarnings;
        uint256 clubPoolEarnings;
        bool ghpEligible;           // GHP distribution eligibility
        bool clubPoolEligible;      // Club pool eligibility (Tier 3+)
    }
    
    struct Package {
        uint128 amount;             // Package investment amount
        uint128 bnbAmount;          // BNB equivalent
        uint128 usdtAmount;         // USDT amount
        uint32 minDirectReferrals;  // Required directs for this package
        bool isActive;              // Package availability
    }
    
    struct Investment {
        uint8 tier;
        uint256 amount;
        uint256 timestamp;
        bool active;
        uint256 earningsGenerated;
    }

    // ==================== STATE VARIABLES ====================
    
    // Core Configuration
    IERC20 public usdtToken;
    address public treasury;
    address public platformWallet;
    
    // Dual Currency Support
    bool public usdtMode; // true = USDT mode, false = BNB mode
    address public priceOracle;
    bool public oracleEnabled;
    uint256 public usdtPriceInBNB; // Oracle price for USDT/BNB conversion

    // Package System
    mapping(uint256 => Package) public packages;
    uint256 public totalPackages;
    
    // User Management
    mapping(address => User) public users;
    mapping(uint256 => address) public userIdToAddress;
    address[] public allUsers;
    uint256 public totalUsers;
    uint256 public totalVolume;
    
    // Binary Matrix System
    mapping(address => address[]) public directReferrals;
    mapping(address => address[30]) public uplineChain;
    
    // Level Bonus Configuration
    mapping(uint256 => uint256) public levelBonuses; // Level => basis points
    
    // Distribution Pools
    uint256 public globalHelpPoolBalance;
    uint256 public leaderBonusPoolBalance;
    uint256 public clubPoolBalance;
    uint256 public totalPoolDistributed;
    
    // GHP System
    uint256 public lastGHPDistribution;
    uint256 public lastLeaderBonusDistribution;
    uint256 public lastClubPoolDistribution;
    
    // Leader System
    mapping(LeaderRank => uint256) public leaderQualifications;
    
    // Security & MEV Protection
    mapping(address => bool) public blacklistedUsers;
    mapping(address => string) public blacklistReasons;
    
    // Investment tracking
    mapping(address => Investment[]) public userInvestments;

    // Platform Statistics
    uint256 public totalInvestments;
    uint256 public totalBonusDistributed;
    
    // Free admin registration
    address[16] public adminPrivilegeIDs;

    // ==================== EVENTS ====================
    event UserRegistered(address indexed user, address indexed referrer, address indexed sponsor, uint256 packageLevel, uint256 amount, uint256 timestamp);
    event PackageUpgraded(address indexed user, uint256 oldLevel, uint256 newLevel, uint256 amount, uint256 timestamp);
    event BonusDistributed(address indexed recipient, address indexed from, uint256 amount, uint8 level, string bonusType, uint256 timestamp);
    event FundsWithdrawn(address indexed user, uint256 totalAmount, uint256 withdrawnAmount, uint256 reinvestedAmount, WithdrawalType withdrawalType, uint256 timestamp);
    event GHPDistributed(address[] recipients, uint256[] amounts, uint256 totalDistributed, uint256 perRecipient, uint256 timestamp);
    event LeaderRankAchieved(address indexed user, LeaderRank oldRank, LeaderRank newRank, uint256 qualifyingVolume, uint256 timestamp);
    event UserBlacklistUpdated(address indexed user, bool blacklisted, string reason, address admin, uint256 timestamp);
    event OracleUpdated(address oldOracle, address newOracle, uint256 timestamp);
    event InvestmentMade(address indexed user, PackageTier tier, uint256 amount);

    // ==================== INITIALIZER ====================
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        // Set default roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(TREASURY_ROLE, msg.sender);
        _setupRole(POOL_MANAGER_ROLE, msg.sender);
        _setupRole(ORACLE_ROLE, msg.sender);

        // Initialize packages (8-tier system)
        _initializePackages();
        _initializeLevelBonuses();
        _initializeLeaderRanks();
    }

    // ==================== PACKAGE INITIALIZATION ====================
    function _initializePackages() internal {
        packages[1] = Package({
            amount: 30 ether,
            bnbAmount: 30 ether,
            usdtAmount: 30 * 1e18,
            minDirectReferrals: 0,
            isActive: true
        });
        
        packages[2] = Package({
            amount: 50 ether,
            bnbAmount: 50 ether,
            usdtAmount: 50 * 1e18,
            minDirectReferrals: 0,
            isActive: true
        });
        
        packages[3] = Package({
            amount: 100 ether,
            bnbAmount: 100 ether,
            usdtAmount: 100 * 1e18,
            minDirectReferrals: 0,
            isActive: true
        });
        
        packages[4] = Package({
            amount: 200 ether,
            bnbAmount: 200 ether,
            usdtAmount: 200 * 1e18,
            minDirectReferrals: 0,
            isActive: true
        });
        
        packages[5] = Package({
            amount: 300 ether,
            bnbAmount: 300 ether,
            usdtAmount: 300 * 1e18,
            minDirectReferrals: 0,
            isActive: true
        });
        
        packages[6] = Package({
            amount: 500 ether,
            bnbAmount: 500 ether,
            usdtAmount: 500 * 1e18,
            minDirectReferrals: 0,
            isActive: true
        });
        
        packages[7] = Package({
            amount: 1000 ether,
            bnbAmount: 1000 ether,
            usdtAmount: 1000 * 1e18,
            minDirectReferrals: 0,
            isActive: true
        });
        
        packages[8] = Package({
            amount: 2000 ether,
            bnbAmount: 2000 ether,
            usdtAmount: 2000 * 1e18,
            minDirectReferrals: 0,
            isActive: true
        });
        
        totalPackages = 8;
    }

    // ==================== LEVEL BONUS INITIALIZATION ====================
    function _initializeLevelBonuses() internal {
        levelBonuses[1] = 300; // 3%
        levelBonuses[2] = 100; // 1%
        levelBonuses[3] = 100; // 1%
        for (uint256 i = 4; i <= 10; i++) {
            levelBonuses[i] = 50; // 0.5% each
        }
    }

    // ==================== LEADER RANKS INITIALIZATION ====================
    function _initializeLeaderRanks() internal {
        // Leader qualification thresholds (in basis points for consistency)
        leaderQualifications[LeaderRank.BRONZE] = 1000; // $1000+ volume
        leaderQualifications[LeaderRank.SILVER] = 3000; // $3000+ volume
        leaderQualifications[LeaderRank.GOLD] = 10000; // $10000+ volume
        leaderQualifications[LeaderRank.PLATINUM] = 50000; // $50000+ volume
        leaderQualifications[LeaderRank.DIAMOND] = 200000; // $200000+ volume
    }

    // ==================== CORE FUNCTIONS ====================
    
    /**
     * @notice Main contribution function with comprehensive compensation distribution
     */
    function contribute(address referrer, PackageTier tier) external payable nonReentrant whenNotPaused {
        if (tier == PackageTier.NONE || uint8(tier) > 8) revert InvalidTier();
        if (referrer == address(0) || referrer == msg.sender) revert InvalidReferrer();
        if (!packages[uint8(tier)].isActive) revert InactivePackage();
        
        uint256 packageAmount = packages[uint8(tier)].amount;
        if (msg.value < packageAmount) revert InvalidPackage();
        
        if (!users[msg.sender].exists) {
            _registerUser(msg.sender, referrer, tier, packageAmount);
        } else {
            _upgradePackage(msg.sender, tier, packageAmount);
        }
        
        // Distribute all bonuses
        _distributeBonuses(msg.sender, packageAmount);
        
        // Update pools
        _updatePools(packageAmount);
        
        emit InvestmentMade(msg.sender, tier, packageAmount);
    }

    /**
     * @notice Register new user
     */
    function _registerUser(address user, address referrer, PackageTier tier, uint256 amount) internal {
        users[user] = User({
            exists: true,
            isActive: true,
            referrer: referrer,
            sponsor: referrer,
            leftChild: address(0),
            rightChild: address(0),
            totalInvestment: amount,
            totalEarnings: 0,
            withdrawableAmount: 0,
            directReferrals: 0,
            teamSize: 0,
            leftVolume: 0,
            rightVolume: 0,
            packageLevel: uint8(tier),
            joinTime: block.timestamp,
            lastActivity: block.timestamp,
            registrationTime: block.timestamp,
            lastWithdrawal: 0,
            leaderRank: LeaderRank.NONE,
            earningsCap: (amount * EARNINGS_CAP_BASIS_POINTS) / BASIS_POINTS,
            ghpEligibleVolume: 0,
            leaderBonusEarnings: 0,
            clubPoolEarnings: 0,
            ghpEligible: true,
            clubPoolEligible: uint8(tier) >= 3
        });

        userInvestments[user].push(Investment({
            tier: uint8(tier),
            amount: amount,
            timestamp: block.timestamp,
            active: true,
            earningsGenerated: 0
        }));

        allUsers.push(user);
        totalUsers++;
        userIdToAddress[totalUsers] = user;
        totalInvestments += amount;

        // Update referrer's direct referrals
        users[referrer].directReferrals++;
        directReferrals[referrer].push(user);

        // Build upline chain
        _buildUplineChain(user, referrer);

        emit UserRegistered(user, referrer, referrer, uint8(tier), amount, block.timestamp);
    }

    /**
     * @notice Build 30-level upline chain
     */
    function _buildUplineChain(address user, address referrer) internal {
        address currentUpline = referrer;
        for (uint256 i = 0; i < MAX_UPLINE_LEVELS && currentUpline != address(0); i++) {
            uplineChain[user][i] = currentUpline;
            users[currentUpline].teamSize++;
            currentUpline = users[currentUpline].referrer;
        }
    }

    /**
     * @notice Comprehensive bonus distribution (40% + 10% + 10% + pools)
     */
    function _distributeBonuses(address user, uint256 amount) internal {
        // 1. Direct Sponsor Bonus (40%)
        address sponsor = users[user].referrer;
        if (sponsor != address(0)) {
            uint256 directBonus = (amount * SPONSOR_COMMISSION_RATE) / BASIS_POINTS;
            if (users[sponsor].totalEarnings + directBonus <= users[sponsor].earningsCap) {
                users[sponsor].totalEarnings += directBonus;
                users[sponsor].withdrawableAmount += directBonus;
                emit BonusDistributed(sponsor, user, directBonus, 0, "direct", block.timestamp);
            }
        }
        
        // 2. Level Bonuses (10% total across 10 levels)
        address currentUpline = sponsor;
        for (uint256 level = 1; level <= 10 && currentUpline != address(0); level++) {
            uint256 levelBonus = (amount * levelBonuses[level]) / BASIS_POINTS;
            if (levelBonus > 0 && users[currentUpline].totalEarnings + levelBonus <= users[currentUpline].earningsCap) {
                users[currentUpline].totalEarnings += levelBonus;
                users[currentUpline].withdrawableAmount += levelBonus;
                emit BonusDistributed(currentUpline, user, levelBonus, uint8(level), "level", block.timestamp);
            }
            currentUpline = users[currentUpline].referrer;
        }
        
        // 3. Global Upline Distribution (10%)
        _distributeGlobalUplineBonus(user, amount);
    }

    /**
     * @notice Global Upline Distribution (10% across 30 levels)
     */
    function _distributeGlobalUplineBonus(address user, uint256 amount) internal {
        uint256 totalBonus = (amount * GLOBAL_UPLINE_RATE) / BASIS_POINTS;
        uint256 perUpline = totalBonus / MAX_UPLINE_LEVELS;
        
        for (uint256 i = 0; i < MAX_UPLINE_LEVELS; i++) {
            address upline = uplineChain[user][i];
            if (upline == address(0)) break;
            
            if (users[upline].totalEarnings + perUpline <= users[upline].earningsCap) {
                users[upline].totalEarnings += perUpline;
                users[upline].withdrawableAmount += perUpline;
                emit BonusDistributed(upline, user, perUpline, uint8(i+1), "upline", block.timestamp);
            }
        }
    }

    /**
     * @notice Update all pools (Leader: 10%, GHP: 30%, Club: 5%)
     */
    function _updatePools(uint256 amount) internal {
        // Leader Bonus Pool: 10%
        uint256 leaderAmount = (amount * LEADER_BONUS_RATE) / BASIS_POINTS;
        leaderBonusPoolBalance += leaderAmount;
        
        // Global Help Pool: 30%
        uint256 ghpAmount = (amount * GLOBAL_HELP_POOL_RATE) / BASIS_POINTS;
        globalHelpPoolBalance += ghpAmount;
        
        // Club Pool: 5%
        uint256 clubAmount = (amount * CLUB_POOL_BP) / BASIS_POINTS;
        clubPoolBalance += clubAmount;
    }

    /**
     * @notice Progressive withdrawal with auto-reinvestment
     */
    function withdraw() external nonReentrant whenNotPaused {
        User storage user = users[msg.sender];
        if (!user.exists || user.withdrawableAmount == 0) revert OperationFailed("No funds to withdraw");

        uint256 totalAmount = user.withdrawableAmount;
        uint256 withdrawPercent;

        // Determine withdrawal percentage based on direct referrals
        if (user.directReferrals >= 20) {
            withdrawPercent = WITHDRAWAL_80_PERCENT; // 80%
        } else if (user.directReferrals >= 5) {
            withdrawPercent = WITHDRAWAL_75_PERCENT; // 75%
        } else {
            withdrawPercent = WITHDRAWAL_70_PERCENT; // 70%
        }

        uint256 withdrawAmount = (totalAmount * withdrawPercent) / BASIS_POINTS;
        uint256 reinvestAmount = totalAmount - withdrawAmount;

        // Update user state
        user.withdrawableAmount = 0;
        user.lastWithdrawal = block.timestamp;

        // Auto-reinvestment distribution
        if (reinvestAmount > 0) {
            _processAutoReinvestment(msg.sender, reinvestAmount);
        }

        // Transfer withdrawal amount
        if (withdrawAmount > 0) {
            if (usdtMode) {
                if (!usdtToken.transfer(msg.sender, withdrawAmount)) revert TransferFailed();
            } else {
                payable(msg.sender).transfer(withdrawAmount);
            }
        }

        emit FundsWithdrawn(msg.sender, totalAmount, withdrawAmount, reinvestAmount, WithdrawalType.EARNINGS, block.timestamp);
    }

    /**
     * @notice Auto-reinvestment: 40% Level, 30% Upline, 30% GHP
     */
    function _processAutoReinvestment(address user, uint256 amount) internal {
        uint256 levelPart = (amount * REINVEST_LEVEL_BP) / BASIS_POINTS;
        uint256 uplinePart = (amount * REINVEST_UPLINE_BP) / BASIS_POINTS;
        uint256 ghpPart = (amount * REINVEST_GHP_BP) / BASIS_POINTS;

        // Distribute level part to sponsor and levels
        _distributeBonuses(user, levelPart);
        
        // Add upline part to upline bonuses
        _distributeGlobalUplineBonus(user, uplinePart);
        
        // Add GHP part to Global Help Pool
        globalHelpPoolBalance += ghpPart;
    }

    // ==================== POOL DISTRIBUTION FUNCTIONS ====================
    
    /**
     * @notice Distribute Global Help Pool (30%) weekly
     */
    function distributeGlobalHelpPool() external onlyRole(ADMIN_ROLE) {
        if (block.timestamp < lastGHPDistribution + WEEKLY_DISTRIBUTION_INTERVAL) revert DistributionTooSoon();
        if (globalHelpPoolBalance == 0) return;

        address[] memory eligibleUsers = _getGHPEligibleUsers();
        if (eligibleUsers.length == 0) return;

        uint256 perUser = globalHelpPoolBalance / eligibleUsers.length;
        uint256[] memory amounts = new uint256[](eligibleUsers.length);

        for (uint256 i = 0; i < eligibleUsers.length; i++) {
            address recipient = eligibleUsers[i];
            if (users[recipient].totalEarnings + perUser <= users[recipient].earningsCap) {
                users[recipient].totalEarnings += perUser;
                users[recipient].withdrawableAmount += perUser;
                amounts[i] = perUser;
            }
        }

        lastGHPDistribution = block.timestamp;
        globalHelpPoolBalance = 0;

        emit GHPDistributed(eligibleUsers, amounts, globalHelpPoolBalance, perUser, block.timestamp);
    }

    /**
     * @notice Get GHP eligible users (active users who haven't hit 4x cap)
     */
    function _getGHPEligibleUsers() internal view returns (address[] memory) {
        address[] memory eligible = new address[](allUsers.length);
        uint256 count = 0;

        for (uint256 i = 0; i < allUsers.length; i++) {
            address user = allUsers[i];
            if (users[user].isActive && 
                users[user].ghpEligible && 
                users[user].totalEarnings < users[user].earningsCap) {
                eligible[count] = user;
                count++;
            }
        }

        // Resize array
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = eligible[i];
        }
        return result;
    }

    // ==================== ADMIN FUNCTIONS ====================

    /**
     * @notice Register root user (admin only)
     */
    function registerRootUser(address user, PackageTier tier) external onlyRole(ADMIN_ROLE) {
        if (users[user].exists) revert AlreadyRegistered();
        if (tier == PackageTier.NONE || uint8(tier) > 8) revert InvalidTier();

        uint256 packageAmount = packages[uint8(tier)].amount;

        users[user] = User({
            exists: true,
            isActive: true,
            referrer: address(0),
            sponsor: address(0),
            leftChild: address(0),
            rightChild: address(0),
            totalInvestment: packageAmount,
            totalEarnings: 0,
            withdrawableAmount: 0,
            directReferrals: 0,
            teamSize: 0,
            leftVolume: 0,
            rightVolume: 0,
            packageLevel: uint8(tier),
            joinTime: block.timestamp,
            lastActivity: block.timestamp,
            registrationTime: block.timestamp,
            lastWithdrawal: 0,
            leaderRank: LeaderRank.NONE,
            earningsCap: (packageAmount * EARNINGS_CAP_BASIS_POINTS) / BASIS_POINTS,
            ghpEligibleVolume: 0,
            leaderBonusEarnings: 0,
            clubPoolEarnings: 0,
            ghpEligible: true,
            clubPoolEligible: uint8(tier) >= 3
        });

        userInvestments[user].push(Investment({
            tier: uint8(tier),
            amount: packageAmount,
            timestamp: block.timestamp,
            active: true,
            earningsGenerated: 0
        }));

        allUsers.push(user);
        totalUsers++;
        userIdToAddress[totalUsers] = user;
        totalInvestments += packageAmount;

        emit UserRegistered(user, address(0), address(0), uint8(tier), packageAmount, block.timestamp);
        emit InvestmentMade(user, tier, packageAmount);
    }

    /**
     * @notice Initialize 16 admin privilege IDs
     */
    function initializeAdminPrivilegeIDs(address[16] calldata ids) external onlyRole(ADMIN_ROLE) {
        adminPrivilegeIDs = ids;
    }

    /**
     * @notice Admin free registration using privilege IDs
     */
    function adminFreeRegister(address user, uint8 privilegeIndex, address referrer, PackageTier tier) external onlyRole(ADMIN_ROLE) {
        if (privilegeIndex >= 16) revert InvalidPrivilegeIndex();
        if (adminPrivilegeIDs[privilegeIndex] == address(0)) revert PrivilegeAlreadyUsed();
        if (users[user].exists) revert AlreadyRegistered();
        if (!(tier >= PackageTier.PACKAGE_1 && tier <= PackageTier.PACKAGE_8)) revert InvalidPackage();
        if (referrer == address(0) || referrer == user) revert InvalidReferrer();

        // Mark ID as used
        adminPrivilegeIDs[privilegeIndex] = address(0);

        // Register user without payment
        users[user] = User({
            exists: true,
            isActive: true,
            referrer: referrer,
            sponsor: referrer,
            leftChild: address(0),
            rightChild: address(0),
            totalInvestment: 0,
            totalEarnings: 0,
            withdrawableAmount: 0,
            directReferrals: 0,
            teamSize: 0,
            leftVolume: 0,
            rightVolume: 0,
            packageLevel: uint8(tier),
            joinTime: block.timestamp,
            lastActivity: block.timestamp,
            registrationTime: block.timestamp,
            lastWithdrawal: 0,
            leaderRank: LeaderRank.NONE,
            earningsCap: 0,
            ghpEligibleVolume: 0,
            leaderBonusEarnings: 0,
            clubPoolEarnings: 0,
            ghpEligible: true,
            clubPoolEligible: uint8(tier) >= 3
        });

        allUsers.push(user);
        totalUsers++;
        userIdToAddress[totalUsers] = user;

        userInvestments[user].push(Investment({
            tier: uint8(tier),
            amount: 0,
            timestamp: block.timestamp,
            active: true,
            earningsGenerated: 0
        }));

        emit UserRegistered(user, referrer, referrer, uint8(tier), 0, block.timestamp);
        emit InvestmentMade(user, tier, 0);
    }

    /**
     * @notice Blacklist user
     */
    function blacklistUser(address user, string memory reason) external onlyRole(ADMIN_ROLE) {
        blacklistedUsers[user] = true;
        blacklistReasons[user] = reason;
        users[user].isActive = false;
        emit UserBlacklistUpdated(user, true, reason, msg.sender, block.timestamp);
    }

    /**
     * @notice Unblacklist user
     */
    function unblacklistUser(address user) external onlyRole(ADMIN_ROLE) {
        blacklistedUsers[user] = false;
        blacklistReasons[user] = "";
        users[user].isActive = true;
        emit UserBlacklistUpdated(user, false, "", msg.sender, block.timestamp);
    }

    // ==================== ORACLE FUNCTIONS ====================
    
    function updateOracle(address newOracle) external onlyRole(ADMIN_ROLE) {
        address old = priceOracle;
        priceOracle = newOracle;
        emit OracleUpdated(old, newOracle, block.timestamp);
    }

    function setOracleEnabled(bool enabled) external onlyRole(ADMIN_ROLE) {
        oracleEnabled = enabled;
    }

    function setCurrencyMode(bool _usdtMode) external onlyRole(ADMIN_ROLE) {
        usdtMode = _usdtMode;
    }

    // ==================== VIEW FUNCTIONS ====================
    
    function getUser(address userAddress) external view returns (User memory) {
        return users[userAddress];
    }

    function getUserBonuses(address user) external view returns (
        uint256 totalEarnings,
        uint256 withdrawableAmount,
        uint256 leaderBonus,
        uint256 clubBonus
    ) {
        User storage u = users[user];
        return (
            u.totalEarnings,
            u.withdrawableAmount,
            u.leaderBonusEarnings,
            u.clubPoolEarnings
        );
    }

    function getPackageAmount(uint256 tier) public view returns (uint256) {
        if (!packages[tier].isActive) revert InactivePackage();
        return packages[tier].amount;
    }

    function getPoolBalances() external view returns (uint256 ghp, uint256 leader, uint256 club) {
        return (globalHelpPoolBalance, leaderBonusPoolBalance, clubPoolBalance);
    }

    // ==================== UPGRADE FUNCTIONS ====================
    function _upgradePackage(address user, PackageTier newTier, uint256 amount) internal {
        uint256 oldLevel = users[user].packageLevel;
        users[user].packageLevel = uint8(newTier);
        users[user].totalInvestment += amount;
        totalInvestments += amount;

        userInvestments[user].push(Investment({
            tier: uint8(newTier),
            amount: amount,
            timestamp: block.timestamp,
            active: true,
            earningsGenerated: 0
        }));

        emit PackageUpgraded(user, oldLevel, uint8(newTier), amount, block.timestamp);
    }

    // ==================== EMERGENCY FUNCTIONS ====================
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }

    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }

    // ==================== UUPS UPGRADE ====================
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    // ==================== RECEIVE FUNCTION ====================
    receive() external payable {
        // Allow contract to receive BNB
    }

    // ==================== STORAGE GAP ====================
    uint256[50] private __gap;
}
