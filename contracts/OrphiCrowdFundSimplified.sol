// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

// ==================== INTERFACES ====================

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
 * @title OrphiCrowdFund Simplified
 * @dev Simplified version for testing core security features
 */
contract OrphiCrowdFundSimplified is 
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    
    // ==================== ROLES ====================
    
    bytes32 public constant POOL_MANAGER_ROLE = keccak256("POOL_MANAGER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    // ==================== STRUCTS ====================
    
    struct User {
        bool isRegistered;
        address sponsor;
        uint256 totalInvested;
        uint256 totalEarnings;
        uint256 withdrawableAmount;
        uint256 packageCount;
        uint256 lastWithdrawal;
    }
    
    // ==================== STATE VARIABLES ====================
    
    mapping(address => User) public users;
    mapping(address => uint256) public lastActionBlock;
    
    IERC20 public usdtToken;
    uint256 public totalUsers;
    
    // Package amounts (USDT decimals = 6)
    uint256[4] public packageAmounts;
    
    // Security features
    bool public mevProtectionEnabled;
    bool public circuitBreakerEnabled;
    bool public timelockEnabled;
    
    uint256 public constant MIN_BLOCK_DELAY = 1;
    uint256 public maxDailyWithdrawals;
    uint256 public currentDayWithdrawals;
    uint256 public lastWithdrawalResetTime;
    
    // ==================== EVENTS ====================
    
    event UserRegistered(address indexed user, address indexed sponsor);
    event PackagePurchased(address indexed user, uint256 packageIndex, uint256 amount);
    event WithdrawalProcessed(address indexed user, uint256 amount);
    
    // ==================== MODIFIERS ====================
    
    modifier mevProtection() {
        if (mevProtectionEnabled) {
            require(block.number > lastActionBlock[msg.sender] + MIN_BLOCK_DELAY, "MEV protection active");
            lastActionBlock[msg.sender] = block.number;
        }
        _;
    }
    
    modifier circuitBreakerCheck(uint256 amount) {
        if (circuitBreakerEnabled) {
            _resetDailyWithdrawalsIfNeeded();
            require(currentDayWithdrawals + amount <= maxDailyWithdrawals, "Daily limit exceeded");
            currentDayWithdrawals += amount;
        }
        _;
    }
    
    // ==================== INITIALIZER ====================
    
    function initialize(
        address _usdtToken,
        address _oracleAddress,
        address _adminAddress,
        bool _mevProtectionEnabled,
        bool _circuitBreakerEnabled,
        bool _timelockEnabled
    ) public initializer {
        require(_usdtToken != address(0), "Invalid USDT address");
        
        __Ownable_init(msg.sender);
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        usdtToken = IERC20(_usdtToken);
        mevProtectionEnabled = _mevProtectionEnabled;
        circuitBreakerEnabled = _circuitBreakerEnabled;
        timelockEnabled = _timelockEnabled;
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(POOL_MANAGER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        
        // Initialize package amounts (USDT has 6 decimals)
        packageAmounts[0] = 30 * 10**6;   // $30
        packageAmounts[1] = 50 * 10**6;   // $50
        packageAmounts[2] = 100 * 10**6;  // $100
        packageAmounts[3] = 200 * 10**6;  // $200
        
        // Circuit breaker settings
        maxDailyWithdrawals = 10000 * 10**6; // $10,000 daily limit
        lastWithdrawalResetTime = block.timestamp;
    }
    
    // ==================== CORE FUNCTIONS ====================
    
    function register(address sponsor) external whenNotPaused mevProtection {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(sponsor != msg.sender, "Cannot sponsor yourself");
        
        users[msg.sender] = User({
            isRegistered: true,
            sponsor: sponsor,
            totalInvested: 0,
            totalEarnings: 0,
            withdrawableAmount: 0,
            packageCount: 0,
            lastWithdrawal: 0
        });
        
        totalUsers++;
        emit UserRegistered(msg.sender, sponsor);
    }
    
    function purchasePackage(uint256 packageIndex, address placement) 
        external 
        whenNotPaused 
        mevProtection 
        nonReentrant 
    {
        require(users[msg.sender].isRegistered, "Not registered");
        require(packageIndex < 4, "Invalid package");
        
        uint256 amount = packageAmounts[packageIndex];
        
        // Transfer USDT from user
        require(
            usdtToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        users[msg.sender].totalInvested += amount;
        users[msg.sender].packageCount++;
        
        // Distribute commissions
        _distributeCommissions(msg.sender, amount);
        
        emit PackagePurchased(msg.sender, packageIndex, amount);
    }
    
    function withdraw() 
        external 
        whenNotPaused 
        mevProtection 
        nonReentrant 
        circuitBreakerCheck(users[msg.sender].withdrawableAmount)
    {
        require(users[msg.sender].isRegistered, "Not registered");
        require(users[msg.sender].withdrawableAmount > 0, "No withdrawable amount");
        
        uint256 amount = users[msg.sender].withdrawableAmount;
        
        // Follow CEI pattern - Effects first
        users[msg.sender].withdrawableAmount = 0;
        users[msg.sender].lastWithdrawal = block.timestamp;
        
        // Interactions last
        require(usdtToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit WithdrawalProcessed(msg.sender, amount);
    }
    
    // ==================== INTERNAL FUNCTIONS ====================
    
    function _distributeCommissions(address user, uint256 amount) internal {
        address sponsor = users[user].sponsor;
        if (sponsor != address(0) && users[sponsor].isRegistered) {
            // Simple 40% sponsor commission
            uint256 commission = (amount * 4000) / 10000;
            users[sponsor].totalEarnings += commission;
            users[sponsor].withdrawableAmount += commission;
        }
    }
    
    function _resetDailyWithdrawalsIfNeeded() internal {
        if (block.timestamp >= lastWithdrawalResetTime + 1 days) {
            currentDayWithdrawals = 0;
            lastWithdrawalResetTime = block.timestamp;
        }
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }
    
    function setMEVProtection(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        mevProtectionEnabled = enabled;
    }
    
    function setCircuitBreaker(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        circuitBreakerEnabled = enabled;
    }
    
    function emergencyWithdraw(address token, uint256 amount) 
        external 
        onlyRole(EMERGENCY_ROLE) 
    {
        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).transfer(msg.sender, amount);
        }
    }
    
    // ==================== UPGRADE AUTHORIZATION ====================
    
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {}
    
    // ==================== VIEW FUNCTIONS ====================
    
    function getUserInfo(address user) external view returns (User memory) {
        return users[user];
    }
    
    function getPackageAmounts() external view returns (uint256[4] memory) {
        return packageAmounts;
    }
    
    function isUserRegistered(address user) external view returns (bool) {
        return users[user].isRegistered;
    }
}
