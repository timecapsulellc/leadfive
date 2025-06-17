// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/**
 * @title OrphiCrowdFund - Ultra Minimal Contract
 * @dev Absolute minimal implementation to fit size constraints
 */
contract OrphiCrowdFundMinimal is 
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
    uint256 public constant EARNINGS_CAP_BASIS_POINTS = 30000; // 300%

    // ==================== ROLES ====================
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // ==================== ENUMS ====================
    enum PackageTier { NONE, PACKAGE_5, PACKAGE_6, PACKAGE_7, PACKAGE_8 }
    enum LeaderRank { NONE, BRONZE, SILVER, GOLD, PLATINUM, DIAMOND }

    // ==================== STRUCTS ====================
    struct User {
        bool isRegistered;
        bool isActive;
        address sponsor;
        uint256 totalInvestment;
        uint256 totalEarnings;
        uint256 withdrawableBalance;
        uint256 directReferrals;
        PackageTier currentTier;
        uint256 registrationTime;
        uint256 earningsCap;
        bool isBlacklisted;
        uint256 directBonus;
        uint256 levelBonus;
        uint256 uplineBonus;
    }
    
    struct Package {
        uint256 amount;
        uint256 bnbAmount;
        uint256 usdtAmount;
        bool isActive;
    }

    // ==================== STATE VARIABLES ====================
    mapping(address => User) public users;
    mapping(uint8 => Package) public packages;
    mapping(address => address[]) public directReferrals;
    
    address[] public allUsers;
    uint256 public totalUsers;
    uint256 public totalInvestment;

    // ==================== EVENTS ====================
    event UserRegistered(address indexed user, address indexed sponsor, uint256 packageTier, uint256 amount);
    event BonusDistributed(address indexed recipient, uint256 amount, string bonusType);

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
        
        // Initialize packages
        packages[1] = Package(300 * 1e18, 0.5 ether, 300 * 1e18, true);
        packages[2] = Package(500 * 1e18, 0.8 ether, 500 * 1e18, true);
        packages[3] = Package(1000 * 1e18, 1.6 ether, 1000 * 1e18, true);
        packages[4] = Package(2000 * 1e18, 3.2 ether, 2000 * 1e18, true);
    }

    // ==================== REGISTRATION ====================
    function register(address referrer, PackageTier tier) external payable nonReentrant whenNotPaused {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(users[referrer].isRegistered, "Invalid referrer");
        require(tier != PackageTier.NONE, "Invalid package");
        
        uint8 packageTier = uint8(tier);
        uint256 requiredAmount = packages[packageTier].amount;
        require(msg.value == requiredAmount, "Incorrect amount");
        
        // Register user
        users[msg.sender] = User({
            isRegistered: true,
            isActive: true,
            sponsor: referrer,
            totalInvestment: requiredAmount,
            totalEarnings: 0,
            withdrawableBalance: 0,
            directReferrals: 0,
            currentTier: tier,
            registrationTime: block.timestamp,
            earningsCap: (requiredAmount * EARNINGS_CAP_BASIS_POINTS) / BASIS_POINTS,
            isBlacklisted: false,
            directBonus: 0,
            levelBonus: 0,
            uplineBonus: 0
        });
        
        allUsers.push(msg.sender);
        directReferrals[referrer].push(msg.sender);
        users[referrer].directReferrals++;
        totalUsers++;
        totalInvestment += requiredAmount;
        
        // Direct bonus
        _distributeDirectBonus(referrer, requiredAmount);
        
        emit UserRegistered(msg.sender, referrer, packageTier, requiredAmount);
    }

    function registerRootUser(address user, PackageTier tier) external onlyRole(ADMIN_ROLE) {
        require(!users[user].isRegistered, "Already registered");
        
        users[user] = User({
            isRegistered: true,
            isActive: true,
            sponsor: address(0),
            totalInvestment: 0,
            totalEarnings: 0,
            withdrawableBalance: 0,
            directReferrals: 0,
            currentTier: tier,
            registrationTime: block.timestamp,
            earningsCap: 0,
            isBlacklisted: false,
            directBonus: 0,
            levelBonus: 0,
            uplineBonus: 0
        });
        
        allUsers.push(user);
        totalUsers++;
        
        emit UserRegistered(user, address(0), uint8(tier), 0);
    }

    // ==================== INTERNAL FUNCTIONS ====================
    function _distributeDirectBonus(address sponsor, uint256 amount) internal {
        if (!users[sponsor].isRegistered || !users[sponsor].isActive || users[sponsor].isBlacklisted) {
            return;
        }
        
        uint256 bonusAmount = (amount * SPONSOR_COMMISSION_RATE) / BASIS_POINTS;
        
        if (users[sponsor].totalEarnings + bonusAmount > users[sponsor].earningsCap) {
            bonusAmount = users[sponsor].earningsCap > users[sponsor].totalEarnings 
                ? users[sponsor].earningsCap - users[sponsor].totalEarnings 
                : 0;
        }
        
        if (bonusAmount > 0) {
            users[sponsor].totalEarnings += bonusAmount;
            users[sponsor].withdrawableBalance += bonusAmount;
            users[sponsor].directBonus += bonusAmount;
            
            emit BonusDistributed(sponsor, bonusAmount, "direct");
        }
    }

    // ==================== VIEW FUNCTIONS ====================
    function getUserBasic(address user) external view returns (
        bool isRegistered, bool isActive, address sponsor, 
        uint256 totalInvestment, uint256 withdrawableBalance
    ) {
        User storage u = users[user];
        return (u.isRegistered, u.isActive, u.sponsor, u.totalInvestment, u.withdrawableBalance);
    }
    
    function getUserBonuses(address user) external view returns (uint256, uint256, uint256) {
        User storage u = users[user];
        return (u.directBonus, u.levelBonus, u.uplineBonus);
    }
    
    function getPackageAmount(uint256 tier) external view returns (uint256) {
        require(tier >= 1 && tier <= 4, "Invalid tier");
        return packages[uint8(tier)].amount;
    }
    
    function getDirectReferrals(address user) external view returns (address[] memory) {
        return directReferrals[user];
    }

    // ==================== ADMIN FUNCTIONS ====================
    function blacklistUser(address user) external onlyRole(ADMIN_ROLE) {
        users[user].isBlacklisted = true;
        users[user].isActive = false;
    }
    
    function unblacklistUser(address user) external onlyRole(ADMIN_ROLE) {
        users[user].isBlacklisted = false;
        users[user].isActive = true;
    }
    
    function emergencyWithdrawal(address payable recipient, uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(address(this).balance >= amount, "Insufficient balance");
        recipient.transfer(amount);
    }

    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }
    
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }

    // ==================== REQUIRED OVERRIDES ====================
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    // ==================== FALLBACK ====================
    receive() external payable {}
}
