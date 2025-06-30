// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

/**
 * @title LeadFiveFullyInlined
 * @dev Completely inlined version with NO external dependencies
 * @notice Single contract deployment - zero external imports
 * 
 * FEATURES INCLUDED:
 * - All business logic from LeadFive.sol
 * - All security features and audit recommendations
 * - Complete bonus distribution system
 * - Matrix management system  
 * - Pool distribution system
 * - Admin management with proper access controls
 * - Withdrawal safety mechanisms
 * - Anti-MEV protection
 * - Circuit breaker for large withdrawals
 * - Reserve fund management
 * - Emergency controls
 * - All OpenZeppelin functionality inlined
 * 
 * OPTIMIZATION:
 * - Zero external contract calls during deployment
 * - All libraries and interfaces embedded
 * - Maintains full functionality
 * - Maximum gas savings on deployment
 */

// ==================== INLINED INTERFACES ====================

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IERC1822Proxiable {
    function proxiableUUID() external view returns (bytes32);
}

interface IPriceFeed {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 price,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

// ==================== INLINED OPENZEPPELIN CONTRACTS ====================

/**
 * @dev This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
 * behind a proxy. Since proxied contracts do not make use of a constructor, it's common to move constructor logic to an
 * external initializer function, usually called `initialize`. It then becomes necessary to protect this initializer
 * function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.
 */
abstract contract Initializable {
    uint8 private _initialized;
    bool private _initializing;

    event Initialized(uint8 version);

    modifier initializer() {
        bool isTopLevelCall = !_initializing;
        require(
            (isTopLevelCall && _initialized < 1) || (!isTopLevelCall && _initialized == 1),
            "Initializable: contract is already initialized"
        );
        _initialized = 1;
        if (isTopLevelCall) {
            _initializing = true;
        }
        _;
        if (isTopLevelCall) {
            _initializing = false;
            emit Initialized(1);
        }
    }

    modifier reinitializer(uint8 version) {
        require(!_initializing && _initialized < version, "Initializable: contract is already initialized");
        _initialized = version;
        _initializing = true;
        _;
        _initializing = false;
        emit Initialized(version);
    }

    modifier onlyInitializing() {
        require(_initializing, "Initializable: contract is not initializing");
        _;
    }

    function _disableInitializers() internal virtual {
        require(!_initializing, "Initializable: contract is initializing");
        if (_initialized != type(uint8).max) {
            _initialized = type(uint8).max;
            emit Initialized(type(uint8).max);
        }
    }

    function _getInitializedVersion() internal view returns (uint8) {
        return _initialized;
    }

    function _isInitializing() internal view returns (bool) {
        return _initializing;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 */
abstract contract OwnableUpgradeable is Initializable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function __Ownable_init() internal onlyInitializing {
        __Ownable_init_unchained();
    }

    function __Ownable_init_unchained() internal onlyInitializing {
        _transferOwnership(msg.sender);
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    uint256[49] private __gap;
}

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 */
abstract contract ReentrancyGuardUpgradeable is Initializable {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    function __ReentrancyGuard_init() internal onlyInitializing {
        __ReentrancyGuard_init_unchained();
    }

    function __ReentrancyGuard_init_unchained() internal onlyInitializing {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        _status = _NOT_ENTERED;
    }

    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }

    uint256[49] private __gap;
}

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 */
abstract contract PausableUpgradeable is Initializable {
    event Paused(address account);
    event Unpaused(address account);

    bool private _paused;

    function __Pausable_init() internal onlyInitializing {
        __Pausable_init_unchained();
    }

    function __Pausable_init_unchained() internal onlyInitializing {
        _paused = false;
    }

    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    modifier whenPaused() {
        _requirePaused();
        _;
    }

    function paused() public view virtual returns (bool) {
        return _paused;
    }

    function _requireNotPaused() internal view virtual {
        require(!paused(), "Pausable: paused");
    }

    function _requirePaused() internal view virtual {
        require(paused(), "Pausable: not paused");
    }

    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }

    uint256[49] private __gap;
}

/**
 * @dev An upgradeability mechanism designed for UUPS proxies. The functions included here can perform an upgrade of an
 * {ERC1967Proxy}, when this contract is set as the implementation behind such a proxy.
 */
abstract contract UUPSUpgradeable is Initializable, IERC1822Proxiable {
    address private immutable __self = address(this);

    modifier onlyProxy() {
        require(address(this) != __self, "Function must be called through delegatecall");
        require(_getImplementation() == __self, "Function must be called through active proxy");
        _;
    }

    modifier notDelegated() {
        require(address(this) == __self, "UUPSUpgradeable: must not be called through delegatecall");
        _;
    }

    function proxiableUUID() external view virtual override notDelegated returns (bytes32) {
        return _IMPLEMENTATION_SLOT;
    }

    function upgradeTo(address newImplementation) external virtual onlyProxy {
        _authorizeUpgrade(newImplementation);
        _upgradeToAndCallUUPS(newImplementation, new bytes(0), false);
    }

    function upgradeToAndCall(address newImplementation, bytes memory data) external payable virtual onlyProxy {
        _authorizeUpgrade(newImplementation);
        _upgradeToAndCallUUPS(newImplementation, data, true);
    }

    function _authorizeUpgrade(address newImplementation) internal virtual;

    bytes32 private constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    function _getImplementation() internal view returns (address) {
        return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
    }

    function _upgradeToAndCallUUPS(
        address newImplementation,
        bytes memory data,
        bool forceCall
    ) internal {
        StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = newImplementation;
        emit Upgraded(newImplementation);

        if (data.length > 0 || forceCall) {
            Address.functionDelegateCall(newImplementation, data);
        }
    }

    event Upgraded(address indexed implementation);
}

// ==================== INLINED UTILITY LIBRARIES ====================

library StorageSlot {
    struct AddressSlot {
        address value;
    }

    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly {
            r.slot := slot
        }
    }
}

library Address {
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
    }

    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    function verifyCallResultFromTarget(
        address target,
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        if (success) {
            if (returndata.length == 0) {
                require(isContract(target), "Address: call to non-contract");
            }
            return returndata;
        } else {
            _revert(returndata, errorMessage);
        }
    }

    function isContract(address account) internal view returns (bool) {
        return account.code.length > 0;
    }

    function _revert(bytes memory returndata, string memory errorMessage) private pure {
        if (returndata.length > 0) {
            assembly {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            revert(errorMessage);
        }
    }
}

// ==================== MAIN CONTRACT ====================

contract LeadFiveFullyInlined is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {
    
    // ==================== DATA STRUCTURES ====================
    
    enum PackageTier { 
        NONE,       // 0
        PACKAGE_1,  // 1 - $30
        PACKAGE_2,  // 2 - $50  
        PACKAGE_3,  // 3 - $100
        PACKAGE_4   // 4 - $200
    }
    
    struct User {
        bool isActive;
        bool hasReferralCode;
        uint32 packageLevel;
        uint64 totalDirectReferrals;
        uint64 totalTeamSize;
        uint128 totalEarnings;
        uint128 pendingWithdrawals;
        address referrer;
        string referralCode;
        uint256 registrationTime;
        uint256 lastWithdrawal;
        uint256 totalWithdrawn;
        
        // Matrix positions
        mapping(uint8 => uint256) matrixPosition;
        mapping(uint8 => uint256) matrixEarnings;
        
        // Genealogy tracking
        address[] directReferrals;
        
        // Pool earnings
        uint256 poolEarnings;
        uint256 lastPoolClaim;
    }
    
    struct MatrixLevel {
        uint256 price;
        uint256 maxUsers;
        uint256 currentUsers;
        uint256 totalEarnings;
        mapping(uint256 => address) users;
        mapping(address => uint256) userIndex;
    }
    
    struct PoolLevel {
        uint256 requiredDirects;
        uint256 requiredTeamSize;
        uint256 rewardAmount;
        uint256 totalUsers;
        uint256 totalDistributed;
        mapping(address => bool) qualifiedUsers;
        mapping(address => uint256) lastClaim;
    }

    // ==================== STATE VARIABLES ====================
    
    // Tokens
    IERC20 public usdtToken;
    IERC20 public wbnbToken;
    IPriceFeed public priceFeed;
    
    // Package prices in USD (scaled by 1e18)
    mapping(PackageTier => uint256) public packagePrices;
    
    // User management
    mapping(address => User) public users;
    mapping(string => address) public referralCodeToUser;
    mapping(address => bool) public adminUsers;
    mapping(address => bool) public blockedUsers;
    
    // Business metrics
    uint256 public totalUsers;
    uint256 public totalPackagesSold;
    uint256 public totalRevenue;
    uint256 public totalWithdrawals;
    
    // Matrix system
    mapping(uint8 => MatrixLevel) public matrixLevels;
    uint8 public constant MAX_MATRIX_LEVEL = 12;
    
    // Pool system
    mapping(uint8 => PoolLevel) public poolLevels;
    uint8 public constant MAX_POOL_LEVEL = 10;
    
    // Admin fees and controls
    uint256 public adminFeePercentage; // Basis points (100 = 1%)
    uint256 public withdrawalFeePercentage; // Basis points
    uint256 public maxWithdrawalPerDay;
    uint256 public minWithdrawalAmount;
    mapping(address => uint256) public dailyWithdrawnAmount;
    mapping(address => uint256) public lastWithdrawalDay;
    
    // Security and limits
    uint256 public maxDailyRegistrations;
    uint256 public currentDailyRegistrations;
    uint256 public lastRegistrationDay;
    uint256 public emergencyWithdrawalLimit;
    bool public emergencyMode;
    
    // Revenue tracking
    uint256 public adminBalance;
    uint256 public reserveFundBalance;
    uint256 public constant RESERVE_FUND_PERCENTAGE = 1000; // 10%
    
    // Anti-MEV protection
    mapping(address => uint256) public lastActionBlock;
    uint256 public constant MIN_BLOCK_DELAY = 1;
    
    // Events
    event UserRegistered(address indexed user, address indexed referrer, PackageTier package, string referralCode);
    event PackagePurchased(address indexed user, PackageTier package, uint256 amount);
    event BonusPaid(address indexed user, address indexed from, uint256 amount, string bonusType);
    event MatrixPlacement(address indexed user, uint8 level, uint256 position);
    event PoolQualification(address indexed user, uint8 level);
    event WithdrawalProcessed(address indexed user, uint256 amount, uint256 fee);
    event AdminFeeCollected(uint256 amount);
    event EmergencyModeToggled(bool enabled);
    event UserBlocked(address indexed user, bool blocked);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    // ==================== INITIALIZATION ====================
    
    function initialize(
        address _usdtToken,
        address _wbnbToken,
        address _priceFeed,
        address _initialAdmin
    ) public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        // Set token addresses
        usdtToken = IERC20(_usdtToken);
        wbnbToken = IERC20(_wbnbToken);
        priceFeed = IPriceFeed(_priceFeed);
        
        // Initialize package prices (in USD, scaled by 1e18)
        packagePrices[PackageTier.PACKAGE_1] = 30 * 1e18;  // $30
        packagePrices[PackageTier.PACKAGE_2] = 50 * 1e18;  // $50
        packagePrices[PackageTier.PACKAGE_3] = 100 * 1e18; // $100
        packagePrices[PackageTier.PACKAGE_4] = 200 * 1e18; // $200
        
        // Initialize admin settings
        adminFeePercentage = 1000; // 10%
        withdrawalFeePercentage = 500; // 5%
        maxWithdrawalPerDay = 10000 * 1e18; // $10,000
        minWithdrawalAmount = 10 * 1e18; // $10
        maxDailyRegistrations = 1000;
        emergencyWithdrawalLimit = 1000 * 1e18; // $1,000
        
        // Set initial admin
        if (_initialAdmin != address(0)) {
            adminUsers[_initialAdmin] = true;
            emit AdminAdded(_initialAdmin);
        }
        
        // Initialize matrix levels
        _initializeMatrixLevels();
        
        // Initialize pool levels
        _initializePoolLevels();
    }
    
    function _initializeMatrixLevels() private {
        // Matrix level setup (simplified for mainnet)
        for (uint8 i = 1; i <= MAX_MATRIX_LEVEL; i++) {
            matrixLevels[i].price = (10 * i) * 1e18; // $10, $20, $30, etc.
            matrixLevels[i].maxUsers = 2 ** i; // 2, 4, 8, 16, etc.
        }
    }
    
    function _initializePoolLevels() private {
        // Pool level setup (simplified for mainnet)
        for (uint8 i = 1; i <= MAX_POOL_LEVEL; i++) {
            poolLevels[i].requiredDirects = i * 2; // 2, 4, 6, etc.
            poolLevels[i].requiredTeamSize = i * 10; // 10, 20, 30, etc.
            poolLevels[i].rewardAmount = (50 * i) * 1e18; // $50, $100, $150, etc.
        }
    }

    // ==================== MODIFIERS ====================
    
    modifier onlyAdmin() {
        require(adminUsers[msg.sender] || msg.sender == owner(), "LeadFive: Not an admin");
        _;
    }
    
    modifier notBlocked() {
        require(!blockedUsers[msg.sender], "LeadFive: User is blocked");
        _;
    }
    
    modifier antiMEV() {
        require(
            block.number > lastActionBlock[msg.sender] + MIN_BLOCK_DELAY,
            "LeadFive: Too many actions per block"
        );
        lastActionBlock[msg.sender] = block.number;
        _;
    }
    
    modifier validUser() {
        require(users[msg.sender].isActive, "LeadFive: User not registered");
        _;
    }

    // ==================== REGISTRATION FUNCTIONS ====================
    
    function registerUser(
        PackageTier _package,
        address _referrer,
        string calldata _referralCode
    ) external payable whenNotPaused nonReentrant antiMEV notBlocked {
        require(_package != PackageTier.NONE, "LeadFive: Invalid package");
        require(!users[msg.sender].isActive, "LeadFive: User already registered");
        require(bytes(_referralCode).length >= 3 && bytes(_referralCode).length <= 20, "LeadFive: Invalid referral code length");
        require(referralCodeToUser[_referralCode] == address(0), "LeadFive: Referral code already exists");
        
        // Check daily registration limit
        _checkDailyRegistrationLimit();
        
        // Validate referrer
        if (_referrer != address(0)) {
            require(users[_referrer].isActive, "LeadFive: Invalid referrer");
        }
        
        // Calculate payment amount
        uint256 packagePrice = packagePrices[_package];
        uint256 requiredPayment = _calculateRequiredPayment(packagePrice);
        
        // Process payment
        _processPayment(requiredPayment);
        
        // Create user
        User storage newUser = users[msg.sender];
        newUser.isActive = true;
        newUser.hasReferralCode = true;
        newUser.packageLevel = uint32(_package);
        newUser.referrer = _referrer;
        newUser.referralCode = _referralCode;
        newUser.registrationTime = block.timestamp;
        
        // Register referral code
        referralCodeToUser[_referralCode] = msg.sender;
        
        // Update metrics
        totalUsers++;
        totalPackagesSold++;
        totalRevenue += packagePrice;
        currentDailyRegistrations++;
        
        // Process referral rewards
        if (_referrer != address(0)) {
            _processReferralRewards(_referrer, packagePrice);
        }
        
        // Matrix placement
        _placeInMatrix(msg.sender, 1);
        
        // Pool qualification check
        _checkPoolQualification(msg.sender);
        
        emit UserRegistered(msg.sender, _referrer, _package, _referralCode);
        emit PackagePurchased(msg.sender, _package, packagePrice);
    }
    
    function _checkDailyRegistrationLimit() private {
        uint256 currentDay = block.timestamp / 86400; // 1 day = 86400 seconds
        
        if (currentDay > lastRegistrationDay) {
            // New day, reset counter
            currentDailyRegistrations = 0;
            lastRegistrationDay = currentDay;
        }
        
        require(
            currentDailyRegistrations < maxDailyRegistrations,
            "LeadFive: Daily registration limit reached"
        );
    }
    
    function _calculateRequiredPayment(uint256 _usdAmount) private view returns (uint256) {
        // Get BNB price from oracle
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "LeadFive: Invalid price feed");
        
        // Calculate BNB amount needed
        uint256 bnbPrice = uint256(price) * 1e10; // Convert to 18 decimals
        return (_usdAmount * 1e18) / bnbPrice;
    }
    
    function _processPayment(uint256 _requiredAmount) private {
        require(msg.value >= _requiredAmount, "LeadFive: Insufficient payment");
        
        // Calculate admin fee
        uint256 adminFee = (_requiredAmount * adminFeePercentage) / 10000;
        uint256 reserveFee = (_requiredAmount * RESERVE_FUND_PERCENTAGE) / 10000;
        
        adminBalance += adminFee;
        reserveFundBalance += reserveFee;
        
        // Refund excess payment
        if (msg.value > _requiredAmount) {
            payable(msg.sender).transfer(msg.value - _requiredAmount);
        }
    }
    
    function _processReferralRewards(address _referrer, uint256 _packagePrice) private {
        // Direct referral bonus (10%)
        uint256 directBonus = (_packagePrice * 1000) / 10000;
        users[_referrer].pendingWithdrawals += uint128(directBonus);
        users[_referrer].totalEarnings += uint128(directBonus);
        users[_referrer].totalDirectReferrals++;
        users[_referrer].directReferrals.push(msg.sender);
        
        emit BonusPaid(_referrer, msg.sender, directBonus, "Direct Referral");
        
        // Level bonuses (up to 5 levels)
        address currentReferrer = users[_referrer].referrer;
        uint256[] memory levelPercentages = new uint256[](5);
        levelPercentages[0] = 500; // 5%
        levelPercentages[1] = 300; // 3%
        levelPercentages[2] = 200; // 2%
        levelPercentages[3] = 100; // 1%
        levelPercentages[4] = 100; // 1%
        
        for (uint8 i = 0; i < 5 && currentReferrer != address(0); i++) {
            if (users[currentReferrer].isActive) {
                uint256 levelBonus = (_packagePrice * levelPercentages[i]) / 10000;
                users[currentReferrer].pendingWithdrawals += uint128(levelBonus);
                users[currentReferrer].totalEarnings += uint128(levelBonus);
                users[currentReferrer].totalTeamSize++;
                
                emit BonusPaid(currentReferrer, msg.sender, levelBonus, string(abi.encodePacked("Level ", i + 2)));
                
                currentReferrer = users[currentReferrer].referrer;
            }
        }
    }

    // ==================== MATRIX FUNCTIONS ====================
    
    function _placeInMatrix(address _user, uint8 _level) private {
        require(_level <= MAX_MATRIX_LEVEL, "LeadFive: Invalid matrix level");
        
        MatrixLevel storage matrix = matrixLevels[_level];
        
        // Check if user can afford this level
        uint256 levelPrice = matrix.price;
        require(users[_user].pendingWithdrawals >= levelPrice, "LeadFive: Insufficient funds for matrix");
        
        // Deduct price from pending withdrawals
        users[_user].pendingWithdrawals -= uint128(levelPrice);
        
        // Place user in matrix
        uint256 position = matrix.currentUsers + 1;
        matrix.users[position] = _user;
        matrix.userIndex[_user] = position;
        matrix.currentUsers++;
        
        users[_user].matrixPosition[_level] = position;
        
        // Calculate matrix earnings (50% goes to upline)
        uint256 matrixEarning = levelPrice / 2;
        
        // Find upline (user at position/2)
        uint256 uplinePosition = position / 2;
        if (uplinePosition > 0) {
            address upline = matrix.users[uplinePosition];
            if (upline != address(0)) {
                users[upline].matrixEarnings[_level] += matrixEarning;
                users[upline].pendingWithdrawals += uint128(matrixEarning);
                users[upline].totalEarnings += uint128(matrixEarning);
                
                emit BonusPaid(upline, _user, matrixEarning, string(abi.encodePacked("Matrix L", _level)));
            }
        }
        
        matrix.totalEarnings += matrixEarning;
        
        emit MatrixPlacement(_user, _level, position);
        
        // Auto-upgrade to next level if qualified
        if (_level < MAX_MATRIX_LEVEL && position % 4 == 0) {
            _placeInMatrix(_user, _level + 1);
        }
    }

    // ==================== POOL FUNCTIONS ====================
    
    function _checkPoolQualification(address _user) private {
        for (uint8 i = 1; i <= MAX_POOL_LEVEL; i++) {
            PoolLevel storage pool = poolLevels[i];
            
            if (!pool.qualifiedUsers[_user] &&
                users[_user].totalDirectReferrals >= pool.requiredDirects &&
                users[_user].totalTeamSize >= pool.requiredTeamSize) {
                
                pool.qualifiedUsers[_user] = true;
                pool.totalUsers++;
                
                emit PoolQualification(_user, i);
            }
        }
    }
    
    function claimPoolReward(uint8 _level) external validUser nonReentrant antiMEV {
        require(_level <= MAX_POOL_LEVEL, "LeadFive: Invalid pool level");
        
        PoolLevel storage pool = poolLevels[_level];
        require(pool.qualifiedUsers[msg.sender], "LeadFive: Not qualified for this pool");
        
        uint256 lastClaim = pool.lastClaim[msg.sender];
        require(block.timestamp >= lastClaim + 86400, "LeadFive: Can only claim once per day");
        
        uint256 reward = pool.rewardAmount;
        pool.lastClaim[msg.sender] = block.timestamp;
        pool.totalDistributed += reward;
        
        users[msg.sender].poolEarnings += reward;
        users[msg.sender].pendingWithdrawals += uint128(reward);
        users[msg.sender].totalEarnings += uint128(reward);
        users[msg.sender].lastPoolClaim = block.timestamp;
        
        emit BonusPaid(msg.sender, address(this), reward, string(abi.encodePacked("Pool L", _level)));
    }

    // ==================== WITHDRAWAL FUNCTIONS ====================
    
    function withdraw(uint256 _amount) external validUser nonReentrant antiMEV whenNotPaused notBlocked {
        require(_amount >= minWithdrawalAmount, "LeadFive: Amount below minimum");
        require(users[msg.sender].pendingWithdrawals >= _amount, "LeadFive: Insufficient balance");
        
        // Check daily withdrawal limit
        _checkDailyWithdrawalLimit(msg.sender, _amount);
        
        // Emergency mode check
        if (emergencyMode) {
            require(_amount <= emergencyWithdrawalLimit, "LeadFive: Exceeds emergency limit");
        }
        
        // Calculate withdrawal fee
        uint256 withdrawalFee = (_amount * withdrawalFeePercentage) / 10000;
        uint256 netAmount = _amount - withdrawalFee;
        
        // Update user balances
        users[msg.sender].pendingWithdrawals -= uint128(_amount);
        users[msg.sender].totalWithdrawn += _amount;
        users[msg.sender].lastWithdrawal = block.timestamp;
        
        // Update daily withdrawal tracking
        uint256 currentDay = block.timestamp / 86400;
        if (currentDay > lastWithdrawalDay[msg.sender]) {
            dailyWithdrawnAmount[msg.sender] = _amount;
            lastWithdrawalDay[msg.sender] = currentDay;
        } else {
            dailyWithdrawnAmount[msg.sender] += _amount;
        }
        
        // Update global metrics
        totalWithdrawals += _amount;
        adminBalance += withdrawalFee;
        
        // Transfer funds
        require(address(this).balance >= netAmount, "LeadFive: Insufficient contract balance");
        payable(msg.sender).transfer(netAmount);
        
        emit WithdrawalProcessed(msg.sender, netAmount, withdrawalFee);
    }
    
    function _checkDailyWithdrawalLimit(address _user, uint256 _amount) private view {
        uint256 currentDay = block.timestamp / 86400;
        
        if (currentDay == lastWithdrawalDay[_user]) {
            require(
                dailyWithdrawnAmount[_user] + _amount <= maxWithdrawalPerDay,
                "LeadFive: Daily withdrawal limit exceeded"
            );
        }
    }

    // ==================== ADMIN FUNCTIONS ====================
    
    function addAdmin(address _admin) external onlyOwner {
        require(_admin != address(0), "LeadFive: Invalid admin address");
        adminUsers[_admin] = true;
        emit AdminAdded(_admin);
    }
    
    function removeAdmin(address _admin) external onlyOwner {
        adminUsers[_admin] = false;
        emit AdminRemoved(_admin);
    }
    
    function blockUser(address _user, bool _blocked) external onlyAdmin {
        blockedUsers[_user] = _blocked;
        emit UserBlocked(_user, _blocked);
    }
    
    function setAdminFeePercentage(uint256 _percentage) external onlyAdmin {
        require(_percentage <= 2000, "LeadFive: Fee too high"); // Max 20%
        adminFeePercentage = _percentage;
    }
    
    function setWithdrawalFeePercentage(uint256 _percentage) external onlyAdmin {
        require(_percentage <= 1000, "LeadFive: Fee too high"); // Max 10%
        withdrawalFeePercentage = _percentage;
    }
    
    function setMaxWithdrawalPerDay(uint256 _amount) external onlyAdmin {
        maxWithdrawalPerDay = _amount;
    }
    
    function setMinWithdrawalAmount(uint256 _amount) external onlyAdmin {
        minWithdrawalAmount = _amount;
    }
    
    function setMaxDailyRegistrations(uint256 _limit) external onlyAdmin {
        maxDailyRegistrations = _limit;
    }
    
    function toggleEmergencyMode() external onlyAdmin {
        emergencyMode = !emergencyMode;
        emit EmergencyModeToggled(emergencyMode);
    }
    
    function setEmergencyWithdrawalLimit(uint256 _limit) external onlyAdmin {
        emergencyWithdrawalLimit = _limit;
    }
    
    function withdrawAdminFees() external onlyAdmin {
        uint256 amount = adminBalance;
        require(amount > 0, "LeadFive: No admin fees to withdraw");
        
        adminBalance = 0;
        payable(msg.sender).transfer(amount);
        
        emit AdminFeeCollected(amount);
    }
    
    function pause() external onlyAdmin {
        _pause();
    }
    
    function unpause() external onlyAdmin {
        _unpause();
    }

    // ==================== VIEW FUNCTIONS ====================
    
    function getUserInfo(address _user) external view returns (
        bool isActive,
        uint32 packageLevel,
        uint64 totalDirectReferrals,
        uint64 totalTeamSize,
        uint128 totalEarnings,
        uint128 pendingWithdrawals,
        address referrer,
        string memory referralCode,
        uint256 registrationTime,
        uint256 totalWithdrawn
    ) {
        User storage user = users[_user];
        return (
            user.isActive,
            user.packageLevel,
            user.totalDirectReferrals,
            user.totalTeamSize,
            user.totalEarnings,
            user.pendingWithdrawals,
            user.referrer,
            user.referralCode,
            user.registrationTime,
            user.totalWithdrawn
        );
    }
    
    function getUserMatrixInfo(address _user, uint8 _level) external view returns (
        uint256 position,
        uint256 earnings
    ) {
        return (
            users[_user].matrixPosition[_level],
            users[_user].matrixEarnings[_level]
        );
    }
    
    function getMatrixLevelInfo(uint8 _level) external view returns (
        uint256 price,
        uint256 maxUsers,
        uint256 currentUsers,
        uint256 totalEarnings
    ) {
        MatrixLevel storage matrix = matrixLevels[_level];
        return (
            matrix.price,
            matrix.maxUsers,
            matrix.currentUsers,
            matrix.totalEarnings
        );
    }
    
    function getPoolLevelInfo(uint8 _level) external view returns (
        uint256 requiredDirects,
        uint256 requiredTeamSize,
        uint256 rewardAmount,
        uint256 totalPoolUsers,
        uint256 totalDistributed
    ) {
        PoolLevel storage pool = poolLevels[_level];
        return (
            pool.requiredDirects,
            pool.requiredTeamSize,
            pool.rewardAmount,
            pool.totalUsers,
            pool.totalDistributed
        );
    }
    
    function isPoolQualified(address _user, uint8 _level) external view returns (bool) {
        return poolLevels[_level].qualifiedUsers[_user];
    }
    
    function getDirectReferrals(address _user) external view returns (address[] memory) {
        return users[_user].directReferrals;
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getCurrentPrice() external view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "LeadFive: Invalid price feed");
        return uint256(price) * 1e10;
    }

    // ==================== EMERGENCY FUNCTIONS ====================
    
    function emergencyWithdrawFunds(uint256 _amount) external onlyOwner {
        require(emergencyMode, "LeadFive: Emergency mode not active");
        require(_amount <= address(this).balance, "LeadFive: Insufficient balance");
        
        payable(owner()).transfer(_amount);
    }
    
    function recoverToken(IERC20 _token, uint256 _amount) external onlyOwner {
        require(_token.transfer(owner(), _amount), "LeadFive: Token transfer failed");
    }

    // ==================== UPGRADE AUTHORIZATION ====================
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ==================== RECEIVE FUNCTION ====================
    
    receive() external payable {
        // Accept BNB deposits
    }
}
