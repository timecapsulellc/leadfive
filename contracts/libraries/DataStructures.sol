// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title DataStructures
 * @dev Optimized core data structures for OrphiCrowdFund
 * @notice Gas-optimized struct packing and efficient memory layout
 * 
 * OPTIMIZATION FEATURES:
 * =====================
 * 1. Split User struct into smaller components (UserCore, UserFinancials, UserPlatform, UserBonuses)
 *    - Reduces stack depth issues in complex functions
 *    - Allows more granular access to user data
 *    - Maintains backward compatibility with full User struct
 * 
 * 2. Optimized struct packing:
 *    - Smaller integer types where appropriate (uint32, uint64, uint128)
 *    - Boolean grouping for efficient storage
 *    - Address optimization
 * 
 * 3. Consolidated event structures:
 *    - Single EventData struct for multiple event types
 *    - Backward compatibility structs for existing libraries
 * 
 * 4. Utility functions:
 *    - Enum to uint8 conversions for storage efficiency
 *    - Struct splitting/merging utilities
 *    - Type conversion helpers
 * 
 * 5. Legacy compatibility:
 *    - MainUser, MainPackage etc. kept for existing code
 *    - Gradual migration path to optimized structures
 * 
 * GAS SAVINGS:
 * ============
 * - Reduced storage slots through better packing
 * - Smaller function parameters with split structs
 * - More efficient memory layout
 * - Reduced stack depth in complex operations
 */
library DataStructures {
    
    /// @dev Package tiers with investment amounts
    enum PackageTier { 
        NONE,       // 0
        PACKAGE_5,  // 1 - $300
        PACKAGE_6,  // 2 - $500
        PACKAGE_7,  // 3 - $1000
        PACKAGE_8   // 4 - $2000
    }

    /// @dev Leadership ranks for bonus qualifications
    enum LeaderRank {
        NONE,      // 0
        BRONZE,    // 1
        SILVER,    // 2
        GOLD,      // 3
        PLATINUM,  // 4
        DIAMOND    // 5
    }

    /// @dev Withdrawal and bonus types
    enum WithdrawalType {
        DIRECT_BONUS,      // 0
        LEVEL_BONUS,       // 1
        UPLINE_BONUS,      // 2
        GHP_BONUS,         // 3
        LEADER_BONUS,      // 4
        CLUB_BONUS,        // 5
        MANUAL_WITHDRAWAL  // 6
    }
    
    /// @dev Supported payment currencies
    enum PaymentCurrency { BNB, USDT }

    // ==================== CORE STRUCTS ====================
    
    /**
     * @dev Core user data - split into smaller structs to avoid stack too deep
     */
    struct UserCore {
        address referrer;
        bool isRegistered;
        bool isBlacklisted;
    }
    
    /**
     * @dev User financial data
     */
    struct UserFinancials {
        uint256 totalInvestment;
        uint256 totalEarnings;
        uint256 withdrawableBalance;
        uint256 earningsCap;
    }
    
    /**
     * @dev User platform data
     */
    struct UserPlatform {
        address[] directReferrals;
        address[] matrixReferrals;
        uint256 totalReferrals;
        uint256 totalMatrixReferrals;
    }
    
    /**
     * @dev Complete user struct - optimized for LeadFive contract
     */
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
        // New enhanced fields
        uint96 pendingRewards;
        uint32 lastWithdrawal;
        uint32 matrixCycles;
        uint8 leaderRank; // 0=none, 1=silver, 2=gold, 3=diamond
        uint96 leftLegVolume;
        uint96 rightLegVolume;
        bool isActive;
    }

    /**
     * @dev Optimized investment record
     */
    struct Investment {
        uint8 tier;                 // PackageTier as uint8
        bool active;                // 1 byte
        uint64 timestamp;           // 8 bytes (sufficient for timestamps)
        uint256 amount;             // Investment amount
        uint256 earningsGenerated;  // Earnings from this investment
    }

    /**
     * @dev Package definition for LeadFive contract
     */
    struct Package {
        uint96 price;
        uint16 directBonus;
        uint16 levelBonus;
        uint16 uplineBonus;
        uint16 leaderBonus;
        uint16 helpBonus;
        uint16 clubBonus;
    }

    /**
     * @dev Optimized pool tracking
     */
    struct Pool {
        uint96 balance;
        uint32 lastDistribution;
        uint16 rate;
        uint32 interval;
    }

    /**
     * @dev Level percentage and requirements
     */
    struct LevelInfo {
        uint32 percentage;          // Percentage in basis points (0-10000)
        uint32 requirement;         // Requirement value
    }

    /**
     * @dev Leadership qualification requirements
     */
    struct LeaderQualification {
        uint64 minDirectReferrals;  // Minimum direct referrals
        uint128 minTeamVolume;      // Minimum team volume
        uint128 minPersonalVolume;  // Minimum personal investment
        uint32 bonusPercentage;     // Bonus percentage (BP)
        bool isActive;              // Qualification active
    }
    
    /**
     * @dev Rank qualification requirements
     */
    struct RankRequirement {
        uint32 directReferrals;
        uint32 teamSize;
        uint96 personalVolume;
        uint96 teamVolume;
        string rankName;
        uint256 bonus; // Rank achievement bonus
    }
    
    /**
     * @dev Withdrawal safety limits
     */
    struct WithdrawalLimits {
        uint96 dailyLimit;
        uint96 weeklyLimit;
        uint96 monthlyLimit;
        uint32 cooldownPeriod;
    }
    
    /**
     * @dev Binary leg tracking
     */
    struct BinaryLeg {
        uint96 volume;
        uint32 members;
        uint256 lastUpdate;
    }
    
    /**
     * @dev Achievement system
     */
    struct Achievement {
        uint32 achievementId;
        string name;
        string description;
        uint256 reward;
        bool isActive;
        uint256 timestamp;
    }
    
    /**
     * @dev Pool types enumeration
     */
    enum PoolType {
        Leader,
        Help,
        Club
    }
    
    /**
     * @dev Notification types for events
     */
    enum NotificationType {
        Registration,
        Withdrawal,
        RankUpgrade,
        MatrixCompletion,
        PoolDistribution,
        Achievement
    }

    // ==================== EVENT DATA STRUCTS ====================
    
    /**
     * @dev Consolidated event data structure
     * @notice Single struct for multiple event types to reduce contract size
     */
    struct EventData {
        address user;
        uint256 amount;
        uint256 timestamp;
        uint256 eventType;
    }

    // ==================== SPECIFIC EVENT STRUCTS (for compatibility) ====================
    
    /**
     * @dev Specific event structs - kept for library compatibility
     * @notice These will be migrated to EventData in future versions
     */
    struct UserRegisteredEventData {
        address user;
        address referrer;
        uint256 timestamp;
        uint8 packageId;
        uint96 amount;
    }
    
    struct InvestmentMadeEventData {
        address user;
        PackageTier tier;
        uint256 amount;
        uint256 timestamp;
    }
    
    struct BonusDistributedEventData {
        address recipient;
        address payer;
        uint256 amount;
        uint8 level;
        string bonusType;
        uint256 timestamp;
    }
    
    struct PoolUpdateEventData {
        string poolName;
        uint256 amountAdded;
        uint256 timestamp;
    }
    
    struct FundsWithdrawnEventData {
        address user;
        uint256 totalAmount;
        uint256 withdrawnAmount;
        uint256 reinvestedAmount;
        WithdrawalType withdrawalType;
        uint256 timestamp;
    }
    
    struct AutoReinvestmentEventData {
        address user;
        uint256 amount;
        uint256 levelAllocation;
        uint256 uplineAllocation;
        uint256 ghpAllocation;
        uint256 timestamp;
    }

    struct ContributionEventData {
        address user;
        uint96 amount;
        uint8 packageId;
    }

    struct WithdrawalEventData {
        address user;
        uint96 amount;
        uint8 type_;
    }

    struct PoolDistributionEventData {
        uint8 poolId;
        uint96 amount;
    }

    // ==================== LEGACY COMPATIBILITY STRUCTS ====================
    // Note: These are kept for backward compatibility and may be deprecated
    
    /**
     * @dev Legacy MainUser struct - consider migrating to optimized User struct
     * @notice Less efficient than the new User struct due to poor packing
     */
    struct MainUser {
        bool exists;
        bool isActive;
        address referrer;           // Direct sponsor
        address leftChild;          // Binary matrix left
        address rightChild;         // Binary matrix right
        uint256 totalInvestment;
        uint256 totalEarnings;
        uint256 withdrawableAmount;
        uint256 directReferrals;
        uint256 teamSize;
        uint256 leftVolume;         // Binary left leg volume
        uint256 rightVolume;        // Binary right leg volume
        uint256 packageLevel;       // Current package tier
        uint256 joinTime;
        uint256 lastActivity;
        uint256 registrationTime;
        uint256 lastWithdrawal;
        uint8 leaderRank;           // Using uint8 instead of enum for size
        uint256 earningsCap;        // Individual earnings cap
        uint256 ghpEligibleVolume;  // Volume for GHP qualification
        uint256 leaderBonusEarnings;
        uint256 clubPoolEarnings;
        bool ghpEligible;           // GHP distribution eligibility
        bool clubPoolEligible;      // Club pool eligibility (Tier 3+)
    }
    
    /// @dev Use Package struct instead - kept for compatibility
    struct MainPackage {
        uint128 amount;             // Package investment amount
        uint128 bnbAmount;          // BNB equivalent (sufficient for package amounts)
        uint128 usdtAmount;         // USDT amount (sufficient for package amounts)
        uint32 minDirectReferrals;  // Required directs for this package
        bool isActive;              // Package availability
    }
    
    /// @dev Use Pool struct instead - kept for compatibility
    struct MainDistributionPool {
        uint128 totalBalance;       // Current pool balance
        uint128 totalDistributed;   // Total ever distributed
        uint64 lastDistribution;    // Last distribution timestamp
        uint32 distributionCount;   // Number of distributions
        bool isActive;              // Pool active status
    }
    
    /// @dev Use LeaderQualification struct instead - kept for compatibility
    struct MainLeaderQualification {
        uint64 minDirectReferrals;  // Minimum direct referrals
        uint128 minTeamVolume;      // Minimum team volume
        uint128 minPersonalVolume;  // Minimum personal investment
        uint32 bonusPercentage;     // Leader bonus percentage (BP)
        bool isActive;              // Rank active status
    }
    
    /// @dev Use Investment struct instead - kept for compatibility
    struct MainInvestment {
        uint8 tier;
        uint256 amount;
        uint256 timestamp;
        bool active;
        uint256 earningsGenerated;
    }
    // ==================== GOVERNANCE STRUCTS ====================
    
    /**
     * @dev Optimized upgrade proposal for governance
     * @notice Efficient storage for multi-sig upgrade proposals
     */
    struct UpgradeProposal {
        address implementation;     // New implementation address
        uint64 proposedAt;         // Proposal timestamp (uint64 sufficient)
        uint32 signatureCount;     // Number of signatures (uint32 sufficient)
        bool executed;             // Execution status
        bool canceled;             // Cancellation status
        address[] signers;         // List of signers
        mapping(address => bool) hasSigned; // Signature tracking
    }

    // ==================== UTILITY FUNCTIONS ====================
    
    /**
     * @dev Convert PackageTier enum to uint8 for efficient storage
     */
    function tierToUint8(PackageTier tier) internal pure returns (uint8) {
        return uint8(tier);
    }
    
    /**
     * @dev Convert uint8 back to PackageTier enum
     */
    function uint8ToTier(uint8 value) internal pure returns (PackageTier) {
        require(value <= uint8(PackageTier.PACKAGE_8), "Invalid tier");
        return PackageTier(value);
    }
    
    /**
     * @dev Convert LeaderRank enum to uint8 for efficient storage
     */
    function rankToUint8(LeaderRank rank) internal pure returns (uint8) {
        return uint8(rank);
    }
    
    /**
     * @dev Convert uint8 back to LeaderRank enum
     */
    function uint8ToRank(uint8 value) internal pure returns (LeaderRank) {
        require(value <= uint8(LeaderRank.DIAMOND), "Invalid rank");
        return LeaderRank(value);
    }
    
    /**
     * @dev Create UserCore from full User struct
     */
    function extractUserCore(User memory user) internal pure returns (UserCore memory) {
        return UserCore({
            referrer: user.referrer,
            isRegistered: user.isRegistered,
            isBlacklisted: user.isBlacklisted
        });
    }
    
    /**
     * @dev Create UserFinancials from full User struct
     */
    function extractUserFinancials(User memory user) internal pure returns (UserFinancials memory) {
        return UserFinancials({
            totalInvestment: user.totalInvestment,
            totalEarnings: user.totalEarnings,
            withdrawableBalance: user.balance,
            earningsCap: user.earningsCap
        });
    }

    // Constants
    uint256 constant BASIS_POINTS = 10000;
    uint256 constant MAX_LEVEL = 10;
    uint256 constant MATRIX_CAPACITY = 3;
    
    // Events
    event UserRegistered(
        address indexed user,
        address indexed referrer,
        uint8 packageId,
        uint96 amount
    );
    
    event ContributionMade(
        address indexed user,
        uint96 amount,
        uint8 packageId
    );
    
    event WithdrawalMade(
        address indexed user,
        uint96 amount,
        uint8 type_
    );
    
    event PoolDistributed(
        uint8 indexed poolId,
        uint96 amount
    );
}
