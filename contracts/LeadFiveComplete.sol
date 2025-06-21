// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
        address referrer,
        uint8 currentTier,
        uint96 totalInvestment,
        uint96 totalEarnings,
        uint96 withdrawableBalance,
        uint32 userDirectReferrals,
        uint32 teamSize,
        uint32 level,
        uint32 matrixLevel,
        uint8 rank,
        uint96 earningsCap
    ) {
        DataStructures.User storage u = users[user];
        return (
            u.isRegistered,
            u.isBlacklisted,
            u.referrer,
            u.packageLevel,
            u.totalInvestment,
            u.totalEarnings,
            u.balance,
            u.directReferrals,
            u.teamSize,
            u.matrixLevel,
            u.matrixLevel,
            u.rank,
            u.earningsCap
        );
    }@openzeppelin/contracts/token/ERC20/IERC20.sol";

// ALL Library Imports for Maximum Optimization
import "./libraries/DataStructures.sol";
import "./libraries/UserManagementLib.sol";
import "./libraries/CommissionLib.sol";
import "./libraries/PoolLib.sol";
import "./libraries/ReferralLib.sol";
import "./libraries/MatrixLib.sol";
import "./libraries/LeaderManagement.sol";
import "./libraries/AdminFunctions.sol";
import "./libraries/AdminOperations.sol";
import "./libraries/EventsLib.sol";
import "./libraries/ConstantsLib.sol";

interface IPriceFeed {
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80);
}

/**
 * @title LeadFiveComplete
 * @dev Ultra-optimized LeadFive contract with ALL features using libraries
 * @notice 100% feature parity with main contract while staying under 24KB limit
 */
contract LeadFiveComplete is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {
    using DataStructures for DataStructures.User;
    using UserManagementLib for mapping(address => DataStructures.User);
    using CommissionLib for mapping(uint8 => DataStructures.Package);
    using PoolLib for DataStructures.Pool;
    using ReferralLib for mapping(string => address);
    using MatrixLib for mapping(address => address[2]);
    using LeaderManagement for mapping(LeaderManagement.LeaderRank => LeaderManagement.LeaderQualification);
    using AdminFunctions for mapping(uint256 => DataStructures.Package);
    using AdminOperations for mapping(address => DataStructures.User);
    using EventsLib for *;

    // ========== STORAGE ==========
    
    // Core mappings - optimized
    mapping(address => DataStructures.User) public users;
    mapping(uint8 => DataStructures.Package) public packages;
    mapping(address => address[]) public directReferrals;
    mapping(address => address[30]) public uplineChain;
    mapping(address => address[2]) public binaryMatrix;
    mapping(string => address) public referralCodeToUser;
    mapping(address => bool) public isRootUser;
    
    // Pool system
    DataStructures.Pool public leaderPool;
    DataStructures.Pool public helpPool;
    DataStructures.Pool public clubPool;
    
    // External contracts
    IERC20 public usdt;
    IPriceFeed public priceFeed;
    address[16] public adminIds;
    
    // Tracking arrays - optimized
    address[] public shiningStarLeaders;
    address[] public silverStarLeaders;  
    address[] public eligibleHelpPoolUsers;
    
    // Counters - packed
    uint32 public totalUsers;
    uint32 public matrixWidth;
    uint32 public currentMatrixLevel;
    
    // Root user system
    address public rootUser;
    bool public rootUserSet;
    
    // Admin fee system - packed
    address public adminFeeRecipient;
    uint96 public totalAdminFeesCollected;
    
    // Security
    uint256 private lastTxBlock;
    
    // Constants - optimized storage using library
    uint256 private constant BASIS_POINTS = ConstantsLib.BASIS_POINTS;
    uint256 private constant EARNINGS_MULTIPLIER = ConstantsLib.EARNINGS_CAP_MULTIPLIER;
    uint256 private constant ADMIN_FEE_RATE = ConstantsLib.MAX_FEE_RATE; // 5%
    uint256 private constant OWNERSHIP_TRANSFER_DELAY = 7 days;
    
    // Delayed ownership transfer
    address public pendingOwner;
    uint256 public ownershipTransferTime;
    
    // ========== EVENTS ==========
    
    event UserRegistered(address indexed user, address indexed referrer, uint8 packageLevel, uint96 amount);
    event PackageUpgraded(address indexed user, uint8 newLevel, uint96 amount);
    event BonusDistributed(address indexed recipient, uint96 amount, uint8 bonusType);
    event Withdrawal(address indexed user, uint96 amount);
    event PoolDistributed(uint8 indexed poolType, uint96 amount);
    event AdminFeeCollected(uint96 amount, address indexed user);
    event ReferralCodeGenerated(address indexed user, string code);
    event UserBlacklisted(address indexed user, bool status);
    event RootUserSet(address indexed user);
    event LeaderPromoted(address indexed user, uint8 rank);
    event HelpPoolDistribution(uint96 amount, uint256 recipients);
    event MatrixPositionAssigned(address indexed user, uint32 position, uint32 level);
    event EarningsCapAdjusted(address indexed user, uint96 oldCap, uint96 newCap);
    event WithdrawalRateChanged(address indexed user, uint8 oldRate, uint8 newRate);
    event EmergencyWithdrawal(address indexed user, uint96 amount);
    event ContractPaused(address indexed admin, string reason);
    event ContractUnpaused(address indexed admin);
    event AdminUpdated(uint8 indexed slot, address indexed oldAdmin, address indexed newAdmin);
    event OwnershipTransferInitiated(address indexed currentOwner, address indexed pendingOwner, uint256 transferTime);

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
    
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "Not registered");
        _;
    }
    
    modifier notBlacklisted(address user) {
        require(!users[user].isBlacklisted, "User blacklisted");
        _;
    }

    // ========== INITIALIZATION ==========
    
    function initialize(
        address _usdt, 
        address _priceFeed, 
        address[16] memory _adminIds
    ) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        usdt = IERC20(_usdt);
        priceFeed = IPriceFeed(_priceFeed);
        adminFeeRecipient = msg.sender;
        
        // Initialize admin IDs
        for(uint i = 0; i < 16; i++) {
            adminIds[i] = _adminIds[i];
        }
        
        // Initialize packages using library
        packages.initializePackages();
        
        // Initialize pools using library
        leaderPool.initialize(604800); // 1 week
        helpPool.initialize(604800);   // 1 week
        clubPool.initialize(2592000);  // 1 month
        
        // Initialize matrix system
        matrixWidth = 2;
        currentMatrixLevel = 1;
        
        // Initialize deployer as first user
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
            referralCode: ""
        });
        
        totalUsers = 1;
    }

    // ========== CORE FUNCTIONS ==========
    
    function register(
        address referrer, 
        uint8 packageLevel, 
        bool useUSDT
    ) external payable nonReentrant whenNotPaused antiMEV {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(packageLevel >= 1 && packageLevel <= 4, "Invalid package");
        require(referrer == address(0) || users[referrer].isRegistered, "Invalid referrer");
        
        uint96 amount = _processPayment(packageLevel, useUSDT);
        totalUsers++;
        
        // Use library to create user
        users[msg.sender] = UserManagementLib.createUser(
            referrer,
            amount,
            packageLevel,
            totalUsers
        );
        
        // Update referrer data using library
        if (referrer != address(0)) {
            UserManagementLib.updateReferrerData(users, referrer, msg.sender);
            directReferrals[referrer].push(msg.sender);
            
            // Use MatrixLib for matrix placement
            (address placementParent, uint8 position) = MatrixLib.findPlacementPosition(binaryMatrix, referrer);
            binaryMatrix[placementParent][position] = msg.sender;
            
            // Build upline chain manually (simplified)
            uplineChain[msg.sender][0] = referrer;
            for (uint8 i = 1; i < 30; i++) {
                address nextUpline = uplineChain[uplineChain[msg.sender][i-1]][0];
                if (nextUpline == address(0)) break;
                uplineChain[msg.sender][i] = nextUpline;
            }
        }
        
        // Generate referral code using library
        string memory refCode = ReferralLib.generateCode(referralCodeToUser, msg.sender);
        users[msg.sender].referralCode = refCode;
        
        // Distribute commissions using library
        _distributeCommissions(msg.sender, amount, packageLevel);
        
        // Emit event using EventsLib
        EventsLib.emitUserRegistered(msg.sender, referrer, packageLevel);
    }
    
    function upgradePackage(uint8 newLevel, bool useUSDT) 
        external payable nonReentrant whenNotPaused onlyRegistered antiMEV {
        require(newLevel > users[msg.sender].packageLevel, "Invalid upgrade");
        require(newLevel <= 4, "Invalid package level");
        
        uint96 currentPrice = packages[users[msg.sender].packageLevel].price;
        uint96 newPrice = packages[newLevel].price;
        uint96 upgradeCost = newPrice - currentPrice;
        
        uint96 amount = _processPayment(newLevel, useUSDT);
        require(amount >= upgradeCost, "Insufficient payment");
        
        users[msg.sender].packageLevel = newLevel;
        users[msg.sender].totalInvestment += upgradeCost;
        users[msg.sender].earningsCap += upgradeCost * EARNINGS_MULTIPLIER;
        
        _distributeCommissions(msg.sender, upgradeCost, newLevel);
        
        emit PackageUpgraded(msg.sender, newLevel, upgradeCost);
    }
    
    function withdraw(uint96 amount) 
        external nonReentrant whenNotPaused onlyRegistered notBlacklisted(msg.sender) antiMEV {
        require(amount > 0, "Invalid amount");
        require(users[msg.sender].balance >= amount, "Insufficient balance");
        
        // Apply withdrawal rate using library
        uint96 withdrawableAmount = UserManagementLib.calculateWithdrawableAmount(
            users[msg.sender], 
            amount
        );
        
        users[msg.sender].balance -= amount;
        users[msg.sender].totalEarnings += withdrawableAmount;
        
        // Admin fee using library
        uint96 adminFee = (withdrawableAmount * ADMIN_FEE_RATE) / BASIS_POINTS;
        uint96 userAmount = withdrawableAmount - adminFee;
        
        totalAdminFeesCollected += adminFee;
        
        require(usdt.transfer(msg.sender, userAmount), "Transfer failed");
        
        emit Withdrawal(msg.sender, userAmount);
        emit AdminFeeCollected(adminFee, msg.sender);
    }

    // ========== POOL FUNCTIONS ==========
    
    function distributeLeaderPool() external onlyAdmin {
        uint96 amount = leaderPool.distribute(shiningStarLeaders, silverStarLeaders);
        emit PoolDistributed(1, amount);
    }
    
    function distributeHelpPool() external onlyAdmin {
        uint96 amount = helpPool.distributeHelp(eligibleHelpPoolUsers, users);
        emit PoolDistributed(2, amount);
    }
    
    function distributeClubPool() external onlyAdmin {
        uint96 amount = clubPool.distributeClub(users, totalUsers);
        emit PoolDistributed(3, amount);
    }

    // ========== ADMIN FUNCTIONS ==========
    
    function setRootUser(address user) external onlyOwner {
        require(!rootUserSet, "Root user already set");
        require(users[user].isRegistered, "User not registered");
        
        rootUser = user;
        rootUserSet = true;
        isRootUser[user] = true;
        users[user].rank = 5; // Highest rank
        
        emit RootUserSet(user);
    }
    
    function blacklistUser(address user, bool status) external onlyAdmin {
        AdminOperations.blacklistUser(users, user, "Admin blacklist action");
    }
    
    function adjustEarningsCap(address user, uint96 newCap) external onlyAdmin {
        AdminOperations.setEarningsCap(users, user, newCap, "Admin cap adjustment");
    }
    
    function distributeManualBonus(address recipient, uint96 amount, string calldata reason) external onlyAdmin {
        AdminFunctions.distributeManualBonus(users, recipient, amount, reason);
    }
    
    function updateWithdrawalRate(address user, uint8 newRate) external onlyAdmin {
        require(newRate <= 100, "Invalid rate");
        uint8 oldRate = users[user].withdrawalRate;
        users[user].withdrawalRate = newRate;
        emit WithdrawalRateChanged(user, oldRate, newRate);
    }
    
    function updateAdmin(uint8 slot, address newAdmin) external onlyOwner {
        require(slot < 16, "Invalid slot");
        address oldAdmin = adminIds[slot];
        adminIds[slot] = newAdmin;
        emit AdminUpdated(slot, oldAdmin, newAdmin);
    }
    
    function emergencyPause(string calldata reason) external onlyAdmin {
        _pause();
        emit ContractPaused(msg.sender, reason);
    }
    
    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

    // ========== INTERNAL FUNCTIONS ==========
    
    function _processPayment(uint8 packageLevel, bool useUSDT) internal returns (uint96) {
        uint96 packagePrice = packages[packageLevel].price;
        
        if (useUSDT) {
            require(usdt.transferFrom(msg.sender, address(this), packagePrice), "USDT transfer failed");
            return packagePrice;
        } else {
            uint96 bnbAmount = _getBNBAmount(packagePrice);
            require(msg.value >= bnbAmount, "Insufficient BNB");
            
            if (msg.value > bnbAmount) {
                payable(msg.sender).transfer(msg.value - bnbAmount);
            }
            
            return packagePrice;
        }
    }
    
    function _getBNBAmount(uint96 usdAmount) internal view returns (uint96) {
        try priceFeed.latestRoundData() returns (uint80, int256 price, uint256, uint256 updatedAt, uint80) {
            require(price > 0, "Invalid price");
            require(block.timestamp - updatedAt <= 3600, "Price too old");
            return uint96((uint256(usdAmount) * 1e18) / (uint256(price) * 1e10));
        } catch {
            return uint96((usdAmount * 1e18) / 300e18); // Fallback: 1 BNB = $300
        }
    }
    
    function _distributeCommissions(address user, uint96 amount, uint8 packageLevel) internal {
        DataStructures.Package memory pkg = packages[packageLevel];
        
        // Direct bonus
        if (users[user].referrer != address(0)) {
            uint96 directBonus = (amount * pkg.directBonus) / BASIS_POINTS;
            _creditBonus(users[user].referrer, directBonus, 1);
        }
        
        // Level bonuses using library
        CommissionLib.distributeLevelBonuses(
            users, 
            uplineChain, 
            user, 
            amount, 
            pkg.levelBonus
        );
        
        // Pool contributions
        uint96 helpPoolAmount = (amount * pkg.helpBonus) / BASIS_POINTS;
        uint96 leaderPoolAmount = (amount * pkg.leaderBonus) / BASIS_POINTS;
        uint96 clubPoolAmount = (amount * pkg.clubBonus) / BASIS_POINTS;
        
        helpPool.balance += helpPoolAmount;
        leaderPool.balance += leaderPoolAmount;
        clubPool.balance += clubPoolAmount;
    }
    
    function _creditBonus(address recipient, uint96 amount, uint8 bonusType) internal {
        if (users[recipient].totalEarnings + amount <= users[recipient].earningsCap) {
            users[recipient].balance += amount;
            emit BonusDistributed(recipient, amount, bonusType);
        }
    }

    // ========== VIEW FUNCTIONS ==========
    
    function getUserDetails(address user) external view returns (
        bool isRegistered,
        bool isBlacklisted,
        address referrer,
        uint8 currentTier,
        uint96 totalInvestment,
        uint96 totalEarnings,
        uint96 withdrawableBalance,
        uint32 userDirectReferrals,
        uint32 teamSize,
        uint8 level,
        uint8 matrixLevel,
        uint8 rank,
        uint96 earningsCap
    ) {
        return UserOperations.getUserInfo(users, user);
    }
    
    function getPoolBalances() external view returns (uint96, uint96, uint96) {
        return (leaderPool.balance, helpPool.balance, clubPool.balance);
    }
    
    function getMatrixPosition(address user) external view returns (uint32, uint32) {
        return (users[user].matrixPosition, users[user].matrixLevel);
    }
    
    function getReferralInfo(address user) external view returns (string memory, address[] memory, uint32) {
        return (
            users[user].referralCode,
            directReferrals[user],
            users[user].directReferrals
        );
    }
    
    function isEligibleForWithdrawal(address user, uint96 amount) external view returns (bool, uint96) {
        uint96 withdrawable = UserManagementLib.calculateWithdrawableAmount(users[user], amount);
        return (users[user].balance >= amount, withdrawable);
    }
    
    function getBNBPrice() external view returns (uint256) {
        try priceFeed.latestRoundData() returns (uint80, int256 price, uint256, uint256 updatedAt, uint80) {
            require(price > 0, "Invalid price");
            require(block.timestamp - updatedAt <= 3600, "Price too old");
            return uint256(price) * 1e10; // Convert to 18 decimals
        } catch {
            return 300e18; // Fallback: $300
        }
    }

    // ========== UPGRADE FUNCTION ==========
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    // ========== EMERGENCY FUNCTIONS ==========
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            payable(owner()).transfer(balance);
        }
        
        uint256 usdtBalance = usdt.balanceOf(address(this));
        if (usdtBalance > 0) {
            usdt.transfer(owner(), usdtBalance);
        }
    }
    
    // ========== RECEIVE FUNCTION ==========
    
    receive() external payable {
        // Accept BNB payments
    }
}
