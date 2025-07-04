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

contract LeadFiveCompact is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {
    
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
    
    // Core mappings
    mapping(address => User) public users;
    mapping(uint8 => Package) public packages;
    mapping(address => address[]) public directReferrals;
    mapping(address => address[30]) public uplineChain;
    mapping(address => address[2]) public binaryMatrix;
    mapping(string => address) public referralCodeToUser;
    mapping(address => bool) public isRootUser;
    
    // Pools
    Pool public leaderPool;
    Pool public helpPool;
    Pool public clubPool;
    
    // Core contracts
    IERC20 public usdt;
    IPriceFeed public priceFeed;
    address[16] public adminIds;
    
    // Tracking arrays
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
    
    // Security & constants
    uint256 private lastTxBlock;
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant EARNINGS_MULTIPLIER = 4;
    uint256 private constant ADMIN_FEE_RATE = 500; // 5%
    uint256 private constant OWNERSHIP_TRANSFER_DELAY = 7 days;
    
    // Matrix tracking
    uint32 public matrixWidth;
    uint32 public currentMatrixLevel;
    
    // Delayed ownership transfer security
    address public pendingOwner;
    uint256 public ownershipTransferTime;
    
    // Help pool batch processing
    uint256 public helpPoolDistributionIndex;
    uint256 public constant BATCH_SIZE = 50;
    
    // Events
    event UserRegistered(address indexed user, address indexed referrer, uint8 packageLevel, uint96 amount);
    event PackageUpgraded(address indexed user, uint8 newLevel, uint96 amount);
    event BonusDistributed(address indexed recipient, uint96 amount, uint8 bonusType);
    event Withdrawal(address indexed user, uint96 amount);
    event PoolDistributed(uint8 indexed poolType, uint96 amount);
    event AdminFeeCollected(uint96 amount, address indexed user);
    event ReferralCodeGenerated(address indexed user, string code);
    event AdminFeeRecipientUpdated(address indexed newRecipient);
    event UserBlacklisted(address indexed user, bool status, string reason);
    event LeaderRankUpdated(address indexed user, uint8 newRank);
    event MatrixPositionAssigned(address indexed user, uint32 position, uint32 level);
    event TeamSizeUpdated(address indexed user, uint32 newTeamSize);
    event AutoReinvestmentUpgrade(address indexed user, uint8 newLevel, uint96 upgradeAmount, uint96 remainingAmount);
    event OwnershipTransferInitiated(address indexed newOwner, uint256 transferTime);
    event OwnershipTransferCompleted(address indexed previousOwner, address indexed newOwner);
    event EarningsCapReached(address indexed user, uint96 excessAmount);
    
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
        
        // Initialize deployer
        users[msg.sender] = User({
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
    
    // ========== CORE FUNCTIONS ==========
    
    function register(address referrer, uint8 packageLevel, bool useUSDT) 
        external payable nonReentrant whenNotPaused antiMEV {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(packageLevel >= 1 && packageLevel <= 4, "Invalid package");
        require(referrer == address(0) || users[referrer].isRegistered, "Invalid referrer");
        
        uint96 amount = _processPayment(packageLevel, useUSDT);
        totalUsers++;
        
        // Create user
        uint32 matrixPos = totalUsers;
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
            referralCode: ""
        });
        
        if(referrer != address(0)) {
            directReferrals[referrer].push(msg.sender);
            users[referrer].directReferrals++;
            
            _buildUplineChain(msg.sender, referrer);
            _placeBinaryMatrix(msg.sender, referrer);
            _updateUplineTeamSizes(msg.sender);
            _updateLeaderRank(referrer);
        }
        
        _distributeBonuses(msg.sender, amount, packageLevel);
        emit UserRegistered(msg.sender, referrer, packageLevel, amount);
    }
    
    function registerWithCode(string memory referralCode, uint8 packageLevel, bool useUSDT) 
        external payable nonReentrant whenNotPaused antiMEV {
        address referrer = referralCodeToUser[referralCode];
        require(referrer != address(0), "Invalid referral code");
        
        this.register{value: msg.value}(referrer, packageLevel, useUSDT);
    }
    
    function upgradePackage(uint8 newLevel, bool useUSDT) 
        external payable nonReentrant whenNotPaused antiMEV {
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
        
        uint8 withdrawalRate = _getProgressiveWithdrawalRate(user.directReferrals);
        uint96 withdrawable = uint96((uint256(amount) * withdrawalRate) / 100);
        uint96 reinvestment = amount - withdrawable;
        uint96 adminFee = uint96((uint256(withdrawable) * ADMIN_FEE_RATE) / BASIS_POINTS);
        uint96 userReceives = withdrawable - adminFee;
        
        user.balance -= amount;
        totalAdminFeesCollected += adminFee;
        
        payable(msg.sender).transfer(userReceives);
        payable(adminFeeRecipient).transfer(adminFee);
        
        if(reinvestment > 0) {
            _distributeReinvestment(msg.sender, reinvestment);
        }
        
        emit Withdrawal(msg.sender, userReceives);
        emit AdminFeeCollected(adminFee, msg.sender);
    }
    
    // ========== ROOT USER SYSTEM ==========
    
    function setRootUser(address _rootUser) external onlyOwner {
        require(!rootUserSet, "Root user already set");
        require(_rootUser != address(0), "Invalid address");
        
        rootUser = _rootUser;
        rootUserSet = true;
        isRootUser[_rootUser] = true;
        
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
            rank: 5,
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
    }
    
    // ========== REFERRAL CODE SYSTEM ==========
    
    function generateReferralCode(address user) external returns (string memory) {
        require(users[user].isRegistered, "User not registered");
        
        string memory code = string(abi.encodePacked(
            "LF",
            _toHexString(uint160(user) % 10000),
            _toHexString(uint32(block.timestamp) % 1000)
        ));
        
        uint256 counter = 0;
        while (referralCodeToUser[code] != address(0) && counter < 100) {
            code = string(abi.encodePacked(code, "X"));
            counter++;
        }
        
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
            uint96 bnbRequired = _getBNBPrice(packagePrice);
            require(msg.value >= bnbRequired, "Insufficient BNB");
            
            if(msg.value > bnbRequired) {
                payable(msg.sender).transfer(msg.value - bnbRequired);
            }
            return packagePrice;
        }
    }
    
    function _getBNBPrice(uint96 usdAmount) internal view returns (uint96) {
        try priceFeed.latestRoundData() returns (uint80, int256 price, uint256, uint256 updatedAt, uint80) {
            require(price > 0, "Invalid price");
            require(block.timestamp - updatedAt <= 3600, "Price too old");
            return uint96((uint256(usdAmount) * 1e18) / (uint256(price) * 1e10));
        } catch {
            return uint96((usdAmount * 1e18) / 300e18); // Fallback: 1 BNB = $300
        }
    }
    
    // ========== HELPER FUNCTIONS ==========
    
    function _distributeBonuses(address user, uint96 amount, uint8 packageLevel) internal {
        Package memory pkg = packages[packageLevel];
        
        if(users[user].referrer != address(0)) {
            uint96 directBonus = uint96((uint256(amount) * pkg.directBonus) / BASIS_POINTS);
            _addEarnings(users[user].referrer, directBonus, 1);
        }
        
        _distributeLevelBonus(user, amount, pkg.levelBonus);
        _distributeUplineBonus(user, amount, pkg.uplineBonus);
        
        leaderPool.balance += uint96((uint256(amount) * pkg.leaderBonus) / BASIS_POINTS);
        helpPool.balance += uint96((uint256(amount) * pkg.helpBonus) / BASIS_POINTS);
        clubPool.balance += uint96((uint256(amount) * pkg.clubBonus) / BASIS_POINTS);
    }
    
    function _distributeLevelBonus(address user, uint96 amount, uint16 rate) internal {
        address current = users[user].referrer;
        uint96 totalBonus = uint96((uint256(amount) * rate) / BASIS_POINTS);
        uint16[10] memory levelRates = [300, 100, 100, 50, 50, 50, 50, 50, 50, 50];
        
        for(uint8 i = 0; i < 10 && current != address(0); i++) {
            if(users[current].isRegistered && !users[current].isBlacklisted) {
                uint96 levelBonus = (totalBonus * levelRates[i]) / 1000;
                _addEarnings(current, levelBonus, 2);
            }
            current = users[current].referrer;
        }
    }
    
    function _distributeUplineBonus(address user, uint96 amount, uint16 rate) internal {
        uint96 totalBonus = uint96((uint256(amount) * rate) / BASIS_POINTS);
        uint96 perUpline = totalBonus / 30;
        
        for(uint8 i = 0; i < 30; i++) {
            address upline = uplineChain[user][i];
            if(upline != address(0) && users[upline].isRegistered && !users[upline].isBlacklisted) {
                _addEarnings(upline, perUpline, 3);
            }
        }
    }
    
    function _addEarnings(address user, uint96 amount, uint8 bonusType) internal {
        if(amount == 0) return;
        
        User storage u = users[user];
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
        
        while (depth < 100) {
            if(binaryMatrix[current][0] == address(0)) {
                binaryMatrix[current][0] = user;
                return;
            } else if(binaryMatrix[current][1] == address(0)) {
                binaryMatrix[current][1] = user;
                return;
            } else {
                current = binaryMatrix[current][0];
                depth++;
            }
        }
    }
    
    function _updateUplineTeamSizes(address user) internal {
        address current = users[user].referrer;
        for(uint8 i = 0; i < 30 && current != address(0); i++) {
            users[current].teamSize++;
            current = users[current].referrer;
        }
    }
    
    function _updateLeaderRank(address user) internal {
        User storage u = users[user];
        uint32 teamSize = u.teamSize;
        uint32 directRefs = u.directReferrals;
        uint8 oldRank = u.rank;
        
        if (teamSize >= 500) {
            u.rank = 2; // Silver Star Leader
        } else if (teamSize >= 250 && directRefs >= 10) {
            u.rank = 1; // Shining Star Leader
        } else {
            u.rank = 0; // No rank
        }
        
        u.withdrawalRate = _getProgressiveWithdrawalRate(directRefs);
    }
    
    function _calculateMatrixLevel(uint32 position) internal pure returns (uint32) {
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
    
    function _getProgressiveWithdrawalRate(uint32 directReferralCount) internal pure returns (uint8) {
        if (directReferralCount >= 20) {
            return 80; // 80% withdrawal, 20% reinvestment
        } else if (directReferralCount >= 5) {
            return 75; // 75% withdrawal, 25% reinvestment
        } else {
            return 70; // 70% withdrawal, 30% reinvestment
        }
    }
    
    function _distributeReinvestment(address user, uint96 amount) internal {
        uint96 helpAmount = uint96((uint256(amount) * 3000) / BASIS_POINTS); // 30% to help pool
        helpPool.balance += helpAmount;
    }
    
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
    
    // ========== ADMIN FUNCTIONS ==========
    
    function setAdminFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid address");
        adminFeeRecipient = _recipient;
    }
    
    function blacklistUser(address user, bool status) external onlyAdmin {
        users[user].isBlacklisted = status;
    }
    
    function distributePools() external onlyAdmin {
        uint32 currentTime = uint32(block.timestamp);
        
        if(currentTime >= leaderPool.lastDistribution + leaderPool.interval) {
            emit PoolDistributed(1, leaderPool.balance);
            leaderPool.balance = 0;
            leaderPool.lastDistribution = currentTime;
        }
        
        if(currentTime >= helpPool.lastDistribution + helpPool.interval) {
            emit PoolDistributed(2, helpPool.balance);
            helpPool.balance = 0;
            helpPool.lastDistribution = currentTime;
        }
        
        if(currentTime >= clubPool.lastDistribution + clubPool.interval) {
            emit PoolDistributed(3, clubPool.balance);
            clubPool.balance = 0;
            clubPool.lastDistribution = currentTime;
        }
    }
    
    // ========== VIEW FUNCTIONS ==========
    
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
            1
        );
    }
    
    function calculateTeamSize(address user) external view returns (uint32) {
        return users[user].teamSize; // Simplified for now
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
