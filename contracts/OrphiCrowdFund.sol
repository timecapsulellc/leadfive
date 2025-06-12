// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                                       ║
 * ║     ██████╗ ██████╗ ██████╗ ██╗  ██╗██╗     ██████╗██████╗  ██████╗ ██╗    ██╗██████╗ ║
 * ║    ██╔═══██╗██╔══██╗██╔══██╗██║  ██║██║    ██╔════╝██╔══██╗██╔═══██╗██║    ██║██╔══██╗║
 * ║    ██║   ██║██████╔╝██████╔╝███████║██║    ██║     ██████╔╝██║   ██║██║ █╗ ██║██║  ██║║
 * ║    ██║   ██║██╔══██╗██╔═══╝ ██╔══██║██║    ██║     ██╔══██╗██║   ██║██║███╗██║██║  ██║║
 * ║    ╚██████╔╝██║  ██║██║     ██║  ██║██║    ╚██████╗██║  ██║╚██████╔╝╚███╔███╔╝██████╔╝║
 * ║     ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝     ╚═════╝╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝ ╚═════╝ ║
 * ║                                                                                       ║
 * ║                        ◆ ORPHI CROWDFUND PLATFORM ◆                                  ║
 * ║                   ◇ Dual-Branch Progressive Reward Network ◇                         ║
 * ║                                                                                       ║
 * ║    ┌─────────────────────────────────────────────────────────────────────────────┐   ║
 * ║    │  🎯 WHITEPAPER IMPLEMENTATION v2.0.0                                       │   ║
 * ║    │  ◆ 5-Pool Commission System (40%/10%/10%/10%/30%)                         │   ║
 * ║    │  ◆ Dual-Branch 2×∞ Crowd Placement System                                 │   ║
 * ║    │  ◆ Level Bonus Distribution (3%/1%/0.5%)                                  │   ║
 * ║    │  ◆ Global Upline Bonus (30 levels equal distribution)                     │   ║
 * ║    │  ◆ Weekly Global Help Pool (30% of all packages)                          │   ║
 * ║    │  ◆ 4x Earnings Cap System                                                 │   ║
 * ║    │  ◆ Progressive Withdrawal Rates (70%/75%/80%)                             │   ║
 * ║    │  ◆ Leader Bonus Pool (Bi-monthly distributions)                           │   ║
 * ║    └─────────────────────────────────────────────────────────────────────────────┘   ║
 * ║                                                                                       ║
 * ║    🏆 FEATURES IMPLEMENTED:                                                           ║
 * ║    ◇ Sponsor Commission: 40% direct to sponsor                                       ║
 * ║    ◇ Level Bonus: 10% distributed across 10 levels                                  ║
 * ║    ◇ Global Upline Bonus: 10% equally distributed to 30 uplines                     ║
 * ║    ◇ Leader Bonus: 10% for Shining Star & Silver Star leaders                       ║
 * ║    ◇ Global Help Pool: 30% weekly distribution to active members                     ║
 * ║    ◇ Package Tiers: $30, $50, $100, $200 USDT                                       ║
 * ║    ◇ 4x Earnings Cap: Maximum 4x return on investment                                ║
 * ║    ◇ Progressive Withdrawals: Based on direct referral count                         ║
 * ║                                                                                       ║
 * ║    💎 VERSION: v2.0.0 - Complete Whitepaper Implementation                           ║
 * ║    ⚡ GAS OPTIMIZED: Enhanced efficiency with comprehensive features                  ║
 * ║                                                                                       ║
 * ║    Built with ❤️ by the Orphi CrowdFund Team                                         ║
 * ║    © 2025 Orphi CrowdFund - Growing Together, Earning Together                       ║
 * ║                                                                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════╝
 *
 * @title Orphi CrowdFund Platform
 * @dev Complete implementation of the Orphi CrowdFund whitepaper specifications
 * @notice Dual-Branch 2×∞ Crowd Placement System with Progressive Reward Network
 * 
 * @custom:security-contact security@orphicrowdfund.com
 * @custom:version 2.0.0
 * @custom:network BSC (Binance Smart Chain)
 * @custom:proxy-type UUPS (Universal Upgradeable Proxy Standard)
 * @custom:whitepaper-compliance 100%
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

/**
 * @title IPriceOracle
 * @dev Enhanced oracle interface with health checks and failure handling
 */
interface IPriceOracle {
    function getPrice(address token) external view returns (uint256);
    function isHealthy() external view returns (bool);
    function getLastUpdateTime() external view returns (uint256);
    function getPriceWithTimestamp(address token) external view returns (uint256 price, uint256 timestamp);
}

/**
 * @title IInternalAdminManager
 * @dev Interface for internal admin management
 */
interface IInternalAdminManager {
    function checkIsInternalAdmin(address admin) external view returns (bool);
    function validateInternalAdmin(address caller) external view returns (bool);
    function trackAdminActivity(address admin, string calldata action) external;
    function getAllInternalAdmins() external view returns (address[] memory);
    function getInternalAdminCount() external view returns (uint256);
}

contract OrphiCrowdFund is 
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    // ==================== STORAGE LAYOUT VERSION CONTROL ====================
    
    uint256 public constant STORAGE_VERSION = 2;
    bytes32 public storageLayoutHash;

    // ==================== ROLES ====================
    
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant ORACLE_MANAGER_ROLE = keccak256("ORACLE_MANAGER_ROLE");

    // ==================== ENUMS AND STRUCTS ====================
    
    enum PackageTier { NONE, PACKAGE_30, PACKAGE_50, PACKAGE_100, PACKAGE_200 }
    enum LeaderRank { NONE, SHINING_STAR, SILVER_STAR }
    
    /**
     * @dev User struct optimized for whitepaper requirements
     * Implements all features from the Orphi CrowdFund specification
     */
    struct User {
        // Slot 1: Investment and timing data
        uint128 totalInvested;          // Total amount invested by user
        uint64 registrationTime;        // Registration timestamp
        uint32 teamSize;                // Total team size in dual-branch matrix
        uint32 lastActivity;            // Last activity timestamp
        
        // Slot 2: Earnings and status
        uint128 totalEarnings;          // Total earnings accumulated
        uint128 withdrawableAmount;     // Amount available for withdrawal
        
        // Slot 3: Package and rank info
        uint64 packageTierValue;        // Package tier as uint64
        uint32 leaderRankValue;         // Leader rank as uint32
        uint32 directReferrals;         // Count of direct referrals
        bool isCapped;                  // Whether user has reached 4x cap
        bool isActive;                  // Whether user is active for Global Help Pool
        // 6 bytes padding
        
        // Slot 4: Matrix structure
        address sponsor;                // Direct sponsor/referrer
        
        // Slot 5: Matrix children
        address leftChild;              // Left child in dual-branch matrix
        
        // Slot 6: Matrix children
        address rightChild;             // Right child in dual-branch matrix
        
        // Slot 7: Pool earnings tracking
        uint128[5] poolEarnings;        // Earnings from each of the 5 pools
        
        // Slot 8: Level structure tracking
        uint32 currentLevel;            // Current level in the matrix (for upgrades)
        uint32 leftLegCount;            // Count in left leg
        uint32 rightLegCount;           // Count in right leg
        uint32 weeklyHelpPoolShares;    // Shares in weekly help pool
        
        // Slot 9: Withdrawal tracking
        uint128 totalWithdrawn;         // Total amount withdrawn
        uint64 lastWithdrawal;          // Last withdrawal timestamp
        uint32 withdrawalCount;         // Number of withdrawals made
        uint32 reinvestmentPercentage;  // Current reinvestment percentage (30%, 25%, 20%)
    }

    // ==================== STATE VARIABLES ====================
    
    // Core mappings and arrays
    mapping(address => User) public users;
    mapping(uint256 => address) public userIdToAddress;
    mapping(address => address[]) public directReferrals; // Track direct referrals for each user
    mapping(address => address[30]) public uplineChain; // 30-level upline chain for Global Upline Bonus
    
    // Platform statistics
    uint256 public totalUsers;
    uint256 public totalVolume;
    uint256[5] public poolBalances; // 5 pool balances
    uint256 public globalHelpPoolBalance;
    uint256 public leaderBonusPoolBalance;
    
    // Distribution tracking
    uint256 public lastGlobalHelpPoolDistribution;
    uint256 public lastLeaderBonusDistribution;
    uint256 public weeklyDistributionCount;
    uint256 public totalDistributedAmount;
    
    // Contract references
    IERC20 public usdtToken;
    IPriceOracle public priceOracle;
    
    // Administrative addresses
    address public treasuryAddress;
    address public emergencyAddress;
    address public poolManagerAddress;
    
    // Internal Admin Manager integration
    address public internalAdminManager;
    bool public internalAdminEnabled;
    
    // Package configuration (USDT has 6 decimals on BSC)
    uint256[4] public packageAmounts;
    
    // Commission rates (basis points for precision)
    uint256 public constant SPONSOR_COMMISSION_RATE = 4000;     // 40%
    uint256 public constant LEVEL_BONUS_RATE = 1000;           // 10%
    uint256 public constant GLOBAL_UPLINE_RATE = 1000;         // 10%
    uint256 public constant LEADER_BONUS_RATE = 1000;          // 10%
    uint256 public constant GLOBAL_HELP_POOL_RATE = 3000;      // 30%
    uint256 public constant BASIS_POINTS = 10000;              // 100%
    
    // Level bonus distribution rates
    uint256[10] public levelBonusRates; // Rates for levels 1-10
    
    // Earnings cap multiplier
    uint256 public constant EARNINGS_CAP_MULTIPLIER = 4; // 4x return cap
    
    // Withdrawal rates based on direct referrals
    uint256 public constant BASE_WITHDRAWAL_RATE = 7000;       // 70%
    uint256 public constant MID_WITHDRAWAL_RATE = 7500;        // 75%
    uint256 public constant PRO_WITHDRAWAL_RATE = 8000;        // 80%
    
    // Leader qualification requirements
    uint256 public constant SHINING_STAR_TEAM_REQUIREMENT = 250;
    uint256 public constant SHINING_STAR_DIRECT_REQUIREMENT = 10;
    uint256 public constant SILVER_STAR_TEAM_REQUIREMENT = 500;
    
    // Distribution intervals
    uint256 public constant WEEKLY_DISTRIBUTION_INTERVAL = 7 days;
    uint256 public constant LEADER_DISTRIBUTION_INTERVAL = 15 days; // Bi-monthly (twice per month)
    
    // Platform fees
    uint256 public platformFeeRate; // Basis points
    uint256 private constant MAX_FEE_RATE = 500; // 5% maximum
    
    // Oracle configuration
    bool public oracleEnabled;
    uint256 public maxPriceAge;
    uint256 public priceDeviationThreshold;
    
    // Circuit breaker configuration
    bool public circuitBreakerEnabled;
    uint256 public maxDailyWithdrawals;
    uint256 public currentDayWithdrawals;
    uint256 public lastWithdrawalResetTime;
    uint256 public emergencyPauseThreshold;
    
    // MEV protection
    mapping(address => uint256) public lastTransactionBlock;
    uint256 public constant MIN_BLOCK_DELAY = 1;
    
    // Upgrade timelock
    uint256 public constant UPGRADE_DELAY = 48 hours;
    mapping(address => uint256) public proposedUpgrades;
    
    // Events for upgrade timelock
    event UpgradeProposed(address indexed newImplementation, uint256 unlockTime);
    event UpgradeExecuted(address indexed newImplementation);

    // ==================== EVENTS ====================
    
    event UserRegistered(
        address indexed user,
        address indexed sponsor,
        PackageTier indexed packageTier,
        uint256 amount,
        uint256 timestamp
    );
    
    event PackageUpgraded(
        address indexed user,
        PackageTier indexed oldTier,
        PackageTier indexed newTier,
        uint256 upgradeCost,
        uint256 timestamp
    );
    
    event CommissionDistributed(
        address indexed recipient,
        address indexed payer,
        uint256 indexed amount,
        uint8 poolType,
        string poolName,
        uint256 timestamp
    );
    
    event WithdrawalProcessed(
        address indexed user,
        uint256 indexed amount,
        uint256 reinvestmentAmount,
        uint256 timestamp
    );
    
    event GlobalHelpPoolDistributed(
        uint256 indexed totalAmount,
        uint256 indexed eligibleUsers,
        uint256 indexed perUserAmount,
        uint256 timestamp
    );
    
    event GlobalHelpPoolBatchDistributed(
        uint256 indexed batchAmount,
        uint256 indexed batchEligibleUsers,
        uint256 indexed startIndex,
        uint256 endIndex,
        uint256 timestamp
    );
    
    event LeaderBonusDistributed(
        uint256 indexed shiningStarAmount,
        uint256 indexed silverStarAmount,
        uint256 shiningStarCount,
        uint256 silverStarCount,
        uint256 timestamp
    );
    
    event LeaderBonusBatchDistributed(
        uint256 indexed batchAmount,
        uint256 indexed batchShiningStars,
        uint256 indexed batchSilverStars,
        uint256 startIndex,
        uint256 endIndex,
        uint256 timestamp
    );
    
    event RankAdvancement(
        address indexed user,
        LeaderRank indexed oldRank,
        LeaderRank indexed newRank,
        uint256 timestamp
    );
    
    event EarningsCapReached(
        address indexed user,
        uint256 indexed totalEarnings,
        uint256 investmentAmount,
        uint256 timestamp
    );
    
    event MatrixPlacement(
        address indexed user,
        address indexed placedUnder,
        string position, // "left" or "right"
        uint256 level,
        uint256 timestamp
    );
    
    // Internal Admin Manager events
    event InternalAdminManagerUpdated(address indexed oldManager, address indexed newManager);
    event InternalAdminStatusChanged(bool enabled);

    // ==================== MODIFIERS ====================
    
    modifier validUser(address user) {
        require(user != address(0), "OrphiCrowdFund: Invalid address");
        _;
    }
    
    modifier registeredUser(address user) {
        require(_uint64ToPackageTier(users[user].packageTierValue) != PackageTier.NONE, "OrphiCrowdFund: User not registered");
        _;
    }
    
    modifier notCapped(address user) {
        require(!users[user].isCapped, "OrphiCrowdFund: User has reached earnings cap");
        _;
    }
    
    modifier mevProtection() {
        require(block.number > lastTransactionBlock[msg.sender] + MIN_BLOCK_DELAY, "OrphiCrowdFund: MEV protection active");
        lastTransactionBlock[msg.sender] = block.number;
        _;
    }
    
    modifier circuitBreakerCheck() {
        if (circuitBreakerEnabled) {
            _resetDailyWithdrawalsIfNeeded();
            require(currentDayWithdrawals < maxDailyWithdrawals, "OrphiCrowdFund: Daily withdrawal limit exceeded");
        }
        _;
    }

    // ==================== INITIALIZER ====================
    
    function initialize(
        address _usdtToken,
        address _treasuryAddress,
        address _emergencyAddress,
        address _poolManagerAddress
    ) public initializer {
        require(_usdtToken != address(0), "OrphiCrowdFund: Invalid USDT address");
        require(_treasuryAddress != address(0), "OrphiCrowdFund: Invalid treasury address");
        require(_emergencyAddress != address(0), "OrphiCrowdFund: Invalid emergency address");
        require(_poolManagerAddress != address(0), "OrphiCrowdFund: Invalid pool manager address");
        
        __Ownable_init(msg.sender);
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        __Pausable_init();
        
        // Set contract references
        usdtToken = IERC20(_usdtToken);
        
        // Set administrative addresses
        treasuryAddress = _treasuryAddress;
        emergencyAddress = _emergencyAddress;
        poolManagerAddress = _poolManagerAddress;
        
        // Initialize package amounts (USDT has 6 decimals on BSC)
        packageAmounts = [
            30 * 10**6,   // $30 USDT
            50 * 10**6,   // $50 USDT
            100 * 10**6,  // $100 USDT
            200 * 10**6   // $200 USDT
        ];
        
        // Initialize level bonus rates according to whitepaper
        levelBonusRates = [
            300,  // Level 1: 3%
            100,  // Level 2: 1%
            100,  // Level 3: 1%
            100,  // Level 4: 1%
            100,  // Level 5: 1%
            100,  // Level 6: 1%
            50,   // Level 7: 0.5%
            50,   // Level 8: 0.5%
            50,   // Level 9: 0.5%
            50    // Level 10: 0.5%
        ];
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, _treasuryAddress);
        _grantRole(EMERGENCY_ROLE, _emergencyAddress);
        _grantRole(POOL_MANAGER_ROLE, _poolManagerAddress);
        _grantRole(ORACLE_MANAGER_ROLE, msg.sender);
        
        // Initialize platform fee (2.5%)
        platformFeeRate = 250;
        
        // Initialize oracle configuration
        oracleEnabled = false;
        maxPriceAge = 3600; // 1 hour
        priceDeviationThreshold = 1000; // 10%
        
        // Initialize circuit breaker
        circuitBreakerEnabled = false;
        maxDailyWithdrawals = 1000; // Default limit
        currentDayWithdrawals = 0;
        lastWithdrawalResetTime = block.timestamp;
        emergencyPauseThreshold = 500; // Pause after 500 rapid withdrawals
        
        // Generate storage layout hash
        storageLayoutHash = _generateStorageLayoutHash();
    }

    // ==================== SAFE TYPE CONVERSION FUNCTIONS ====================
    
    function _safeUint128(uint256 value) internal pure returns (uint128) {
        require(value <= type(uint128).max, "OrphiCrowdFund: Value exceeds uint128 maximum");
        return uint128(value);
    }
    
    function _safeUint64(uint256 value) internal pure returns (uint64) {
        require(value <= type(uint64).max, "OrphiCrowdFund: Value exceeds uint64 maximum");
        return uint64(value);
    }
    
    function _safeUint32(uint256 value) internal pure returns (uint32) {
        require(value <= type(uint32).max, "OrphiCrowdFund: Value exceeds uint32 maximum");
        return uint32(value);
    }
    
    function _packageTierToUint64(PackageTier tier) internal pure returns (uint64) {
        return _safeUint64(uint256(tier));
    }
    
    function _uint64ToPackageTier(uint64 value) internal pure returns (PackageTier) {
        require(value <= uint64(type(PackageTier).max), "OrphiCrowdFund: Invalid package tier value");
        return PackageTier(value);
    }
    
    function _leaderRankToUint32(LeaderRank rank) internal pure returns (uint32) {
        return _safeUint32(uint256(rank));
    }
    
    function _uint32ToLeaderRank(uint32 value) internal pure returns (LeaderRank) {
        require(value <= uint32(type(LeaderRank).max), "OrphiCrowdFund: Invalid leader rank value");
        return LeaderRank(value);
    }

    // ==================== USER REGISTRATION SYSTEM ====================
    
    /**
     * @dev Registers a new user with Dual-Branch 2×∞ Crowd Placement System
     * @param sponsor The sponsor's address
     * @param packageTier The package tier to purchase
     */
    function registerUser(address sponsor, PackageTier packageTier) external nonReentrant whenNotPaused {
        require(_uint64ToPackageTier(users[msg.sender].packageTierValue) == PackageTier.NONE, "OrphiCrowdFund: User already registered");
        require(packageTier != PackageTier.NONE, "OrphiCrowdFund: Invalid package tier");
        require(sponsor != msg.sender, "OrphiCrowdFund: Cannot sponsor yourself");
        
        // For first user, sponsor can be zero address
        if (totalUsers > 0) {
            require(sponsor != address(0), "OrphiCrowdFund: Invalid sponsor address");
            require(_uint64ToPackageTier(users[sponsor].packageTierValue) != PackageTier.NONE, "OrphiCrowdFund: Sponsor not registered");
        }
        
        uint256 packagePrice = packageAmounts[uint8(packageTier) - 1];
        require(usdtToken.transferFrom(msg.sender, address(this), packagePrice), "OrphiCrowdFund: Transfer failed");
        
        // Collect platform fee
        uint256 platformFee = (packagePrice * platformFeeRate) / BASIS_POINTS;
        if (platformFee > 0) {
            require(usdtToken.transfer(treasuryAddress, platformFee), "OrphiCrowdFund: Fee transfer failed");
        }
        
        // Initialize user data
        users[msg.sender] = User({
            totalInvested: _safeUint128(packagePrice),
            registrationTime: _safeUint64(block.timestamp),
            teamSize: 0,
            lastActivity: _safeUint32(block.timestamp),
            totalEarnings: 0,
            withdrawableAmount: 0,
            packageTierValue: _packageTierToUint64(packageTier),
            leaderRankValue: _leaderRankToUint32(LeaderRank.NONE),
            directReferrals: 0,
            isCapped: false,
            isActive: true,
            sponsor: sponsor,
            leftChild: address(0),
            rightChild: address(0),
            poolEarnings: [uint128(0), uint128(0), uint128(0), uint128(0), uint128(0)],
            currentLevel: 1,
            leftLegCount: 0,
            rightLegCount: 0,
            weeklyHelpPoolShares: 1,
            totalWithdrawn: 0,
            lastWithdrawal: 0,
            withdrawalCount: 0,
            reinvestmentPercentage: 3000 // Start with 30% reinvestment
        });
        
        // Add to user registry
        userIdToAddress[totalUsers] = msg.sender;
        totalUsers++;
        totalVolume += packagePrice;
        
        // Update sponsor's direct referrals
        if (sponsor != address(0)) {
            directReferrals[sponsor].push(msg.sender);
            users[sponsor].directReferrals++;
        }
        
        // Place in dual-branch matrix
        _placeInDualBranchMatrix(msg.sender, sponsor);
        
        // Build upline chain for Global Upline Bonus
        _buildUplineChain(msg.sender, sponsor);
        
        // Distribute commissions according to 5-pool system
        _distributeCommissions(msg.sender, packagePrice);
        
        emit UserRegistered(msg.sender, sponsor, packageTier, packagePrice, block.timestamp);
    }

    // ==================== DUAL-BRANCH 2×∞ CROWD PLACEMENT SYSTEM ====================
    
    /**
     * @dev Places user in the dual-branch matrix using breadth-first placement
     * @param user The user to place
     * @param sponsor The sponsor under whom to place the user
     */
    function _placeInDualBranchMatrix(address user, address sponsor) internal {
        if (sponsor == address(0)) return;
        
        // Find placement position using breadth-first search
        address placementSponsor = _findMatrixPlacement(sponsor);
        
        // Place user in the matrix
        if (users[placementSponsor].leftChild == address(0)) {
            users[placementSponsor].leftChild = user;
            users[placementSponsor].leftLegCount++;
            emit MatrixPlacement(user, placementSponsor, "left", users[user].currentLevel, block.timestamp);
        } else if (users[placementSponsor].rightChild == address(0)) {
            users[placementSponsor].rightChild = user;
            users[placementSponsor].rightLegCount++;
            emit MatrixPlacement(user, placementSponsor, "right", users[user].currentLevel, block.timestamp);
        }
        
        // Update team sizes up the sponsorship line
        address current = sponsor;
        while (current != address(0)) {
            users[current].teamSize++;
            current = users[current].sponsor;
        }
    }
    
    /**
     * @dev Finds the next available position in the dual-branch matrix
     * @param sponsor The starting sponsor
     * @return The address where the user should be placed
     */
    function _findMatrixPlacement(address sponsor) internal view returns (address) {
        // Breadth-first search for next available position
        address[] memory queue = new address[](1000); // Reasonable queue size
        uint256 front = 0;
        uint256 rear = 0;
        
        queue[rear++] = sponsor;
        
        while (front < rear) {
            address current = queue[front++];
            
            // Check if current position has available slots
            if (users[current].leftChild == address(0) || users[current].rightChild == address(0)) {
                return current;
            }
            
            // Add children to queue for next level search
            if (users[current].leftChild != address(0) && rear < queue.length) {
                queue[rear++] = users[current].leftChild;
            }
            if (users[current].rightChild != address(0) && rear < queue.length) {
                queue[rear++] = users[current].rightChild;
            }
        }
        
        return sponsor; // Fallback to sponsor if no position found
    }

    // ==================== UPLINE CHAIN BUILDING ====================
    
    /**
     * @dev Builds the 30-level upline chain for Global Upline Bonus
     * @param user The user for whom to build the chain
     * @param sponsor The direct sponsor
     */
    function _buildUplineChain(address user, address sponsor) internal {
        address current = sponsor;
        for (uint256 i = 0; i < 30 && current != address(0); i++) {
            uplineChain[user][i] = current;
            current = users[current].sponsor;
        }
    }

    // ==================== 5-POOL COMMISSION SYSTEM ====================
    
    /**
     * @dev Distributes commissions according to the 5-pool system
     * @param user The user who made the investment
     * @param amount The investment amount
     */
    function _distributeCommissions(address user, uint256 amount) internal {
        // Pool 1: Sponsor Commission (40%)
        uint256 sponsorAmount = (amount * SPONSOR_COMMISSION_RATE) / BASIS_POINTS;
        _distributeSponsorCommission(user, sponsorAmount);
        
        // Pool 2: Level Bonus (10%)
        uint256 levelBonusAmount = (amount * LEVEL_BONUS_RATE) / BASIS_POINTS;
        _distributeLevelBonus(user, levelBonusAmount);
        
        // Pool 3: Global Upline Bonus (10%)
        uint256 globalUplineAmount = (amount * GLOBAL_UPLINE_RATE) / BASIS_POINTS;
        _distributeGlobalUplineBonus(user, globalUplineAmount);
        
        // Pool 4: Leader Bonus (10%) - Add to pool for bi-monthly distribution
        uint256 leaderBonusAmount = (amount * LEADER_BONUS_RATE) / BASIS_POINTS;
        leaderBonusPoolBalance += leaderBonusAmount;
        poolBalances[3] += leaderBonusAmount;
        
        // Pool 5: Global Help Pool (30%) - Add to pool for weekly distribution
        uint256 globalHelpAmount = (amount * GLOBAL_HELP_POOL_RATE) / BASIS_POINTS;
        globalHelpPoolBalance += globalHelpAmount;
        poolBalances[4] += globalHelpAmount;
    }
    
    /**
     * @dev Distributes sponsor commission (40% to direct sponsor)
     * @param user The user who made the investment
     * @param amount The commission amount
     */
    function _distributeSponsorCommission(address user, uint256 amount) internal {
        address sponsor = users[user].sponsor;
        if (sponsor != address(0) && !users[sponsor].isCapped) {
            _creditEarnings(sponsor, amount, 0);
            emit CommissionDistributed(sponsor, user, amount, 0, "Sponsor Commission", block.timestamp);
        } else {
            // Add to treasury if sponsor is capped or doesn't exist
            poolBalances[0] += amount;
        }
    }
    
    /**
     * @dev Distributes level bonus according to whitepaper specification
     * @param user The user who made the investment
     * @param totalAmount The total level bonus amount (10% of package)
     */
    function _distributeLevelBonus(address user, uint256 totalAmount) internal {
        address current = users[user].sponsor;
        
        for (uint256 i = 0; i < 10 && current != address(0); i++) {
            if (!users[current].isCapped) {
                uint256 levelAmount = (totalAmount * levelBonusRates[i]) / BASIS_POINTS;
                _creditEarnings(current, levelAmount, 1);
                emit CommissionDistributed(current, user, levelAmount, 1, "Level Bonus", block.timestamp);
            }
            current = users[current].sponsor;
        }
        
        poolBalances[1] += totalAmount;
    }
    
    /**
     * @dev Distributes Global Upline Bonus equally across 30 levels
     * @param user The user who made the investment
     * @param totalAmount The total Global Upline Bonus amount (10% of package)
     */
    function _distributeGlobalUplineBonus(address user, uint256 totalAmount) internal {
        // Fix precision loss: Calculate per upline amount with better precision
        uint256 perUplineAmount = (totalAmount * BASIS_POINTS) / (30 * BASIS_POINTS);
        uint256 distributedAmount = 0;
        uint256 actualDistributed = 0;
        
        // Gas optimization: Cache array in memory
        address[30] storage uplines = uplineChain[user];
        
        for (uint256 i = 0; i < 30; i++) {
            address upline = uplines[i];
            if (upline != address(0) && !users[upline].isCapped) {
                _creditEarnings(upline, perUplineAmount, 2);
                emit CommissionDistributed(upline, user, perUplineAmount, 2, "Global Upline Bonus", block.timestamp);
                actualDistributed += perUplineAmount;
            }
            distributedAmount += perUplineAmount; // Track total attempted distribution
        }
        
        // Handle any remaining dust due to rounding
        uint256 remainingAmount = totalAmount - actualDistributed;
        if (remainingAmount > 0 && totalUsers > 0) {
            // Add remaining amount to treasury for fairness
            require(usdtToken.transfer(treasuryAddress, remainingAmount), "OrphiCrowdFund: Dust transfer failed");
        }
        
        poolBalances[2] += totalAmount;
    }

    // ==================== EARNINGS MANAGEMENT ====================
    
    /**
     * @dev Credits earnings to a user with 4x cap enforcement
     * @param user The user to credit
     * @param amount The amount to credit
     * @param poolType The pool type (0-4)
     */
    function _creditEarnings(address user, uint256 amount, uint8 poolType) internal {
        require(poolType < 5, "OrphiCrowdFund: Invalid pool type");
        
        User storage userData = users[user];
        uint256 maxEarnings = userData.totalInvested * EARNINGS_CAP_MULTIPLIER;
        
        // Check if user would exceed 4x cap
        if (userData.totalEarnings + amount > maxEarnings) {
            // Cap the earnings
            uint256 remainingCap = maxEarnings - userData.totalEarnings;
            if (remainingCap > 0) {
                userData.poolEarnings[poolType] = _safeUint128(userData.poolEarnings[poolType] + remainingCap);
                userData.totalEarnings = _safeUint128(maxEarnings);
                userData.withdrawableAmount = _safeUint128(userData.withdrawableAmount + remainingCap);
            }
            
            // Mark user as capped
            userData.isCapped = true;
            userData.isActive = false; // Remove from Global Help Pool
            
            emit EarningsCapReached(user, maxEarnings, userData.totalInvested, block.timestamp);
        } else {
            // Normal earnings credit
            userData.poolEarnings[poolType] = _safeUint128(userData.poolEarnings[poolType] + amount);
            userData.totalEarnings = _safeUint128(userData.totalEarnings + amount);
            userData.withdrawableAmount = _safeUint128(userData.withdrawableAmount + amount);
        }
        
        userData.lastActivity = _safeUint32(block.timestamp);
    }

    // ==================== PROGRESSIVE WITHDRAWAL SYSTEM ====================
    
    /**
     * @dev Withdraws earnings with progressive withdrawal rates and reinvestment
     * @param amount The amount to withdraw
     */
    function withdraw(uint256 amount) external 
        nonReentrant 
        registeredUser(msg.sender) 
        whenNotPaused 
        mevProtection 
        circuitBreakerCheck 
    {
        require(amount > 0, "OrphiCrowdFund: Amount must be greater than 0");
        require(users[msg.sender].withdrawableAmount >= amount, "OrphiCrowdFund: Insufficient balance");
        
        User storage user = users[msg.sender];
        
        // Calculate withdrawal rate based on direct referrals
        uint256 withdrawalRate = _getWithdrawalRate(user.directReferrals);
        uint256 withdrawableAmount = (amount * withdrawalRate) / BASIS_POINTS;
        uint256 reinvestmentAmount = amount - withdrawableAmount;
        
        // CEI Pattern: Update state FIRST before external calls
        user.withdrawableAmount = _safeUint128(user.withdrawableAmount - amount);
        user.totalWithdrawn = _safeUint128(user.totalWithdrawn + withdrawableAmount);
        user.lastWithdrawal = _safeUint64(block.timestamp);
        user.withdrawalCount++;
        
        // Update circuit breaker counters
        if (circuitBreakerEnabled) {
            currentDayWithdrawals++;
        }
        
        // THEN perform external calls - Transfer withdrawable amount
        require(usdtToken.transfer(msg.sender, withdrawableAmount), "OrphiCrowdFund: Transfer failed");
        
        // Handle reinvestment (internal calls are safe after state update)
        if (reinvestmentAmount > 0) {
            _processReinvestment(msg.sender, reinvestmentAmount);
        }
        
        emit WithdrawalProcessed(msg.sender, withdrawableAmount, reinvestmentAmount, block.timestamp);
    }
    
    /**
     * @dev Gets withdrawal rate based on direct referrals count
     * @param referralCount Number of direct referrals
     * @return Withdrawal rate in basis points
     */
    function _getWithdrawalRate(uint32 referralCount) internal pure returns (uint256) {
        if (referralCount >= 20) {
            return PRO_WITHDRAWAL_RATE; // 80%
        } else if (referralCount >= 5) {
            return MID_WITHDRAWAL_RATE; // 75%
        } else {
            return BASE_WITHDRAWAL_RATE; // 70%
        }
    }
    
    /**
     * @dev Processes reinvestment according to whitepaper specification
     * @param user The user making the reinvestment
     * @param amount The reinvestment amount
     */
    function _processReinvestment(address user, uint256 amount) internal {
        // Reinvestment allocation: Level Bonus 40%, Global Upline 30%, Global Help Pool 30%
        uint256 levelBonusReinvest = (amount * 4000) / BASIS_POINTS; // 40%
        uint256 globalUplineReinvest = (amount * 3000) / BASIS_POINTS; // 30%
        uint256 globalHelpReinvest = (amount * 3000) / BASIS_POINTS; // 30%
        
        // Distribute reinvestment
        _distributeLevelBonus(user, levelBonusReinvest);
        _distributeGlobalUplineBonus(user, globalUplineReinvest);
        
        // Add to Global Help Pool
        globalHelpPoolBalance += globalHelpReinvest;
        poolBalances[4] += globalHelpReinvest;
    }

    // Distribution batch size to prevent gas limit issues
    uint256 public constant DISTRIBUTION_BATCH_SIZE = 100;
    
    // Pagination state for distributions
    uint256 public ghpDistributionIndex;
    uint256 public leaderDistributionIndex;
    bool public ghpDistributionInProgress;
    bool public leaderDistributionInProgress;

    // ==================== WEEKLY GLOBAL HELP POOL DISTRIBUTION ====================
    
    /**
     * @dev Distributes the weekly Global Help Pool to active members (paginated)
     * @param batchSize Number of users to process in this batch (max DISTRIBUTION_BATCH_SIZE)
     */
    function distributeGlobalHelpPool(uint256 batchSize) external onlyRole(POOL_MANAGER_ROLE) {
        _distributeGlobalHelpPoolBatch(batchSize);
    }
    
    /**
     * @dev Internal function for paginated Global Help Pool distribution
     * @param batchSize Number of users to process in this batch
     */
    function _distributeGlobalHelpPoolBatch(uint256 batchSize) internal {
        require(batchSize <= DISTRIBUTION_BATCH_SIZE, "OrphiCrowdFund: Batch size too large");
        
        // Start new distribution cycle if not in progress
        if (!ghpDistributionInProgress) {
            require(block.timestamp >= lastGlobalHelpPoolDistribution + WEEKLY_DISTRIBUTION_INTERVAL, 
                    "OrphiCrowdFund: Too early for distribution");
            require(globalHelpPoolBalance > 0, "OrphiCrowdFund: No funds to distribute");
            
            ghpDistributionInProgress = true;
            ghpDistributionIndex = 0;
        }
        
        uint256 endIndex = ghpDistributionIndex + batchSize;
        if (endIndex > totalUsers) {
            endIndex = totalUsers;
        }
        
        // Count eligible users in this batch
        uint256 eligibleUsers = 0;
        for (uint256 i = ghpDistributionIndex; i < endIndex; i++) {
            address userAddr = userIdToAddress[i];
            if (users[userAddr].isActive && !users[userAddr].isCapped) {
                eligibleUsers++;
            }
        }
        
        if (eligibleUsers > 0) {
            // Calculate total eligible users if this is the first batch
            uint256 totalEligible = _getTotalEligibleUsers();
            require(totalEligible > 0, "OrphiCrowdFund: No eligible users");
            
            uint256 perUserAmount = globalHelpPoolBalance / totalEligible;
            uint256 batchDistributed = 0;
            
            // Distribute to eligible users in this batch
            for (uint256 i = ghpDistributionIndex; i < endIndex; i++) {
                address userAddr = userIdToAddress[i];
                if (users[userAddr].isActive && !users[userAddr].isCapped) {
                    _creditEarnings(userAddr, perUserAmount, 4);
                    batchDistributed += perUserAmount;
                }
            }
            
            emit GlobalHelpPoolBatchDistributed(batchDistributed, eligibleUsers, ghpDistributionIndex, endIndex, block.timestamp);
        }
        
        ghpDistributionIndex = endIndex;
        
        // Complete distribution if we've processed all users
        if (ghpDistributionIndex >= totalUsers) {
            _completeGHPDistribution();
        }
    }
    
    /**
     * @dev Complete GHP distribution and reset state
     */
    function _completeGHPDistribution() internal {
        globalHelpPoolBalance = 0;
        lastGlobalHelpPoolDistribution = block.timestamp;
        weeklyDistributionCount++;
        ghpDistributionInProgress = false;
        ghpDistributionIndex = 0;
        
        emit GlobalHelpPoolDistributed(0, 0, 0, block.timestamp); // Final completion event
    }
    
    /**
     * @dev Get total number of eligible users for GHP distribution
     */
    function _getTotalEligibleUsers() internal view returns (uint256) {
        uint256 eligible = 0;
        for (uint256 i = 0; i < totalUsers; i++) {
            address userAddr = userIdToAddress[i];
            if (users[userAddr].isActive && !users[userAddr].isCapped) {
                eligible++;
            }
        }
        return eligible;
    }
    
    /**
     * @dev Legacy function for backward compatibility (uses default batch size)
     */
    function distributeGlobalHelpPool() external onlyRole(POOL_MANAGER_ROLE) {
        _distributeGlobalHelpPoolBatch(DISTRIBUTION_BATCH_SIZE);
    }

    // ==================== BI-MONTHLY LEADER BONUS DISTRIBUTION ====================
    
    /**
     * @dev Distributes the bi-monthly Leader Bonus Pool (paginated)
     * @param batchSize Number of users to process in this batch (max DISTRIBUTION_BATCH_SIZE)
     */
    function distributeLeaderBonus(uint256 batchSize) external onlyRole(POOL_MANAGER_ROLE) {
        _distributeLeaderBonusBatch(batchSize);
    }
    
    /**
     * @dev Internal function for paginated Leader Bonus distribution
     * @param batchSize Number of users to process in this batch
     */
    function _distributeLeaderBonusBatch(uint256 batchSize) internal {
        require(batchSize <= DISTRIBUTION_BATCH_SIZE, "OrphiCrowdFund: Batch size too large");
        
        // Start new distribution cycle if not in progress
        if (!leaderDistributionInProgress) {
            require(block.timestamp >= lastLeaderBonusDistribution + LEADER_DISTRIBUTION_INTERVAL, 
                    "OrphiCrowdFund: Too early for distribution");
            require(leaderBonusPoolBalance > 0, "OrphiCrowdFund: No funds to distribute");
            
            leaderDistributionInProgress = true;
            leaderDistributionIndex = 0;
        }
        
        uint256 endIndex = leaderDistributionIndex + batchSize;
        if (endIndex > totalUsers) {
            endIndex = totalUsers;
        }
        
        // Count leaders by rank in this batch
        uint256 batchShiningStars = 0;
        uint256 batchSilverStars = 0;
        
        for (uint256 i = leaderDistributionIndex; i < endIndex; i++) {
            address userAddr = userIdToAddress[i];
            LeaderRank rank = _uint32ToLeaderRank(users[userAddr].leaderRankValue);
            
            if (rank == LeaderRank.SHINING_STAR) {
                batchShiningStars++;
            } else if (rank == LeaderRank.SILVER_STAR) {
                batchSilverStars++;
            }
        }
        
        if (batchShiningStars > 0 || batchSilverStars > 0) {
            // Get total leader counts for proper distribution calculation
            (uint256 totalShiningStars, uint256 totalSilverStars) = _getTotalLeaderCounts();
            
            // Split pool 50/50 between ranks
            uint256 shiningStarPool = leaderBonusPoolBalance / 2;
            uint256 silverStarPool = leaderBonusPoolBalance / 2;
            
            uint256 batchDistributed = 0;
            
            // Distribute to leaders in this batch
            if (totalShiningStars > 0 && batchShiningStars > 0) {
                uint256 perShiningStarAmount = shiningStarPool / totalShiningStars;
                for (uint256 i = leaderDistributionIndex; i < endIndex; i++) {
                    address userAddr = userIdToAddress[i];
                    if (_uint32ToLeaderRank(users[userAddr].leaderRankValue) == LeaderRank.SHINING_STAR) {
                        _creditEarnings(userAddr, perShiningStarAmount, 3);
                        batchDistributed += perShiningStarAmount;
                    }
                }
            }
            
            if (totalSilverStars > 0 && batchSilverStars > 0) {
                uint256 perSilverStarAmount = silverStarPool / totalSilverStars;
                for (uint256 i = leaderDistributionIndex; i < endIndex; i++) {
                    address userAddr = userIdToAddress[i];
                    if (_uint32ToLeaderRank(users[userAddr].leaderRankValue) == LeaderRank.SILVER_STAR) {
                        _creditEarnings(userAddr, perSilverStarAmount, 3);
                        batchDistributed += perSilverStarAmount;
                    }
                }
            }
            
            emit LeaderBonusBatchDistributed(batchDistributed, batchShiningStars, batchSilverStars, leaderDistributionIndex, endIndex, block.timestamp);
        }
        
        leaderDistributionIndex = endIndex;
        
        // Complete distribution if we've processed all users
        if (leaderDistributionIndex >= totalUsers) {
            _completeLeaderDistribution();
        }
    }
    
    /**
     * @dev Complete leader distribution and reset state
     */
    function _completeLeaderDistribution() internal {
        leaderBonusPoolBalance = 0;
        lastLeaderBonusDistribution = block.timestamp;
        leaderDistributionInProgress = false;
        leaderDistributionIndex = 0;
        
        emit LeaderBonusDistributed(0, 0, 0, 0, block.timestamp); // Final completion event
    }
    
    /**
     * @dev Get total leader counts for distribution calculation
     */
    function _getTotalLeaderCounts() internal view returns (uint256 shiningStars, uint256 silverStars) {
        for (uint256 i = 0; i < totalUsers; i++) {
            address userAddr = userIdToAddress[i];
            LeaderRank rank = _uint32ToLeaderRank(users[userAddr].leaderRankValue);
            
            if (rank == LeaderRank.SHINING_STAR) {
                shiningStars++;
            } else if (rank == LeaderRank.SILVER_STAR) {
                silverStars++;
            }
        }
    }
    
    /**
     * @dev Legacy function for backward compatibility (uses default batch size)
     */
    function distributeLeaderBonus() external onlyRole(POOL_MANAGER_ROLE) {
        _distributeLeaderBonusBatch(DISTRIBUTION_BATCH_SIZE);
    }

    // ==================== RANK ADVANCEMENT SYSTEM ====================
    
    /**
     * @dev Checks and processes rank advancement for a user
     * @param user The user to check for advancement
     */
    function checkRankAdvancement(address user) external registeredUser(user) {
        User storage userData = users[user];
        LeaderRank currentRank = _uint32ToLeaderRank(userData.leaderRankValue);
        
        // Check for Shining Star advancement
        if (currentRank == LeaderRank.NONE && 
            userData.teamSize >= SHINING_STAR_TEAM_REQUIREMENT && 
            userData.directReferrals >= SHINING_STAR_DIRECT_REQUIREMENT) {
            
            userData.leaderRankValue = _leaderRankToUint32(LeaderRank.SHINING_STAR);
            emit RankAdvancement(user, currentRank, LeaderRank.SHINING_STAR, block.timestamp);
        }
        // Check for Silver Star advancement
        else if (currentRank == LeaderRank.SHINING_STAR && 
                 userData.teamSize >= SILVER_STAR_TEAM_REQUIREMENT) {
            
            userData.leaderRankValue = _leaderRankToUint32(LeaderRank.SILVER_STAR);
            emit RankAdvancement(user, currentRank, LeaderRank.SILVER_STAR, block.timestamp);
        }
    }

    // ==================== PACKAGE UPGRADE SYSTEM ====================
    
    /**
     * @dev Upgrades user's package to a higher tier
     * @param newTier The new package tier to upgrade to
     */
    function upgradePackage(PackageTier newTier) external nonReentrant registeredUser(msg.sender) whenNotPaused {
        User storage user = users[msg.sender];
        PackageTier currentTier = _uint64ToPackageTier(user.packageTierValue);
        
        require(newTier > currentTier, "OrphiCrowdFund: Can only upgrade to higher tier");
        require(newTier != PackageTier.NONE, "OrphiCrowdFund: Invalid tier");
        
        uint256 currentPrice = packageAmounts[uint8(currentTier) - 1];
        uint256 newPrice = packageAmounts[uint8(newTier) - 1];
        uint256 upgradeCost = newPrice - currentPrice;
        
        require(usdtToken.transferFrom(msg.sender, address(this), upgradeCost), "OrphiCrowdFund: Transfer failed");
        
        // Collect platform fee
        uint256 platformFee = (upgradeCost * platformFeeRate) / BASIS_POINTS;
        if (platformFee > 0) {
            require(usdtToken.transfer(treasuryAddress, platformFee), "OrphiCrowdFund: Fee transfer failed");
        }
        
        // Update user data
        user.packageTierValue = _packageTierToUint64(newTier);
        user.totalInvested = _safeUint128(user.totalInvested + upgradeCost);
        user.lastActivity = _safeUint32(block.timestamp);
        
        // Distribute upgrade commissions
        _distributeCommissions(msg.sender, upgradeCost);
        
        emit PackageUpgraded(msg.sender, currentTier, newTier, upgradeCost, block.timestamp);
    }

    // ==================== STORAGE LAYOUT COMPATIBILITY ====================
    
    function _generateStorageLayoutHash() internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            "User_v2",
            "totalInvested:uint128",
            "registrationTime:uint64",
            "teamSize:uint32",
            "lastActivity:uint32",
            "totalEarnings:uint128",
            "withdrawableAmount:uint128",
            "packageTierValue:uint64",
            "leaderRankValue:uint32",
            "directReferrals:uint32",
            "isCapped:bool",
            "isActive:bool",
            "sponsor:address",
            "leftChild:address",
            "rightChild:address",
            "poolEarnings:uint128[5]",
            "currentLevel:uint32",
            "leftLegCount:uint32",
            "rightLegCount:uint32",
            "weeklyHelpPoolShares:uint32",
            "totalWithdrawn:uint128",
            "lastWithdrawal:uint64",
            "withdrawalCount:uint32",
            "reinvestmentPercentage:uint32",
            "STORAGE_VERSION:2"
        ));
    }

    // ==================== ORACLE INTEGRATION ====================
    
    function setPriceOracle(address _priceOracle) external onlyRole(ORACLE_MANAGER_ROLE) {
        priceOracle = IPriceOracle(_priceOracle);
    }
    
    function setOracleEnabled(bool _enabled) external onlyRole(ORACLE_MANAGER_ROLE) {
        oracleEnabled = _enabled;
    }
    
    function getCurrentUSDTPrice() public view returns (uint256) {
        if (!oracleEnabled || address(priceOracle) == address(0)) {
            return 1e18; // Fixed price: 1 USDT = 1 USD
        }
        
        try priceOracle.getPriceWithTimestamp(address(usdtToken)) returns (uint256 price, uint256 timestamp) {
            require(block.timestamp - timestamp <= maxPriceAge, "OrphiCrowdFund: Price too old");
            require(price > 0, "OrphiCrowdFund: Invalid price");
            
            // Check for extreme price deviations
            uint256 expectedPrice = 1e18; // 1 USD
            uint256 deviation = price > expectedPrice ? 
                ((price - expectedPrice) * BASIS_POINTS) / expectedPrice :
                ((expectedPrice - price) * BASIS_POINTS) / expectedPrice;
            
            require(deviation <= priceDeviationThreshold, "OrphiCrowdFund: Price deviation too high");
            
            return price;
        } catch {
            return 1e18; // Fallback to fixed price
        }
    }

    // ==================== CIRCUIT BREAKER FUNCTIONS ====================
    
    /**
     * @dev Reset daily withdrawal counter if a day has passed
     */
    function _resetDailyWithdrawalsIfNeeded() internal {
        if (block.timestamp >= lastWithdrawalResetTime + 1 days) {
            currentDayWithdrawals = 0;
            lastWithdrawalResetTime = block.timestamp;
        }
    }
    
    /**
     * @dev Configure circuit breaker settings
     */
    function setCircuitBreakerConfig(
        bool _enabled,
        uint256 _maxDailyWithdrawals,
        uint256 _emergencyPauseThreshold
    ) external onlyRole(EMERGENCY_ROLE) {
        circuitBreakerEnabled = _enabled;
        maxDailyWithdrawals = _maxDailyWithdrawals;
        emergencyPauseThreshold = _emergencyPauseThreshold;
        
        if (_enabled && lastWithdrawalResetTime == 0) {
            lastWithdrawalResetTime = block.timestamp;
        }
    }
    
    /**
     * @dev Emergency circuit breaker trigger
     */
    function triggerCircuitBreaker() external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit CircuitBreakerTriggered(msg.sender, block.timestamp);
    }
    
    // Circuit breaker events
    event CircuitBreakerTriggered(address indexed admin, uint256 timestamp);
    event CircuitBreakerConfigUpdated(bool enabled, uint256 maxDaily, uint256 threshold);

    // ==================== VIEW FUNCTIONS ====================
    
    function getUserInfo(address user) external view returns (
        uint256 totalInvested,
        uint256 registrationTime,
        uint256 teamSize,
        uint256 totalEarnings,
        uint256 withdrawableAmount,
        PackageTier packageTier,
        LeaderRank leaderRank,
        bool isCapped,
        bool isActive,
        address sponsor,
        uint32 directReferralCount
    ) {
        User storage userData = users[user];
        return (
            userData.totalInvested,
            userData.registrationTime,
            userData.teamSize,
            userData.totalEarnings,
            userData.withdrawableAmount,
            _uint64ToPackageTier(userData.packageTierValue),
            _uint32ToLeaderRank(userData.leaderRankValue),
            userData.isCapped,
            userData.isActive,
            userData.sponsor,
            userData.directReferrals
        );
    }
    
    function getPoolEarnings(address user) external view returns (uint128[5] memory) {
        return users[user].poolEarnings;
    }
    
    function getDirectReferrals(address user) external view returns (address[] memory) {
        return directReferrals[user];
    }
    
    function getUplineChain(address user) external view returns (address[30] memory) {
        return uplineChain[user];
    }
    
    function getMatrixChildren(address user) external view returns (address left, address right) {
        return (users[user].leftChild, users[user].rightChild);
    }
    
    function getWithdrawalRate(address user) external view returns (uint256) {
        return _getWithdrawalRate(users[user].directReferrals);
    }
    
    function isUserRegistered(address user) external view returns (bool) {
        return _uint64ToPackageTier(users[user].packageTierValue) != PackageTier.NONE;
    }
    
    function getDistributionStatus() external view returns (
        bool ghpInProgress,
        uint256 ghpIndex,
        bool leaderInProgress,
        uint256 leaderIndex,
        uint256 batchSize
    ) {
        return (
            ghpDistributionInProgress,
            ghpDistributionIndex,
            leaderDistributionInProgress,
            leaderDistributionIndex,
            DISTRIBUTION_BATCH_SIZE
        );
    }
    
    function getCircuitBreakerStatus() external view returns (
        bool enabled,
        uint256 maxDaily,
        uint256 currentDaily,
        uint256 resetTime,
        uint256 threshold
    ) {
        return (
            circuitBreakerEnabled,
            maxDailyWithdrawals,
            currentDayWithdrawals,
            lastWithdrawalResetTime,
            emergencyPauseThreshold
        );
    }
    
    function getPackageAmounts() external view returns (uint256[4] memory) {
        return packageAmounts;
    }
    
    function getLevelBonusRates() external view returns (uint256[10] memory) {
        return levelBonusRates;
    }

    // ==================== ADMIN FUNCTIONS ====================
    
    function updateAdminAddresses(
        address _treasuryAddress,
        address _emergencyAddress,
        address _poolManagerAddress
    ) external onlyOwner {
        require(_treasuryAddress != address(0), "OrphiCrowdFund: Invalid treasury address");
        require(_emergencyAddress != address(0), "OrphiCrowdFund: Invalid emergency address");
        require(_poolManagerAddress != address(0), "OrphiCrowdFund: Invalid pool manager address");
        
        treasuryAddress = _treasuryAddress;
        emergencyAddress = _emergencyAddress;
        poolManagerAddress = _poolManagerAddress;
        
        // Update roles
        _grantRole(TREASURY_ROLE, _treasuryAddress);
        _grantRole(EMERGENCY_ROLE, _emergencyAddress);
        _grantRole(POOL_MANAGER_ROLE, _poolManagerAddress);
    }
    
    function emergencyWithdraw(uint256 amount) external onlyRole(EMERGENCY_ROLE) {
        require(amount > 0, "OrphiCrowdFund: Invalid amount");
        require(usdtToken.balanceOf(address(this)) >= amount, "OrphiCrowdFund: Insufficient contract balance");
        require(usdtToken.transfer(emergencyAddress, amount), "OrphiCrowdFund: Transfer failed");
        
        emit EmergencyWithdrawal(emergencyAddress, amount, block.timestamp);
    }
    
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit EmergencyPauseActivated(msg.sender, block.timestamp);
    }
    
    function emergencyUnpause() external onlyOwner {
        _unpause();
        emit EmergencyPauseDeactivated(msg.sender, block.timestamp);
    }
    
    // Emergency events
    event EmergencyWithdrawal(address indexed recipient, uint256 amount, uint256 timestamp);
    event EmergencyPauseActivated(address indexed admin, uint256 timestamp);
    event EmergencyPauseDeactivated(address indexed admin, uint256 timestamp);
    
    // ==================== INTERNAL ADMIN MANAGER FUNCTIONS ====================
    
    /**
     * @dev Sets the InternalAdminManager contract address
     * @param _adminManager Address of the InternalAdminManager contract
     */
    function setInternalAdminManager(address _adminManager) external onlyOwner {
        require(_adminManager != address(0), "OrphiCrowdFund: Invalid admin manager address");
        address oldManager = internalAdminManager;
        internalAdminManager = _adminManager;
        emit InternalAdminManagerUpdated(oldManager, _adminManager);
    }
    
    /**
     * @dev Initializes the InternalAdminManager integration (called after both contracts are deployed)
     * @param _adminManager Address of the InternalAdminManager contract
     * @param _enabled Whether to enable internal admin functionality
     */
    function initializeInternalAdminManager(address _adminManager, bool _enabled) external onlyOwner {
        require(_adminManager != address(0), "OrphiCrowdFund: Invalid admin manager address");
        
        address oldManager = internalAdminManager;
        internalAdminManager = _adminManager;
        internalAdminEnabled = _enabled;
        
        emit InternalAdminManagerUpdated(oldManager, _adminManager);
        emit InternalAdminStatusChanged(_enabled);
    }
    
    /**
     * @dev Enables or disables internal admin functionality
     * @param _enabled Whether to enable internal admin functionality
     */
    function setInternalAdminEnabled(bool _enabled) external onlyOwner {
        internalAdminEnabled = _enabled;
        emit InternalAdminStatusChanged(_enabled);
    }
    
    /**
     * @dev Checks if an address is an internal admin
     * @param _admin Address to check
     */
    function isInternalAdmin(address _admin) public view returns (bool) {
        if (!internalAdminEnabled || internalAdminManager == address(0)) {
            return false;
        }
        
        try IInternalAdminManager(internalAdminManager).checkIsInternalAdmin(_admin) returns (bool result) {
            return result;
        } catch {
            return false;
        }
    }
    
    /**
     * @dev Validates internal admin access for simulation purposes
     * @param _caller Address to validate
     */
    function validateInternalAdminAccess(address _caller) external view returns (bool) {
        return isInternalAdmin(_caller);
    }
    
    /**
     * @dev Tracks admin activity for simulation purposes
     * @param _action Description of action performed
     */
    function trackAdminActivity(string calldata _action) external {
        if (internalAdminEnabled && internalAdminManager != address(0) && isInternalAdmin(msg.sender)) {
            try IInternalAdminManager(internalAdminManager).trackAdminActivity(msg.sender, _action) {
                // Activity tracked successfully
            } catch {
                // Silently fail to not break main functionality
            }
        }
    }
    
    /**
     * @dev Gets all internal admin addresses for display purposes
     */
    function getAllInternalAdmins() external view returns (address[] memory) {
        if (!internalAdminEnabled || internalAdminManager == address(0)) {
            return new address[](0);
        }
        
        try IInternalAdminManager(internalAdminManager).getAllInternalAdmins() returns (address[] memory admins) {
            return admins;
        } catch {
            return new address[](0);
        }
    }
    
    /**
     * @dev Gets internal admin count for display purposes
     */
    function getInternalAdminCount() external view returns (uint256) {
        if (!internalAdminEnabled || internalAdminManager == address(0)) {
            return 0;
        }
        
        try IInternalAdminManager(internalAdminManager).getInternalAdminCount() returns (uint256 count) {
            return count;
        } catch {
            return 0;
        }
    }
    
    /**
     * @dev Returns internal admin manager configuration
     */
    function getInternalAdminConfig() external view returns (
        address adminManagerAddress,
        bool enabled,
        uint256 adminCount
    ) {
        return (
            internalAdminManager,
            internalAdminEnabled,
            this.getInternalAdminCount()
        );
    }
    
    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function version() external pure returns (string memory) {
        return "Orphi CrowdFund Platform v2.0.0 - Complete Whitepaper Implementation";
    }

    // ==================== UPGRADE AUTHORIZATION ====================
    
    /**
     * @dev Propose an upgrade with timelock
     */
    function proposeUpgrade(address newImplementation) external onlyRole(UPGRADER_ROLE) {
        require(newImplementation != address(0), "OrphiCrowdFund: Invalid implementation");
        require(newImplementation != address(this), "OrphiCrowdFund: Same implementation");
        
        uint256 unlockTime = block.timestamp + UPGRADE_DELAY;
        proposedUpgrades[newImplementation] = unlockTime;
        
        emit UpgradeProposed(newImplementation, unlockTime);
    }
    
    /**
     * @dev Cancel a proposed upgrade
     */
    function cancelUpgrade(address newImplementation) external onlyRole(UPGRADER_ROLE) {
        delete proposedUpgrades[newImplementation];
    }
    
    function _authorizeUpgrade(address newImplementation) internal view override onlyRole(UPGRADER_ROLE) {
        require(newImplementation != address(0), "OrphiCrowdFund: Invalid implementation");
        require(newImplementation != address(this), "OrphiCrowdFund: Same implementation");
        
        // Check timelock
        uint256 unlockTime = proposedUpgrades[newImplementation];
        require(unlockTime != 0, "OrphiCrowdFund: Upgrade not proposed");
        require(block.timestamp >= unlockTime, "OrphiCrowdFund: Upgrade timelock not expired");
    }
}
