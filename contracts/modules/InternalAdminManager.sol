// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title InternalAdminManager
 * @dev Manages 21 internal admin addresses for simulation and testing purposes
 * 
 * Features:
 * - Manages up to 21 internal admin addresses
 * - Role-based access control for admin management
 * - Emergency controls for admin address updates
 * - Event logging for transparency
 * - Integration with main OrphiCrowdFund contract
 */
contract InternalAdminManager is Initializable, AccessControlUpgradeable, PausableUpgradeable {
    
    // =============================================================================
    // CONSTANTS
    // =============================================================================
    
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");
    bytes32 public constant ADMIN_MANAGER_ROLE = keccak256("ADMIN_MANAGER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    uint256 public constant MAX_INTERNAL_ADMINS = 21;
    
    // =============================================================================
    // STATE VARIABLES
    // =============================================================================
    
    /// @dev Array of internal admin addresses
    address[] public internalAdmins;
    
    /// @dev Mapping to check if address is an internal admin
    mapping(address => bool) public isInternalAdmin;
    
    /// @dev Mapping to track admin indices for efficient removal
    mapping(address => uint256) public adminIndex;
    
    /// @dev Main contract address that can use these admins
    address public orphiContract;
    
    /// @dev Emergency admin that can override in critical situations
    address public emergencyAdmin;
    
    /// @dev Timestamp of last admin update
    uint256 public lastAdminUpdate;
    
    /// @dev Admin activity tracking
    mapping(address => uint256) public adminLastActivity;
    mapping(address => uint256) public adminActionCount;
    
    // =============================================================================
    // EVENTS
    // =============================================================================
    
    event InternalAdminAdded(address indexed admin, uint256 index, address indexed addedBy);
    event InternalAdminRemoved(address indexed admin, uint256 index, address indexed removedBy);
    event InternalAdminReplaced(address indexed oldAdmin, address indexed newAdmin, uint256 index, address indexed replacedBy);
    event EmergencyAdminUpdated(address indexed oldEmergency, address indexed newEmergency);
    event OrphiContractUpdated(address indexed oldContract, address indexed newContract);
    event AdminActivityTracked(address indexed admin, string action);
    event MassAdminUpdate(uint256 totalAdmins, address indexed updatedBy);
    
    // =============================================================================
    // ERRORS
    // =============================================================================
    
    error MaxAdminsReached();
    error AdminNotFound();
    error AdminAlreadyExists();
    error InvalidAddress();
    error UnauthorizedAccess();
    error EmptyAdminList();
    error IndexOutOfBounds();
    
    // =============================================================================
    // INITIALIZATION
    // =============================================================================
    
    /**
     * @dev Initializes the InternalAdminManager
     * @param _superAdmin Address that will have super admin role
     * @param _emergencyAdmin Emergency admin address
     * @param _orphiContract Main OrphiCrowdFund contract address
     */
    function initialize(
        address _superAdmin,
        address _emergencyAdmin,
        address _orphiContract
    ) public initializer {
        if (_superAdmin == address(0) || _emergencyAdmin == address(0)) {
            revert InvalidAddress();
        }
        
        __AccessControl_init();
        __Pausable_init();
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, _superAdmin);
        _grantRole(SUPER_ADMIN_ROLE, _superAdmin);
        _grantRole(ADMIN_MANAGER_ROLE, _superAdmin);
        _grantRole(EMERGENCY_ROLE, _emergencyAdmin);
        
        emergencyAdmin = _emergencyAdmin;
        orphiContract = _orphiContract;
        lastAdminUpdate = block.timestamp;
        
        emit EmergencyAdminUpdated(address(0), _emergencyAdmin);
        emit OrphiContractUpdated(address(0), _orphiContract);
    }
    
    // =============================================================================
    // ADMIN MANAGEMENT FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Adds a new internal admin
     * @param _admin Address to add as internal admin
     */
    function addInternalAdmin(address _admin) 
        external 
        onlyRole(ADMIN_MANAGER_ROLE) 
        whenNotPaused 
    {
        if (_admin == address(0)) revert InvalidAddress();
        if (isInternalAdmin[_admin]) revert AdminAlreadyExists();
        if (internalAdmins.length >= MAX_INTERNAL_ADMINS) revert MaxAdminsReached();
        
        uint256 index = internalAdmins.length;
        internalAdmins.push(_admin);
        isInternalAdmin[_admin] = true;
        adminIndex[_admin] = index;
        adminLastActivity[_admin] = block.timestamp;
        
        lastAdminUpdate = block.timestamp;
        
        emit InternalAdminAdded(_admin, index, msg.sender);
    }
    
    /**
     * @dev Removes an internal admin
     * @param _admin Address to remove from internal admins
     */
    function removeInternalAdmin(address _admin) 
        external 
        onlyRole(ADMIN_MANAGER_ROLE) 
        whenNotPaused 
    {
        if (!isInternalAdmin[_admin]) revert AdminNotFound();
        
        uint256 indexToRemove = adminIndex[_admin];
        uint256 lastIndex = internalAdmins.length - 1;
        
        // Move the last admin to the position of the admin to remove
        if (indexToRemove != lastIndex) {
            address lastAdmin = internalAdmins[lastIndex];
            internalAdmins[indexToRemove] = lastAdmin;
            adminIndex[lastAdmin] = indexToRemove;
        }
        
        // Remove the last element
        internalAdmins.pop();
        
        // Clean up mappings
        delete isInternalAdmin[_admin];
        delete adminIndex[_admin];
        delete adminLastActivity[_admin];
        delete adminActionCount[_admin];
        
        lastAdminUpdate = block.timestamp;
        
        emit InternalAdminRemoved(_admin, indexToRemove, msg.sender);
    }
    
    /**
     * @dev Replaces an internal admin with a new one
     * @param _oldAdmin Address to replace
     * @param _newAdmin New address to add
     */
    function replaceInternalAdmin(address _oldAdmin, address _newAdmin) 
        external 
        onlyRole(ADMIN_MANAGER_ROLE) 
        whenNotPaused 
    {
        if (!isInternalAdmin[_oldAdmin]) revert AdminNotFound();
        if (_newAdmin == address(0)) revert InvalidAddress();
        if (isInternalAdmin[_newAdmin]) revert AdminAlreadyExists();
        
        uint256 index = adminIndex[_oldAdmin];
        
        // Update the array
        internalAdmins[index] = _newAdmin;
        
        // Update mappings
        delete isInternalAdmin[_oldAdmin];
        delete adminLastActivity[_oldAdmin];
        delete adminActionCount[_oldAdmin];
        
        isInternalAdmin[_newAdmin] = true;
        adminIndex[_newAdmin] = index;
        adminLastActivity[_newAdmin] = block.timestamp;
        
        lastAdminUpdate = block.timestamp;
        
        emit InternalAdminReplaced(_oldAdmin, _newAdmin, index, msg.sender);
    }
    
    /**
     * @dev Bulk add internal admins for initial setup
     * @param _admins Array of addresses to add as internal admins
     */
    function bulkAddInternalAdmins(address[] calldata _admins) 
        external 
        onlyRole(SUPER_ADMIN_ROLE) 
        whenNotPaused 
    {
        if (_admins.length == 0) revert EmptyAdminList();
        if (internalAdmins.length + _admins.length > MAX_INTERNAL_ADMINS) {
            revert MaxAdminsReached();
        }
        
        for (uint256 i = 0; i < _admins.length; i++) {
            address admin = _admins[i];
            if (admin == address(0)) revert InvalidAddress();
            if (isInternalAdmin[admin]) revert AdminAlreadyExists();
            
            uint256 index = internalAdmins.length;
            internalAdmins.push(admin);
            isInternalAdmin[admin] = true;
            adminIndex[admin] = index;
            adminLastActivity[admin] = block.timestamp;
            
            emit InternalAdminAdded(admin, index, msg.sender);
        }
        
        lastAdminUpdate = block.timestamp;
        emit MassAdminUpdate(internalAdmins.length, msg.sender);
    }
    
    // =============================================================================
    // ACTIVITY TRACKING
    // =============================================================================
    
    /**
     * @dev Tracks admin activity (called by main contract)
     * @param _admin Admin address that performed action
     * @param _action Description of action performed
     */
    function trackAdminActivity(address _admin, string calldata _action) 
        external 
    {
        require(msg.sender == orphiContract || hasRole(ADMIN_MANAGER_ROLE, msg.sender), "Unauthorized");
        
        if (isInternalAdmin[_admin]) {
            adminLastActivity[_admin] = block.timestamp;
            adminActionCount[_admin]++;
            
            emit AdminActivityTracked(_admin, _action);
        }
    }
    
    // =============================================================================
    // VIEW FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Returns all internal admin addresses
     */
    function getAllInternalAdmins() external view returns (address[] memory) {
        return internalAdmins;
    }
    
    /**
     * @dev Returns number of internal admins
     */
    function getInternalAdminCount() external view returns (uint256) {
        return internalAdmins.length;
    }
    
    /**
     * @dev Returns internal admin at specific index
     * @param _index Index to query
     */
    function getInternalAdminAt(uint256 _index) external view returns (address) {
        if (_index >= internalAdmins.length) revert IndexOutOfBounds();
        return internalAdmins[_index];
    }
    
    /**
     * @dev Checks if address is an internal admin
     * @param _admin Address to check
     */
    function checkIsInternalAdmin(address _admin) external view returns (bool) {
        return isInternalAdmin[_admin];
    }
    
    /**
     * @dev Gets admin activity stats
     * @param _admin Admin address to query
     */
    function getAdminStats(address _admin) external view returns (
        bool isAdmin,
        uint256 lastActivity,
        uint256 actionCount,
        uint256 index
    ) {
        return (
            isInternalAdmin[_admin],
            adminLastActivity[_admin],
            adminActionCount[_admin],
            adminIndex[_admin]
        );
    }
    
    /**
     * @dev Returns comprehensive admin info
     */
    function getAdminManagerInfo() external view returns (
        uint256 totalAdmins,
        uint256 maxAdmins,
        address[] memory admins,
        address currentEmergencyAdmin,
        address currentOrphiContract,
        uint256 lastUpdate
    ) {
        return (
            internalAdmins.length,
            MAX_INTERNAL_ADMINS,
            internalAdmins,
            emergencyAdmin,
            orphiContract,
            lastAdminUpdate
        );
    }
    
    // =============================================================================
    // ADMIN CONFIGURATION
    // =============================================================================
    
    /**
     * @dev Updates emergency admin address
     * @param _newEmergencyAdmin New emergency admin address
     */
    function updateEmergencyAdmin(address _newEmergencyAdmin) 
        external 
        onlyRole(SUPER_ADMIN_ROLE) 
    {
        if (_newEmergencyAdmin == address(0)) revert InvalidAddress();
        
        address oldEmergency = emergencyAdmin;
        emergencyAdmin = _newEmergencyAdmin;
        
        // Update role
        _revokeRole(EMERGENCY_ROLE, oldEmergency);
        _grantRole(EMERGENCY_ROLE, _newEmergencyAdmin);
        
        emit EmergencyAdminUpdated(oldEmergency, _newEmergencyAdmin);
    }
    
    /**
     * @dev Updates OrphiCrowdFund contract address
     * @param _newOrphiContract New contract address
     */
    function updateOrphiContract(address _newOrphiContract) 
        external 
        onlyRole(SUPER_ADMIN_ROLE) 
    {
        if (_newOrphiContract == address(0)) revert InvalidAddress();
        
        address oldContract = orphiContract;
        orphiContract = _newOrphiContract;
        
        emit OrphiContractUpdated(oldContract, _newOrphiContract);
    }
    
    // =============================================================================
    // EMERGENCY FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Emergency pause function
     */
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }
    
    /**
     * @dev Emergency unpause function
     */
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Emergency clear all admins (use with extreme caution)
     */
    function emergencyClearAllAdmins() external onlyRole(EMERGENCY_ROLE) {
        uint256 adminCount = internalAdmins.length;
        
        // Clear all mappings
        for (uint256 i = 0; i < adminCount; i++) {
            address admin = internalAdmins[i];
            delete isInternalAdmin[admin];
            delete adminIndex[admin];
            delete adminLastActivity[admin];
            delete adminActionCount[admin];
        }
        
        // Clear array
        delete internalAdmins;
        lastAdminUpdate = block.timestamp;
        
        emit MassAdminUpdate(0, msg.sender);
    }
    
    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================
    
    /**
     * @dev Validates if caller has internal admin privileges
     * @param _caller Address to validate
     */
    function validateInternalAdmin(address _caller) external view returns (bool) {
        return isInternalAdmin[_caller];
    }
    
    /**
     * @dev Gets a random internal admin (for simulation purposes)
     */
    function getRandomInternalAdmin() external view returns (address) {
        if (internalAdmins.length == 0) return address(0);
        
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number
        ))) % internalAdmins.length;
        
        return internalAdmins[randomIndex];
    }
    
    /**
     * @dev Returns contract version for compatibility checking
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}
