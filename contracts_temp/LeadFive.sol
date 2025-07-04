// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./libraries/MatrixManagementLib.sol";
import "./libraries/PoolDistributionLib.sol";
import "./libraries/WithdrawalSafetyLib.sol";
import "./libraries/BusinessLogicLib.sol";
import "./libraries/AdvancedFeaturesLib.sol";
import "./libraries/DataStructures.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPriceFeed {
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80);
}

/**
 * @title LeadFive - Production MLM Smart Contract
 * @dev Production-ready MLM contract with all advanced features and security
 */
contract LeadFive is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {
    using DataStructures for DataStructures.User;
    
    // ========== STATE VARIABLES ==========
    
    // Core mappings
    mapping(address => DataStructures.User) public users;
    mapping(uint8 => Package) public packages;
    mapping(address => address[]) public directReferrals;
    mapping(string => address) public referralCodeToUser;
    
    // Simplified Package struct
    struct Package {
        uint96 price;
        uint16 directBonus;
        uint16 levelBonus;
        uint16 uplineBonus;
        uint16 leaderBonus;
        uint16 helpBonus;
        uint16 clubBonus;
    }
    
    // Pool struct
    struct Pool {
        uint96 balance;
        uint32 lastDistribution;
        uint32 interval;
    }
    
    // Pools
    Pool public leaderPool;
    Pool public helpPool;
    Pool public clubPool;
    
    // Core contracts
    IERC20 public usdt;
    IPriceFeed public priceFeed;
    IPriceFeed[] public priceOracles; // Multi-oracle system for security
    address[16] public adminIds;
    
    // Oracle security parameters (aligned with LeadFive.sol)
    uint256 public constant MIN_ORACLES_REQUIRED = 2;
    uint256 public constant MAX_PRICE_DEVIATION = 1000; // 10% deviation allowed
    int256 public constant MIN_PRICE_BOUND = 50e8; // $50 minimum
    int256 public constant MAX_PRICE_BOUND = 2000e8; // $2000 maximum
    uint256 public constant PRICE_STALENESS_THRESHOLD = 1800; // 30 minutes
    
    // Essential tracking
    uint32 public totalUsers;
    address public rootUser;
    bool public rootUserSet;
    address public adminFeeRecipient;
    uint96 public totalAdminFeesCollected;
    
    // Security
    uint256 private lastTxBlock;
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant EARNINGS_MULTIPLIER = 4;
    uint256 private constant ADMIN_FEE_RATE = 500; // 5%
    
    // Advanced features mappings (external library state)
    mapping(address => MatrixManagementLib.MatrixPosition) public matrixPositions;
    mapping(address => PoolDistributionLib.PoolQualification) public poolQualifications;
    mapping(address => WithdrawalSafetyLib.UserWithdrawalStats) public withdrawalStats;
    mapping(address => WithdrawalSafetyLib.WithdrawalLimits) public userWithdrawalLimits;
    mapping(address => uint256) public pendingCommissions;
    mapping(address => uint256) public pendingPoolRewards;
    mapping(address => uint256) public pendingMatrixBonuses;
    mapping(address => mapping(uint32 => bool)) public userAchievements;
    
    // Pool distribution schedules
    PoolDistributionLib.DistributionSchedule public leaderPoolSchedule;
    PoolDistributionLib.DistributionSchedule public helpPoolSchedule;
    PoolDistributionLib.DistributionSchedule public clubPoolSchedule;
    
    // Circuit breaker and safety
    mapping(uint256 => uint256) public windowWithdrawals;
    uint256 public circuitBreakerThreshold;
    uint256 public reserveFund;
    uint256 public totalDeposits;
    
    // Tracking arrays
    address[] public shiningStarLeaders;
    address[] public eligibleHelpPoolUsers;
    
    // Notification system
    AdvancedFeaturesLib.NotificationQueue public notificationQueue;
    mapping(address => AdvancedFeaturesLib.UserNotifications) public userNotifications;
    
    // ========== EVENTS ==========
    
    event UserRegistered(address indexed user, address indexed referrer, uint8 packageLevel, uint96 amount);
    event PackageUpgraded(address indexed user, uint8 newLevel, uint96 amount);
    event BonusDistributed(address indexed recipient, uint96 amount, uint8 bonusType);
    event Withdrawal(address indexed user, uint96 amount);
    event PoolDistributed(uint8 indexed poolType, uint96 amount);
    event AdminFeeCollected(uint96 amount, address indexed user);
    event ReferralCodeGenerated(address indexed user, string code);
    event MatrixCycleCompleted(address indexed user, uint8 level, uint256 bonus, uint32 cycleId);
    event WithdrawalDenied(address indexed user, string reason, uint256 amount);
    event CircuitBreakerActivated(uint256 withdrawalAmount, uint256 threshold);
    event RewardsClaimed(address indexed user, uint256 amount);
    event PriceFeedAdded(address indexed priceFeed);
    event PriceFeedRemoved(address indexed priceFeed);
    event PrimaryPriceFeedUpdated(address indexed priceFeed);
    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);
    event PriceFeedUpdated(address indexed priceFeed);
    
    // ========== MODIFIERS ==========
    
    modifier onlyAdmin() {
        bool isAdmin = false;
        for(uint i = 0; i < 16; i++) {
            if(adminIds[i] == msg.sender) {
                isAdmin = true;
                break;
            }
        }
        require(isAdmin || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier antiMEV() {
        require(block.number > lastTxBlock, "MEV protection");
        lastTxBlock = block.number;
        _;
    }
    
    // ========== INITIALIZATION ==========
    
    function initialize(address _usdt, address _priceFeed) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        usdt = IERC20(_usdt);
        priceFeed = IPriceFeed(_priceFeed);
        
        // Initialize multi-oracle system with primary oracle
        priceOracles.push(IPriceFeed(_priceFeed));
        
        // Initialize admin IDs
        for(uint i = 0; i < 16; i++) {
            adminIds[i] = msg.sender;
        }
        
        // Initialize packages
        packages[1] = Package(30e18, 4000, 1000, 1000, 1000, 3000, 0);
        packages[2] = Package(50e18, 4000, 1000, 1000, 1000, 3000, 0);
        packages[3] = Package(100e18, 4000, 1000, 1000, 1000, 3000, 0);
        packages[4] = Package(200e18, 4000, 1000, 1000, 1000, 3000, 0);
        
        // Initialize pools
        leaderPool = Pool(0, uint32(block.timestamp), 604800);
        helpPool = Pool(0, uint32(block.timestamp), 604800);
        clubPool = Pool(0, uint32(block.timestamp), 2592000);
        
        // Initialize deployer with enhanced fields
        users[msg.sender] = DataStructures.User({
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
            matrixPosition: 0,
            matrixLevel: 0,
            registrationTime: uint32(block.timestamp),
            referralCode: "",
            pendingRewards: 0,
            lastWithdrawal: 0,
            matrixCycles: 0,
            leaderRank: 0,
            leftLegVolume: 0,
            rightLegVolume: 0,
            fastStartExpiry: uint32(block.timestamp + 48 hours),
            isActive: true
        });
        
        // Initialize advanced features
        PoolDistributionLib.initializeSchedules(
            leaderPoolSchedule,
            helpPoolSchedule,
            clubPoolSchedule
        );
        
        circuitBreakerThreshold = 50000 * 10**18;
        reserveFund = 0;
        totalDeposits = 0;
    }
    
    // ========== CORE FUNCTIONS ==========
    
    function register(address referrer, uint8 packageLevel, bool useUSDT) 
        external payable nonReentrant whenNotPaused antiMEV {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(packageLevel >= 1 && packageLevel <= 4, "Invalid package");
        require(referrer == address(0) || users[referrer].isRegistered, "Invalid referrer");
        
        uint96 amount = _processPayment(packageLevel, useUSDT);
        totalUsers++;
        totalDeposits += amount;
        
        // Create user with all enhanced fields
        users[msg.sender] = DataStructures.User({
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
            fastStartExpiry: uint32(block.timestamp + 48 hours),
            isActive: true
        });
        
        if(referrer != address(0)) {
            directReferrals[referrer].push(msg.sender);
            users[referrer].directReferrals++;
            users[referrer].teamSize++;
            
            // Add to enhanced withdrawal referral tracking
            _addReferral(referrer, msg.sender);
            
            // Update pool qualifications
            PoolDistributionLib.updatePoolQualifications(users, poolQualifications, referrer);
        }
        
        _distributeBonuses(msg.sender, amount, packageLevel);
        emit UserRegistered(msg.sender, referrer, packageLevel, amount);
    }
    
    function upgradePackage(uint8 newLevel, bool useUSDT) 
        external payable nonReentrant whenNotPaused antiMEV {
        require(users[msg.sender].isRegistered, "Not registered");
        require(!users[msg.sender].isBlacklisted, "Blacklisted");
        require(newLevel > users[msg.sender].packageLevel && newLevel <= 4, "Invalid upgrade");
        
        uint96 amount = _processPayment(newLevel, useUSDT);
        totalDeposits += amount;
        
        users[msg.sender].packageLevel = newLevel;
        users[msg.sender].totalInvestment += amount;
        users[msg.sender].earningsCap += uint96(amount * EARNINGS_MULTIPLIER);
        
        _distributeBonuses(msg.sender, amount, newLevel);
        emit PackageUpgraded(msg.sender, newLevel, amount);
    }
    
    function withdraw(uint96 amount) external nonReentrant whenNotPaused {
        DataStructures.User storage user = users[msg.sender];
        require(user.isRegistered && !user.isBlacklisted, "Invalid user");
        require(amount <= user.balance, "Insufficient balance");
        require(adminFeeRecipient != address(0), "Admin fee recipient not set");
        
        uint8 withdrawalRate = BusinessLogicLib.calculateWithdrawalRate(
            user.directReferrals, user.teamSize, user.packageLevel
        );
        
        uint96 withdrawable = uint96((uint256(amount) * withdrawalRate) / 100);
        uint96 reinvestment = amount - withdrawable;
        uint96 adminFee = uint96((uint256(withdrawable) * ADMIN_FEE_RATE) / BASIS_POINTS);
        uint96 userReceives = withdrawable - adminFee;
        
        user.balance -= amount;
        totalAdminFeesCollected += adminFee;
        
        usdt.transfer(msg.sender, userReceives);
        usdt.transfer(adminFeeRecipient, adminFee);
        
        if(reinvestment > 0) {
            helpPool.balance += uint96((uint256(reinvestment) * 3000) / BASIS_POINTS);
        }
        
        emit Withdrawal(msg.sender, userReceives);
        emit AdminFeeCollected(adminFee, msg.sender);
    }
    
    // ========== ADVANCED FEATURES ==========
    
    function claimAllRewards() external nonReentrant whenNotPaused {
        DataStructures.User storage user = users[msg.sender];
        require(user.isRegistered && !user.isBlacklisted, "Cannot claim");
        
        uint256 totalClaimed = AdvancedFeaturesLib.claimAllRewards(
            user, pendingCommissions, pendingPoolRewards, pendingMatrixBonuses, msg.sender
        );
        
        require(totalClaimed > 0, "No rewards to claim");
        emit RewardsClaimed(msg.sender, totalClaimed);
    }
    
    function withdrawWithSafety() external nonReentrant whenNotPaused antiMEV {
        DataStructures.User storage user = users[msg.sender];
        require(user.isRegistered && !user.isBlacklisted, "Cannot withdraw");
        require(adminFeeRecipient != address(0), "Admin fee recipient not set");
        
        uint256 amount = user.balance;
        require(amount > 0, "Nothing to withdraw");
        
        // Initialize limits if needed
        if (userWithdrawalLimits[msg.sender].dailyLimit == 0) {
            userWithdrawalLimits[msg.sender] = WithdrawalSafetyLib.initializeUserLimits(user.packageLevel);
        }
        
        // Check withdrawal safety
        (bool allowed, string memory reason) = WithdrawalSafetyLib.checkWithdrawalAllowed(
            withdrawalStats[msg.sender], userWithdrawalLimits[msg.sender], amount, usdt.balanceOf(address(this))
        );
        
        if (!allowed) {
            emit WithdrawalDenied(msg.sender, reason, amount);
            revert(reason);
        }
        
        // Check circuit breaker
        bool shouldPause = AdvancedFeaturesLib.checkCircuitBreaker(
            amount, 1 hours, circuitBreakerThreshold, windowWithdrawals
        );
        
        if (shouldPause) {
            _pause();
            emit CircuitBreakerActivated(amount, circuitBreakerThreshold);
            revert("Circuit breaker activated");
        }
        
        // Process withdrawal
        uint8 withdrawalRate = BusinessLogicLib.calculateWithdrawalRate(
            user.directReferrals, user.teamSize, user.packageLevel
        );
        
        uint96 withdrawable = uint96((uint256(amount) * withdrawalRate) / 100);
        uint96 adminFee = uint96((uint256(withdrawable) * ADMIN_FEE_RATE) / BASIS_POINTS);
        uint96 userReceives = withdrawable - adminFee;
        
        user.balance = 0;
        totalAdminFeesCollected += adminFee;
        
        WithdrawalSafetyLib.updateWithdrawalStats(withdrawalStats[msg.sender], withdrawable);
        
        usdt.transfer(adminFeeRecipient, adminFee);
        usdt.transfer(msg.sender, userReceives);
        
        emit Withdrawal(msg.sender, userReceives);
        emit AdminFeeCollected(adminFee, msg.sender);
    }
    
    function triggerPoolDistributions() external onlyAdmin {
        // Leader Pool Distribution
        if (PoolDistributionLib.isDistributionDue(leaderPoolSchedule)) {
            uint256 distributed = PoolDistributionLib.distributeLeaderPool(
                users, poolQualifications, shiningStarLeaders, leaderPool.balance
            );
            leaderPool.balance -= uint96(distributed);
            PoolDistributionLib.updateDistributionSchedule(leaderPoolSchedule);
        }
        
        // Help Pool Distribution
        if (PoolDistributionLib.isDistributionDue(helpPoolSchedule) && gasleft() > 100000) {
            (uint256 distributed,) = PoolDistributionLib.distributeHelpPool(
                users, eligibleHelpPoolUsers, helpPool.balance, 50
            );
            helpPool.balance -= uint96(distributed);
            PoolDistributionLib.updateDistributionSchedule(helpPoolSchedule);
        }
    }
    
    function checkUserAchievements(address user) external {
        uint256 rewards = AdvancedFeaturesLib.checkAchievements(users[user], userAchievements, user);
        if (rewards > 0) {
            emit RewardsClaimed(user, rewards);
        }
    }
    
    // ========== INTERNAL FUNCTIONS ==========
    
    function _processPayment(uint8 packageLevel, bool useUSDT) internal returns (uint96) {
        uint96 packagePrice = packages[packageLevel].price;
        
        if(useUSDT) {
            require(usdt.transferFrom(msg.sender, address(this), packagePrice), "USDT transfer failed");
            return packagePrice;
        } else {
            uint96 bnbRequired = _getBNBPrice(packagePrice);
            require(msg.value >= bnbRequired, "Insufficient BNB");
            
            if(msg.value > bnbRequired) {
                payable(msg.sender).transfer(msg.value - bnbRequired);
            }
            return packagePrice;
        }
    }
    
    function _getBNBPrice(uint96 usdAmount) internal view returns (uint96) {
        int256 securePrice = _getSecurePrice();
        require(securePrice > 0, "Unable to get secure price");
        return uint96((uint256(usdAmount) * 1e18) / (uint256(securePrice) * 1e10));
    }
    
    /**
     * @dev Get secure price from multiple oracles with validation
     */
    function _getSecurePrice() internal view returns (int256) {
        require(priceOracles.length >= MIN_ORACLES_REQUIRED, "Insufficient oracles");
        
        int256[] memory prices = new int256[](priceOracles.length);
        uint256 validPrices = 0;
        
        // Collect prices from all oracles
        for (uint256 i = 0; i < priceOracles.length; i++) {
            try priceOracles[i].latestRoundData() returns (
                uint80,
                int256 price,
                uint256,
                uint256 updatedAt,
                uint80
            ) {
                if (_validateOraclePrice(price, updatedAt)) {
                    prices[validPrices] = price;
                    validPrices++;
                }
            } catch {
                continue;
            }
        }
        
        require(validPrices >= MIN_ORACLES_REQUIRED, "Insufficient valid oracle data");
        
        // Calculate median price
        int256 medianPrice = _calculateMedian(prices, validPrices);
        
        // Validate median price is within bounds
        require(medianPrice >= MIN_PRICE_BOUND && medianPrice <= MAX_PRICE_BOUND, "Price out of bounds");
        
        return medianPrice;
    }
    
    /**
     * @dev Validate individual oracle price data
     */
    function _validateOraclePrice(int256 price, uint256 updatedAt) internal view returns (bool) {
        if (price <= 0) return false;
        if (block.timestamp - updatedAt > PRICE_STALENESS_THRESHOLD) return false;
        if (price < MIN_PRICE_BOUND || price > MAX_PRICE_BOUND) return false;
        return true;
    }
    
    /**
     * @dev Calculate median from array of prices
     */
    function _calculateMedian(int256[] memory prices, uint256 length) internal pure returns (int256) {
        if (length == 0) revert("No prices provided");
        if (length == 1) return prices[0];
        
        // Simple bubble sort for small arrays
        for (uint256 i = 0; i < length - 1; i++) {
            for (uint256 j = 0; j < length - i - 1; j++) {
                if (prices[j] > prices[j + 1]) {
                    int256 temp = prices[j];
                    prices[j] = prices[j + 1];
                    prices[j + 1] = temp;
                }
            }
        }
        
        // Return median
        if (length % 2 == 0) {
            return (prices[length / 2 - 1] + prices[length / 2]) / 2;
        } else {
            return prices[length / 2];
        }
    }
    
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
        
        DataStructures.User storage u = users[user];
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
    
    // ========== VIEW FUNCTIONS ==========
    
    function getUserInfo(address user) external view returns (DataStructures.User memory) {
        return users[user];
    }
    
    function getPendingRewards(address userAddress) external view returns (
        uint256 pendingUserRewards,
        uint256 pendingCommissionRewards,
        uint256 pendingPoolRewardsAmount,
        uint256 pendingMatrixRewardsAmount,
        uint256 totalPending
    ) {
        return AdvancedFeaturesLib.getPendingRewardsSummary(
            users[userAddress], pendingCommissions, pendingPoolRewards, pendingMatrixBonuses, userAddress
        );
    }
    
    function getPoolBalances() external view returns (uint96, uint96, uint96) {
        return (leaderPool.balance, helpPool.balance, clubPool.balance);
    }
    
    function getContractHealth() external view returns (
        uint256 contractBalance,
        uint256 totalDepositsAmount,
        uint256 reserveFundAmount,
        uint256 healthRatio,
        bool isHealthy
    ) {
        contractBalance = usdt.balanceOf(address(this));
        totalDepositsAmount = totalDeposits;
        reserveFundAmount = reserveFund;
        healthRatio = totalDepositsAmount > 0 ? (contractBalance * 10000) / totalDepositsAmount : 10000;
        isHealthy = healthRatio >= 2000;
        
        return (contractBalance, totalDepositsAmount, reserveFundAmount, healthRatio, isHealthy);
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function setAdminFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid address");
        adminFeeRecipient = _recipient;
    }
    
    /**
     * @dev Add oracle to multi-oracle system
     */
    function addOracle(address oracle) external onlyOwner {
        require(oracle != address(0), "Invalid oracle address");
        require(priceOracles.length < 10, "Too many oracles");
        
        // Test oracle functionality
        try IPriceFeed(oracle).latestRoundData() returns (uint80, int256, uint256, uint256, uint80) {
            priceOracles.push(IPriceFeed(oracle));
            emit OracleAdded(oracle);
        } catch {
            revert("Invalid oracle");
        }
    }
    
    /**
     * @dev Remove oracle from multi-oracle system
     */
    function removeOracle(address oracle) external onlyOwner {
        for (uint256 i = 0; i < priceOracles.length; i++) {
            if (address(priceOracles[i]) == oracle) {
                priceOracles[i] = priceOracles[priceOracles.length - 1];
                priceOracles.pop();
                emit OracleRemoved(oracle);
                return;
            }
        }
        revert("Oracle not found");
    }
    
    /**
     * @dev Update primary price feed
     */
    function setPriceFeed(address _priceFeed) external onlyOwner {
        require(_priceFeed != address(0), "Invalid address");
        priceFeed = IPriceFeed(_priceFeed);
        emit PriceFeedUpdated(_priceFeed);
    }
    


    function blacklistUser(address user, bool status) external onlyAdmin {
        users[user].isBlacklisted = status;
    }

    function updateReserveFund() external onlyAdmin {
        uint256 requiredReserve = BusinessLogicLib.updateReserveFund(totalDeposits, 1500);
        if (requiredReserve > reserveFund) {
            uint256 needed = requiredReserve - reserveFund;
            if (usdt.balanceOf(address(this)) >= needed) {
                reserveFund = requiredReserve;
            }
        }
    }
    
    function setCircuitBreakerThreshold(uint256 newThreshold) external onlyOwner {
        circuitBreakerThreshold = newThreshold;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }
    
    function recoverUSDT(uint256 amount) external onlyOwner {
        usdt.transfer(owner(), amount);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    receive() external payable {}
    
    /**
     * @dev Get number of configured oracles
     */
    function getOracleCount() external view returns (uint256) {
        return priceOracles.length;
    }
    
    /**
     * @dev Emergency function to get price even with reduced oracle requirements
     * Only callable by owner in extreme situations
     */
    function getEmergencyPrice() external view onlyOwner returns (int256) {
        // Try primary oracle first
        try priceFeed.latestRoundData() returns (uint80, int256 price, uint256, uint256 updatedAt, uint80) {
            if (price > 0 && block.timestamp - updatedAt <= 7200) { // Extended 2-hour window for emergency
                return price;
            }
        } catch {}
        
        // Try additional oracles with relaxed constraints
        for (uint i = 0; i < priceOracles.length; i++) {
            try priceOracles[i].latestRoundData() returns (uint80, int256 price, uint256, uint256 updatedAt, uint80) {
                if (price > 0 && block.timestamp - updatedAt <= 7200) {
                    return price;
                }
            } catch {}
        }
        
        revert("All oracles failed");
    }
    
    // ========== ENHANCED WITHDRAWAL SYSTEM v1.11 ==========
    // Added as per withdrawal.html instructions
    
    // New state variables for enhanced withdrawal (add to storage)
    address public treasuryWallet; // Treasury address - Changeable for testing, transferable later
    mapping(address => bool) public autoCompoundEnabled;
    address public xpContract; // XP system address (if exists)
    uint256 public constant ADMIN_FEE_PERCENT = 5; // 5% fee on withdrawals
    mapping(address => address[]) public userReferrals; // Track referrals for withdrawal splits
    
    // Ownership transfer preparation
    address public pendingOwner; // For safe ownership transfers
    address public pendingTreasuryWallet; // For safe treasury transfers
    
    // New events for enhanced withdrawal system
    event TreasuryWalletSet(address indexed treasury);
    event AutoCompoundToggled(address indexed user, bool enabled);
    event XPContractSet(address indexed xpContract);
    event EnhancedWithdrawal(address indexed user, uint256 amount, uint256 adminFee, uint256 userReceives, uint256 reinvestAmount);
    event PoolReinvestment(address indexed user, uint256 amount, string poolType);
    event AutoCompoundBonus(address indexed user, uint256 reinvestAmount, uint256 bonus);
    event SecurityAlert(string indexed alertType, address indexed user, uint256 amount);
    
    /**
     * @dev Set treasury wallet (admin only) - Changeable for testing and development
     * @param _treasuryWallet Address to receive treasury fees
     */
    function setTreasuryWallet(address _treasuryWallet) external onlyOwner {
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        treasuryWallet = _treasuryWallet;
        emit TreasuryWalletSet(_treasuryWallet);
    }
    
    /**
     * @dev Set XP contract address (admin only)
     * @param _xpContract Address of XP tracking contract
     */
    function setXPContract(address _xpContract) external onlyOwner {
        xpContract = _xpContract;
        emit XPContractSet(_xpContract);
    }
    
    /**
     * @dev Enhanced withdrawal with treasury fees and referral-based splits
     * Implements the exact logic from withdrawal.html
     */
    function withdrawEnhanced(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(users[msg.sender].balance >= amount, "Insufficient balance");
        require(treasuryWallet != address(0), "Treasury wallet not set");
        
        DataStructures.User storage user = users[msg.sender];
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
        
        // Send fees to treasury (use call for BSC compatibility)
        if (adminFee > 0) {
            bool feeSuccess;
            if (address(usdt) != address(0)) {
                feeSuccess = usdt.transfer(treasuryWallet, adminFee);
            } else {
                (feeSuccess, ) = treasuryWallet.call{value: adminFee}("");
            }
            require(feeSuccess, "Fee transfer failed");
            totalAdminFeesCollected += uint96(adminFee);
        }
        
        // Send to user
        if (amountAfterFee > 0) {
            bool userSuccess;
            if (address(usdt) != address(0)) {
                userSuccess = usdt.transfer(msg.sender, amountAfterFee);
            } else {
                (userSuccess, ) = msg.sender.call{value: amountAfterFee}("");
            }
            require(userSuccess, "Transfer failed");
        }
        
        // Handle reinvestment as per corrected marketing plan
        if (reinvestAmount > 0) {
            if (autoCompoundEnabled[msg.sender]) {
                // Auto-compound: Add to user balance with 5% bonus
                uint256 compoundBonus = (reinvestAmount * 5) / 100;
                user.balance += uint96(reinvestAmount + compoundBonus);
                emit AutoCompoundBonus(msg.sender, reinvestAmount, compoundBonus);
            } else {
                // Default: Send reinvestment directly to Help Pool (corrected as per HTML spec)
                helpPool.balance += uint96(reinvestAmount);
                emit PoolReinvestment(msg.sender, reinvestAmount, "helpPool");
                
                // Track for pool distribution eligibility
                if (!user.isEligibleForHelpPool) {
                    user.isEligibleForHelpPool = true;
                    eligibleHelpPoolUsers.push(msg.sender);
                }
            }
        }
        
        // Trigger XP (if applicable) - as per corrected spec
        _updateXP(msg.sender, amount);
        
        emit EnhancedWithdrawal(msg.sender, amount, adminFee, amountAfterFee, reinvestAmount);
    }
    
    /**
     * @dev Helper to calculate splits based on referrals
     * Implements the exact logic from withdrawal.html
     */
    function _getWithdrawalSplit(address user) internal view returns (uint256, uint256) {
        if (autoCompoundEnabled[user]) return (0, 100); // 0% withdraw, 100% reinvest
        uint256 referralCount = userReferrals[user].length;
        if (referralCount >= 20) return (80, 20);
        if (referralCount >= 5) return (75, 25);
        return (70, 30); // Default
    }
    
    /**
     * @dev Add auto-compound toggle as per withdrawal.html
     */
    function toggleAutoCompound(bool enabled) external {
        require(users[msg.sender].isRegistered, "User not registered");
        autoCompoundEnabled[msg.sender] = enabled;
        emit AutoCompoundToggled(msg.sender, enabled);
    }
    
    /**
     * @dev External call to XP contract (for try-catch pattern)
     */
    function callXPContract(address user, uint256 amount) external {
        require(msg.sender == address(this), "Internal call only");
        (bool xpSuccess, ) = xpContract.call(
            abi.encodeWithSignature("recordWithdrawal(address,uint256)", user, amount)
        );
        require(xpSuccess, "XP update failed");
    }
    
    /**
     * @dev Update XP for user (internal helper)
     * @param user User address
     * @param amount Withdrawal amount
     */
    function _updateXP(address user, uint256 amount) internal {
        if (xpContract != address(0)) {
            try this.callXPContract(user, amount) {
                // XP recorded successfully
            } catch {
                // XP recording failed but don't revert the withdrawal
                emit SecurityAlert("XP_UPDATE_FAILED", user, amount);
            }
        }
    }
    
    /**
     * @dev Add user to referral tracking (call when registering)
     */
    function _addReferral(address sponsor, address newUser) internal {
        if (sponsor != address(0)) {
            userReferrals[sponsor].push(newUser);
        }
    }
    
    /**
     * @dev Get withdrawal split for a user (view function)
     */
    function getWithdrawalSplit(address user) external view returns (uint256 withdrawPercent, uint256 reinvestPercent) {
        return _getWithdrawalSplit(user);
    }
    
    /**
     * @dev Check if auto-compound is enabled for user
     */
    function isAutoCompoundEnabled(address user) external view returns (bool) {
        return autoCompoundEnabled[user];
    }
    
    /**
     * @dev Get user's referral count
     */
    function getUserReferralCount(address user) external view returns (uint256) {
        return userReferrals[user].length;
    }
    
    /**
     * @dev Get treasury wallet address
     */
    function getTreasuryWallet() external view returns (address) {
        return treasuryWallet;
    }
    
    // ========== OWNERSHIP TRANSFER FUNCTIONS FOR CLIENT HANDOVER ==========
    
    event OwnershipTransferInitiated(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferCompleted(address indexed previousOwner, address indexed newOwner);
    event TreasuryTransferInitiated(address indexed previousTreasury, address indexed newTreasury);
    event TreasuryTransferCompleted(address indexed previousTreasury, address indexed newTreasury);
    
    /**
     * @dev Initiate ownership transfer to client (2-step process for safety)
     * @param newOwner Address of the new owner (client's address)
     */
    function initiateOwnershipTransfer(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        require(newOwner != owner(), "Already the owner");
        pendingOwner = newOwner;
        emit OwnershipTransferInitiated(owner(), newOwner);
    }
    
    /**
     * @dev Complete ownership transfer (called by new owner to accept)
     */
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Not the pending owner");
        address previousOwner = owner();
        _transferOwnership(pendingOwner);
        pendingOwner = address(0);
        emit OwnershipTransferCompleted(previousOwner, owner());
    }
    
    /**
     * @dev Initiate treasury transfer to client (2-step process for safety)
     * @param newTreasury Address of the new treasury (client's treasury address)
     */
    function initiateTreasuryTransfer(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid new treasury");
        require(newTreasury != treasuryWallet, "Already the treasury");
        pendingTreasuryWallet = newTreasury;
        emit TreasuryTransferInitiated(treasuryWallet, newTreasury);
    }
    
    /**
     * @dev Complete treasury transfer (called by owner to confirm)
     */
    function acceptTreasuryTransfer() external onlyOwner {
        require(pendingTreasuryWallet != address(0), "No pending treasury transfer");
        address previousTreasury = treasuryWallet;
        treasuryWallet = pendingTreasuryWallet;
        pendingTreasuryWallet = address(0);
        emit TreasuryTransferCompleted(previousTreasury, treasuryWallet);
        emit TreasuryWalletSet(treasuryWallet);
    }
    
    /**
     * @dev Emergency function to transfer both ownership and treasury to client
     * @param clientOwner Client's owner address
     * @param clientTreasury Client's treasury address
     */
    function transferToClient(address clientOwner, address clientTreasury) external onlyOwner {
        require(clientOwner != address(0), "Invalid client owner");
        require(clientTreasury != address(0), "Invalid client treasury");
        
        // Transfer treasury first
        address previousTreasury = treasuryWallet;
        treasuryWallet = clientTreasury;
        emit TreasuryTransferCompleted(previousTreasury, clientTreasury);
        emit TreasuryWalletSet(clientTreasury);
        
        // Transfer ownership
        address previousOwner = owner();
        _transferOwnership(clientOwner);
        emit OwnershipTransferCompleted(previousOwner, clientOwner);
    }
    
    /**
     * @dev Get pending transfers info (for verification)
     */
    function getPendingTransfers() external view returns (address pendingOwnerAddress, address pendingTreasuryAddress) {
        return (pendingOwner, pendingTreasuryWallet);
    }
}