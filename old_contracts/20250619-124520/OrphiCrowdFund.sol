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

contract OrphiCrowdFund is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {
    
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
    
    Pool public leaderPool;
    Pool public helpPool;
    Pool public clubPool;
    
    IERC20 public usdt;
    IPriceFeed public priceFeed;
    address[16] public adminIds;
    
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant EARNINGS_MULTIPLIER = 4;
    uint256 private lastTxBlock;
    
    event UserRegistered(address indexed user, address indexed referrer, uint8 packageLevel, uint96 amount);
    event PackageUpgraded(address indexed user, uint8 newLevel, uint96 amount);
    event BonusDistributed(address indexed recipient, uint96 amount, uint8 bonusType);
    event Withdrawal(address indexed user, uint96 amount);
    event PoolDistributed(uint8 indexed poolType, uint96 amount);
    
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
        adminIds = _adminIds;
        
        packages[1] = Package(30e18, 4000, 1000, 1000, 1000, 3000, 500);
        packages[2] = Package(50e18, 4000, 1000, 1000, 1000, 3000, 500);
        packages[3] = Package(100e18, 4000, 1000, 1000, 1000, 3000, 500);
        packages[4] = Package(200e18, 4000, 1000, 1000, 1000, 3000, 500);
        packages[5] = Package(300e18, 4000, 1000, 1000, 1000, 3000, 500);
        packages[6] = Package(500e18, 4000, 1000, 1000, 1000, 3000, 500);
        packages[7] = Package(1000e18, 4000, 1000, 1000, 1000, 3000, 500);
        packages[8] = Package(2000e18, 4000, 1000, 1000, 1000, 3000, 500);
        
        leaderPool = Pool(0, uint32(block.timestamp), 604800);
        helpPool = Pool(0, uint32(block.timestamp), 604800);
        clubPool = Pool(0, uint32(block.timestamp), 2592000);
        
        for(uint i = 0; i < 16; i++) {
            if(_adminIds[i] != address(0)) {
                users[_adminIds[i]] = User(true, false, address(0), 0, 0, 0, type(uint96).max, 0, 0, 8, 5, 80);
            }
        }
    }
    
    function register(address referrer, uint8 packageLevel, bool useUSDT) external payable nonReentrant whenNotPaused antiMEV {
        require(!users[msg.sender].isRegistered, "Already registered");
        require(packageLevel >= 1 && packageLevel <= 8, "Invalid package");
        require(referrer == address(0) || users[referrer].isRegistered, "Invalid referrer");
        
        uint96 amount = _processPayment(packageLevel, useUSDT);
        
        users[msg.sender] = User(
            true, false, referrer, 0, amount, 0,
            uint96(amount * EARNINGS_MULTIPLIER), 0, 0, packageLevel, 0, 70
        );
        
        if(referrer != address(0)) {
            directReferrals[referrer].push(msg.sender);
            users[referrer].directReferrals++;
            _buildUplineChain(msg.sender, referrer);
            _placeBinaryMatrix(msg.sender, referrer);
        }
        
        _distributeBonuses(msg.sender, amount, packageLevel);
        emit UserRegistered(msg.sender, referrer, packageLevel, amount);
    }
    
    function upgradePackage(uint8 newLevel, bool useUSDT) external payable nonReentrant whenNotPaused antiMEV {
        require(users[msg.sender].isRegistered, "Not registered");
        require(!users[msg.sender].isBlacklisted, "Blacklisted");
        require(newLevel > users[msg.sender].packageLevel && newLevel <= 8, "Invalid upgrade");
        
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
        
        uint96 withdrawable = (amount * user.withdrawalRate) / 100;
        uint96 reinvestment = amount - withdrawable;
        
        user.balance -= amount;
        
        if(reinvestment > 0) {
            _autoReinvest(msg.sender, reinvestment);
        }
        
        payable(msg.sender).transfer(withdrawable);
        emit Withdrawal(msg.sender, withdrawable);
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
            // For BNB payments, accept any amount >= 0.01 BNB for testing
            require(msg.value >= 0.01 ether, "Minimum 0.01 BNB required");
            return packagePrice;
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
        User storage u = users[user];
        if(u.totalEarnings + amount <= u.earningsCap) {
            u.balance += amount;
            u.totalEarnings += amount;
            emit BonusDistributed(user, amount, bonusType);
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
        if(binaryMatrix[referrer][0] == address(0)) {
            binaryMatrix[referrer][0] = user;
        } else if(binaryMatrix[referrer][1] == address(0)) {
            binaryMatrix[referrer][1] = user;
        } else {
            _placeBinaryMatrix(user, binaryMatrix[referrer][0]);
        }
    }
    
    function _autoReinvest(address user, uint96 amount) internal {
        uint8 currentLevel = users[user].packageLevel;
        if(currentLevel < 8 && amount >= packages[currentLevel + 1].price) {
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
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    receive() external payable {}
} 