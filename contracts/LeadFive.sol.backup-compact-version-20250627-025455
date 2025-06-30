// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

// Optimized core libraries
import "./libraries/Errors.sol";
import "./libraries/CoreOptimized.sol";
import "./libraries/SecureOracle.sol";

// Essential OpenZeppelin contracts only
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LeadFive - Optimized Production Contract
 * @dev Streamlined for mainnet deployment under 24KB
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
    
    // ========== CORE STORAGE ==========
    
    mapping(address => CoreOptimized.PackedUser) public users;
    mapping(uint8 => CoreOptimized.PackedPackage) public packages;
    mapping(address => address[]) public directReferrals;
    mapping(string => address) public referralCodeToUser;
    mapping(address => address[2]) public binaryMatrix;
    mapping(uint32 => address) public userIds;
    
    // Pools
    CoreOptimized.PackedPool public leaderPool;
    CoreOptimized.PackedPool public helpPool;
    
    // Oracle system
    SecureOracle.OracleData[] private oracles;
    SecureOracle.PriceConfig public priceConfig;
    
    // Admin management
    mapping(address => bool) private isAdminAddress;
    address[] private adminList;
    uint256 public constant MAX_ADMINS = 16;
    
    // Core state
    IERC20 public usdt;
    uint32 public totalUsers;
    address public platformFeeRecipient;
    uint96 public totalPlatformFeesCollected;
    uint256 private lastTxBlock;
    uint96 public totalPlatformVolume;
    
    // Circuit breaker
    uint256 public circuitBreakerThreshold;
    bool public circuitBreakerTriggered;
    bool public emergencyMode;
    
    // ========== EVENTS ==========
    
    event ParticipantRegistered(address indexed participant, address indexed referrer, uint8 packageLevel, uint96 amount);
    event PackageUpgraded(address indexed participant, uint8 newLevel, uint96 amount);
    event RewardDistributed(address indexed recipient, uint96 amount, uint8 rewardType);
    event ParticipantWithdrawal(address indexed participant, uint96 amount);
    event IncentivePoolDistributed(uint8 indexed poolType, uint96 amount);
    event PlatformFeeCollected(uint96 amount, address indexed participant);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event EarningsCapReached(address indexed user, uint96 exceededAmount);
    event ReinvestmentDistributed(address indexed user, uint96 total, uint96 level, uint96 chain, uint96 help);
    event CircuitBreakerTriggered(uint256 amount, uint256 threshold);
    
    // ========== MODIFIERS ==========
    
    modifier onlyAdmin() {
        if (!isAdminAddress[msg.sender] && msg.sender != owner()) {
            revert Errors.NotAuthorized(msg.sender);
        }
        _;
    }
    
    modifier antiMEV() {
        if (block.number == lastTxBlock) revert Errors.MEVProtection();
        lastTxBlock = block.number;
        _;
    }
    
    modifier circuitBreakerCheck(uint256 amount) {
        if (amount > circuitBreakerThreshold) {
            circuitBreakerTriggered = true;
            emit CircuitBreakerTriggered(amount, circuitBreakerThreshold);
            revert Errors.CircuitBreakerTriggered(amount, circuitBreakerThreshold);
        }
        _;
    }
    
    modifier notInEmergency() {
        if (emergencyMode) revert Errors.EmergencyModeActive();
        _;
    }
    
    // ========== INITIALIZATION ==========
    
    function initialize(address _usdt, address _initialOracle) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        if (_usdt == address(0) || _initialOracle == address(0)) {
            revert Errors.ZeroAddress();
        }
        
        usdt = IERC20(_usdt);
        
        // Initialize secure oracle
        priceConfig = SecureOracle.PriceConfig({
            minPrice: 50e8,
            maxPrice: 2000e8,
            maxStaleTime: 1800,
            minOracles: 1
        });
        
        oracles.push(SecureOracle.OracleData(IPriceFeed(_initialOracle), true, 0));
        
        // Initialize admin
        isAdminAddress[msg.sender] = true;
        adminList.push(msg.sender);
        
        // Initialize packages
        packages[1] = CoreOptimized.PackedPackage(30e18, 4000, 1000, 1000, 1000, 3000, 0);
        packages[2] = CoreOptimized.PackedPackage(50e18, 4000, 1000, 1000, 1000, 3000, 0);
        packages[3] = CoreOptimized.PackedPackage(100e18, 4000, 1000, 1000, 1000, 3000, 0);
        packages[4] = CoreOptimized.PackedPackage(200e18, 4000, 1000, 1000, 1000, 3000, 0);
        
        // Initialize pools
        leaderPool = CoreOptimized.PackedPool(0, uint32(block.timestamp), 1296000, 0);
        helpPool = CoreOptimized.PackedPool(0, uint32(block.timestamp), 604800, 0);
        
        // Initialize platform user
        CoreOptimized.PackedUser storage platformUser = users[msg.sender];
        platformUser.setRegistered(true);
        platformUser.packageLevel = 4;
        platformUser.earningsCap = type(uint96).max;
        platformUser.registrationTime = uint32(block.timestamp);
        platformUser.withdrawalRate = 90;
        
        userIds[1] = msg.sender;
        referralCodeToUser["ROOT001"] = msg.sender;
        totalUsers = 1;
        platformFeeRecipient = msg.sender;
        circuitBreakerThreshold = 50000e18;
        emergencyMode = false;
    }
    
    // ========== CORE FUNCTIONS ==========
    
    function register(
        uint8 packageLevel,
        address referrer,
        bool useUSDT,
        string memory customReferralCode
    ) external payable nonReentrant whenNotPaused antiMEV notInEmergency {
        CoreOptimized.PackedUser storage user = users[msg.sender];
        
        if (user.isRegistered()) revert Errors.UserAlreadyRegistered(msg.sender);
        if (packageLevel < 1 || packageLevel > 4) revert Errors.InvalidPackageLevel(packageLevel);
        if (referrer == msg.sender) revert Errors.SelfReferralNotAllowed();
        
        if (referrer != address(0)) {
            if (!users[referrer].isRegistered()) revert Errors.InvalidReferrer(referrer);
            if (users[referrer].isBlacklisted()) revert Errors.UserBlacklisted(referrer);
        }
        
        if (bytes(customReferralCode).length > 0) {
            if (bytes(customReferralCode).length > 20) revert Errors.InvalidInput();
            if (referralCodeToUser[customReferralCode] != address(0)) revert Errors.InvalidInput();
        }
        
        uint96 amount = _processPayment(packageLevel, useUSDT);
        
        user.setRegistered(true);
        user.packageLevel = packageLevel;
        user.registrationTime = uint32(block.timestamp);
        user.totalInvestment = amount;
        user.earningsCap = uint96(uint256(amount) * CoreOptimized.EARNINGS_MULTIPLIER);
        user.referrer = referrer;
        user.withdrawalRate = 70;
        
        string memory refCode = bytes(customReferralCode).length > 0 ? 
            customReferralCode : 
            CoreOptimized.generateSecureReferralCode(msg.sender);
            
        if (referralCodeToUser[refCode] != address(0)) {
            refCode = CoreOptimized.generateSecureReferralCode(msg.sender);
        }
        user.referralCode = refCode;
        referralCodeToUser[refCode] = msg.sender;
        totalUsers++;
        userIds[totalUsers] = msg.sender;
        totalPlatformVolume += amount;
        
        if (referrer != address(0)) {
            directReferrals[referrer].push(msg.sender);
            users[referrer].directReferrals++;
            CoreOptimized.placeInMatrixIterative(msg.sender, referrer, binaryMatrix);
            _updateParentChainTeamSizes(referrer);
        }
        
        _distributeIncentives(msg.sender, amount, packageLevel);
        emit ParticipantRegistered(msg.sender, referrer, packageLevel, amount);
    }
    
    function upgradePackage(uint8 newLevel, bool useUSDT) 
        external payable nonReentrant whenNotPaused antiMEV {
        CoreOptimized.PackedUser storage user = users[msg.sender];
        if (!user.isRegistered()) revert Errors.UserNotRegistered(msg.sender);
        if (user.isBlacklisted()) revert Errors.UserBlacklisted(msg.sender);
        if (newLevel <= user.packageLevel || newLevel > 4) revert Errors.InvalidPackageLevel(newLevel);
        
        uint96 amount = _processPayment(newLevel, useUSDT);
        
        user.packageLevel = newLevel;
        user.totalInvestment += amount;
        user.earningsCap += uint96(uint256(amount) * CoreOptimized.EARNINGS_MULTIPLIER);
        _distributeIncentives(msg.sender, amount, newLevel);
        emit PackageUpgraded(msg.sender, newLevel, amount);
    }
    
    function withdraw(uint96 amount) external nonReentrant whenNotPaused notInEmergency antiMEV 
        circuitBreakerCheck(amount) {
        CoreOptimized.PackedUser storage user = users[msg.sender];
        
        if (!user.isRegistered()) revert Errors.UserNotRegistered(msg.sender);
        if (user.isBlacklisted()) revert Errors.UserBlacklisted(msg.sender);
        if (amount == 0 || amount > user.balance) revert Errors.InsufficientBalance(user.balance, amount);
        if (platformFeeRecipient == address(0)) revert Errors.ZeroAddress();
        if (amount < 1e6) revert Errors.InvalidValue();
        
        uint8 withdrawalRate = calculateWithdrawalRate(msg.sender);
        uint96 withdrawable = uint96((uint256(amount) * withdrawalRate) / 100);
        uint96 reinvestment = amount - withdrawable;
        uint96 platformFee = uint96((uint256(withdrawable) * CoreOptimized.ADMIN_FEE_RATE) / CoreOptimized.BASIS_POINTS);
        uint96 participantReceives = withdrawable - platformFee;
        
        user.balance -= amount;
        user.totalWithdrawn += participantReceives;
        totalPlatformFeesCollected += platformFee;
        
        usdt.transfer(msg.sender, participantReceives);
        usdt.transfer(platformFeeRecipient, platformFee);
        
        if (reinvestment > 0) {
            _processReinvestmentDistribution(msg.sender, reinvestment);
        }
        
        emit ParticipantWithdrawal(msg.sender, participantReceives);
        emit PlatformFeeCollected(platformFee, msg.sender);
    }
    
    // ========== INTERNAL FUNCTIONS ==========
    
    function _processPayment(uint8 packageLevel, bool useUSDT) internal returns (uint96) {
        uint96 packagePrice = packages[packageLevel].price;
        
        if(useUSDT) {
            require(usdt.transferFrom(msg.sender, address(this), packagePrice), "E15");
            return packagePrice;
        } else {
            uint96 bnbRequired = _getBNBPrice(packagePrice);
            require(msg.value >= bnbRequired, "E16");
            
            if(msg.value > bnbRequired) {
                payable(msg.sender).transfer(msg.value - bnbRequired);
            }
            return packagePrice;
        }
    }
    
    function _getBNBPrice(uint96 usdAmount) internal view returns (uint96) {
        int256 securePrice = SecureOracle.getSecurePrice(oracles, priceConfig);
        return SecureOracle.calculateBNBRequired(usdAmount, securePrice);
    }
    
    function _distributeIncentives(address participant, uint96 amount, uint8 packageLevel) internal {
        CoreOptimized.PackedPackage memory pkg = packages[packageLevel];
        
        (
            ,
            uint96 levelAmount,
            uint96 leaderAmount,
            uint96 helpAmount,
            ,
            uint96 adminAmount
        ) = CoreOptimized.calculateBonusDistributions(
            amount, 
            pkg.directBonus, 
            pkg.levelBonus, 
            pkg.leaderBonus, 
            pkg.helpBonus, 
            0
        );
        
        // Direct referral reward
        if (users[participant].referrer != address(0)) {
            address directReferrer = users[participant].referrer;
            uint96 actualDirectReward = uint96((uint256(amount) * pkg.directBonus + 9999) / 10000);
            _addEarningsWithCapEnforcement(directReferrer, actualDirectReward);
            
            uint96 chainAmount = uint96((uint256(amount) * 1000) / 10000);
            _distributeReferrerChainIncentives(participant, chainAmount);
            
            CoreOptimized.distributeMultiLevelBonuses(users, participant, levelAmount);
            emit RewardDistributed(directReferrer, actualDirectReward, 1);
        }
        
        leaderPool.balance += leaderAmount;
        helpPool.balance += helpAmount;
        totalPlatformFeesCollected += adminAmount;
        
        if (platformFeeRecipient != address(0) && adminAmount > 0) {
            usdt.transfer(platformFeeRecipient, adminAmount);
            emit PlatformFeeCollected(adminAmount, participant);
        }
    }
    
    function _addEarningsWithCapEnforcement(address user, uint96 amount) internal {
        if (amount == 0) return;
        
        CoreOptimized.PackedUser storage userData = users[user];
        if (!userData.isRegistered() || userData.isBlacklisted()) return;
        
        if (userData.totalEarnings > type(uint96).max - amount) return;
        
        uint96 allowedAmount = amount;
        if (userData.totalEarnings + amount > userData.earningsCap) {
            if (userData.totalEarnings >= userData.earningsCap) return;
            allowedAmount = userData.earningsCap - userData.totalEarnings;
        }
        
        userData.balance += allowedAmount;
        userData.totalEarnings += allowedAmount;
        
        uint96 overflow = amount - allowedAmount;
        if (overflow > 0) {
            helpPool.balance += overflow;
            emit EarningsCapReached(user, overflow);
        }
    }
    
    function _distributeReferrerChainIncentives(address user, uint96 amount) internal {
        address current = users[user].referrer;
        uint96 remaining = amount;
        uint8 level = 1;
        uint8 maxLevels = 30;
        
        while (current != address(0) && remaining > 0 && level <= maxLevels) {
            CoreOptimized.PackedUser storage parentUser = users[current];
            
            if (parentUser.isRegistered() && !parentUser.isBlacklisted()) {
                uint96 levelPayout = amount / maxLevels;
                
                if (levelPayout > remaining) levelPayout = remaining;
                if (levelPayout > 0) {
                    _addEarningsWithCapEnforcement(current, levelPayout);
                    remaining -= levelPayout;
                    emit RewardDistributed(current, levelPayout, 2);
                }
            }
            
            current = parentUser.referrer;
            level++;
        }
    }
    
    function _updateParentChainTeamSizes(address user) internal {
        address current = user;
        uint8 level = 0;
        uint8 maxLevels = 100;
        
        while (current != address(0) && level < maxLevels) {
            users[current].teamSize++;
            current = users[current].referrer;
            level++;
        }
    }
    
    function _processReinvestmentDistribution(address user, uint96 amount) internal {
        uint96 levelPart = uint96((uint256(amount) * 40) / 100);
        uint96 chainPart = uint96((uint256(amount) * 30) / 100);
        uint96 helpPart = uint96((uint256(amount) * 30) / 100);
        
        if (levelPart > 0) {
            _distributeMultiLevelReinvestment(user, levelPart);
        }
        
        if (chainPart > 0) {
            _distributeReferrerChainIncentives(user, chainPart);
        }
        
        if (helpPart > 0) {
            helpPool.balance += helpPart;
        }
        
        emit ReinvestmentDistributed(user, amount, levelPart, chainPart, helpPart);
    }
    
    function _distributeMultiLevelReinvestment(address user, uint96 amount) internal {
        address current = users[user].referrer;
        uint96 remaining = amount;
        uint8 level = 1;
        uint8 maxLevels = 10;
        
        while (current != address(0) && remaining > 0 && level <= maxLevels) {
            CoreOptimized.PackedUser storage parentUser = users[current];
            
            if (parentUser.isRegistered() && !parentUser.isBlacklisted()) {
                uint96 levelPayout = amount / maxLevels;
                
                if (levelPayout > remaining) levelPayout = remaining;
                if (levelPayout > 0) {
                    _addEarningsWithCapEnforcement(current, levelPayout);
                    remaining -= levelPayout;
                    emit RewardDistributed(current, levelPayout, 6);
                }
            }
            
            current = parentUser.referrer;
            level++;
        }
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function addAdmin(address admin) external onlyOwner {
        if (admin == address(0)) revert Errors.ZeroAddress();
        if (isAdminAddress[admin]) revert Errors.AdminAlreadyExists(admin);
        if (adminList.length >= MAX_ADMINS) revert Errors.MaxAdminsReached(adminList.length, MAX_ADMINS);
        
        isAdminAddress[admin] = true;
        adminList.push(admin);
        emit AdminAdded(admin);
    }
    
    function removeAdmin(address admin) external onlyOwner {
        if (!isAdminAddress[admin]) revert Errors.AdminNotFound(admin);
        
        isAdminAddress[admin] = false;
        
        for (uint256 i = 0; i < adminList.length; i++) {
            if (adminList[i] == admin) {
                adminList[i] = adminList[adminList.length - 1];
                adminList.pop();
                break;
            }
        }
        
        emit AdminRemoved(admin);
    }
    
    function setPlatformFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "E17");
        platformFeeRecipient = _recipient;
    }
    
    function pause() external onlyAdmin {
        _pause();
    }
    
    function unpause() external onlyAdmin {
        _unpause();
    }
    
    function setEmergencyMode(bool _emergency) external onlyOwner {
        emergencyMode = _emergency;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function calculateWithdrawalRate(address user) public view returns (uint8) {
        CoreOptimized.PackedUser memory userData = users[user];
        uint32 directs = userData.directReferrals;
        
        if (directs >= 20) return 80;
        if (directs >= 5) return 75;
        return 70;
    }
    
    function getUserInfo(address user) external view returns (CoreOptimized.PackedUser memory) {
        return users[user];
    }
    
    // ========== UPGRADE FUNCTION ==========
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
