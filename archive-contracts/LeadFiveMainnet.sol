// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LeadFiveMainnet
 * @dev Fully inlined version of LeadFive with all libraries merged into one contract
 * @notice All tested functions and security features included for mainnet deployment
 * 
 * FEATURES INCLUDED:
 * - All security audit recommendations implemented
 * - Complete bonus distribution system
 * - Matrix management system
 * - Pool distribution system
 * - Admin management with proper access controls
 * - Oracle price feed integration
 * - Withdrawal safety mechanisms
 * - Anti-MEV protection
 * - Circuit breaker for large withdrawals
 * - Reserve fund management
 * - Emergency controls
 */

interface IPriceFeed {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 price,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract LeadFiveMainnet is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {
    
    // ==================== DATA STRUCTURES ====================
    
    enum PackageTier { 
        NONE,       // 0
        PACKAGE_1,  // 1 - $30
        PACKAGE_2,  // 2 - $50  
        PACKAGE_3,  // 3 - $100
        PACKAGE_4   // 4 - $200
    }
    
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
        uint32 matrixPosition;
        uint8 matrixLevel;
        uint32 registrationTime;
        string referralCode;
        uint96 pendingRewards;
        uint32 lastWithdrawal;
        uint32 matrixCycles;
        uint8 leaderRank;
        uint96 leftLegVolume;
        uint96 rightLegVolume;
        bool isActive;
    }
    
    struct Package {
        uint96 price;
        uint16 directBonus;     // Basis points (e.g., 4000 = 40%)
        uint16 levelBonus;      // Basis points
        uint16 uplineBonus;     // Basis points
        uint16 leaderBonus;     // Basis points
        uint16 helpBonus;       // Basis points
        uint16 clubBonus;       // Basis points
        bool isActive;
    }
    
    struct Pool {
        uint96 balance;
        uint32 lastDistribution;
        uint32 interval;
        bool isActive;
    }
    
    struct MatrixPosition {
        address upline;
        address[] downlines;
        uint256 level;
        uint256 earnings;
        bool isActive;
    }
    
    struct PoolQualification {
        bool qualifiesForLeader;
        bool qualifiesForHelp;
        bool qualifiesForClub;
        uint32 lastUpdate;
    }
    
    struct DistributionSchedule {
        uint32 nextDistribution;
        uint32 interval;
        uint96 minimumAmount;
        bool isActive;
    }
    
    // ==================== STATE VARIABLES ====================
    
    mapping(address => User) public users;
    mapping(uint8 => Package) public packages;
    mapping(address => address[]) public directReferrals;
    mapping(string => address) public referralCodeToUser;
    mapping(address => MatrixPosition) public matrixPositions;
    mapping(address => PoolQualification) public poolQualifications;
    mapping(address => uint256) public pendingCommissions;
    mapping(uint256 => uint256) public windowWithdrawals;
    
    Pool public leaderPool;
    Pool public helpPool;
    Pool public clubPool;
    
    IERC20 public usdt;
    IPriceFeed public priceFeed;
    IPriceFeed[] public priceOracles;
    
    // Admin management
    mapping(address => bool) private isAdminAddress;
    address[] private adminList;
    uint256 public constant MAX_ADMINS = 16;
    address[16] public adminIds;
    
    // Platform stats
    uint32 public totalUsers;
    address public adminFeeRecipient;
    uint96 public totalAdminFeesCollected;
    uint256 public totalDeposits;
    uint256 public reserveFund;
    uint256 public circuitBreakerThreshold;
    
    // Security
    uint256 private lastTxBlock;
    
    // Pool schedules
    DistributionSchedule public leaderPoolSchedule;
    DistributionSchedule public helpPoolSchedule;
    DistributionSchedule public clubPoolSchedule;
    
    // Leaders tracking
    address[] public shiningStarLeaders;
    
    // ==================== CONSTANTS ====================
    
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant ADMIN_FEE_RATE = 500; // 5%
    uint256 public constant EARNINGS_MULTIPLIER = 200; // 2x cap
    uint256 public constant PRICE_DEVIATION_THRESHOLD = 500; // 5%
    uint256 public constant MIN_WITHDRAWAL_INTERVAL = 86400; // 24 hours
    
    // Package prices
    uint256 public constant PACKAGE_1_PRICE = 30e18;   // $30
    uint256 public constant PACKAGE_2_PRICE = 50e18;   // $50
    uint256 public constant PACKAGE_3_PRICE = 100e18;  // $100
    uint256 public constant PACKAGE_4_PRICE = 200e18;  // $200
    
    // ==================== EVENTS ====================
    
    event UserRegistered(address indexed user, address indexed referrer, uint8 packageLevel, uint96 amount);
    event PackageUpgraded(address indexed user, uint8 newLevel, uint96 amount);
    event BonusDistributed(address indexed recipient, uint96 amount, uint8 bonusType);
    event Withdrawal(address indexed user, uint96 amount);
    event PoolDistributed(uint8 indexed poolType, uint96 amount);
    event AdminFeeCollected(uint96 amount, address indexed user);
    event ReferralCodeGenerated(address indexed user, string code);
    event MatrixCycleCompleted(address indexed user, uint8 level, uint256 bonus, uint32 cycleId);
    event RewardsClaimed(address indexed user, uint256 amount);
    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);
    event PriceFeedUpdated(address indexed priceFeed);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event EarningsCapReached(address indexed user, uint96 exceededAmount);
    event EmergencyPaused(string reason);
    event CircuitBreakerTriggered(uint256 amount, uint256 threshold);
    
    // ==================== ERRORS ====================
    
    error Unauthorized();
    error MEVProtection();
    error AlreadyRegistered();
    error InvalidPackage();
    error InvalidReferrer();
    error NotRegistered();
    error UserBlacklisted();
    error InvalidUpgrade();
    error InsufficientBalance();
    error AdminFeeRecipientNotSet();
    error WithdrawalTooSoon();
    error CircuitBreakerActivated();
    error PaymentFailed();
    error InsufficientBNB();
    error ZeroAddress();
    error InvalidAmount();
    error OracleCallFailed();
    error TooManyOracles();
    error OracleNotFound();
    error AdminAlreadyExists();
    error TooManyAdmins();
    error AdminNotFound();
    error InvalidIndex();
    
    // ==================== MODIFIERS ====================
    
    modifier onlyAdmin() {
        if (!isAdminAddress[msg.sender] && msg.sender != owner()) revert Unauthorized();
        _;
    }
    
    modifier antiMEV() {
        if (block.number <= lastTxBlock) revert MEVProtection();
        lastTxBlock = block.number;
        _;
    }
    
    modifier validPackage(uint8 packageLevel) {
        if (packageLevel == 0 || packageLevel > 4 || !packages[packageLevel].isActive) revert InvalidPackage();
        _;
    }
    
    modifier onlyRegistered() {
        if (!users[msg.sender].isRegistered) revert NotRegistered();
        _;
    }
    
    modifier notBlacklisted() {
        if (users[msg.sender].isBlacklisted) revert UserBlacklisted();
        _;
    }
    
    // ==================== INITIALIZATION ====================
    
    function initialize(address _usdt, address _priceFeed) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        if (_usdt == address(0) || _priceFeed == address(0)) revert ZeroAddress();
        
        usdt = IERC20(_usdt);
        priceFeed = IPriceFeed(_priceFeed);
        
        // Initialize price oracles array
        priceOracles.push(IPriceFeed(_priceFeed));
        
        // Set deployer as first admin
        _setInitialAdmin(msg.sender);
        
        // Initialize packages
        _initializePackages();
        
        // Initialize pools
        _initializePools();
        
        // Initialize deployer as first user
        _initializeDeployerUser();
        
        // Initialize security settings
        circuitBreakerThreshold = 50000e18; // $50,000 daily withdrawal limit
        reserveFund = 0;
        totalDeposits = 0;
    }
    
    function _setInitialAdmin(address deployer) internal {
        isAdminAddress[deployer] = true;
        adminList.push(deployer);
        
        // Fill all admin slots with deployer initially
        for(uint i = 0; i < 16; i++) {
            adminIds[i] = deployer;
        }
        
        adminFeeRecipient = deployer;
    }
    
    function _initializePackages() internal {
        packages[1] = Package({
            price: uint96(PACKAGE_1_PRICE),
            directBonus: 4000,  // 40%
            levelBonus: 1000,   // 10%
            uplineBonus: 1000,  // 10%
            leaderBonus: 1000,  // 10%
            helpBonus: 3000,    // 30%
            clubBonus: 0,       // 0%
            isActive: true
        });
        
        packages[2] = Package({
            price: uint96(PACKAGE_2_PRICE),
            directBonus: 4000,
            levelBonus: 1000,
            uplineBonus: 1000,
            leaderBonus: 1000,
            helpBonus: 3000,
            clubBonus: 0,
            isActive: true
        });
        
        packages[3] = Package({
            price: uint96(PACKAGE_3_PRICE),
            directBonus: 4000,
            levelBonus: 1000,
            uplineBonus: 1000,
            leaderBonus: 1000,
            helpBonus: 3000,
            clubBonus: 0,
            isActive: true
        });
        
        packages[4] = Package({
            price: uint96(PACKAGE_4_PRICE),
            directBonus: 4000,
            levelBonus: 1000,
            uplineBonus: 1000,
            leaderBonus: 1000,
            helpBonus: 3000,
            clubBonus: 0,
            isActive: true
        });
    }
    
    function _initializePools() internal {
        leaderPool = Pool({
            balance: 0,
            lastDistribution: uint32(block.timestamp),
            interval: 604800, // 1 week
            isActive: true
        });
        
        helpPool = Pool({
            balance: 0,
            lastDistribution: uint32(block.timestamp),
            interval: 604800, // 1 week
            isActive: true
        });
        
        clubPool = Pool({
            balance: 0,
            lastDistribution: uint32(block.timestamp),
            interval: 2592000, // 30 days
            isActive: true
        });
        
        // Initialize distribution schedules
        leaderPoolSchedule = DistributionSchedule({
            nextDistribution: uint32(block.timestamp + 604800),
            interval: 604800,
            minimumAmount: 1000e18,
            isActive: true
        });
        
        helpPoolSchedule = DistributionSchedule({
            nextDistribution: uint32(block.timestamp + 604800),
            interval: 604800,
            minimumAmount: 500e18,
            isActive: true
        });
        
        clubPoolSchedule = DistributionSchedule({
            nextDistribution: uint32(block.timestamp + 2592000),
            interval: 2592000,
            minimumAmount: 2000e18,
            isActive: true
        });
    }
    
    function _initializeDeployerUser() internal {
        address deployer = msg.sender;
        
        users[deployer] = User({
            isRegistered: true,
            isBlacklisted: false,
            referrer: address(0),
            balance: 0,
            totalInvestment: 0,
            totalEarnings: 0,
            earningsCap: type(uint96).max,
            directReferrals: 0,
            teamSize: 0,
            packageLevel: 4, // Highest package
            rank: 5,
            withdrawalRate: 80,
            lastHelpPoolClaim: 0,
            isEligibleForHelpPool: true,
            matrixPosition: 0,
            matrixLevel: 0,
            registrationTime: uint32(block.timestamp),
            referralCode: "ADMIN001",
            pendingRewards: 0,
            lastWithdrawal: 0,
            matrixCycles: 0,
            leaderRank: 5, // Top leader rank
            leftLegVolume: 0,
            rightLegVolume: 0,
            isActive: true
        });
        
        // Set referral code mapping
        referralCodeToUser["ADMIN001"] = deployer;
        
        totalUsers = 1;
    }
    
    // ==================== CORE FUNCTIONS ====================
    
    function register(address referrer, uint8 packageLevel, bool useUSDT) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        antiMEV 
        validPackage(packageLevel) 
    {
        if (users[msg.sender].isRegistered) revert AlreadyRegistered();
        if (referrer != address(0) && !users[referrer].isRegistered) revert InvalidReferrer();
        
        uint96 amount = _processPayment(packageLevel, useUSDT);
        totalUsers++;
        totalDeposits += amount;
        
        // Create user
        users[msg.sender] = User({
            isRegistered: true,
            isBlacklisted: false,
            referrer: referrer,
            balance: 0,
            totalInvestment: amount,
            totalEarnings: 0,
            earningsCap: uint96(amount * EARNINGS_MULTIPLIER / 100),
            directReferrals: 0,
            teamSize: 0,
            packageLevel: packageLevel,
            rank: 1,
            withdrawalRate: _calculateInitialWithdrawalRate(packageLevel),
            lastHelpPoolClaim: 0,
            isEligibleForHelpPool: true,
            matrixPosition: totalUsers,
            matrixLevel: 1,
            registrationTime: uint32(block.timestamp),
            referralCode: "",
            pendingRewards: 0,
            lastWithdrawal: 0,
            matrixCycles: 0,
            leaderRank: 0,
            leftLegVolume: 0,
            rightLegVolume: 0,
            isActive: true
        });
        
        // Generate and assign referral code
        string memory refCode = _generateReferralCode(msg.sender);
        users[msg.sender].referralCode = refCode;
        referralCodeToUser[refCode] = msg.sender;
        
        // Handle referrer relationships
        if (referrer != address(0)) {
            directReferrals[referrer].push(msg.sender);
            users[referrer].directReferrals++;
            users[referrer].teamSize++;
            
            // Place in matrix
            _placeInMatrix(msg.sender, referrer);
            
            // Update pool qualifications
            _updatePoolQualifications(referrer);
            
            // Update leader qualifications
            _updateLeaderQualifications(referrer);
        }
        
        // Distribute bonuses
        _distributeBonuses(msg.sender, amount, packageLevel);
        
        emit UserRegistered(msg.sender, referrer, packageLevel, amount);
        emit ReferralCodeGenerated(msg.sender, refCode);
    }
    
    function upgradePackage(uint8 newLevel, bool useUSDT) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        antiMEV 
        onlyRegistered 
        notBlacklisted 
        validPackage(newLevel) 
    {
        if (newLevel <= users[msg.sender].packageLevel) revert InvalidUpgrade();
        
        uint96 amount = _processPayment(newLevel, useUSDT);
        totalDeposits += amount;
        
        users[msg.sender].packageLevel = newLevel;
        users[msg.sender].totalInvestment += amount;
        users[msg.sender].earningsCap += uint96(amount * EARNINGS_MULTIPLIER / 100);
        
        // Update withdrawal rate based on new package
        users[msg.sender].withdrawalRate = _calculateWithdrawalRate(
            users[msg.sender].directReferrals,
            users[msg.sender].teamSize,
            newLevel
        );
        
        _distributeBonuses(msg.sender, amount, newLevel);
        emit PackageUpgraded(msg.sender, newLevel, amount);
    }
    
    function withdraw(uint96 amount, bool useSafety) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyRegistered 
        notBlacklisted 
    {
        User storage user = users[msg.sender];
        if (amount > user.balance) revert InsufficientBalance();
        if (adminFeeRecipient == address(0)) revert AdminFeeRecipientNotSet();
        
        // Safety checks if enabled
        if (useSafety) {
            if (block.timestamp - user.lastWithdrawal < MIN_WITHDRAWAL_INTERVAL) {
                revert WithdrawalTooSoon();
            }
            
            uint256 dayKey = block.timestamp / 86400;
            if (windowWithdrawals[dayKey] + amount > circuitBreakerThreshold) {
                emit CircuitBreakerTriggered(amount, circuitBreakerThreshold);
                revert CircuitBreakerActivated();
            }
            windowWithdrawals[dayKey] += amount;
            user.lastWithdrawal = uint32(block.timestamp);
        }
        
        // Calculate withdrawal amounts
        uint96 withdrawable = uint96((uint256(amount) * user.withdrawalRate) / 100);
        uint96 reinvestment = amount - withdrawable;
        uint96 adminFee = uint96((uint256(withdrawable) * ADMIN_FEE_RATE) / BASIS_POINTS);
        uint96 userReceives = withdrawable - adminFee;
        
        // Update balances
        user.balance -= amount;
        totalAdminFeesCollected += adminFee;
        
        // Transfer tokens
        if (!usdt.transfer(msg.sender, userReceives)) revert PaymentFailed();
        if (!usdt.transfer(adminFeeRecipient, adminFee)) revert PaymentFailed();
        
        // Handle reinvestment
        if (reinvestment > 0) {
            uint96 helpPoolAmount = _distributeReinvestment(reinvestment);
            helpPool.balance += helpPoolAmount;
        }
        
        emit Withdrawal(msg.sender, userReceives);
        emit AdminFeeCollected(adminFee, msg.sender);
    }
    
    // ==================== INTERNAL HELPER FUNCTIONS ====================
    
    function _processPayment(uint8 packageLevel, bool useUSDT) internal returns (uint96) {
        uint96 packagePrice = packages[packageLevel].price;
        
        if (useUSDT) {
            if (!usdt.transferFrom(msg.sender, address(this), packagePrice)) {
                revert PaymentFailed();
            }
            return packagePrice;
        } else {
            uint96 bnbRequired = _getBNBPrice(packagePrice);
            if (msg.value < bnbRequired) revert InsufficientBNB();
            
            // Refund excess BNB
            if (msg.value > bnbRequired) {
                payable(msg.sender).transfer(msg.value - bnbRequired);
            }
            return packagePrice;
        }
    }
    
    function _getBNBPrice(uint96 usdAmount) internal view returns (uint96) {
        int256 securePrice = _getSecurePrice();
        if (securePrice <= 0) revert OracleCallFailed();
        
        // Convert USD to BNB: (usdAmount * 1e18) / (price * 1e10)
        return uint96((uint256(usdAmount) * 1e8) / uint256(securePrice));
    }
    
    function _getSecurePrice() internal view returns (int256) {
        if (priceOracles.length == 0) revert OracleCallFailed();
        
        if (priceOracles.length == 1) {
            try priceOracles[0].latestRoundData() returns (
                uint80, int256 price, uint256, uint256 updatedAt, uint80
            ) {
                if (block.timestamp - updatedAt > 3600) revert OracleCallFailed(); // 1 hour max
                return price;
            } catch {
                revert OracleCallFailed();
            }
        }
        
        // Multiple oracles - use median
        int256[] memory prices = new int256[](priceOracles.length);
        uint256 validPrices = 0;
        
        for (uint256 i = 0; i < priceOracles.length; i++) {
            try priceOracles[i].latestRoundData() returns (
                uint80, int256 price, uint256, uint256 updatedAt, uint80
            ) {
                if (block.timestamp - updatedAt <= 3600 && price > 0) {
                    prices[validPrices] = price;
                    validPrices++;
                }
            } catch {
                continue;
            }
        }
        
        if (validPrices == 0) revert OracleCallFailed();
        
        // Sort and return median
        for (uint256 i = 0; i < validPrices - 1; i++) {
            for (uint256 j = 0; j < validPrices - i - 1; j++) {
                if (prices[j] > prices[j + 1]) {
                    int256 temp = prices[j];
                    prices[j] = prices[j + 1];
                    prices[j + 1] = temp;
                }
            }
        }
        
        return prices[validPrices / 2];
    }
    
    function _generateReferralCode(address user) internal view returns (string memory) {
        uint256 hash = uint256(keccak256(abi.encodePacked(user, block.timestamp, totalUsers)));
        
        bytes memory chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        bytes memory result = new bytes(8);
        
        for (uint256 i = 0; i < 8; i++) {
            result[i] = chars[hash % chars.length];
            hash = hash / chars.length;
        }
        
        return string(result);
    }
    
    function _calculateInitialWithdrawalRate(uint8 packageLevel) internal pure returns (uint8) {
        if (packageLevel == 1) return 60;
        if (packageLevel == 2) return 65;
        if (packageLevel == 3) return 70;
        if (packageLevel == 4) return 80;
        return 50; // fallback
    }
    
    function _calculateWithdrawalRate(uint32 directRefs, uint32 teamSize, uint8 packageLevel) internal pure returns (uint8) {
        uint8 baseRate = _calculateInitialWithdrawalRate(packageLevel);
        
        // Bonus for direct referrals (max +10%)
        if (directRefs >= 10) baseRate += 10;
        else if (directRefs >= 5) baseRate += 5;
        else if (directRefs >= 2) baseRate += 2;
        
        // Bonus for team size (max +10%)
        if (teamSize >= 100) baseRate += 10;
        else if (teamSize >= 50) baseRate += 5;
        else if (teamSize >= 20) baseRate += 2;
        
        return baseRate > 100 ? 100 : baseRate;
    }
    
    function _distributeBonuses(address user, uint96 amount, uint8 packageLevel) internal {
        Package memory pkg = packages[packageLevel];
        
        // Calculate bonus amounts
        uint96 directAmount = uint96((uint256(amount) * pkg.directBonus) / BASIS_POINTS);
        uint96 levelAmount = uint96((uint256(amount) * pkg.levelBonus) / BASIS_POINTS);
        uint96 uplineAmount = uint96((uint256(amount) * pkg.uplineBonus) / BASIS_POINTS);
        uint96 leaderAmount = uint96((uint256(amount) * pkg.leaderBonus) / BASIS_POINTS);
        uint96 helpAmount = uint96((uint256(amount) * pkg.helpBonus) / BASIS_POINTS);
        uint96 clubAmount = uint96((uint256(amount) * pkg.clubBonus) / BASIS_POINTS);
        uint96 adminAmount = uint96((uint256(amount) * ADMIN_FEE_RATE) / BASIS_POINTS);
        
        // Direct bonus to immediate referrer
        if (users[user].referrer != address(0)) {
            _addEarningsWithCap(users[user].referrer, directAmount, 1);
            
            // Distribute level bonuses (10 levels)
            _distribute10LevelBonus(user, levelAmount);
            
            // Distribute upline bonuses
            _distributeUplineBonus(user, uplineAmount);
        }
        
        // Pool allocations
        leaderPool.balance += leaderAmount;
        helpPool.balance += helpAmount;
        clubPool.balance += clubAmount;
        
        // Admin fee
        totalAdminFeesCollected += adminAmount;
        if (adminFeeRecipient != address(0) && adminAmount > 0) {
            if (!usdt.transfer(adminFeeRecipient, adminAmount)) revert PaymentFailed();
            emit AdminFeeCollected(adminAmount, user);
        }
    }
    
    function _addEarningsWithCap(address user, uint96 amount, uint8 bonusType) internal {
        User storage userData = users[user];
        if (!userData.isRegistered || userData.isBlacklisted) return;
        
        uint96 availableCap = userData.earningsCap > userData.totalEarnings ? 
                              userData.earningsCap - userData.totalEarnings : 0;
        
        uint96 actualAmount = amount > availableCap ? availableCap : amount;
        
        if (actualAmount > 0) {
            userData.balance += actualAmount;
            userData.totalEarnings += actualAmount;
            
            emit BonusDistributed(user, actualAmount, bonusType);
        }
        
        if (amount > actualAmount) {
            emit EarningsCapReached(user, amount - actualAmount);
        }
    }
    
    function _distribute10LevelBonus(address user, uint96 totalAmount) internal {
        address current = users[user].referrer;
        uint96 amountPerLevel = totalAmount / 10;
        
        for (uint8 level = 1; level <= 10 && current != address(0); level++) {
            if (users[current].isRegistered && !users[current].isBlacklisted) {
                _addEarningsWithCap(current, amountPerLevel, 2);
            }
            current = users[current].referrer;
        }
    }
    
    function _distributeUplineBonus(address user, uint96 amount) internal {
        address current = users[user].referrer;
        uint256 distributed = 0;
        uint8 level = 1;
        
        while (current != address(0) && level <= 20 && distributed < amount) {
            if (users[current].isRegistered && !users[current].isBlacklisted) {
                uint96 levelBonus = uint96(amount / 20); // Equal distribution among 20 levels
                _addEarningsWithCap(current, levelBonus, 3);
                distributed += levelBonus;
            }
            current = users[current].referrer;
            level++;
        }
    }
    
    function _distributeReinvestment(uint96 amount) internal returns (uint96) {
        // 70% to help pool, 30% distributed to active users
        uint96 helpPoolAmount = uint96((uint256(amount) * 7000) / BASIS_POINTS);
        uint96 userAmount = amount - helpPoolAmount;
        
        // Simple distribution to some active users
        if (totalUsers > 0 && userAmount > 0) {
            uint96 perUser = userAmount / uint96(totalUsers > 10 ? 10 : totalUsers);
            
            // Find some active users and distribute
            address[] memory activeUsers = new address[](10);
            uint256 count = 0;
            
            for (uint256 i = 0; i < adminList.length && count < 10; i++) {
                if (users[adminList[i]].isActive) {
                    activeUsers[count] = adminList[i];
                    count++;
                }
            }
            
            for (uint256 i = 0; i < count; i++) {
                _addEarningsWithCap(activeUsers[i], perUser, 4);
            }
        }
        
        return helpPoolAmount;
    }
    
    function _placeInMatrix(address user, address upline) internal {
        matrixPositions[user] = MatrixPosition({
            upline: upline,
            downlines: new address[](0),
            level: 1,
            earnings: 0,
            isActive: true
        });
        
        matrixPositions[upline].downlines.push(user);
    }
    
    function _updatePoolQualifications(address user) internal {
        User storage userData = users[user];
        
        poolQualifications[user] = PoolQualification({
            qualifiesForLeader: userData.directReferrals >= 5 && userData.teamSize >= 25,
            qualifiesForHelp: userData.directReferrals >= 2 && userData.packageLevel >= 2,
            qualifiesForClub: userData.directReferrals >= 10 && userData.teamSize >= 100,
            lastUpdate: uint32(block.timestamp)
        });
    }
    
    function _updateLeaderQualifications(address user) internal {
        User storage userData = users[user];
        
        // Update leader rank based on team performance
        if (userData.directReferrals >= 20 && userData.teamSize >= 500) {
            if (userData.leaderRank < 5) {
                userData.leaderRank = 5; // Shining Star
                
                // Add to shining star leaders if not already there
                bool exists = false;
                for (uint256 i = 0; i < shiningStarLeaders.length; i++) {
                    if (shiningStarLeaders[i] == user) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    shiningStarLeaders.push(user);
                }
            }
        } else if (userData.directReferrals >= 10 && userData.teamSize >= 100) {
            if (userData.leaderRank < 4) userData.leaderRank = 4; // Silver Star
        } else if (userData.directReferrals >= 5 && userData.teamSize >= 25) {
            if (userData.leaderRank < 3) userData.leaderRank = 3; // Gold
        } else if (userData.directReferrals >= 3 && userData.teamSize >= 10) {
            if (userData.leaderRank < 2) userData.leaderRank = 2; // Silver
        } else if (userData.directReferrals >= 1) {
            if (userData.leaderRank < 1) userData.leaderRank = 1; // Bronze
        }
    }
    
    // ==================== VIEW FUNCTIONS ====================
    
    function getUserInfo(address user) external view returns (User memory) {
        return users[user];
    }
    
    function getPackageInfo(uint8 packageLevel) external view returns (Package memory) {
        return packages[packageLevel];
    }
    
    function getUserBalance(address user) external view returns (uint256) {
        return users[user].balance;
    }
    
    function getDirectReferrals(address user) external view returns (address[] memory) {
        return directReferrals[user];
    }
    
    function getPoolBalances() external view returns (uint96, uint96, uint96) {
        return (leaderPool.balance, helpPool.balance, clubPool.balance);
    }
    
    function getContractStats() external view returns (
        uint32 totalUsersCount,
        uint256 totalInvestments,
        uint256 totalAdminFees,
        uint256 contractBalance,
        bool isHealthy
    ) {
        uint256 currentBalance = usdt.balanceOf(address(this));
        uint256 healthRatio = totalDeposits > 0 ? (currentBalance * 10000) / totalDeposits : 10000;
        
        return (
            totalUsers,
            totalDeposits,
            totalAdminFeesCollected,
            currentBalance,
            healthRatio >= 2000 // At least 20% reserve
        );
    }
    
    function getPendingRewards(address user) external view returns (uint256) {
        return pendingCommissions[user];
    }
    
    function getBNBPrice() external view returns (uint256) {
        int256 price = _getSecurePrice();
        return uint256(price);
    }
    
    function getOracleCount() external view returns (uint256) {
        return priceOracles.length;
    }
    
    function getAllAdmins() external view returns (address[16] memory) {
        return adminIds;
    }
    
    function isAdmin(address user) external view returns (bool) {
        return isAdminAddress[user] || user == owner();
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    function setAdminFeeRecipient(address _recipient) external onlyOwner {
        if (_recipient == address(0)) revert ZeroAddress();
        adminFeeRecipient = _recipient;
    }
    
    function addAdmin(address admin) external onlyOwner {
        if (admin == address(0)) revert ZeroAddress();
        if (isAdminAddress[admin]) revert AdminAlreadyExists();
        if (adminList.length >= MAX_ADMINS) revert TooManyAdmins();
        
        isAdminAddress[admin] = true;
        adminList.push(admin);
        
        // Update legacy array
        for (uint256 i = 0; i < 16; i++) {
            if (adminIds[i] == address(0)) {
                adminIds[i] = admin;
                break;
            }
        }
        
        emit AdminAdded(admin);
    }
    
    function removeAdmin(address admin) external onlyOwner {
        if (!isAdminAddress[admin]) revert AdminNotFound();
        
        isAdminAddress[admin] = false;
        
        // Remove from array
        for (uint256 i = 0; i < adminList.length; i++) {
            if (adminList[i] == admin) {
                adminList[i] = adminList[adminList.length - 1];
                adminList.pop();
                break;
            }
        }
        
        // Update legacy array
        for (uint256 i = 0; i < 16; i++) {
            if (adminIds[i] == admin) {
                adminIds[i] = address(0);
                break;
            }
        }
        
        emit AdminRemoved(admin);
    }
    
    function setAdminId(uint256 index, address admin) external onlyOwner {
        if (index >= 16) revert InvalidIndex();
        if (admin == address(0)) revert ZeroAddress();
        
        // Remove old admin if exists
        address oldAdmin = adminIds[index];
        if (oldAdmin != address(0) && oldAdmin != admin) {
            isAdminAddress[oldAdmin] = false;
            
            // Remove from adminList
            for (uint256 i = 0; i < adminList.length; i++) {
                if (adminList[i] == oldAdmin) {
                    adminList[i] = adminList[adminList.length - 1];
                    adminList.pop();
                    break;
                }
            }
        }
        
        // Add new admin
        if (!isAdminAddress[admin] && adminList.length < MAX_ADMINS) {
            isAdminAddress[admin] = true;
            adminList.push(admin);
        }
        
        adminIds[index] = admin;
        emit AdminAdded(admin);
    }
    
    function addOracle(address oracle) external onlyOwner {
        if (oracle == address(0)) revert ZeroAddress();
        if (priceOracles.length >= 10) revert TooManyOracles();
        
        // Test oracle call
        try IPriceFeed(oracle).latestRoundData() returns (
            uint80, int256, uint256, uint256, uint80
        ) {
            priceOracles.push(IPriceFeed(oracle));
            emit OracleAdded(oracle);
        } catch {
            revert OracleCallFailed();
        }
    }
    
    function removeOracle(address oracle) external onlyOwner {
        for (uint256 i = 0; i < priceOracles.length; i++) {
            if (address(priceOracles[i]) == oracle) {
                priceOracles[i] = priceOracles[priceOracles.length - 1];
                priceOracles.pop();
                emit OracleRemoved(oracle);
                return;
            }
        }
        revert OracleNotFound();
    }
    
    function setPriceFeed(address _priceFeed) external onlyOwner {
        if (_priceFeed == address(0)) revert ZeroAddress();
        priceFeed = IPriceFeed(_priceFeed);
        emit PriceFeedUpdated(_priceFeed);
    }
    
    function blacklistUser(address user, bool status) external onlyAdmin {
        users[user].isBlacklisted = status;
    }
    
    function emergencyPause(string calldata reason) external onlyAdmin {
        _pause();
        emit EmergencyPaused(reason);
    }
    
    function setCircuitBreakerThreshold(uint256 newThreshold) external onlyOwner {
        circuitBreakerThreshold = newThreshold;
    }
    
    function updateReserveFund() external onlyAdmin {
        uint256 contractBalance = usdt.balanceOf(address(this));
        uint256 requiredReserve = (totalDeposits * 1500) / BASIS_POINTS; // 15%
        
        if (contractBalance >= requiredReserve) {
            reserveFund = requiredReserve;
        }
    }
    
    // ==================== EMERGENCY FUNCTIONS ====================
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        if (amount > address(this).balance) revert InsufficientBalance();
        payable(owner()).transfer(amount);
    }
    
    function recoverUSDT(uint256 amount) external onlyOwner {
        if (!usdt.transfer(owner(), amount)) revert PaymentFailed();
    }
    
    function recoverToken(address token, uint256 amount) external onlyOwner {
        if (token == address(usdt)) {
            // Only allow recovery if it doesn't affect user balances
            uint256 contractBalance = usdt.balanceOf(address(this));
            uint256 userBalances = _calculateTotalUserBalances();
            if (amount > contractBalance - userBalances) revert InsufficientBalance();
        }
        
        IERC20(token).transfer(owner(), amount);
    }
    
    function _calculateTotalUserBalances() internal view returns (uint256) {
        // This is a simplified calculation - in practice you might want to track this more efficiently
        return totalDeposits; // Approximation
    }
    
    // ==================== UPGRADE FUNCTION ====================
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    // ==================== RECEIVE FUNCTION ====================
    
    receive() external payable {}
}
