// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

// Optimized libraries for gas efficiency and modularity
import "./libraries/Errors.sol";
import "./libraries/CoreOptimized.sol";

// OpenZeppelin upgradeable contracts
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LEAD FIVE: THE DECENTRALIZED INCENTIVE PLATFORM
 * @notice Smart Rewards, Powered by Blockchain - USDT-Only Version
 * @dev Lead Five v1.0.0 is a pure USDT incentive protocol built on Binance Smart Chain.
 *      This version removes all BNB/Oracle complexity for simplified, secure operation.
 *      Features algorithmic reward distribution, multi-audited security, and sustainable 
 *      4x earnings cap—all verifiable on-chain with USDT-only payments.
 *      
 *      Key Features:
 *      - USDT-only payments (no BNB option)
 *      - 2-parameter register function: register(sponsor, packageLevel)
 *      - 6-decimal internal accounting with 18-decimal BSC compatibility
 *      - Complete business logic preservation
 *      - Gas-optimized operations
 *      - Comprehensive read/write functions
 *      
 *      Version: 1.0.0 - Production Ready USDT-Only
 * @author LeadFive Development Team
 */
contract LeadFive is 
    Initializable, 
    UUPSUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable 
{
    using CoreOptimized for *;

    // ========== STATE VARIABLES ==========
    
    // Core user and package management (gas-optimized with packed structs)
    mapping(address => CoreOptimized.PackedUser) public users;
    mapping(uint8 => CoreOptimized.PackedPackage) public packages;
    mapping(address => address[]) public directNetwork;
    mapping(address => address[2]) public smartTreeMatrix;
    mapping(uint32 => address) public userIds;
    
    // Pool management - Algorithmic reward distribution
    CoreOptimized.PackedPool public leadershipPool;
    CoreOptimized.PackedPool public communityPool;
    CoreOptimized.PackedPool public clubPool;
    CoreOptimized.PackedPool public algorithmicPool;
    
    // Network optimization mappings (cached for gas efficiency)
    mapping(address => uint256) public leftLegVolume;
    mapping(address => uint256) public rightLegVolume;
    mapping(address => uint32) public networkSizeCache;
    mapping(address => uint256) public lastNetworkUpdate;
    
    // Security and rate limiting
    mapping(address => bool) public isAdminAddress;
    mapping(address => uint256) public dailyWithdrawals;
    mapping(address => uint256) public lastWithdrawalDay;
    mapping(address => uint256) public userLastTx;
    
    // Circuit breaker system
    uint256 public circuitBreakerThreshold;
    bool public circuitBreakerTriggered;
    uint256 public lastTxBlock;
    
    // Global statistics (packed for gas efficiency)
    uint32 public totalUsers;
    uint96 public totalPlatformFeesCollected;
    uint256 public dailyWithdrawalLimit;
    IERC20 public usdt;
    address public platformFeeRecipient;
    
    // USDT configuration for decimal handling
    uint8 public usdtDecimals;
    
    // Upgradeable proxy storage gap for future variables
    uint256[49] private __gap;

    // ========== EVENTS ==========
    
    // Core business events
    event UserRegistered(address indexed user, address indexed sponsor, uint8 packageLevel, uint96 amount);
    event PackageUpgraded(address indexed user, uint8 newLevel, uint96 amount);
    event RewardDistributed(address indexed recipient, uint96 amount, uint8 rewardType);
    event UserWithdrawal(address indexed user, uint96 amount);
    event PoolDistributed(uint8 poolType, uint96 amount);
    event PlatformFeeCollected(uint96 amount, address indexed user);
    
    // Security and admin events
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event CircuitBreakerTriggered(uint256 amount, uint256 threshold);
    event CircuitBreakerReset();
    event EarningsCapReached(address indexed user, uint96 exceededAmount);
    
    // Algorithmic system events
    event NetworkPositionAssigned(address indexed user, uint32 position);
    event AlgorithmicBonusDistributed(address indexed user, uint96 amount);
    event MatrixCycleCompleted(address indexed user, uint256 cycle);
    
    // Production launch events
    event ProductionInitialized(uint8 usdtDecimals);
    event USDTPaymentProcessed(address indexed user, uint256 amount18, uint96 amount6);

    // ========== MODIFIERS ==========
    
    modifier onlyAdmin() {
        require(isAdminAddress[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier antiMEV() {
        require(lastTxBlock != block.number && userLastTx[msg.sender] != block.number, "MEV protection");
        lastTxBlock = block.number;
        userLastTx[msg.sender] = block.number;
        _;
    }
    
    modifier circuitBreakerCheck(uint256 amount) {
        if (amount > circuitBreakerThreshold && circuitBreakerThreshold > 0) {
            circuitBreakerTriggered = true;
            emit CircuitBreakerTriggered(amount, circuitBreakerThreshold);
            revert Errors.CircuitBreakerActivated();
        }
        _;
    }
    
    modifier validPackageLevel(uint8 packageLevel) {
        require(packageLevel > 0 && packageLevel <= 4, "Invalid package level");
        _;
    }
    
    modifier registeredUser(address user) {
        require(users[user].isRegistered(), "User not registered");
        _;
    }

    // ========== INITIALIZATION ==========
    
    function initialize(address _usdt) external initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        // Initialize USDT token
        if (_usdt == address(0)) {
            revert Errors.ZeroAddress();
        }
        usdt = IERC20(_usdt);
        
        // Set USDT decimals to 6 (for internal accounting)
        usdtDecimals = 6;
        
        // Initialize packages with correct pricing
        _initializePackages();
        
        // Set initial security parameters
        circuitBreakerThreshold = 1000000 * 10**6; // 1M USDT threshold (6 decimals)
        dailyWithdrawalLimit = 1000 * 10**6; // 1000 USDT with 6 decimals
        
        // Set initial admin
        isAdminAddress[msg.sender] = true;
        platformFeeRecipient = msg.sender;

        // Create platform user (root user)
        CoreOptimized.PackedUser storage platformUser = users[msg.sender];
        platformUser.setRegistered(true);
        platformUser.packageLevel = 4;
        platformUser.rank = 5;
        platformUser.earningsCap = type(uint96).max;
        platformUser.registrationTime = uint32(block.timestamp);
        platformUser.withdrawalRate = 90;
        userIds[1] = msg.sender;
        totalUsers = 1;

        emit AdminAdded(msg.sender);
    }
    
    /**
     * @dev Initialize production features for existing deployment
     * This function should be called immediately after deployment upgrade
     */
    function initializeProduction() external onlyOwner {
        require(usdtDecimals == 0, "Production already initialized");
        
        // Set USDT decimals to 6 (internal accounting)
        usdtDecimals = 6;
        
        // Update package prices with correct 6 decimals
        _updatePackagePrices();
        
        // Update daily withdrawal limit
        dailyWithdrawalLimit = uint96(1000 * 10**6); // 1000 USDT with 6 decimals
        
        emit ProductionInitialized(usdtDecimals);
    }
    
    function _initializePackages() private {
        // Package prices using 6 decimals (internal accounting)
        // BSC USDT uses 18 decimals, conversion handled in payment processing
        
        // Package Level 1: $30 USDT
        packages[1] = CoreOptimized.PackedPackage({
            price: uint96(30 * 10**6), // 30 USDT with 6 decimals
            directBonus: 4000, // 40%
            levelBonus: 1000, // 10%
            uplineBonus: 0, // Not used
            leaderBonus: 1000, // 10%
            helpBonus: 1000, // 10%
            clubBonus: 1000 // 10%
        });
        
        // Package Level 2: $50 USDT
        packages[2] = CoreOptimized.PackedPackage({
            price: uint96(50 * 10**6), // 50 USDT with 6 decimals
            directBonus: 4000, // 40%
            levelBonus: 1000, // 10%
            uplineBonus: 0, // Not used
            leaderBonus: 1000, // 10%
            helpBonus: 1000, // 10%
            clubBonus: 1500 // 15%
        });
        
        // Package Level 3: $100 USDT
        packages[3] = CoreOptimized.PackedPackage({
            price: uint96(100 * 10**6), // 100 USDT with 6 decimals
            directBonus: 4000, // 40%
            levelBonus: 1000, // 10%
            uplineBonus: 0, // Not used
            leaderBonus: 1000, // 10%
            helpBonus: 1000, // 10%
            clubBonus: 2000 // 20%
        });
        
        // Package Level 4: $200 USDT
        packages[4] = CoreOptimized.PackedPackage({
            price: uint96(200 * 10**6), // 200 USDT with 6 decimals
            directBonus: 4000, // 40%
            levelBonus: 1000, // 10%
            uplineBonus: 0, // Not used
            leaderBonus: 1000, // 10%
            helpBonus: 1000, // 10%
            clubBonus: 2500 // 25%
        });
    }
    
    function _updatePackagePrices() private {
        // Update package prices to use 6 decimals (internal accounting)
        packages[1].price = uint96(30 * 10**6);   // 30 USDT
        packages[2].price = uint96(50 * 10**6);   // 50 USDT
        packages[3].price = uint96(100 * 10**6);  // 100 USDT
        packages[4].price = uint96(200 * 10**6);  // 200 USDT
    }

    // ========== REGISTRATION FUNCTIONS (USDT-ONLY) ==========
    
    /**
     * @dev Register new user with USDT payment only
     * @param sponsor The sponsor address (can be address(0) for no sponsor)
     * @param packageLevel Package level (1-4)
     */
    function register(
        address sponsor,
        uint8 packageLevel
    ) external 
      nonReentrant 
      whenNotPaused 
      antiMEV 
      validPackageLevel(packageLevel)
      circuitBreakerCheck(packages[packageLevel].price) 
    {
        require(!users[msg.sender].isRegistered(), "Already registered");
        require(users[sponsor].isRegistered() || sponsor == address(0), "Invalid sponsor");
        
        // Process USDT payment only (no BNB option)
        uint96 packagePrice = _processUSDTPayment(packageLevel);
        
        // Register user with optimized data structure
        _registerUserInternal(sponsor, packageLevel, packagePrice);
        
        // Process payments and rewards
        _processRegistrationPayments(sponsor, packageLevel, packagePrice);
        
        // Update network structures
        _updateNetworkStructure(msg.sender, sponsor);
        
        emit UserRegistered(msg.sender, sponsor, packageLevel, packagePrice);
    }

    /**
     * @dev Upgrade user package with USDT payment
     * @param newLevel New package level (must be higher than current)
     */
    function upgradePackage(uint8 newLevel) 
        external 
        nonReentrant 
        whenNotPaused 
        antiMEV 
        validPackageLevel(newLevel)
    {
        CoreOptimized.PackedUser storage user = users[msg.sender];
        if (!user.isRegistered()) revert Errors.UserNotRegistered(msg.sender);
        if (user.isBlacklisted()) revert Errors.UserBlacklisted(msg.sender);
        if (newLevel <= user.packageLevel) revert Errors.InvalidPackageLevel(newLevel);
        
        uint96 amount = _processUSDTPayment(newLevel);
        
        // Update user data
        user.packageLevel = newLevel;
        user.totalInvestment += amount;
        user.earningsCap += uint96(uint256(amount) * 4); // 4x earnings cap
        
        // Process upgrade payments
        _processRegistrationPayments(user.referrer, newLevel, amount);
        
        emit PackageUpgraded(msg.sender, newLevel, amount);
    }

    /**
     * @dev Process USDT payment with decimal conversion
     * @param packageLevel Package level for pricing
     * @return packagePrice Price in 6-decimal format
     */
    function _processUSDTPayment(uint8 packageLevel) internal returns (uint96) {
        uint96 packagePrice = packages[packageLevel].price; // 6 decimals
        require(packagePrice > 0, "Package price not set");
        
        // Convert 6-decimal package price to 18-decimal BSC USDT amount
        uint256 usdtAmount = uint256(packagePrice) * 10**12; // Convert to 18 decimals
        
        // Gas-optimized balance and allowance checks
        IERC20 usdtToken = usdt; // Load once to save gas
        require(usdtToken.balanceOf(msg.sender) >= usdtAmount, "Insufficient USDT balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= usdtAmount, "Insufficient USDT allowance");
        
        // Execute transfer
        require(usdtToken.transferFrom(msg.sender, address(this), usdtAmount), "USDT transfer failed");
        
        // Emit payment event for transparency
        emit USDTPaymentProcessed(msg.sender, usdtAmount, packagePrice);
        
        return packagePrice; // Return 6-decimal amount for internal accounting
    }
    
    /**
     * @dev Internal user registration with gas optimization
     */
    function _registerUserInternal(
        address sponsor,
        uint8 packageLevel,
        uint96 packagePrice
    ) private {
        uint32 newUserId = ++totalUsers;
        
        // Gas-optimized user creation
        CoreOptimized.PackedUser storage newUser = users[msg.sender];
        newUser.setRegistered(true);
        newUser.packageLevel = packageLevel;
        newUser.referrer = sponsor;
        newUser.balance = 0;
        newUser.totalEarnings = 0;
        newUser.totalInvestment = packagePrice;
        newUser.earningsCap = packagePrice * 4; // 4x earnings cap
        newUser.directReferrals = 0;
        newUser.teamSize = 0;
        newUser.registrationTime = uint32(block.timestamp);
        newUser.withdrawalRate = 40; // Default withdrawal rate

        userIds[newUserId] = msg.sender;
        
        // Update sponsor's direct network
        if (sponsor != address(0)) {
            directNetwork[sponsor].push(msg.sender);
            users[sponsor].directReferrals++;
        }
    }

    // ========== REWARD DISTRIBUTION ==========
    
    function _processRegistrationPayments(
        address sponsor,
        uint8 packageLevel,
        uint96 packagePrice
    ) private {
        // Calculate and distribute direct bonus (40% to sponsor)
        if (sponsor != address(0)) {
            uint96 directBonus = (packagePrice * packages[packageLevel].directBonus) / 10000;
            _distributeReward(sponsor, directBonus, 1); // Type 1 = Direct bonus

            // Referrer chain distribution - optimized calculation
            uint96 chainAmount = packagePrice / 10; // 10%
            _distributeReferrerChainIncentives(msg.sender, chainAmount);
        }
        
        // Distribute level bonuses (10% across 10 levels)
        _distributeLevelBonuses(sponsor, packagePrice, packageLevel);
        
        // Allocate to pools (remaining amount after fees and bonuses)
        _allocateToPoolsOptimized(packagePrice, packageLevel);
    }
    
    function _distributeLevelBonuses(
        address startSponsor,
        uint96 packagePrice,
        uint8 packageLevel
    ) private {
        if (startSponsor == address(0)) return;
        
        address currentSponsor = startSponsor;
        uint96 levelBonus = (packagePrice * packages[packageLevel].levelBonus) / 10000;
        
        // Gas-optimized iterative implementation
        for (uint8 level = 1; level <= 10 && currentSponsor != address(0); level++) {
            if (users[currentSponsor].packageLevel >= packageLevel) {
                _distributeReward(currentSponsor, levelBonus, 2); // Type 2 = Level bonus
            }
            currentSponsor = users[currentSponsor].referrer;
        }
    }
    
    function _distributeReward(address recipient, uint96 amount, uint8 rewardType) private {
        if (recipient == address(0) || amount == 0) return;
        
        CoreOptimized.PackedUser storage user = users[recipient];
        
        // Check earnings cap
        if (user.totalEarnings + amount > user.earningsCap) {
            uint96 exceededAmount = (user.totalEarnings + amount) - user.earningsCap;
            amount = user.earningsCap - user.totalEarnings;
            if (exceededAmount > 0) {
                emit EarningsCapReached(recipient, exceededAmount);
            }
        }
        
        if (amount > 0) {
            user.balance += amount;
            user.totalEarnings += amount;
            emit RewardDistributed(recipient, amount, rewardType);
        }
    }

    function _distributeReferrerChainIncentives(address participant, uint96 amount) internal {
        if (amount == 0) return;
        
        address current = users[participant].referrer;
        uint8 level = 1;
        uint8 maxParents = 30;
        uint96 remaining = amount;
        
        // Gas-optimized distribution
        while (current != address(0) && level <= maxParents && remaining > 0) {
            CoreOptimized.PackedUser storage parentUser = users[current];
            
            if (parentUser.isRegistered() && !parentUser.isBlacklisted()) {
                uint96 perParent = remaining / (maxParents - level + 1);
                if (perParent > 0) {
                    _distributeReward(current, perParent, 5);
                    remaining -= perParent;
                }
            }
            
            current = parentUser.referrer;
            level++;
        }
        
        // Add remainder to community pool
        if (remaining > 0) {
            communityPool.balance += remaining;
        }
    }

    // ========== POOL MANAGEMENT ==========
    
    function _allocateToPoolsOptimized(uint96 packagePrice, uint8 packageLevel) private {
        CoreOptimized.PackedPackage storage packageData = packages[packageLevel];
        
        // Calculate pool allocations based on package bonuses
        uint96 leadershipShare = (packagePrice * packageData.leaderBonus) / 10000;
        uint96 communityShare = (packagePrice * packageData.helpBonus) / 10000;  
        uint96 clubShare = (packagePrice * packageData.clubBonus) / 10000;
        
        // Update pool balances
        leadershipPool.balance += leadershipShare;
        communityPool.balance += communityShare;
        clubPool.balance += clubShare;
    }
    
    function distributePool(uint8 poolType) external onlyAdmin nonReentrant {
        CoreOptimized.PackedPool storage pool = _getPool(poolType);
        require(pool.balance > 0, "Pool empty");
        
        address[] memory eligibleUsers = _getEligibleUsers(poolType);
        require(eligibleUsers.length > 0, "No eligible users");
        
        // Gas-optimized batch processing
        uint96 distributionAmount = pool.balance / uint96(eligibleUsers.length);
        uint256 batchSize = eligibleUsers.length > 50 ? 50 : eligibleUsers.length;
        
        for (uint256 i = 0; i < batchSize; i++) {
            _distributeReward(eligibleUsers[i], distributionAmount, poolType + 10);
        }
        
        pool.balance = 0;
        pool.lastDistribution = uint32(block.timestamp);
        emit PoolDistributed(poolType, distributionAmount * uint96(batchSize));
    }
    
    function _getPool(uint8 poolType) private view returns (CoreOptimized.PackedPool storage) {
        if (poolType == 1) return leadershipPool;
        if (poolType == 2) return communityPool;
        if (poolType == 3) return clubPool;
        if (poolType == 4) return algorithmicPool;
        revert("Invalid pool type");
    }
    
    function _getEligibleUsers(uint8 poolType) private view returns (address[] memory) {
        // Gas-optimized eligibility check
        address[] memory eligible = new address[](50); // Fixed size for gas optimization
        uint256 count = 0;
        
        for (uint32 i = 1; i <= totalUsers && count < 50; i++) {
            address user = userIds[i];
            CoreOptimized.PackedUser storage userData = users[user];
            
            // Pool-specific eligibility criteria
            if (userData.packageLevel >= poolType && userData.directReferrals >= poolType) {
                eligible[count] = user;
                count++;
            }
        }
        
        // Resize array to actual count
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = eligible[i];
        }
        return result;
    }

    // ========== WITHDRAWAL FUNCTIONS ==========
    
    function withdraw(uint96 amount) external 
        nonReentrant 
        whenNotPaused 
        antiMEV 
        circuitBreakerCheck(amount) 
    {
        CoreOptimized.PackedUser storage user = users[msg.sender];
        
        // Withdrawal validation
        if (!user.isRegistered()) revert Errors.UserNotRegistered(msg.sender);
        if (user.isBlacklisted()) revert Errors.UserBlacklisted(msg.sender);
        if (amount == 0) revert Errors.InvalidAmount(amount);
        if (amount > user.balance) revert Errors.InsufficientBalance(user.balance, amount);
        if (platformFeeRecipient == address(0)) revert Errors.ZeroAddress();
        
        // Minimum withdrawal threshold (1 USDT)
        require(amount >= 1e6, "Minimum withdrawal is 1 USDT");
        
        uint8 withdrawalRate = calculateWithdrawalRate(msg.sender);
        
        uint96 withdrawable = (amount * withdrawalRate) / 100;
        uint96 reinvestment = amount - withdrawable;
        uint96 platformFee = (withdrawable * 500) / 10000; // 5% platform fee
        uint96 participantReceives = withdrawable - platformFee;
        
        // Update state before external calls
        user.balance -= amount;
        user.totalWithdrawn += participantReceives;
        totalPlatformFeesCollected += platformFee;
        
        // Convert to 18-decimal USDT for transfers
        uint256 participantUSDT = uint256(participantReceives) * 10**12;
        uint256 platformUSDT = uint256(platformFee) * 10**12;
        
        // Gas-optimized transfers
        IERC20 usdtToken = usdt;
        require(usdtToken.transfer(msg.sender, participantUSDT), "User transfer failed");
        require(usdtToken.transfer(platformFeeRecipient, platformUSDT), "Platform transfer failed");
        
        // Process reinvestment
        if (reinvestment > 0) {
            _processReinvestmentDistribution(msg.sender, reinvestment);
        }
        
        emit UserWithdrawal(msg.sender, participantReceives);
        emit PlatformFeeCollected(platformFee, msg.sender);
    }

    function calculateWithdrawalRate(address user) public view returns (uint8) {
        uint32 directs = users[user].directReferrals;
        
        // Tiered withdrawal rates based on direct referrals
        if (directs >= 20) return 80;
        if (directs >= 5) return 75;
        return 70;
    }

    function _processReinvestmentDistribution(address participant, uint96 amount) internal {
        // Gas-optimized reinvestment splitting
        uint96 levelShare = amount >> 1; // amount / 2 (gas optimized)
        uint96 chainShare = amount >> 2; // amount / 4 (gas optimized)
        uint96 helpShare = amount - levelShare - chainShare;
        
        if (levelShare > 0) {
            _distributeLevelReinvestment(participant, levelShare);
        }
        
        if (chainShare > 0) {
            _distributeReferrerChainIncentives(participant, chainShare);
        }
        
        if (helpShare > 0) {
            communityPool.balance += helpShare;
        }
    }

    function _distributeLevelReinvestment(address participant, uint96 amount) internal {
        if (amount == 0) return;
        
        address current = users[participant].referrer;
        uint8 level = 1;
        uint8 maxLevels = 30;
        uint96 remaining = amount;
        
        // Gas-optimized level distribution
        while (current != address(0) && level <= maxLevels && remaining > 0) {
            CoreOptimized.PackedUser storage parentUser = users[current];
            
            if (parentUser.isRegistered() && !parentUser.isBlacklisted()) {
                uint96 levelPayout = amount / maxLevels;
                
                if (levelPayout > remaining) levelPayout = remaining;
                if (levelPayout > 0) {
                    _distributeReward(current, levelPayout, 6);
                    remaining -= levelPayout;
                }
            }
            
            current = parentUser.referrer;
            level++;
        }
        
        // Add remainder to community pool
        if (remaining > 0) {
            communityPool.balance += remaining;
        }
    }

    // ========== NETWORK MANAGEMENT ==========
    
    function _updateNetworkStructure(address user, address sponsor) private {
        if (sponsor == address(0)) return;
        
        // Smart tree matrix placement algorithm
        _assignMatrixPosition(user, sponsor);
        
        // Update team sizes up the network
        _updateTeamSizes(sponsor);
    }
    
    function _assignMatrixPosition(address user, address sponsor) private {
        address currentParent = sponsor;
        
        // Gas-optimized matrix placement
        while (currentParent != address(0)) {
            if (smartTreeMatrix[currentParent][0] == address(0)) {
                smartTreeMatrix[currentParent][0] = user;
                break;
            } else if (smartTreeMatrix[currentParent][1] == address(0)) {
                smartTreeMatrix[currentParent][1] = user;
                break;
            } else {
                currentParent = smartTreeMatrix[currentParent][0];
            }
        }
        
        emit NetworkPositionAssigned(user, totalUsers);
    }
    
    function _updateTeamSizes(address sponsor) private {
        address current = sponsor;
        
        // Gas-optimized team size update (limited depth for gas efficiency)
        for (uint8 level = 0; level < 10 && current != address(0); level++) {
            users[current].teamSize++;
            current = users[current].referrer;
        }
    }

    // ========== READ FUNCTIONS (COMPREHENSIVE) ==========
    
    function getUserBasicInfo(address user) external view returns (bool, uint8, uint96) {
        CoreOptimized.PackedUser storage userData = users[user];
        return (userData.isRegistered(), userData.packageLevel, userData.balance);
    }
    
    function getUserEarnings(address user) external view returns (uint96, uint96, uint32) {
        CoreOptimized.PackedUser storage userData = users[user];
        return (userData.totalEarnings, userData.earningsCap, userData.directReferrals);
    }
    
    function getUserNetwork(address user) external view returns (address, uint32) {
        CoreOptimized.PackedUser storage userData = users[user];
        return (userData.referrer, userData.teamSize);
    }
    
    function getUserFullInfo(address user) external view returns (
        bool registered,
        uint8 packageLevel,
        uint96 balance,
        uint96 totalEarnings,
        uint96 earningsCap,
        uint96 totalInvestment,
        uint32 directReferrals,
        address referrer,
        uint32 registrationTime
    ) {
        CoreOptimized.PackedUser storage userData = users[user];
        return (
            userData.isRegistered(),
            userData.packageLevel,
            userData.balance,
            userData.totalEarnings,
            userData.earningsCap,
            userData.totalInvestment,
            userData.directReferrals,
            userData.referrer,
            userData.registrationTime
        );
    }
    
    function getDirectReferrals(address user) external view returns (address[] memory) {
        return directNetwork[user];
    }
    
    function getPoolBalance(uint8 poolType) external view returns (uint96) {
        if (poolType == 1) return leadershipPool.balance;
        if (poolType == 2) return communityPool.balance;
        if (poolType == 3) return clubPool.balance;
        if (poolType == 4) return algorithmicPool.balance;
        return 0;
    }
    
    function getAllPoolBalances() external view returns (uint96, uint96, uint96, uint96) {
        return (
            leadershipPool.balance,
            communityPool.balance,
            clubPool.balance,
            algorithmicPool.balance
        );
    }
    
    function getMatrixPosition(address user) external view returns (address, address) {
        return (smartTreeMatrix[user][0], smartTreeMatrix[user][1]);
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getUSDTBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }
    
    function getTotalUsers() external view returns (uint32) {
        return totalUsers;
    }
    
    function getPackagePrice(uint8 packageLevel) external view validPackageLevel(packageLevel) returns (uint96) {
        return packages[packageLevel].price;
    }
    
    function getAllPackagePrices() external view returns (uint96, uint96, uint96, uint96) {
        return (
            packages[1].price,
            packages[2].price,
            packages[3].price,
            packages[4].price
        );
    }
    
    function getPackageDetails(uint8 packageLevel) external view validPackageLevel(packageLevel) returns (
        uint96 price,
        uint16 directBonus,
        uint16 levelBonus,
        uint16 leaderBonus,
        uint16 helpBonus,
        uint16 clubBonus
    ) {
        CoreOptimized.PackedPackage storage pkg = packages[packageLevel];
        return (
            pkg.price,
            pkg.directBonus,
            pkg.levelBonus,
            pkg.leaderBonus,
            pkg.helpBonus,
            pkg.clubBonus
        );
    }
    
    function getUSDTDecimals() external view returns (uint8) {
        return usdtDecimals;
    }
    
    function convertToUSDT18(uint96 amount6) public pure returns (uint256) {
        return uint256(amount6) * 10**12;
    }
    
    function convertFromUSDT18(uint256 amount18) public pure returns (uint96) {
        require(amount18 % 10**12 == 0, "Invalid conversion: not divisible");
        require(amount18 <= type(uint96).max * 10**12, "Amount too large");
        return uint96(amount18 / 10**12);
    }
    
    function getVersion() external pure returns (string memory) {
        return "1.0.0";
    }
    
    function isAdmin(address user) external view returns (bool) {
        return isAdminAddress[user] || user == owner();
    }
    
    function getPlatformStats() external view returns (
        uint32 totalUsersCount,
        uint96 totalPlatformFees,
        uint256 contractUSDTBalance,
        uint256 dailyLimit,
        bool isPaused
    ) {
        return (
            totalUsers,
            totalPlatformFeesCollected,
            usdt.balanceOf(address(this)),
            dailyWithdrawalLimit,
            paused()
        );
    }

    // ========== ADMIN FUNCTIONS ==========
    
    function setPlatformFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Zero address");
        platformFeeRecipient = _recipient;
    }

    function addAdmin(address admin) external onlyOwner {
        require(admin != address(0), "Invalid admin");
        isAdminAddress[admin] = true;
        emit AdminAdded(admin);
    }
    
    function removeAdmin(address admin) external onlyOwner {
        isAdminAddress[admin] = false;
        emit AdminRemoved(admin);
    }
    
    function setCircuitBreaker(uint256 threshold) external onlyAdmin {
        circuitBreakerThreshold = threshold;
        circuitBreakerTriggered = false;
        emit CircuitBreakerReset();
    }
    
    function updatePackagePrices() external onlyOwner {
        _updatePackagePrices();
    }
    
    function emergencyPause() external onlyAdmin {
        _pause();
    }
    
    function emergencyUnpause() external onlyAdmin {
        _unpause();
    }
    
    function setDailyWithdrawalLimit(uint256 newLimit) external onlyAdmin {
        dailyWithdrawalLimit = newLimit;
    }

    // ========== UPGRADE FUNCTIONS ==========
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ========== EMERGENCY FUNCTIONS ==========
    
    function emergencyWithdraw() external onlyOwner {
        require(circuitBreakerTriggered, "Only in emergency");
        
        // Emergency USDT withdrawal
        uint256 usdtBalance = usdt.balanceOf(address(this));
        if (usdtBalance > 0) {
            require(usdt.transfer(owner(), usdtBalance), "Emergency USDT withdrawal failed");
        }
        
        // Emergency BNB withdrawal (if any accidentally sent)
        uint256 bnbBalance = address(this).balance;
        if (bnbBalance > 0) {
            (bool success, ) = payable(owner()).call{value: bnbBalance}("");
            require(success, "Emergency BNB withdrawal failed");
        }
    }
    
    // ========== FALLBACK FUNCTIONS ==========
    
    // Allow contract to receive BNB (in case of accidental transfers)
    receive() external payable {
        // BNB received but not processed (USDT-only contract)
    }
    
    fallback() external payable {
        // Fallback for unknown calls
    }
}
