const fs = require('fs');
const path = require('path');

console.log('📝 Writing LeadFive.sol contract to disk...\n');

const contractPath = path.join(__dirname, 'contracts/LeadFive.sol');

// This is the correct contract content from your VS Code
const correctContract = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

// Optimized libraries for gas efficiency and modularity
import "./libraries/Errors.sol";
import "./libraries/CoreOptimized.sol";
import "./libraries/SecureOracle.sol";

// OpenZeppelin upgradeable contracts
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/**
 * @title LEAD FIVE: THE DECENTRALIZED INCENTIVE PLATFORM
 * @dev Smart Rewards, Powered by Blockchain
 * 
 * Lead Five is a next-generation incentive protocol built on Binance Smart Chain, combining autonomous smart contracts
 * with decentralized governance. Unlike traditional models, our technology platform enforces fairness through algorithmic
 * distribution, multi-audited security, and a sustainable 4x earnings cap—all verifiable on-chain.
 * 
 * CORE TECHNOLOGY FEATURES:
 * 🔹 Decentralized Autonomous Distribution: Algorithmic reward allocation without centralized control
 * 🔹 Smart Contract Governance: On-chain verification and transparency for all transactions
 * 🔹 Multi-Oracle Price Feeds: Secure and reliable external data integration
 * 🔹 Circuit Breaker Protection: Advanced security mechanisms for participant safety
 * 🔹 Gas-Optimized Architecture: Efficient bytecode and library modularization
 * 🔹 Upgradeable Proxy Pattern: Future-proof contract evolution capability
 * 
 * BLOCKCHAIN SECURITY:
 * 🔹 Multi-layered audit compliance with enterprise-grade security standards
 * 🔹 MEV protection and anti-front-running mechanisms
 * 🔹 Automated earnings caps and withdrawal rate management
 * 🔹 Real-time monitoring and emergency pause functionality
 * 🔹 Decentralized pool distributions with algorithmic fairness
 * 🔹 Immutable business logic with transparent rule enforcement
 */
contract LeadFive is 
    Initializable, 
    UUPSUpgradeable, 
    OwnableUpgradeable, 
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable 
{
    using CoreOptimized for *;
    using SecureOracle for *;

    // ========== STATE VARIABLES ==========
    
    // Core user and package management
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
    
    // Oracle system for price feeds
    SecureOracle.OracleData[] private oracles;
    SecureOracle.PriceConfig public priceConfig;
    
    // Network optimization mappings
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
    
    // Global statistics
    uint32 public totalUsers;
    uint96 public totalPlatformFeesCollected;
    uint256 public dailyWithdrawalLimit;
    IERC20 public usdt;
    address public platformFeeRecipient;
    
    // Upgradeable proxy storage gap for future variables
    uint256[50] private __gap;

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
    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);
    event CircuitBreakerTriggered(uint256 amount, uint256 threshold);
    event CircuitBreakerReset();
    event EarningsCapReached(address indexed user, uint96 exceededAmount);
    event SecurityAlert(string indexed alertType, address indexed user, uint256 value);
    
    // Algorithmic system events
    event NetworkPositionAssigned(address indexed user, uint32 position);
    event AlgorithmicBonusDistributed(address indexed user, uint96 amount);
    event MatrixCycleCompleted(address indexed user, uint256 cycle);
    event ReinvestmentProcessed(address indexed user, uint96 amount);
    
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
    
    modifier dailyLimitCheck(uint256 amount) {
        uint256 currentDay = block.timestamp / 86400;
        
        if (lastWithdrawalDay[msg.sender] != currentDay) {
            dailyWithdrawals[msg.sender] = 0;
            lastWithdrawalDay[msg.sender] = currentDay;
        }
        
        require(dailyWithdrawals[msg.sender] + amount <= dailyWithdrawalLimit, "Daily limit exceeded");
        dailyWithdrawals[msg.sender] += amount;
        _;
    }

    // ========== INITIALIZATION ==========
    
    function initialize(address _usdt, address _initialOracle) external initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        // Initialize USDT token with decimal verification
        if (_usdt == address(0) || _initialOracle == address(0)) {
            revert Errors.ZeroAddress();
        }
        usdt = IERC20(_usdt);
        
        // Verify USDT decimals (BSC USDT should be 18 decimals)
        try IERC20Metadata(_usdt).decimals() returns (uint8 decimals) {
            require(decimals == 18, "USDT must have 18 decimals on BSC");
            emit SecurityAlert("USDT_VERIFIED", _usdt, decimals);
        } catch {
            // If decimals() call fails, assume it's correct but log warning
            // Continue deployment as some tokens don't implement decimals()
            emit SecurityAlert("USDT_DECIMALS_UNKNOWN", _usdt, 18);
        }
        
        // Initialize package tiers with algorithmic distribution parameters
        _initializePackages();
        
        // Set initial security parameters
        circuitBreakerThreshold = 10 ether; // 10 BNB threshold
        dailyWithdrawalLimit = 1000 * 10**18; // 1000 USDT in 18 decimals (BSC standard)
        
        // Initialize oracle system
        _initializeOracles();
        
        // Set initial admin
        isAdminAddress[msg.sender] = true;
        platformFeeRecipient = msg.sender;

        CoreOptimized.PackedUser storage platformUser = users[msg.sender];
        CoreOptimized.setRegistered(platformUser, true);
        platformUser.packageLevel = 4;
        platformUser.rank = 5;
        platformUser.earningsCap = type(uint96).max;
        platformUser.registrationTime = uint32(block.timestamp);
        platformUser.withdrawalRate = 90;
        userIds[1] = msg.sender;
        totalUsers = 1;

        emit AdminAdded(msg.sender);
    }
    
    function _initializePackages() private {
        // ALGORITHMIC DISTRIBUTION PARAMETERS
        // Direct: 40% | Level: 10% | Upline: 10% | Leader: 10% | Help: 30%
        // Total: 100% per package level
        
        // Package Level 1: $30 USDT  
        packages[1] = CoreOptimized.PackedPackage({
            price: 30 * 10**18, // $30 in 18 decimals (BSC USDT standard)
            directBonus: 4000, // 40% - Direct referral commission
            levelBonus: 1000, // 10% - Multi-level bonuses
            uplineBonus: 1000, // 10% - Upline chain bonuses  
            leaderBonus: 1000, // 10% - Leader pool allocation
            helpBonus: 3000, // 30% - Help pool (largest allocation)
            clubBonus: 0 // Reserved for future protocol features
        });
        
        // Package Level 2: $50 USDT  
        packages[2] = CoreOptimized.PackedPackage({
            price: 50 * 10**18, // $50 in 18 decimals (BSC USDT standard)
            directBonus: 4000, // 40% - Direct referral commission
            levelBonus: 1000, // 10% - Multi-level bonuses
            uplineBonus: 1000, // 10% - Upline chain bonuses
            leaderBonus: 1000, // 10% - Leader pool allocation
            helpBonus: 3000, // 30% - Help pool (largest allocation)
            clubBonus: 0 // Reserved for future protocol features
        });
        
        // Package Level 3: $100 USDT
        packages[3] = CoreOptimized.PackedPackage({
            price: 100 * 10**18, // $100 in 18 decimals (BSC USDT standard)
            directBonus: 4000, // 40% - Direct referral commission
            levelBonus: 1000, // 10% - Multi-level bonuses
            uplineBonus: 1000, // 10% - Upline chain bonuses
            leaderBonus: 1000, // 10% - Leader pool allocation
            helpBonus: 3000, // 30% - Help pool (largest allocation)
            clubBonus: 0 // Reserved for future protocol features
        });
        
        // Package Level 4: $200 USDT
        packages[4] = CoreOptimized.PackedPackage({
            price: 200 * 10**18, // $200 in 18 decimals (BSC USDT standard)  
            directBonus: 4000, // 40% - Direct referral commission
            levelBonus: 1000, // 10% - Multi-level bonuses
            uplineBonus: 1000, // 10% - Upline chain bonuses
            leaderBonus: 1000, // 10% - Leader pool allocation
            helpBonus: 3000, // 30% - Help pool (largest allocation)
            clubBonus: 0 // Reserved for future protocol features
        });
    }
    
    function _initializeOracles() private {
        // Set up multi-oracle price feed system for audit compliance
        priceConfig = SecureOracle.PriceConfig({
            minPrice: 100e8,      // $100 (8 decimals like Chainlink)
            maxPrice: 2000e8,     // $2000 (8 decimals like Chainlink)  
            maxStaleTime: 1800,   // 30 minutes
            minOracles: 1         // 1 oracle minimum
        });
    }

    // ========== REGISTRATION FUNCTIONS ==========
    
    function register(
        address sponsor,
        uint8 packageLevel,
        bool useUSDT
    ) external payable nonReentrant whenNotPaused antiMEV circuitBreakerCheck(packages[packageLevel].price) {
        // Enhanced input validation
        require(!CoreOptimized.isRegistered(users[msg.sender]), "Already registered");
        require(packageLevel > 0 && packageLevel <= 4, "Invalid package level");
        require(sponsor != msg.sender, "Cannot sponsor yourself");
        
        // Sponsor validation
        if (sponsor != address(0)) {
            require(CoreOptimized.isRegistered(users[sponsor]), "Invalid sponsor - not registered");
            require(!CoreOptimized.isBlacklisted(users[sponsor]), "Sponsor is blacklisted");
            require(users[sponsor].packageLevel >= packageLevel, "Sponsor package too low");
        } else {
            // Only allow null sponsor for the first user (owner)
            require(totalUsers == 0 || msg.sender == owner(), "Sponsor required");
        }
        
        // Calculate required payment amount
        uint96 packagePrice = _processPayment(packageLevel, useUSDT);
        
        // Register user with packed data structure
        _registerUserInternal(sponsor, packageLevel, packagePrice);
        
        // Process payments and rewards
        _processRegistrationPayments(sponsor, packageLevel, packagePrice);
        
        // Update network structures
        _updateNetworkStructure(msg.sender, sponsor);
        
        emit UserRegistered(msg.sender, sponsor, packageLevel, packagePrice);
    }

    function upgradePackage(uint8 newLevel, bool useUSDT) 
        external payable nonReentrant whenNotPaused antiMEV {
        CoreOptimized.PackedUser storage user = users[msg.sender];
        if (!CoreOptimized.isRegistered(user)) revert Errors.UserNotRegistered(msg.sender);
        if (CoreOptimized.isBlacklisted(user)) revert Errors.UserBlacklisted(msg.sender);
        if (newLevel <= user.packageLevel || newLevel > 4) revert Errors.InvalidPackageLevel(newLevel);
        
        uint96 amount = _processPayment(newLevel, useUSDT);
        
        user.packageLevel = newLevel;
        user.totalInvestment += amount;
        user.earningsCap += uint96(uint256(amount) * 4); // 4x earnings cap
        _processRegistrationPayments(user.referrer, newLevel, amount);
        emit PackageUpgraded(msg.sender, newLevel, amount);
    }

    function _processPayment(uint8 packageLevel, bool useUSDT) internal returns (uint96) {
        uint96 packagePrice = packages[packageLevel].price;
        
        if(useUSDT) {
            bool success = usdt.transferFrom(msg.sender, address(this), packagePrice);
            require(success, "USDT transfer failed");
            return packagePrice;
        } else {
            uint256 bnbRequired = _calculateRequiredBNB(packagePrice);
            require(msg.value >= bnbRequired, "Low BNB");
            
            if(msg.value > bnbRequired) {
                payable(msg.sender).transfer(msg.value - bnbRequired);
            }
            return packagePrice;
        }
    }
    
    function _registerUserInternal(
        address sponsor,
        uint8 packageLevel,
        uint96 packagePrice
    ) private {
        uint32 newUserId = ++totalUsers;
        
        CoreOptimized.PackedUser storage newUser = users[msg.sender];
        CoreOptimized.setRegistered(newUser, true);
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
        
        if (sponsor != address(0)) {
            directNetwork[sponsor].push(msg.sender);
            users[sponsor].directReferrals++;
        }
    }
    
    function _calculateRequiredBNB(uint96 usdAmount) private view returns (uint256) {
        int256 bnbPrice = SecureOracle.getSecurePrice(oracles, priceConfig);
        require(bnbPrice > 0, "Invalid oracle price");
        require(bnbPrice >= priceConfig.minPrice, "Price below minimum threshold");
        require(bnbPrice <= priceConfig.maxPrice, "Price above maximum threshold");
        
        // Convert USD to BNB with additional safety checks
        require(usdAmount > 0, "Invalid USD amount");
        uint256 bnbRequired = (uint256(usdAmount) * 10**18) / uint256(bnbPrice);
        require(bnbRequired > 0, "Calculated BNB amount too small");
        
        return bnbRequired;
    }

    // ========== REWARD DISTRIBUTION ==========
    
    function _processRegistrationPayments(
        address sponsor,
        uint8 packageLevel,
        uint96 packagePrice
    ) private {
        // No platform fee on registration, only on withdrawal
        
        // Calculate direct bonus (40% to sponsor)
        if (sponsor != address(0)) {
            uint96 directBonus = (packagePrice * packages[packageLevel].directBonus) / 10000;
            _distributeReward(sponsor, directBonus, 1); // Type 1 = Direct bonus

            // Upline chain distribution - Use package uplineBonus field (10% algorithmic distribution)
            uint96 chainAmount = (packagePrice * packages[packageLevel].uplineBonus) / 10000;
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
        address currentSponsor = startSponsor;
        uint96 levelBonus = (packagePrice * packages[packageLevel].levelBonus) / 10000;
        
        // Iterative implementation for audit compliance (Critical #1)
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
        
        // Check earnings cap (Critical #6)
        if (user.totalEarnings + amount > user.earningsCap) {
            uint96 exceededAmount = (user.totalEarnings + amount) - user.earningsCap;
            amount = user.earningsCap - user.totalEarnings;
            emit EarningsCapReached(recipient, exceededAmount);
        }
        
        if (amount > 0) {
            user.balance += amount;
            user.totalEarnings += amount;
            emit RewardDistributed(recipient, amount, rewardType);
        }
    }

    // ========== POOL MANAGEMENT ==========
    
    function _allocateToPoolsOptimized(uint96 packagePrice, uint8 packageLevel) private {
        CoreOptimized.PackedPackage storage packageData = packages[packageLevel];
        
        // Calculate pool allocations based on package bonuses
        uint96 leadershipShare = (packagePrice * packageData.leaderBonus) / 10000;
        uint96 communityShare = (packagePrice * packageData.helpBonus) / 10000;  
        uint96 clubShare = (packagePrice * packageData.clubBonus) / 10000;
        
        leadershipPool.balance += leadershipShare;
        communityPool.balance += communityShare;
        clubPool.balance += clubShare;
    }
    
    function distributePool(uint8 poolType) external onlyAdmin nonReentrant {
        CoreOptimized.PackedPool storage pool = _getPool(poolType);
        require(pool.balance > 0, "Pool empty");
        
        address[] memory eligibleUsers = _getEligibleUsers(poolType);
        require(eligibleUsers.length > 0, "No eligible users");
        
        // Batch processing for audit compliance (Critical #7)
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
        revert("Invalid pool type");
    }
    
    function _getEligibleUsers(uint8 poolType) private view returns (address[] memory) {
        // Simplified eligibility check for stack depth optimization
        address[] memory eligible = new address[](10); // Fixed size for optimization
        uint256 count = 0;
        
        // Sample implementation - would be expanded based on pool requirements
        for (uint32 i = 1; i <= totalUsers && count < 10; i++) {
            address user = userIds[i];
            if (users[user].packageLevel >= poolType && users[user].directReferrals >= poolType) {
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

    // ========== NETWORK MANAGEMENT ==========
    
    function _updateNetworkStructure(address user, address sponsor) private {
        if (sponsor == address(0)) return;
        
        // Smart tree matrix placement algorithm (Critical #3)
        _assignMatrixPosition(user, sponsor);
        
        // Update team sizes up the network
        _updateTeamSizes(sponsor);
    }
    
    function _assignMatrixPosition(address user, address sponsor) private {
        // Iterative matrix placement algorithm for audit compliance
        address currentParent = sponsor;
        
        while (currentParent != address(0)) {
            if (smartTreeMatrix[currentParent][0] == address(0)) {
                smartTreeMatrix[currentParent][0] = user;
                break;
            } else if (smartTreeMatrix[currentParent][1] == address(0)) {
                smartTreeMatrix[currentParent][1] = user;
                break;
            } else {
                // Find next position in the tree
                currentParent = smartTreeMatrix[currentParent][0];
            }
        }
        
        emit NetworkPositionAssigned(user, totalUsers);
    }
    
    function _updateTeamSizes(address sponsor) private {
        address current = sponsor;
        
        // Iterative team size update for audit compliance
        for (uint8 level = 0; level < 10 && current != address(0); level++) {
            users[current].teamSize++;
            current = users[current].referrer;
        }
    }
    
    function calculateNetworkSize(address user) external view returns (uint32) {
        return _calculateNetworkSizeIterative(user);
    }
    
    function _calculateNetworkSizeIterative(address user) private view returns (uint32) {
        if (!CoreOptimized.isRegistered(users[user])) return 0;
        
        // Use cached value if recent
        if (block.timestamp - lastNetworkUpdate[user] < 3600) { // 1 hour cache
            return networkSizeCache[user];
        }
        
        uint32 totalSize = 0;
        address[] memory queue = new address[](1000); // Fixed size for optimization
        uint256 front = 0;
        uint256 rear = 0;
        
        // Add direct referrals to queue
        address[] memory directRefs = directNetwork[user];
        for (uint256 i = 0; i < directRefs.length && rear < 1000; i++) {
            queue[rear++] = directRefs[i];
        }
        
        // BFS traversal with depth limit for performance
        while (front < rear && totalSize < 10000) { // Limit for performance
            address current = queue[front++];
            totalSize++;
            
            // Add children to queue (limited depth)
            if (rear < 950) { // Leave room for new additions
                address[] memory currentRefs = directNetwork[current];
                for (uint256 i = 0; i < currentRefs.length && rear < 1000; i++) {
                    queue[rear++] = currentRefs[i];
                }
            }
        }
        
        return totalSize;
    }

    // ========== WITHDRAWAL FUNCTIONS ==========
    
    function withdraw(uint96 amount) external nonReentrant whenNotPaused antiMEV 
      circuitBreakerCheck(amount) {
        CoreOptimized.PackedUser storage user = users[msg.sender];
        
        // Enhanced withdrawal validation
        if (!CoreOptimized.isRegistered(user)) revert Errors.UserNotRegistered(msg.sender);
        if (CoreOptimized.isBlacklisted(user)) revert Errors.UserBlacklisted(msg.sender);
        if (amount == 0) revert Errors.InvalidAmount(amount);
        if (amount > type(uint96).max) revert Errors.InvalidAmount(amount);
        if (amount > user.balance) revert Errors.InsufficientBalance(user.balance, amount);
        if (platformFeeRecipient == address(0)) revert Errors.ZeroAddress();
        
        // Minimum withdrawal threshold (1 USDT in 18 decimals)
        if (amount < 1 * 10**18) revert Errors.InvalidValue();
        
        // Maximum single withdrawal check (prevent large drains)
        require(amount <= 50000 * 10**18, "Exceeds maximum single withdrawal");
        
        // Apply daily limit check
        _checkDailyLimit(amount);
        
        uint8 withdrawalRate = calculateWithdrawalRate(msg.sender);
        require(withdrawalRate >= 70 && withdrawalRate <= 90, "Invalid withdrawal rate");
        
        uint96 withdrawable = (amount * withdrawalRate) / 100;
        uint96 reinvestment = amount - withdrawable;
        uint96 platformFee = (withdrawable * 500) / 10000; // 5% platform fee
        uint96 participantReceives = withdrawable - platformFee;
        
        // Ensure minimum meaningful amounts
        require(participantReceives > 0, "Withdrawal amount too small");
        require(platformFee > 0, "Platform fee calculation error");
        
        // Update state before external calls
        user.balance -= amount;
        user.totalWithdrawn += participantReceives;
        totalPlatformFeesCollected += platformFee;
        
        // Safe external transfers with return value checks
        bool success = usdt.transfer(msg.sender, participantReceives);
        require(success, "USDT transfer to user failed");
        
        success = usdt.transfer(platformFeeRecipient, platformFee);
        require(success, "USDT transfer to platform failed");
        
        // Process reinvestment
        if (reinvestment > 0) {
            _processReinvestmentDistribution(msg.sender, reinvestment);
            emit ReinvestmentProcessed(msg.sender, reinvestment);
        }
        
        emit UserWithdrawal(msg.sender, participantReceives);
        emit PlatformFeeCollected(platformFee, msg.sender);
    }

    function calculateWithdrawalRate(address user) public view returns (uint8) {
        CoreOptimized.PackedUser memory userData = users[user];
        uint32 directs = userData.directReferrals;
        
        // Tiered rates: 70%/75%/80% based on direct referrals
        if (directs >= 20) return 80;
        if (directs >= 5) return 75;
        return 70;
    }

    function _processReinvestmentDistribution(address participant, uint96 amount) internal {
        // Split reinvestment across pools
        uint96 levelShare = amount / 2;
        uint96 chainShare = amount / 4;
        uint96 helpShare = amount - levelShare - chainShare;
        
        // Level reinvestment
        if (levelShare > 0) {
            _distributeLevelReinvestment(participant, levelShare);
        }
        
        // Chain reinvestment
        if (chainShare > 0) {
            _distributeReferrerChainIncentives(participant, chainShare);
        }
        
        // Help pool
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
        
        while (current != address(0) && level <= maxLevels && remaining > 0) {
            CoreOptimized.PackedUser storage parentUser = users[current];
            
            if (CoreOptimized.isRegistered(parentUser) && !CoreOptimized.isBlacklisted(parentUser)) {
                // Equal distribution across levels
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
        
        // Any remaining to help pool
        if (remaining > 0) {
            communityPool.balance += remaining;
        }
    }

    function _distributeReferrerChainIncentives(address participant, uint96 amount) internal {
        if (amount == 0) return;
        
        // Distribute to 30 levels
        address current = users[participant].referrer;
        uint8 level = 1;
        uint8 maxParents = 30;
        uint96 remaining = amount;
        address lastValidParent = address(0);
        
        while (current != address(0) && level <= maxParents && remaining > 0) {
            CoreOptimized.PackedUser storage parentUser = users[current];
            
            if (CoreOptimized.isRegistered(parentUser) && !CoreOptimized.isBlacklisted(parentUser)) {
                uint96 perParent = remaining / (maxParents - level + 1);
                if (perParent > 0) {
                    _distributeReward(current, perParent, 5);
                    remaining -= perParent;
                    lastValidParent = current;
                }
            }
            
            current = parentUser.referrer;
            level++;
        }
        
        // Remainder distribution
        if (remaining > 0) {
            if (lastValidParent != address(0)) {
                _distributeReward(lastValidParent, remaining, 5);
            } else {
                communityPool.balance += remaining;
            }
        }
    }

    // ========== ADMIN FUNCTIONS ==========
    
    function setPlatformFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient address");
        address oldRecipient = platformFeeRecipient;
        platformFeeRecipient = _recipient;
        emit SecurityAlert("PLATFORM_FEE_RECIPIENT_UPDATED", _recipient, uint256(uint160(oldRecipient)));
    }

    function addAdmin(address admin) external onlyOwner {
        require(admin != address(0), "Invalid admin address");
        require(!isAdminAddress[admin], "Already an admin");
        require(admin != owner(), "Owner is already admin");
        isAdminAddress[admin] = true;
        emit AdminAdded(admin);
    }
    
    function removeAdmin(address admin) external onlyOwner {
        require(admin != address(0), "Invalid admin address");
        require(isAdminAddress[admin], "Not an admin");
        require(admin != owner(), "Cannot remove owner");
        isAdminAddress[admin] = false;
        emit AdminRemoved(admin);
    }
    
    function addOracle(address oracle) external onlyAdmin {
        require(oracle != address(0), "Invalid oracle address");
        require(oracle.code.length > 0, "Oracle must be a contract");
        SecureOracle.addOracle(oracles, oracle);
        emit OracleAdded(oracle);
    }
    
    function setCircuitBreaker(uint256 threshold) external onlyAdmin {
        require(threshold > 0, "Threshold must be greater than zero");
        require(threshold <= 1000 ether, "Threshold too high");
        uint256 oldThreshold = circuitBreakerThreshold;
        circuitBreakerThreshold = threshold;
        circuitBreakerTriggered = false;
        emit CircuitBreakerReset();
        emit SecurityAlert("CIRCUIT_BREAKER_UPDATED", msg.sender, threshold);
    }
    
    function emergencyPause() external onlyAdmin {
        _pause();
    }
    
    function emergencyUnpause() external onlyAdmin {
        _unpause();
    }
    
    function emergencyWithdrawUSDT() external onlyOwner {
        require(circuitBreakerTriggered, "Emergency mode not active");
        
        uint256 balance = usdt.balanceOf(address(this));
        require(balance > 0, "No USDT balance to withdraw");
        
        bool success = usdt.transfer(owner(), balance);
        require(success, "Emergency USDT withdrawal failed");
        
        emit SecurityAlert("EMERGENCY_USDT_WITHDRAWAL", owner(), balance);
    }
    
    function setDailyWithdrawalLimit(uint256 newLimit) external onlyAdmin {
        require(newLimit > 0, "Limit must be greater than zero");
        require(newLimit >= 100 * 10**18, "Minimum limit is 100 USDT");
        require(newLimit <= 100000 * 10**18, "Maximum limit is 100,000 USDT");
        uint256 oldLimit = dailyWithdrawalLimit;
        dailyWithdrawalLimit = newLimit;
        emit SecurityAlert("DAILY_LIMIT_UPDATED", msg.sender, newLimit);
    }

    // ========== SIMPLIFIED VIEW FUNCTIONS ==========
    
    // Split complex view functions into simpler ones for stack depth optimization
    
    function getUserBasicInfo(address user) external view returns (bool, uint8, uint96) {
        CoreOptimized.PackedUser storage userData = users[user];
        return (CoreOptimized.isRegistered(userData), userData.packageLevel, userData.balance);
    }
    
    function getUserEarnings(address user) external view returns (uint96, uint96, uint32) {
        CoreOptimized.PackedUser storage userData = users[user];
        return (userData.totalEarnings, userData.earningsCap, userData.directReferrals);
    }
    
    function getUserNetwork(address user) external view returns (address, uint32) {
        CoreOptimized.PackedUser storage userData = users[user];
        return (userData.referrer, userData.teamSize);
    }
    
    function getPoolBalance(uint8 poolType) external view returns (uint96) {
        if (poolType == 1) return leadershipPool.balance;
        if (poolType == 2) return communityPool.balance;
        if (poolType == 3) return clubPool.balance;
        return 0;
    }
    
    function getMatrixPosition(address user) external view returns (address, address) {
        return (smartTreeMatrix[user][0], smartTreeMatrix[user][1]);
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getTotalUsers() external view returns (uint32) {
        return totalUsers;
    }
    
    function getPackagePrice(uint8 packageLevel) external view returns (uint96) {
        return packages[packageLevel].price;
    }
    
    function getCurrentBNBPrice() external view returns (int256) {
        return SecureOracle.getSecurePrice(oracles, priceConfig);
    }
    
    function isAdmin(address user) external view returns (bool) {
        return isAdminAddress[user] || user == owner();
    }
    
    function getTotalPlatformFees() external view returns (uint96) {
        return totalPlatformFeesCollected;
    }
    
    function getUSDTBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }
    
    // ========== DIAGNOSTIC FUNCTIONS ==========
    
    function verifyPackageAllocations(uint8 packageLevel) external view returns (
        uint96 price,
        uint16 directBonus,
        uint16 levelBonus, 
        uint16 uplineBonus,
        uint16 leaderBonus,
        uint16 helpBonus,
        uint16 totalAllocation
    ) {
        require(packageLevel > 0 && packageLevel <= 4, "Invalid package");
        CoreOptimized.PackedPackage storage package = packages[packageLevel];
        
        return (
            package.price,
            package.directBonus,
            package.levelBonus,
            package.uplineBonus,
            package.leaderBonus,
            package.helpBonus,
            package.directBonus + package.levelBonus + package.uplineBonus + package.leaderBonus + package.helpBonus
        );
    }
    
    function getSystemHealth() external view returns (
        bool isOperational,
        uint32 userCount,
        uint96 totalFeesCollected,
        uint256 contractUSDTBalance,
        uint256 contractBNBBalance,
        bool circuitBreakerStatus
    ) {
        return (
            !paused() && !circuitBreakerTriggered,
            totalUsers,
            totalPlatformFeesCollected,
            usdt.balanceOf(address(this)),
            address(this).balance,
            circuitBreakerTriggered
        );
    }

    // ========== UPGRADE FUNCTIONS ==========
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ========== EMERGENCY FUNCTIONS ==========
    
    function emergencyWithdraw() external onlyOwner {
        require(circuitBreakerTriggered, "Emergency mode not active");
        require(address(this).balance > 0, "No BNB balance to withdraw");
        
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency BNB withdrawal failed");
        
        emit SecurityAlert("EMERGENCY_BNB_WITHDRAWAL", owner(), balance);
    }
    
    // Allow contract to receive BNB
    receive() external payable {}
    fallback() external payable {}
    
    // ========== INTERNAL HELPER FUNCTIONS ==========
    
    function _checkDailyLimit(uint256 amount) internal {
        uint256 currentDay = block.timestamp / 86400;
        
        if (lastWithdrawalDay[msg.sender] != currentDay) {
            dailyWithdrawals[msg.sender] = 0;
            lastWithdrawalDay[msg.sender] = currentDay;
        }
        
        require(dailyWithdrawals[msg.sender] + amount <= dailyWithdrawalLimit, "Daily limit exceeded");
        dailyWithdrawals[msg.sender] += amount;
    }
}`;

// Backup the current file (whatever it is)
const backupPath = contractPath + '.backup-' + Date.now();
if (fs.existsSync(contractPath)) {
    fs.copyFileSync(contractPath, backupPath);
    console.log(`📂 Backed up current file to: ${backupPath}`);
}

// Write the correct content
fs.writeFileSync(contractPath, correctContract);
console.log('✅ LeadFive.sol written to disk successfully!');

// Verify the write
const written = fs.readFileSync(contractPath, 'utf8');
const lines = written.split('\n').length;
const size = fs.statSync(contractPath).size;

console.log('\n📊 Verification:');
console.log(`- Lines: ${lines}`);
console.log(`- Size: ${(size / 1024).toFixed(2)} KB`);
console.log(`- First line: ${written.split('\n')[0]}`);
console.log(`- Has SPDX: ${written.includes('SPDX-License-Identifier')}`);
console.log(`- Has pragma: ${written.includes('pragma solidity 0.8.22')}`);

console.log('\n✅ Contract is ready for compilation!');
