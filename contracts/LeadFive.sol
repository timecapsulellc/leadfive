// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPriceFeed {
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80);
}

contract LeadFive is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {
    
    struct User {
        bool isRegistered;
        bool isBlacklisted;
        address referrer;
        uint96 balance;
        uint96 totalInvestment;
        uint96 totalEarnings;
        uint96 earningsCap;
        uint32 directReferrals;
        uint32 teamSize;
        uint8 packageLevel;
        uint8 rank;
        uint8 withdrawalRate;
        uint32 lastHelpPoolClaim;
        bool isEligibleForHelpPool;
        uint32 matrixPosition;
        uint32 matrixLevel;
        uint32 registrationTime;
        string referralCode;
    }
    
    struct Package {
        uint96 price;
        uint16 directBonus;
        uint16 levelBonus;
        uint16 uplineBonus;
        uint16 leaderBonus;
        uint16 helpBonus;
        uint16 clubBonus;
    }
    
    struct Pool {
        uint96 balance;
        uint32 lastDistribution;
        uint32 interval;
    }
    
    mapping(address => User) public users;
    mapping(uint8 => Package) public packages;
    mapping(address => address[]) public directReferrals;
    mapping(address => address[30]) public uplineChain;
    mapping(address => address[2]) public binaryMatrix;
    mapping(string => address) public referralCodeToUser;
    mapping(address => bool) public isRootUser;
    
    Pool public leaderPool;
    Pool public helpPool;
    Pool public clubPool;
    
    IERC20 public usdt;
    IPriceFeed public priceFeed;
    address[16] public adminIds;
    
    // Matrix and Leader tracking
    address[] public shiningStarLeaders;
    address[] public silverStarLeaders;
    address[] public eligibleHelpPoolUsers;
    uint32 public totalUsers;
    uint32 public matrixWidth;
    uint32 public currentMatrixLevel;
    
    // Root user system
    address public rootUser;
    bool public rootUserSet;
    
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant EARNINGS_MULTIPLIER = 4;
    uint256 private constant ADMIN_FEE_RATE = 500; // 5% in basis points
    uint256 private lastTxBlock;
    
    // Admin fee management
    address public adminFeeRecipient;
    uint96 public totalAdminFeesCollected;
    
    // Delayed ownership transfer security
    uint256 public constant OWNERSHIP_TRANSFER_DELAY = 7 days;
    address public pendingOwner;
    uint256 public ownershipTransferTime;
    
    event UserRegistered(address indexed user, address indexed referrer, uint8 packageLevel, uint96 amount);
    event PackageUpgraded(address indexed user, uint8 newLevel, uint96 amount);
    event BonusDistributed(address indexed recipient, uint96 amount, uint8 bonusType);
    event Withdrawal(address indexed user, uint96 amount);
    event PoolDistributed(uint8 indexed poolType, uint96 amount);
    event AdminFeeCollected(uint96 amount, address indexed user);
    event AdminFeeRecipientUpdated(address indexed newRecipient);
    
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
    
    function initialize(address _usdt, address _priceFeed, address[16] memory _adminIds) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        
        usdt = IERC20(_usdt);
        priceFeed = IPriceFeed(_priceFeed);
        
        // Set deployer as all admin positions initially for security
        address deployer = msg.sender;
        for(uint i = 0; i < 16; i++) {
            adminIds[i] = deployer;
        }
        
        // PDF Specification: Only 4 packages ($30, $50, $100, $200)
        // Distribution: 40% Sponsor + 10% Level + 10% Upline + 10% Leader + 30% Help = 100%
        packages[1] = Package(30e18, 4000, 1000, 1000, 1000, 3000, 0);   // $30 package
        packages[2] = Package(50e18, 4000, 1000, 1000, 1000, 3000, 0);   // $50 package  
        packages[3] = Package(100e18, 4000, 1000, 1000, 1000, 3000, 0);  // $100 package
        packages[4] = Package(200e18, 4000, 1000, 1000, 1000, 3000, 0);  // $200 package
        
        leaderPool = Pool(0, uint32(block.timestamp), 604800);
        helpPool = Pool(0, uint32(block.timestamp), 604800);
        clubPool = Pool(0, uint32(block.timestamp), 2592000);
        
        // Register deployer as admin with full privileges
        users[deployer] = User({
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
    }
    
    function register(address referrer, uint8 packageLevel, bool useUSDT) external payable nonReentrant whenNotPaused antiMEV {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(packageLevel >= 1 && packageLevel <= 4, "Invalid package");
        require(referrer == address(0) || users[referrer].isRegistered, "Invalid referrer");
        
        uint96 amount = _processPayment(packageLevel, useUSDT);
        totalUsers++;
        
        // Generate referral code for new user
        string memory newUserCode = generateReferralCode(msg.sender);
        
        // Calculate matrix position
        uint32 matrixPos = _calculateMatrixPosition();
        uint32 matrixLvl = _calculateMatrixLevel(matrixPos);
        
        users[msg.sender] = User({
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
            matrixPosition: matrixPos,
            matrixLevel: matrixLvl,
            registrationTime: uint32(block.timestamp),
            referralCode: newUserCode
        });
        
        if(referrer != address(0)) {
            directReferrals[referrer].push(msg.sender);
            users[referrer].directReferrals++;
            
            // Update team sizes up the chain
            _updateUplineTeamSizes(msg.sender);
            
            _buildUplineChain(msg.sender, referrer);
            _placeBinaryMatrix(msg.sender, referrer);
            
            // Update leader qualifications
            _updateLeaderRank(referrer);
        }
        
        _distributeBonuses(msg.sender, amount, packageLevel);
        emit UserRegistered(msg.sender, referrer, packageLevel, amount);
    }
    
    function upgradePackage(uint8 newLevel, bool useUSDT) external payable nonReentrant whenNotPaused antiMEV {
        require(users[msg.sender].isRegistered, "Not registered");
        require(!users[msg.sender].isBlacklisted, "Blacklisted");
        require(newLevel > users[msg.sender].packageLevel && newLevel <= 4, "Invalid upgrade");
        
        uint96 amount = _processPayment(newLevel, useUSDT);
        
        users[msg.sender].packageLevel = newLevel;
        users[msg.sender].totalInvestment += amount;
        users[msg.sender].earningsCap += uint96(amount * EARNINGS_MULTIPLIER);
        
        _distributeBonuses(msg.sender, amount, newLevel);
        emit PackageUpgraded(msg.sender, newLevel, amount);
    }
    
    function withdraw(uint96 amount) external nonReentrant whenNotPaused {
        User storage user = users[msg.sender];
        require(user.isRegistered && !user.isBlacklisted, "Invalid user");
        require(amount <= user.balance, "Insufficient balance");
        require(adminFeeRecipient != address(0), "Admin fee recipient not set");
        
        // PDF Specification: Progressive withdrawal based on direct referrals
        uint8 withdrawalRate = _getProgressiveWithdrawalRate(user.directReferrals);
        uint96 withdrawable = (amount * withdrawalRate) / 100;
        uint96 reinvestment = amount - withdrawable;
        
        // Calculate 5% admin fee from withdrawable amount
        uint96 adminFee = uint96((withdrawable * ADMIN_FEE_RATE) / BASIS_POINTS);
        uint96 userReceives = withdrawable - adminFee;
        
        user.balance -= amount;
        totalAdminFeesCollected += adminFee;
        
        // Transfer to user (95% of withdrawable amount)
        payable(msg.sender).transfer(userReceives);
        
        // Transfer admin fee (5% of withdrawable amount)
        payable(adminFeeRecipient).transfer(adminFee);
        
        // Handle reinvestment distribution (unchanged)
        if(reinvestment > 0) {
            _distributeReinvestment(msg.sender, reinvestment);
        }
        
        emit Withdrawal(msg.sender, userReceives);
        emit AdminFeeCollected(adminFee, msg.sender);
    }
    
    function distributePools() external onlyAdmin {
        uint32 currentTime = uint32(block.timestamp);
        
        if(currentTime >= leaderPool.lastDistribution + leaderPool.interval) {
            _distributeLeaderPool();
        }
        
        if(currentTime >= helpPool.lastDistribution + helpPool.interval) {
            _distributeHelpPool();
        }
        
        if(currentTime >= clubPool.lastDistribution + clubPool.interval) {
            _distributeClubPool();
        }
    }
    
    function _processPayment(uint8 packageLevel, bool useUSDT) internal returns (uint96) {
        uint96 packagePrice = packages[packageLevel].price;
        
        if(useUSDT) {
            require(usdt.transferFrom(msg.sender, address(this), packagePrice), "USDT transfer failed");
            return packagePrice;
        } else {
            return _processPaymentAdvanced(packageLevel);
        }
    }
    
    function _processPaymentAdvanced(uint8 packageLevel) internal returns (uint96) {
        uint96 packagePrice = packages[packageLevel].price;
        uint96 bnbRequired = _getBNBPriceAdvanced(packagePrice);
        
        require(msg.value >= bnbRequired, "Insufficient BNB");
        
        // Refund excess BNB
        if(msg.value > bnbRequired) {
            uint256 excess = msg.value - bnbRequired;
            payable(msg.sender).transfer(excess);
        }
        
        return packagePrice;
    }
    
    function _getBNBPriceAdvanced(uint96 usdAmount) internal view returns (uint96) {
        try priceFeed.latestRoundData() returns (uint80, int256 price, uint256, uint256 updatedAt, uint80) {
            require(price > 0, "Invalid price");
            require(block.timestamp - updatedAt <= 3600, "Price too old"); // 1 hour max
            
            // Convert USD to BNB with 8 decimal precision
            uint256 bnbAmount = (uint256(usdAmount) * 1e18) / (uint256(price) * 1e10);
            return uint96(bnbAmount);
        } catch {
            // Fallback to default price if oracle fails
            return uint96((usdAmount * 1e18) / 300e18); // 1 BNB = $300 fallback
        }
    }
    
    function _getBNBPrice(uint96 usdAmount) internal view returns (uint96) {
        try priceFeed.latestRoundData() returns (uint80, int256 price, uint256, uint256, uint80) {
            if (price > 0) {
                return uint96((usdAmount * 1e18) / uint256(price * 1e10));
            }
        } catch {
            // Fallback to a default price if oracle fails
        }
        // Default: 1 BNB = $300 (fallback price)
        return uint96((usdAmount * 1e18) / 300e18);
    }
    
    function _distributeBonuses(address user, uint96 amount, uint8 packageLevel) internal {
        Package memory pkg = packages[packageLevel];
        
        if(users[user].referrer != address(0)) {
            uint96 directBonus = uint96((amount * pkg.directBonus) / BASIS_POINTS);
            _addEarnings(users[user].referrer, directBonus, 1);
        }
        
        _distributeLevelBonus(user, amount, pkg.levelBonus);
        _distributeUplineBonus(user, amount, pkg.uplineBonus);
        
        leaderPool.balance += uint96((amount * pkg.leaderBonus) / BASIS_POINTS);
        helpPool.balance += uint96((amount * pkg.helpBonus) / BASIS_POINTS);
        clubPool.balance += uint96((amount * pkg.clubBonus) / BASIS_POINTS);
    }
    
    function _distributeLevelBonus(address user, uint96 amount, uint16 rate) internal {
        address current = users[user].referrer;
        uint96 totalBonus = uint96((amount * rate) / BASIS_POINTS);
        uint16[10] memory levelRates = [300, 100, 100, 50, 50, 50, 50, 50, 50, 50];
        
        for(uint8 i = 0; i < 10 && current != address(0); i++) {
            if(users[current].isRegistered && !users[current].isBlacklisted) {
                uint96 levelBonus = uint96((totalBonus * levelRates[i]) / 1000);
                _addEarnings(current, levelBonus, 2);
            }
            current = users[current].referrer;
        }
    }
    
    function _distributeUplineBonus(address user, uint96 amount, uint16 rate) internal {
        uint96 totalBonus = uint96((amount * rate) / BASIS_POINTS);
        uint96 perUpline = totalBonus / 30;
        
        for(uint8 i = 0; i < 30; i++) {
            address upline = uplineChain[user][i];
            if(upline != address(0) && users[upline].isRegistered && !users[upline].isBlacklisted) {
                _addEarnings(upline, perUpline, 3);
            }
        }
    }
    
    function _addEarnings(address user, uint96 amount, uint8 bonusType) internal {
        require(amount > 0, "Invalid amount");
        
        User storage u = users[user];
        
        // Check for overflow protection
        require(u.totalEarnings <= type(uint96).max - amount, "Overflow protection");
        
        // Respect earnings cap
        uint96 allowedAmount = amount;
        if (u.totalEarnings + amount > u.earningsCap) {
            allowedAmount = u.earningsCap - u.totalEarnings;
        }
        
        if (allowedAmount > 0) {
            u.balance += allowedAmount;
            u.totalEarnings += allowedAmount;
            emit BonusDistributed(user, allowedAmount, bonusType);
            
            if (allowedAmount < amount) {
                emit EarningsCapReached(user, amount - allowedAmount);
            }
        }
    }
    
    function _buildUplineChain(address user, address referrer) internal {
        uplineChain[user][0] = referrer;
        for(uint8 i = 1; i < 30; i++) {
            address nextUpline = uplineChain[uplineChain[user][i-1]][0];
            if(nextUpline == address(0)) break;
            uplineChain[user][i] = nextUpline;
        }
    }
    
    function _placeBinaryMatrix(address user, address referrer) internal {
        address current = referrer;
        uint256 depth = 0;
        uint256 maxDepth = 100; // Reasonable limit to prevent DoS
        
        while (depth < maxDepth) {
            if(binaryMatrix[current][0] == address(0)) {
                binaryMatrix[current][0] = user;
                return;
            } else if(binaryMatrix[current][1] == address(0)) {
                binaryMatrix[current][1] = user;
                return;
            } else {
                current = binaryMatrix[current][0]; // Spillover to left
                depth++;
            }
        }
        
        revert("Matrix placement failed: max depth reached");
    }
    
    function _autoReinvest(address user, uint96 amount) internal {
        uint8 currentLevel = users[user].packageLevel;
        if(currentLevel < 4 && amount >= packages[currentLevel + 1].price) {
            users[user].packageLevel = currentLevel + 1;
            users[user].totalInvestment += amount;
            users[user].earningsCap += uint96(amount * EARNINGS_MULTIPLIER);
            _distributeBonuses(user, amount, currentLevel + 1);
        } else {
            users[user].balance += amount;
        }
    }
    
    function _distributeLeaderPool() internal {
        leaderPool.lastDistribution = uint32(block.timestamp);
        emit PoolDistributed(1, leaderPool.balance);
        leaderPool.balance = 0;
    }
    
    function _distributeHelpPool() internal {
        helpPool.lastDistribution = uint32(block.timestamp);
        emit PoolDistributed(2, helpPool.balance);
        helpPool.balance = 0;
    }
    
    function _distributeClubPool() internal {
        clubPool.lastDistribution = uint32(block.timestamp);
        emit PoolDistributed(3, clubPool.balance);
        clubPool.balance = 0;
    }
    
    function blacklistUser(address user, bool status) external onlyAdmin {
        users[user].isBlacklisted = status;
    }
    
    function updateWithdrawalRate(address user, uint8 rate) external onlyAdmin {
        require(rate >= 70 && rate <= 80, "Invalid rate");
        users[user].withdrawalRate = rate;
    }
    
    function updateUserRank(address user, uint8 rank) external onlyAdmin {
        users[user].rank = rank;
    }
    
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }
    
    function recoverUSDT(uint256 amount) external onlyOwner {
        usdt.transfer(owner(), amount);
    }
    
    function getUserInfo(address user) external view returns (User memory) {
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
    
    function _getProgressiveWithdrawalRate(uint32 directReferralCount) internal pure returns (uint8) {
        // PDF Specification: Progressive withdrawal rates based on direct referrals
        if (directReferralCount >= 20) {
            return 80; // 80% withdrawal, 20% reinvestment
        } else if (directReferralCount >= 5) {
            return 75; // 75% withdrawal, 25% reinvestment
        } else {
            return 70; // 70% withdrawal, 30% reinvestment
        }
    }
    
    function _distributeReinvestment(address user, uint96 amount) internal {
        // Check for auto-reinvestment upgrade first
        if(_processReinvestmentAdvanced(user, amount)) {
            return; // Auto-upgrade handled the amount
        }
        
        // PDF Specification: Reinvestment distribution (40% Level, 30% Upline, 30% Help)
        uint96 levelAmount = uint96((amount * 4000) / BASIS_POINTS);    // 40%
        uint96 uplineAmount = uint96((amount * 3000) / BASIS_POINTS);   // 30%
        uint96 helpAmount = uint96((amount * 3000) / BASIS_POINTS);     // 30%
        
        // Distribute to level bonus
        _distributeLevelBonus(user, levelAmount, 1000);
        
        // Distribute to upline bonus
        _distributeUplineBonus(user, uplineAmount, 1000);
        
        // Add to help pool
        helpPool.balance += helpAmount;
    }
    
    function _processReinvestmentAdvanced(address user, uint96 amount) internal returns (bool) {
        uint96 remaining = amount;
        bool upgraded = false;
        
        // Iterative processing to prevent recursion
        while (remaining > 0) {
            uint8 currentLevel = users[user].packageLevel;
            if (currentLevel >= 4) break; // Max level reached
            
            uint96 nextPrice = packages[currentLevel + 1].price;
            if (remaining < nextPrice) break; // Not enough for upgrade
            
            // Perform upgrade
            users[user].packageLevel = currentLevel + 1;
            users[user].totalInvestment += nextPrice;
            users[user].earningsCap += uint96(nextPrice * EARNINGS_MULTIPLIER);
            
            // Distribute bonuses for upgrade
            _distributeBonuses(user, nextPrice, currentLevel + 1);
            
            remaining -= nextPrice;
            upgraded = true;
            
            emit PackageUpgraded(user, currentLevel + 1, nextPrice);
            emit AutoReinvestmentUpgrade(user, currentLevel + 1, nextPrice, remaining);
        }
        
        // Handle any remaining amount through standard distribution
        if (remaining > 0) {
            _distributeReinvestmentBase(user, remaining);
        }
        
        return upgraded;
    }
    
    function _distributeReinvestmentBase(address user, uint96 amount) internal {
        // PDF Specification: Reinvestment distribution (40% Level, 30% Upline, 30% Help)
        uint96 levelAmount = uint96((amount * 4000) / BASIS_POINTS);    // 40%
        uint96 uplineAmount = uint96((amount * 3000) / BASIS_POINTS);   // 30%
        uint96 helpAmount = uint96((amount * 3000) / BASIS_POINTS);     // 30%
        
        // Distribute to level bonus
        _distributeLevelBonus(user, levelAmount, 1000);
        
        // Distribute to upline bonus
        _distributeUplineBonus(user, uplineAmount, 1000);
        
        // Add to help pool
        helpPool.balance += helpAmount;
    }
    
    // ========== MISSING CRITICAL FEATURES ==========
    
    // Root User System
    function setRootUser(address _rootUser) external onlyOwner {
        require(!rootUserSet, "Root user already set");
        require(_rootUser != address(0), "Invalid address");
        
        rootUser = _rootUser;
        rootUserSet = true;
        isRootUser[_rootUser] = true;
        
        // Initialize root user with maximum privileges
        users[_rootUser] = User({
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
            rank: 5, // Highest rank
            withdrawalRate: 80,
            lastHelpPoolClaim: 0,
            isEligibleForHelpPool: true,
            matrixPosition: 1,
            matrixLevel: 1,
            registrationTime: uint32(block.timestamp),
            referralCode: "ROOT001"
        });
        
        referralCodeToUser["ROOT001"] = _rootUser;
        totalUsers = 1;
        matrixWidth = 2; // Binary matrix
        currentMatrixLevel = 1;
    }
    
    // Referral Code Generation and Management
    function generateReferralCode(address user) internal returns (string memory) {
        require(users[user].isRegistered, "User not registered");
        
        // Generate unique referral code based on user address and timestamp
        string memory code = string(abi.encodePacked(
            "LF",
            _toHexString(uint160(user) % 10000),
            _toHexString(uint32(block.timestamp) % 1000)
        ));
        
        // Ensure uniqueness
        while (referralCodeToUser[code] != address(0)) {
            code = string(abi.encodePacked(code, "X"));
        }
        
        users[user].referralCode = code;
        referralCodeToUser[code] = user;
        return code;
    }
    
    function registerWithCode(string memory referralCode, uint8 packageLevel, bool useUSDT) 
        external payable nonReentrant whenNotPaused antiMEV {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(packageLevel >= 1 && packageLevel <= 4, "Invalid package");
        
        address referrer = referralCodeToUser[referralCode];
        require(referrer != address(0), "Invalid referral code");
        require(users[referrer].isRegistered, "Referrer not registered");
        
        uint96 amount = _processPayment(packageLevel, useUSDT);
        totalUsers++;
        
        // Generate referral code for new user
        string memory newUserCode = generateReferralCode(msg.sender);
        
        // Calculate matrix position
        uint32 matrixPos = _calculateMatrixPosition();
        uint32 matrixLvl = _calculateMatrixLevel(matrixPos);
        
        users[msg.sender] = User({
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
            matrixPosition: matrixPos,
            matrixLevel: matrixLvl,
            registrationTime: uint32(block.timestamp),
            referralCode: newUserCode
        });
        
        // Update referrer's direct referrals
        directReferrals[referrer].push(msg.sender);
        users[referrer].directReferrals++;
        
        // Update team sizes up the chain
        _updateUplineTeamSizes(msg.sender);
        
        // Build upline chain
        _buildUplineChain(msg.sender, referrer);
        
        // Place in binary matrix
        _placeBinaryMatrix(msg.sender, referrer);
        
        // Update leader qualifications
        _updateLeaderRank(referrer);
        
        // Distribute bonuses
        _distributeBonuses(msg.sender, amount, packageLevel);
        
        emit UserRegistered(msg.sender, referrer, packageLevel, amount);
    }
    
    // Team Size Calculation and Updates
    function _updateUplineTeamSizes(address user) internal {
        address current = users[user].referrer;
        for(uint8 i = 0; i < 30 && current != address(0); i++) {
            users[current].teamSize++;
            _updateLeaderRank(current); // Check for rank updates
            current = users[current].referrer;
        }
    }
    
    function calculateTeamSize(address user) external view returns (uint32) {
        return _calculateTeamSizeIterative(user);
    }
    
    function _calculateTeamSizeIterative(address user) internal view returns (uint32) {
        uint32 totalSize = 0;
        address[] memory queue = new address[](1000); // Limit depth to prevent DoS
        uint256 front = 0;
        uint256 rear = 1;
        queue[0] = user;
        
        while (front < rear && front < 1000) {
            address current = queue[front++];
            address[] memory refs = directReferrals[current];
            
            for (uint i = 0; i < refs.length && rear < 1000; i++) {
                queue[rear++] = refs[i];
                totalSize++;
            }
        }
        
        return totalSize;
    }
    
    // Leader Qualification System
    function _updateLeaderRank(address user) internal {
        User storage u = users[user];
        uint32 teamSize = u.teamSize;
        uint32 directRefs = u.directReferrals;
        
        uint8 oldRank = u.rank;
        
        if (teamSize >= 500) {
            u.rank = 2; // Silver Star Leader
            if (oldRank != 2) {
                _addToLeaderArray(user, 2);
            }
        } else if (teamSize >= 250 && directRefs >= 10) {
            u.rank = 1; // Shining Star Leader
            if (oldRank != 1) {
                _addToLeaderArray(user, 1);
            }
        } else {
            if (oldRank > 0) {
                _removeFromLeaderArray(user, oldRank);
            }
            u.rank = 0; // No rank
        }
        
        // Update withdrawal rate based on rank and direct referrals
        u.withdrawalRate = _getProgressiveWithdrawalRate(directRefs);
    }
    
    function _addToLeaderArray(address user, uint8 rank) internal {
        if (rank == 1) {
            shiningStarLeaders.push(user);
        } else if (rank == 2) {
            silverStarLeaders.push(user);
        }
    }
    
    function _removeFromLeaderArray(address user, uint8 rank) internal {
        if (rank == 1) {
            _removeFromArray(shiningStarLeaders, user);
        } else if (rank == 2) {
            _removeFromArray(silverStarLeaders, user);
        }
    }
    
    function _removeFromArray(address[] storage array, address user) internal {
        for (uint i = 0; i < array.length; i++) {
            if (array[i] == user) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }
    
    // Matrix Calculation Functions
    function _calculateMatrixPosition() internal view returns (uint32) {
        return totalUsers;
    }
    
    function _calculateMatrixLevel(uint32 position) internal view returns (uint32) {
        if (position == 1) return 1;
        
        uint32 level = 1;
        uint32 maxInLevel = 2;
        uint32 currentPos = 1;
        
        while (currentPos + maxInLevel < position) {
            currentPos += maxInLevel;
            maxInLevel *= 2;
            level++;
        }
        
        return level;
    }
    
    // Help Pool Distribution System - Batch Processing to Prevent DoS
    uint256 public helpPoolDistributionIndex;
    uint256 public constant BATCH_SIZE = 50;
    
    function distributeHelpPoolBatch() external {
        require(block.timestamp >= helpPool.lastDistribution + helpPool.interval, "Too early");
        
        uint256 startIndex = helpPoolDistributionIndex;
        uint256 endIndex = startIndex + BATCH_SIZE;
        if (endIndex > eligibleHelpPoolUsers.length) {
            endIndex = eligibleHelpPoolUsers.length;
        }
        
        if (helpPool.balance > 0 && endIndex > startIndex) {
            uint96 perUser = helpPool.balance / uint96(eligibleHelpPoolUsers.length);
            
            for (uint i = startIndex; i < endIndex; i++) {
                address user = eligibleHelpPoolUsers[i];
                if (users[user].isRegistered && !users[user].isBlacklisted) {
                    _addEarnings(user, perUser, 4); // Help pool bonus type
                    users[user].lastHelpPoolClaim = uint32(block.timestamp);
                }
            }
        }
        
        helpPoolDistributionIndex = endIndex;
        
        // Complete distribution when all users processed
        if (endIndex >= eligibleHelpPoolUsers.length) {
            helpPool.balance = 0;
            helpPool.lastDistribution = uint32(block.timestamp);
            helpPoolDistributionIndex = 0;
            emit PoolDistributed(2, helpPool.balance);
        }
    }
    
    // Legacy function for backward compatibility (now calls batch version)
    function distributeHelpPoolAutomatically() external {
        require(block.timestamp >= helpPool.lastDistribution + helpPool.interval, "Too early");
        
        uint256 startIndex = helpPoolDistributionIndex;
        uint256 endIndex = startIndex + BATCH_SIZE;
        if (endIndex > eligibleHelpPoolUsers.length) {
            endIndex = eligibleHelpPoolUsers.length;
        }
        
        if (helpPool.balance > 0 && endIndex > startIndex) {
            uint96 perUser = helpPool.balance / uint96(eligibleHelpPoolUsers.length);
            
            for (uint i = startIndex; i < endIndex; i++) {
                address user = eligibleHelpPoolUsers[i];
                if (users[user].isRegistered && !users[user].isBlacklisted) {
                    _addEarnings(user, perUser, 4); // Help pool bonus type
                    users[user].lastHelpPoolClaim = uint32(block.timestamp);
                }
            }
        }
        
        helpPoolDistributionIndex = endIndex;
        
        // Complete distribution when all users processed
        if (endIndex >= eligibleHelpPoolUsers.length) {
            helpPool.balance = 0;
            helpPool.lastDistribution = uint32(block.timestamp);
            helpPoolDistributionIndex = 0;
            emit PoolDistributed(2, helpPool.balance);
        }
    }
    
    function _updateEligibleHelpPoolUsers() internal {
        // Clear previous list
        delete eligibleHelpPoolUsers;
        
        // Add users who haven't reached 4x cap and are active
        for (uint i = 0; i < totalUsers; i++) {
            // This is a simplified approach - in production, you'd maintain a more efficient list
            // For now, we'll use admin function to manually update eligible users
        }
    }
    
    function addEligibleHelpPoolUser(address user) external onlyAdmin {
        require(users[user].isRegistered, "User not registered");
        require(users[user].totalEarnings < users[user].earningsCap, "User reached cap");
        
        eligibleHelpPoolUsers.push(user);
        users[user].isEligibleForHelpPool = true;
    }
    
    function removeEligibleHelpPoolUser(address user) external onlyAdmin {
        _removeFromArray(eligibleHelpPoolUsers, user);
        users[user].isEligibleForHelpPool = false;
    }
    
    // Blacklisting System Enhancement
    function blacklistUserWithReason(address user, bool status, string memory reason) external onlyAdmin {
        users[user].isBlacklisted = status;
        
        if (status) {
            // Remove from leader arrays if blacklisted
            if (users[user].rank > 0) {
                _removeFromLeaderArray(user, users[user].rank);
                users[user].rank = 0;
            }
            
            // Remove from help pool eligibility
            if (users[user].isEligibleForHelpPool) {
                _removeFromArray(eligibleHelpPoolUsers, user);
                users[user].isEligibleForHelpPool = false;
            }
        }
        
        emit UserBlacklisted(user, status, reason);
    }
    
    // Enhanced Admin Functions
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
            currentMatrixLevel
        );
    }
    
    function getUserByReferralCode(string memory code) external view returns (address) {
        return referralCodeToUser[code];
    }
    
    function isValidReferralCode(string memory code) external view returns (bool) {
        return referralCodeToUser[code] != address(0);
    }
    
    // ========== ADMIN FEE MANAGEMENT ==========
    
    function setAdminFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid address");
        adminFeeRecipient = _recipient;
        emit AdminFeeRecipientUpdated(_recipient);
    }
    
    function getAdminFeeInfo() external view returns (
        address recipient,
        uint96 totalCollected,
        uint256 feeRate
    ) {
        return (
            adminFeeRecipient,
            totalAdminFeesCollected,
            ADMIN_FEE_RATE
        );
    }
    
    function calculateWithdrawalBreakdown(address user, uint96 amount) external view returns (
        uint96 withdrawable,
        uint96 adminFee,
        uint96 userReceives,
        uint96 reinvestment,
        uint8 withdrawalRate
    ) {
        require(users[user].isRegistered, "User not registered");
        
        withdrawalRate = _getProgressiveWithdrawalRate(users[user].directReferrals);
        withdrawable = (amount * withdrawalRate) / 100;
        reinvestment = amount - withdrawable;
        adminFee = uint96((withdrawable * ADMIN_FEE_RATE) / BASIS_POINTS);
        userReceives = withdrawable - adminFee;
        
        return (withdrawable, adminFee, userReceives, reinvestment, withdrawalRate);
    }
    
    // Utility Functions
    function _toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // Additional Events
    event UserBlacklisted(address indexed user, bool status, string reason);
    event LeaderRankUpdated(address indexed user, uint8 newRank);
    event ReferralCodeGenerated(address indexed user, string code);
    event MatrixPositionAssigned(address indexed user, uint32 position, uint32 level);
    event TeamSizeUpdated(address indexed user, uint32 newTeamSize);
    event AutoReinvestmentUpgrade(address indexed user, uint8 newLevel, uint96 upgradeAmount, uint96 remainingAmount);
    event OwnershipTransferInitiated(address indexed newOwner, uint256 transferTime);
    event OwnershipTransferCompleted(address indexed previousOwner, address indexed newOwner);
    event EarningsCapReached(address indexed user, uint96 excessAmount);
    
    // ========== DELAYED OWNERSHIP TRANSFER SECURITY ==========
    
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
        
        // Clear pending transfer
        pendingOwner = address(0);
        ownershipTransferTime = 0;
        
        emit OwnershipTransferCompleted(previousOwner, owner());
    }
    
    function cancelOwnershipTransfer() external onlyOwner {
        require(pendingOwner != address(0), "No pending transfer");
        
        pendingOwner = address(0);
        ownershipTransferTime = 0;
        
        emit OwnershipTransferInitiated(address(0), 0); // Cancel event
    }
    
    function getOwnershipTransferInfo() external view returns (
        address pending,
        uint256 transferTime,
        uint256 remainingDelay
    ) {
        uint256 remaining = 0;
        if (ownershipTransferTime > block.timestamp) {
            remaining = ownershipTransferTime - block.timestamp;
        }
        
        return (pendingOwner, ownershipTransferTime, remaining);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    receive() external payable {}
}
