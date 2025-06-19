// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./libraries/CommissionLib.sol";
import "./libraries/MatrixLib.sol";
import "./libraries/PoolLib.sol";

interface IPriceFeed {
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80);
}

contract LeadFiveModular is Initializable, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {
    using CommissionLib for *;
    using MatrixLib for *;
    using PoolLib for *;
    
    struct Package {
        uint96 price;
        CommissionLib.CommissionRates rates;
    }
    
    mapping(address => CommissionLib.User) public users;
    mapping(uint8 => Package) public packages;
    mapping(address => address[]) public directReferrals;
    mapping(address => address[30]) public uplineChain;
    mapping(address => address[2]) public binaryMatrix;
    mapping(address => uint32) public spilloverCounter; // ✅ NEW: Track spillover direction
    mapping(string => address) public referralCodeToUser;
    
    PoolLib.Pool public leaderPool;
    PoolLib.Pool public helpPool;
    PoolLib.Pool public clubPool;
    
    IERC20 public usdt;
    IPriceFeed public priceFeed;
    address[16] public adminIds;
    
    address[] public shiningStarLeaders;
    address[] public silverStarLeaders;
    address[] public eligibleHelpPoolUsers;
    uint32 public totalUsers;
    
    address public adminFeeRecipient;
    uint96 public totalAdminFeesCollected;
    
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant EARNINGS_MULTIPLIER = 4;
    uint256 private constant ADMIN_FEE_RATE = 500; // 5%
    uint256 private lastTxBlock;
    
    event UserRegistered(address indexed user, address indexed referrer, uint8 packageLevel, uint96 amount);
    event PackageUpgraded(address indexed user, uint8 newLevel, uint96 amount);
    event BonusDistributed(address indexed recipient, uint96 amount, uint8 bonusType);
    event Withdrawal(address indexed user, uint96 amount);
    event PoolDistributed(uint8 indexed poolType, uint96 amount);
    event AdminFeeCollected(uint96 amount, address indexed user);
    event GasLimitReached(address indexed user, uint8 level, string bonusType); // ✅ NEW: Gas monitoring
    
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
        
        for(uint i = 0; i < 16; i++) {
            adminIds[i] = msg.sender;
        }
        
        // Initialize packages with commission rates
        packages[1] = Package(30e18, CommissionLib.CommissionRates(4000, 1000, 1000, 1000, 3000, 0));
        packages[2] = Package(50e18, CommissionLib.CommissionRates(4000, 1000, 1000, 1000, 3000, 0));
        packages[3] = Package(100e18, CommissionLib.CommissionRates(4000, 1000, 1000, 1000, 3000, 0));
        packages[4] = Package(200e18, CommissionLib.CommissionRates(4000, 1000, 1000, 1000, 3000, 0));
        
        // Initialize pools
        PoolLib.initializePool(leaderPool, 604800);  // Weekly
        PoolLib.initializePool(helpPool, 604800);    // Weekly
        PoolLib.initializePool(clubPool, 2592000);   // Monthly
        
        // Register deployer
        users[msg.sender] = CommissionLib.User({
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
        
        uint32 matrixPos = MatrixLib.calculateMatrixPosition(totalUsers);
        uint32 matrixLvl = MatrixLib.calculateMatrixLevel(matrixPos);
        
        users[msg.sender] = CommissionLib.User({
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
            _updateLeaderRank(referrer);
        }
        
        _distributeBonuses(msg.sender, amount, packageLevel);
        emit UserRegistered(msg.sender, referrer, packageLevel, packages[packageLevel].price);
    }
    
    function withdraw(uint96 amount) external nonReentrant whenNotPaused {
        CommissionLib.User storage user = users[msg.sender];
        require(user.isRegistered && !user.isBlacklisted, "Invalid user");
        require(amount <= user.balance, "Insufficient balance");
        require(adminFeeRecipient != address(0), "Admin fee recipient not set");
        
        // ✅ FIX: Calculate admin fee from total amount first
        uint96 adminFee = CommissionLib.calculateAdminFee(amount, ADMIN_FEE_RATE);
        uint96 netAmount = amount - adminFee;
        
        uint8 withdrawalRate = CommissionLib.getProgressiveWithdrawalRate(user.directReferrals);
        uint96 withdrawable = (netAmount * withdrawalRate) / 100;
        uint96 reinvestment = netAmount - withdrawable;
        
        user.balance -= amount;
        totalAdminFeesCollected += adminFee;
        
        payable(msg.sender).transfer(withdrawable);
        payable(adminFeeRecipient).transfer(adminFee);
        
        if(reinvestment > 0) {
            _distributeReinvestment(msg.sender, reinvestment);
        }
        
        emit Withdrawal(msg.sender, withdrawable);
        emit AdminFeeCollected(adminFee, msg.sender);
    }
    
    function distributePools() external onlyAdmin {
        if(PoolLib.isDistributionReady(leaderPool)) {
            uint96 distributed = PoolLib.distributeLeaderPool(leaderPool, shiningStarLeaders, silverStarLeaders);
            if(distributed > 0) emit PoolDistributed(1, distributed);
        }
        
        if(PoolLib.isDistributionReady(helpPool)) {
            (uint96 distributed, , bool completed) = PoolLib.distributeHelpPoolBatch(helpPool, eligibleHelpPoolUsers, 0, 50);
            if(completed && distributed > 0) emit PoolDistributed(2, distributed);
        }
        
        if(PoolLib.isDistributionReady(clubPool)) {
            uint96 distributed = PoolLib.distributeClubPool(clubPool, silverStarLeaders);
            if(distributed > 0) emit PoolDistributed(3, distributed);
        }
    }
    
    function _processPayment(uint8 packageLevel, bool useUSDT) internal returns (uint96) {
        uint96 packagePrice = packages[packageLevel].price;
        
        // ✅ FIX: Calculate and collect admin fee first
        uint96 adminFee = CommissionLib.calculateAdminFee(packagePrice, ADMIN_FEE_RATE);
        uint96 distributableAmount = packagePrice - adminFee;
        
        if(useUSDT) {
            require(usdt.transferFrom(msg.sender, address(this), packagePrice), "USDT transfer failed");
        } else {
            uint96 bnbRequired = _getBNBPrice(packagePrice);
            require(msg.value >= bnbRequired, "Insufficient BNB");
            
            if(msg.value > bnbRequired) {
                payable(msg.sender).transfer(msg.value - bnbRequired);
            }
        }
        
        // ✅ FIX: Collect admin fee and transfer to recipient
        totalAdminFeesCollected += adminFee;
        if(adminFeeRecipient != address(0)) {
            if(useUSDT) {
                require(usdt.transfer(adminFeeRecipient, adminFee), "Admin fee transfer failed");
            } else {
                payable(adminFeeRecipient).transfer(_getBNBPrice(adminFee));
            }
        }
        
        emit AdminFeeCollected(adminFee, msg.sender);
        return distributableAmount; // Return only the distributable amount (95%)
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
    
    function _distributeBonuses(address user, uint96 amount, uint8 packageLevel) internal {
        Package memory pkg = packages[packageLevel];
        
        if(users[user].referrer != address(0)) {
            uint96 directBonus = CommissionLib.calculateDirectBonus(amount, pkg.rates.directBonus);
            _addEarnings(users[user].referrer, directBonus, 1);
        }
        
        _distributeLevelBonus(user, amount, pkg.rates.levelBonus);
        _distributeUplineBonus(user, amount, pkg.rates.uplineBonus);
        
        (uint96 leaderAmount, uint96 helpAmount, uint96 clubAmount) = 
            CommissionLib.calculatePoolContributions(amount, pkg.rates);
        
        PoolLib.addToPool(leaderPool, leaderAmount);
        PoolLib.addToPool(helpPool, helpAmount);
        PoolLib.addToPool(clubPool, clubAmount);
    }
    
    function _distributeLevelBonus(address user, uint96 amount, uint16 rate) internal {
        address current = users[user].referrer;
        uint256 gasUsed = gasleft();
        uint256 gasLimit = gasUsed - 100000; // ✅ Reserve 100k gas for completion
        
        for(uint8 i = 0; i < 10 && current != address(0); i++) {
            // ✅ FIX: Gas limit protection
            if(gasleft() < gasLimit / 10) {
                emit GasLimitReached(user, i, "LevelBonus"); // ✅ NEW: Emit event for monitoring
                break;
            }
            
            if(users[current].isRegistered && !users[current].isBlacklisted) {
                uint96 levelBonus = CommissionLib.calculateLevelBonus(amount, rate, i);
                _addEarnings(current, levelBonus, 2);
            }
            current = users[current].referrer;
        }
    }
    
    function _distributeUplineBonus(address user, uint96 amount, uint16 rate) internal {
        uint96 perUpline = CommissionLib.calculateUplineBonus(amount, rate, 30);
        uint256 gasUsed = gasleft();
        uint256 gasLimit = gasUsed - 100000; // ✅ Reserve gas
        
        for(uint8 i = 0; i < 30; i++) {
            // ✅ FIX: Gas limit protection
            if(gasleft() < gasLimit / 30) {
                emit GasLimitReached(user, i, "UplineBonus");
                break;
            }
            
            address upline = uplineChain[user][i];
            if(upline != address(0) && users[upline].isRegistered && !users[upline].isBlacklisted) {
                _addEarnings(upline, perUpline, 3);
            }
        }
    }
    
    function _addEarnings(address user, uint96 amount, uint8 bonusType) internal {
        if(amount == 0) return;
        
        CommissionLib.User storage u = users[user];
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
    
    function _placeBinaryMatrix(address user, address referrer) internal {
        (address parent, uint8 position) = MatrixLib.findPlacementPosition(
            binaryMatrix, 
            spilloverCounter, // ✅ Pass spillover counter for rotation
            referrer
        );
        binaryMatrix[parent][position] = user;
    }
    
    function _updateLeaderRank(address user) internal {
        CommissionLib.User storage u = users[user];
        uint8 newRank = MatrixLib.checkLeaderQualification(u.teamSize, u.directReferrals);
        
        if(newRank != u.rank) {
            if(u.rank > 0) _removeFromLeaderArray(user, u.rank);
            if(newRank > 0) _addToLeaderArray(user, newRank);
            u.rank = newRank;
        }
    }
    
    function _addToLeaderArray(address user, uint8 rank) internal {
        if(rank == 1) shiningStarLeaders.push(user);
        else if(rank == 2) silverStarLeaders.push(user);
    }
    
    function _removeFromLeaderArray(address user, uint8 rank) internal {
        if(rank == 1) _removeFromArray(shiningStarLeaders, user);
        else if(rank == 2) _removeFromArray(silverStarLeaders, user);
    }
    
    function _removeFromArray(address[] storage array, address user) internal {
        for(uint i = 0; i < array.length; i++) {
            if(array[i] == user) {
                array[i] = array[array.length - 1];
                array.pop();
                break;
            }
        }
    }
    
    function _buildUplineChain(address user, address referrer) internal {
        uplineChain[user][0] = referrer;
        
        for (uint8 i = 1; i < 30; i++) {
            address nextUpline = uplineChain[uplineChain[user][i-1]][0];
            if (nextUpline == address(0)) break;
            uplineChain[user][i] = nextUpline;
        }
    }
    
    function _distributeReinvestment(address user, uint96 amount) internal {
        uint96 levelAmount = uint96((uint256(amount) * 4000) / BASIS_POINTS);
        uint96 uplineAmount = uint96((uint256(amount) * 3000) / BASIS_POINTS);
        uint96 helpAmount = uint96((uint256(amount) * 3000) / BASIS_POINTS);
        
        _distributeLevelBonus(user, levelAmount, 1000);
        _distributeUplineBonus(user, uplineAmount, 1000);
        PoolLib.addToPool(helpPool, helpAmount);
    }
    
    // Admin functions
    function setAdminFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid address");
        adminFeeRecipient = _recipient;
    }
    
    function blacklistUser(address user, bool status) external onlyAdmin {
        users[user].isBlacklisted = status;
    }
    
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }
    
    // View functions
    function getUserInfo(address user) external view returns (CommissionLib.User memory) {
        return users[user];
    }
    
    function getPoolBalances() external view returns (uint96, uint96, uint96) {
        return (leaderPool.balance, helpPool.balance, clubPool.balance);
    }
    
    function getAdminFeeInfo() external view returns (address, uint96, uint256) {
        return (adminFeeRecipient, totalAdminFeesCollected, ADMIN_FEE_RATE);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    receive() external payable {}
}
