// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IOrphiCrowdFund {
    // Upgrade functions
    function proposeUpgrade(address newImplementation) external;
    function executeUpgrade(bytes32 proposalId) external;
    function cancelUpgrade(bytes32 proposalId) external;
    function setupUpgradeMultiSig(address[] calldata signers, uint256 _requiredSignatures) external;
    function signUpgrade(bytes32 proposalId) external;
    
    // Registration and Core Functions
    function register(address referrer, uint8 tier) external payable;
    function contribute(address referrer, uint8 tier) external payable;
    
    // Constants - made as view functions for proxy compatibility
    function BASIS_POINTS() external pure returns (uint256);
    function UPGRADE_DELAY() external pure returns (uint256);
    function POOL_MANAGER_ROLE() external pure returns (bytes32);
    function EMERGENCY_ROLE() external pure returns (bytes32);
    function UPGRADER_ROLE() external pure returns (bytes32);
    function ADMIN_ROLE() external pure returns (bytes32);
    function PAUSER_ROLE() external pure returns (bytes32);
    
    // Upgrade state view functions
    function getPendingUpgrades() external view returns (bytes32[] memory);
    function getUpgradeProposal(bytes32 proposalId) external view returns (
        address implementation,
        uint256 proposedAt,
        bool executed,
        bool canceled,
        address[] memory signers
    );
    
    // Compensation view functions
    function getUserEarnings(address user) external view returns (uint256, uint256, uint256);
    function globalHelpPoolBalance() external view returns (uint256);
    function constants() external pure returns (uint256 basisPoints, uint256 upgradeDelay);
    function getBasisPoints() external pure returns (uint256);
    
    // Proxy admin functions
    function getProxyAdmin() external view returns (address);
    function getImplementation() external view returns (address);
    
    // Leader and matrix functions
    function getLeaderInfo(address leader) external view returns (uint256, uint256, uint256);
    function getNodeInfo(address user) external view returns (address, uint256, uint256);
    function getAdvancedCompensationInfo(address user) external view returns (uint256, uint256, uint256);
}
