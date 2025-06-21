// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Import optimized libraries
import "./libraries/CommissionLib.sol";
import "./libraries/MatrixLib.sol";
import "./libraries/PoolLib.sol";
import "./libraries/UserManagementLib.sol";
import "./libraries/OracleLib.sol";

interface IPriceFeed {
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80);
}

contract LeadFiveOptimized is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {
    using CommissionLib for *;
    using MatrixLib for *;
    using PoolLib for *;
    using UserManagementLib for *;
    using OracleLib for *;
    
    // Core data structures
    mapping(address => CommissionLib.User) public users;
    mapping(uint8 => CommissionLib.Package) public packages;
    mapping(address => address[]) public directReferrals;
    mapping(address => address[30]) public uplineChain;
    mapping(address => address[2]) public binaryMatrix;
    mapping(string => address) public referralCodeToUser;
    mapping(address => bool) public isRootUser;
    
    // Pools
    PoolLib.Pool public leaderPool;
    PoolLib.Pool public helpPool;
    PoolLib.Pool public clubPool;
    
    // Core contracts
    IERC20 public usdt;
    IPriceFeed public priceFeed;
    address[16] public adminIds;
    
    // Leader tracking
    address[] public shiningStarLeaders;
    address[] public silverStarLeaders;
    address[] public eligibleHelpPoolUsers;
    uint32 public totalUsers;
    
    // Root user system
    address public rootUser;
    bool public rootUserSet;
    
    // Admin fee system
    address public adminFeeRecipient;
    uint96 public totalAdminFeesCollected;
    
    // Security
    uint256 private lastTxBlock;
    uint256 public constant OWNERSHIP_TRANSFER_DELAY = 7 days;
    address public pendingOwner;
    uint256 public ownershipTransferTime;
    
    // Constants moved to library usage
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant EARNINGS_MULTIPLIER = 4;
    uint256 private constant ADMIN_FEE_RATE = 500; // 5%
    
    // Events
    event UserRegistered(address indexed user, address indexed referrer, uint8 packageLevel, uint96 amount);
    event PackageUpgraded(address indexed user, uint8 newLevel, uint96 amount);
    event BonusDistributed(address indexed recipient, uint96 amount, uint8 bonusType);
    event Withdrawal(address indexed user, uint96 amount);
    event PoolDistributed(uint8 indexed poolType, uint96 amount);
    event AdminFeeCollected(uint96 amount, address indexed user);
    event AdminFeeRecipientUpdated(address indexed newRecipient);
    event ReferralCodeGenerated(address indexed user, string code);
    event OwnershipTransferInitiated(address indexed newOwner, uint256 transferTime);
    event OwnershipTransferCompleted(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyAdmin() {
        require(UserManagementLib.isAdmin(adminIds, msg.sender) || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier antiMEV() {
        require(block.number > lastTxBlock, "MEV protection");
        lastTxBlock = block.number;
        _;
    }
    
    function initialize(address _usdt, address _priceFeed, address[16] memory _adminIds) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        usdt = IERC20(_usdt);
        priceFeed = IPriceFeed(_priceFeed);
        
        // Initialize admin IDs
        UserManagementLib.initializeAdmins(adminIds, msg.sender);
        
        // Initialize packages using library
        CommissionLib.initializePackages(packages);
        
        // Initialize pools using library
        PoolLib.initializePools(leaderPool, helpPool, clubPool);
        
        // Initialize deployer user
        UserManagementLib.initializeDeployer(users[msg.sender], msg.sender);
    }
    
    // ========== CORE FUNCTIONS ==========
    
    function register(address referrer, uint8 packageLevel, bool useUSDT) 
        external payable nonReentrant whenNotPaused antiMEV {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(packageLevel >= 1 && packageLevel <= 4, "Invalid package");
        require(referrer == address(0) || users[referrer].isRegistered, "Invalid referrer");
        
        uint96 amount = _processPayment(packageLevel, useUSDT);
        totalUsers++;
        
        // Use library for user creation
        UserManagementLib.createUser(
            users[msg.sender], 
            referrer, 
            amount, 
            packageLevel, 
            totalUsers
        );
        
        if(referrer != address(0)) {
            UserManagementLib.updateReferralRelations(
                users, 
                directReferrals, 
                uplineChain, 
                binaryMatrix,
                msg.sender, 
                referrer
            );
            
            UserManagementLib.updateLeaderRank(users[referrer], referrer, shiningStarLeaders, silverStarLeaders);
        }
        
        CommissionLib.distributeBonuses(users, packages, leaderPool, helpPool, clubPool, msg.sender, amount, packageLevel);
        emit UserRegistered(msg.sender, referrer, packageLevel, amount);
    }
    
    function registerWithCode(string memory referralCode, uint8 packageLevel, bool useUSDT) 
        external payable nonReentrant whenNotPaused antiMEV {
        address referrer = referralCodeToUser[referralCode];
        require(referrer != address(0), "Invalid referral code");
        
        // Call main register function
        this.register{value: msg.value}(referrer, packageLevel, useUSDT);
    }
    
    function upgradePackage(uint8 newLevel, bool useUSDT) 
        external payable nonReentrant whenNotPaused antiMEV {
        require(users[msg.sender].isRegistered, "Not registered");
        require(!users[msg.sender].isBlacklisted, "Blacklisted");
        require(newLevel > users[msg.sender].packageLevel && newLevel <= 4, "Invalid upgrade");
        
        uint96 amount = _processPayment(newLevel, useUSDT);
        
        UserManagementLib.upgradePackage(users[msg.sender], newLevel, amount);
        CommissionLib.distributeBonuses(users, packages, leaderPool, helpPool, clubPool, msg.sender, amount, newLevel);
        
        emit PackageUpgraded(msg.sender, newLevel, amount);
    }
    
    function withdraw(uint96 amount) external nonReentrant whenNotPaused {
        CommissionLib.User storage user = users[msg.sender];
        require(user.isRegistered && !user.isBlacklisted, "Invalid user");
        require(amount <= user.balance, "Insufficient balance");
        require(adminFeeRecipient != address(0), "Admin fee recipient not set");
        
        (uint96 withdrawable, uint96 adminFee, uint96 userReceives, uint96 reinvestment) = 
            CommissionLib.calculateWithdrawalBreakdown(user, amount, ADMIN_FEE_RATE);
        
        user.balance -= amount;
        totalAdminFeesCollected += adminFee;
        
        payable(msg.sender).transfer(userReceives);
        payable(adminFeeRecipient).transfer(adminFee);
        
        if(reinvestment > 0) {
            CommissionLib.distributeReinvestment(users, uplineChain, helpPool, msg.sender, reinvestment);
        }
        
        emit Withdrawal(msg.sender, userReceives);
        emit AdminFeeCollected(adminFee, msg.sender);
    }
    
    // ========== POOL FUNCTIONS ==========
    
    function distributePools() external onlyAdmin {
        uint32 currentTime = uint32(block.timestamp);
        
        if(PoolLib.isDistributionReady(leaderPool)) {
            uint96 distributed = PoolLib.distributeLeaderPool(leaderPool, shiningStarLeaders, silverStarLeaders);
            if(distributed > 0) emit PoolDistributed(1, distributed);
        }
        
        if(PoolLib.isDistributionReady(helpPool)) {
            (uint96 distributed, , bool completed) = PoolLib.distributeHelpPoolBatch(
                helpPool, eligibleHelpPoolUsers, 0, 50
            );
            if(completed && distributed > 0) emit PoolDistributed(2, distributed);
        }
        
        if(PoolLib.isDistributionReady(clubPool)) {
            uint96 distributed = PoolLib.distributeClubPool(clubPool, silverStarLeaders);
            if(distributed > 0) emit PoolDistributed(3, distributed);
        }
    }
    
    // ========== ROOT USER SYSTEM ==========
    
    function setRootUser(address _rootUser) external onlyOwner {
        require(!rootUserSet, "Root user already set");
        require(_rootUser != address(0), "Invalid address");
        
        rootUser = _rootUser;
        rootUserSet = true;
        isRootUser[_rootUser] = true;
        
        UserManagementLib.initializeRootUser(users[_rootUser], _rootUser);
        referralCodeToUser["ROOT001"] = _rootUser;
        totalUsers = 1;
    }
    
    // ========== REFERRAL CODE SYSTEM ==========
    
    function generateReferralCode(address user) external returns (string memory) {
        require(users[user].isRegistered, "User not registered");
        
        string memory code = UserManagementLib.generateUniqueReferralCode(user, referralCodeToUser);
        users[user].referralCode = code;
        referralCodeToUser[code] = user;
        
        emit ReferralCodeGenerated(user, code);
        return code;
    }
    
    // ========== PAYMENT PROCESSING ==========
    
    function _processPayment(uint8 packageLevel, bool useUSDT) internal returns (uint96) {
        uint96 packagePrice = packages[packageLevel].price;
        
        if(useUSDT) {
            require(usdt.transferFrom(msg.sender, address(this), packagePrice), "USDT transfer failed");
            return packagePrice;
        } else {
            uint96 bnbRequired = OracleLib.getBNBPrice(priceFeed, packagePrice);
            require(msg.value >= bnbRequired, "Insufficient BNB");
            
            if(msg.value > bnbRequired) {
                payable(msg.sender).transfer(msg.value - bnbRequired);
            }
            return packagePrice;
        }
    }
    
    // ========== ADMIN FUNCTIONS ==========
    
    function setAdminFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid address");
        adminFeeRecipient = _recipient;
        emit AdminFeeRecipientUpdated(_recipient);
    }
    
    function blacklistUser(address user, bool status) external onlyAdmin {
        UserManagementLib.blacklistUser(users[user], user, status, shiningStarLeaders, silverStarLeaders, eligibleHelpPoolUsers);
    }
    
    function addEligibleHelpPoolUser(address user) external onlyAdmin {
        UserManagementLib.addEligibleHelpPoolUser(users[user], user, eligibleHelpPoolUsers);
    }
    
    function removeEligibleHelpPoolUser(address user) external onlyAdmin {
        UserManagementLib.removeEligibleHelpPoolUser(users[user], user, eligibleHelpPoolUsers);
    }
    
    // ========== DELAYED OWNERSHIP TRANSFER ==========
    
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "Invalid address");
        pendingOwner = newOwner;
        ownershipTransferTime = block.timestamp + OWNERSHIP_TRANSFER_DELAY;
        emit OwnershipTransferInitiated(newOwner, ownershipTransferTime);
    }
    
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Not pending owner");
        require(block.timestamp >= ownershipTransferTime, "Transfer delay not met");
        require(ownershipTransferTime != 0, "No pending transfer");
        
        address previousOwner = owner();
        _transferOwnership(pendingOwner);
        
        pendingOwner = address(0);
        ownershipTransferTime = 0;
        
        emit OwnershipTransferCompleted(previousOwner, owner());
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function getUserInfo(address user) external view returns (CommissionLib.User memory) {
        return users[user];
    }
    
    function getDirectReferrals(address user) external view returns (address[] memory) {
        return directReferrals[user];
    }
    
    function getUplineChain(address user) external view returns (address[30] memory) {
        return uplineChain[user];
    }
    
    function getBinaryMatrix(address user) external view returns (address[2] memory) {
        return binaryMatrix[user];
    }
    
    function getPoolBalances() external view returns (uint96, uint96, uint96) {
        return (leaderPool.balance, helpPool.balance, clubPool.balance);
    }
    
    function getAdminFeeInfo() external view returns (address, uint96, uint256) {
        return (adminFeeRecipient, totalAdminFeesCollected, ADMIN_FEE_RATE);
    }
    
    function getLeaderStats() external view returns (
        uint256 shiningStarCount,
        uint256 silverStarCount,
        address[] memory shiningStars,
        address[] memory silverStars
    ) {
        return (
            shiningStarLeaders.length,
            silverStarLeaders.length,
            shiningStarLeaders,
            silverStarLeaders
        );
    }
    
    function getSystemStats() external view returns (
        uint32 totalUsersCount,
        uint96 totalLeaderPool,
        uint96 totalHelpPool,
        uint256 eligibleHelpUsers,
        uint32 currentLevel
    ) {
        return (
            totalUsers,
            leaderPool.balance,
            helpPool.balance,
            eligibleHelpPoolUsers.length,
            1 // Simplified for now
        );
    }
    
    function calculateTeamSize(address user) external view returns (uint32) {
        return UserManagementLib.calculateTeamSize(directReferrals, user);
    }
    
    function isValidReferralCode(string memory code) external view returns (bool) {
        return referralCodeToUser[code] != address(0);
    }
    
    function getUserByReferralCode(string memory code) external view returns (address) {
        return referralCodeToUser[code];
    }
    
    // ========== EMERGENCY FUNCTIONS ==========
    
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }
    
    function recoverUSDT(uint256 amount) external onlyOwner {
        usdt.transfer(owner(), amount);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    receive() external payable {}
}
