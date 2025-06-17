// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * @title OrphiCrowdFund - Production Ready Minimal Version
 * @dev Core functionality optimized for contract size limits
 */
contract OrphiCrowdFundCore is 
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
    uint256 public constant LEVEL_BONUS_RATE = 1000; // 10% total for levels
    uint256 public constant GLOBAL_HELP_POOL_RATE = 3000; // 30%
    uint256 public constant LEADER_BONUS_RATE = 1000; // 10%
    uint256 public constant EARNINGS_CAP_BASIS_POINTS = 30000; // 300%

    // ==================== ROLES ====================
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // ==================== ENUMS ====================
    enum PackageTier { 
        NONE,       // 0
        PACKAGE_5,  // 1 - $300
        PACKAGE_6,  // 2 - $500
        PACKAGE_7,  // 3 - $1000
        PACKAGE_8   // 4 - $2000
    }

    enum LeaderRank { NONE, BRONZE, SILVER, GOLD, PLATINUM, DIAMOND }

    // ==================== OPTIMIZED STRUCTS ====================
    struct User {
        bool isRegistered;
        bool isActive;
        address sponsor;
        uint8 packageTier;
        uint128 totalInvestment;     // Optimized: uint128 sufficient for amounts
        uint128 totalEarnings;       // Optimized: uint128 sufficient for amounts
        uint128 withdrawableBalance; // Optimized: uint128 sufficient for amounts
        uint32 directReferrals;      // Optimized: uint32 sufficient for count
        uint32 registrationTime;     // Optimized: uint32 for timestamp
        uint128 earningsCap;         // Optimized: uint128 sufficient for amounts
        bool isBlacklisted;
        uint64 lastWithdrawal;       // Optimized: uint64 for timestamp
        uint64 directBonus;          // Optimized: uint64 for bonus tracking
        uint64 levelBonus;           // Optimized: uint64 for bonus tracking
        uint64 uplineBonus;          // Optimized: uint64 for bonus tracking
    }
    
    struct Package {
        uint128 amount;      // Optimized: uint128 sufficient
        uint128 bnbAmount;   // Optimized: uint128 sufficient
        uint128 usdtAmount;  // Optimized: uint128 sufficient
        bool isActive;
    }

    // ==================== STATE VARIABLES ====================
    mapping(address => User) public users;
    mapping(uint8 => Package) public packages;
    mapping(address => address[]) public directReferrals;
    
    address[] public allUsers;
    address[] public qualifiedLeaders;
    
    uint128 public totalUsers;      // Optimized: uint128 sufficient
    uint128 public totalInvestment; // Optimized: uint128 sufficient
    uint128 public totalDistributed; // Optimized: uint128 sufficient
    
    // Pool balances - optimized
    uint128 public globalHelpPoolBalance;
    uint128 public leaderBonusPoolBalance;
    uint128 public clubPoolBalance;
    
    // Distribution tracking - optimized
    uint64 public lastGlobalDistribution;
    uint64 public lastLeaderDistribution;

    // ==================== EVENTS ====================
    event UserRegistered(address indexed user, address indexed sponsor, uint8 packageTier, uint256 amount, uint256 timestamp);
    event BonusDistributed(address indexed recipient, address indexed payer, uint256 amount, uint8 level, string bonusType, uint256 timestamp);
    event FundsWithdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event PoolUpdated(string poolName, uint256 amountAdded, uint256 timestamp);

    // ==================== PARAMETER STRUCTS (Stack Too Deep Fix) ====================
    struct BonusParams {
        address user;
        address sponsor;
        uint256 amount;
        uint8 packageTier;
    }

    struct RegistrationParams {
        address referrer;
        PackageTier tier;
        bool useUSDT;
        uint256 paymentAmount;
    }

    // ==================== INITIALIZATION ====================
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        
        _initializePackages();
    }

    function _initializePackages() internal {
        // Initialize packages for $300, $500, $1000, $2000
        packages[1] = Package(300 * 1e18, 0.5 ether, 300 * 1e18, true); // PACKAGE_5
        packages[2] = Package(500 * 1e18, 0.8 ether, 500 * 1e18, true); // PACKAGE_6  
        packages[3] = Package(1000 * 1e18, 1.6 ether, 1000 * 1e18, true); // PACKAGE_7
        packages[4] = Package(2000 * 1e18, 3.2 ether, 2000 * 1e18, true); // PACKAGE_8
    }

    // ==================== CORE REGISTRATION ====================
    function register(address _referrer, PackageTier _tier) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        RegistrationParams memory params = RegistrationParams({
            referrer: _referrer,
            tier: _tier,
            useUSDT: false,
            paymentAmount: msg.value
        });
        
        _processRegistration(params);
    }

    function _processRegistration(RegistrationParams memory params) internal {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(users[params.referrer].isRegistered, "Invalid referrer");
        require(params.tier != PackageTier.NONE, "Invalid package");
        
        uint8 packageTier = uint8(params.tier);
        uint256 requiredAmount = packages[packageTier].amount;
        require(params.paymentAmount == requiredAmount, "Incorrect amount");
        
        // Create user with optimized struct
        users[msg.sender] = User({
            isRegistered: true,
            isActive: true,
            sponsor: params.referrer,
            packageTier: packageTier,
            totalInvestment: uint128(requiredAmount),
            totalEarnings: 0,
            withdrawableBalance: 0,
            directReferrals: 0,
            registrationTime: uint32(block.timestamp),
            earningsCap: uint128((requiredAmount * EARNINGS_CAP_BASIS_POINTS) / BASIS_POINTS),
            isBlacklisted: false,
            lastWithdrawal: 0,
            directBonus: 0,
            levelBonus: 0,
            uplineBonus: 0
        });
        
        allUsers.push(msg.sender);
        directReferrals[params.referrer].push(msg.sender);
        users[params.referrer].directReferrals++;
        totalUsers++;
        totalInvestment += uint128(requiredAmount);
        
        // Distribute bonuses
        BonusParams memory bonusParams = BonusParams({
            user: msg.sender,
            sponsor: params.referrer,
            amount: requiredAmount,
            packageTier: packageTier
        });
        
        _distributeBonuses(bonusParams);
        
        emit UserRegistered(msg.sender, params.referrer, packageTier, requiredAmount, block.timestamp);
    }

    // ==================== BONUS DISTRIBUTION (Optimized) ====================
    function _distributeBonuses(BonusParams memory params) internal {
        // Direct sponsor bonus
        _distributeDirectBonus(params.sponsor, params.amount);
        
        // Level bonuses (simplified to avoid stack too deep)
        _distributeLevelBonuses(params.user, params.amount);
        
        // Pool contributions
        uint256 ghpAmount = (params.amount * GLOBAL_HELP_POOL_RATE) / BASIS_POINTS;
        globalHelpPoolBalance += uint128(ghpAmount);
        
        emit PoolUpdated("GHP", ghpAmount, block.timestamp);
    }

    function _distributeDirectBonus(address _sponsor, uint256 _amount) internal {
        if (!users[_sponsor].isRegistered || !users[_sponsor].isActive || users[_sponsor].isBlacklisted) {
            return;
        }
        
        uint256 bonusAmount = (_amount * SPONSOR_COMMISSION_RATE) / BASIS_POINTS;
        
        // Check earnings cap
        if (users[_sponsor].totalEarnings + bonusAmount > users[_sponsor].earningsCap) {
            bonusAmount = users[_sponsor].earningsCap > users[_sponsor].totalEarnings 
                ? users[_sponsor].earningsCap - users[_sponsor].totalEarnings 
                : 0;
        }
        
        if (bonusAmount > 0) {
            users[_sponsor].totalEarnings += uint128(bonusAmount);
            users[_sponsor].withdrawableBalance += uint128(bonusAmount);
            users[_sponsor].directBonus += uint64(bonusAmount);
            
            emit BonusDistributed(_sponsor, msg.sender, bonusAmount, 0, "direct", block.timestamp);
        }
    }

    function _distributeLevelBonuses(address _user, uint256 _amount) internal {
        address current = users[_user].sponsor;
        uint256 levelAmount = (_amount * LEVEL_BONUS_RATE) / BASIS_POINTS;
        
        // Simplified level distribution (first 3 levels only to avoid stack too deep)
        uint256[3] memory levelPercentages = [uint256(300), 100, 100]; // 3%, 1%, 1%
        
        for (uint256 i = 0; i < 3 && current != address(0); i++) {
            if (users[current].isRegistered && users[current].isActive && !users[current].isBlacklisted) {
                uint256 bonus = (levelAmount * levelPercentages[i]) / 1000;
                
                // Check earnings cap
                if (users[current].totalEarnings + bonus <= users[current].earningsCap) {
                    users[current].totalEarnings += uint128(bonus);
                    users[current].withdrawableBalance += uint128(bonus);
                    users[current].levelBonus += uint64(bonus);
                    
                    emit BonusDistributed(current, _user, bonus, uint8(i + 1), "level", block.timestamp);
                }
            }
            current = users[current].sponsor;
        }
    }

    // ==================== ADMIN FUNCTIONS ====================
    function registerRootUser(address _user, PackageTier _tier) external onlyRole(ADMIN_ROLE) {
        require(!users[_user].isRegistered, "Already registered");
        
        users[_user] = User({
            isRegistered: true,
            isActive: true,
            sponsor: address(0),
            packageTier: uint8(_tier),
            totalInvestment: 0,
            totalEarnings: 0,
            withdrawableBalance: 0,
            directReferrals: 0,
            registrationTime: uint32(block.timestamp),
            earningsCap: 0,
            isBlacklisted: false,
            lastWithdrawal: 0,
            directBonus: 0,
            levelBonus: 0,
            uplineBonus: 0
        });
        
        allUsers.push(_user);
        totalUsers++;
        
        emit UserRegistered(_user, address(0), uint8(_tier), 0, block.timestamp);
    }

    function blacklistUser(address _user) external onlyRole(ADMIN_ROLE) {
        users[_user].isBlacklisted = true;
        users[_user].isActive = false;
    }
    
    function unblacklistUser(address _user) external onlyRole(ADMIN_ROLE) {
        users[_user].isBlacklisted = false;
        users[_user].isActive = true;
    }

    // ==================== VIEW FUNCTIONS (Simplified) ====================
    function getUserBasic(address _user) external view returns (
        bool isRegistered, bool isActive, address sponsor, 
        uint256 userTotalInvestment, uint256 withdrawableBalance
    ) {
        User storage u = users[_user];
        return (u.isRegistered, u.isActive, u.sponsor, u.totalInvestment, u.withdrawableBalance);
    }
    
    function getUserBonuses(address _user) external view returns (uint256, uint256, uint256) {
        User storage u = users[_user];
        return (u.directBonus, u.levelBonus, u.uplineBonus);
    }
    
    function getPackageAmount(uint256 _tier) external view returns (uint256) {
        require(_tier >= 1 && _tier <= 4, "Invalid tier");
        return packages[uint8(_tier)].amount;
    }
    
    function getDirectReferrals(address _user) external view returns (address[] memory) {
        return directReferrals[_user];
    }

    function getTotalUsers() external view returns (uint256) {
        return totalUsers;
    }

    function getTotalInvestment() external view returns (uint256) {
        return totalInvestment;
    }

    // ==================== EMERGENCY FUNCTIONS ====================
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }
    
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }

    function emergencyWithdrawal(address payable _recipient, uint256 _amount) external onlyRole(ADMIN_ROLE) {
        require(address(this).balance >= _amount, "Insufficient balance");
        _recipient.transfer(_amount);
    }

    // ==================== REQUIRED OVERRIDES ====================
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    // ==================== FALLBACK ====================
    receive() external payable {}
}
