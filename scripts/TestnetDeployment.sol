// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "../contracts/LeadFive.sol";
import "../contracts/mocks/MockUSDT.sol";
import "../contracts/mocks/MockPriceOracle.sol";

/**
 * @title BSC Testnet Deployment Script
 * @dev Script for deploying LeadFive ecosystem on BSC Testnet
 */
contract TestnetDeployment {
    
    address public owner;
    MockUSDT public usdt;
    MockPriceOracle public priceOracle;
    LeadFive public leadFive;
    
    // Testnet admin addresses
    address public constant TESTNET_ADMIN = 0x1234567890123456789012345678901234567890; // Replace with actual
    address public constant TESTNET_FEE_RECIPIENT = 0x1234567890123456789012345678901234567890; // Replace with actual
    
    event TestnetDeploymentComplete(
        address indexed leadFive,
        address indexed usdt,
        address indexed priceOracle
    );
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Deploy all contracts in sequence
     */
    function deployAll() external {
        require(msg.sender == owner, "Only owner");
        
        // 1. Deploy Mock USDT for testing
        usdt = new MockUSDT();
        
        // 2. Deploy Mock Price Oracle
        priceOracle = new MockPriceOracle();
        priceOracle.setPrice(300e8); // $300 BNB price (8 decimals)
        
        // 3. Deploy LeadFive contract
        leadFive = new LeadFive();
        leadFive.initialize(address(usdt), address(priceOracle));
        
        // 4. Set admin fee recipient
        leadFive.setAdminFeeRecipient(TESTNET_FEE_RECIPIENT);
        
        // 5. Mint test USDT to deployer for testing
        usdt.mint(owner, 1000000e18); // 1M USDT for testing
        
        emit TestnetDeploymentComplete(address(leadFive), address(usdt), address(priceOracle));
    }
    
    /**
     * @dev Get deployment addresses
     */
    function getAddresses() external view returns (
        address leadFiveAddress,
        address usdtAddress,
        address oracleAddress
    ) {
        return (address(leadFive), address(usdt), address(priceOracle));
    }
    
    /**
     * @dev Fund test accounts with USDT
     */
    function fundTestAccounts(address[] calldata accounts, uint256[] calldata amounts) external {
        require(msg.sender == owner, "Only owner");
        require(accounts.length == amounts.length, "Length mismatch");
        
        for(uint i = 0; i < accounts.length; i++) {
            usdt.mint(accounts[i], amounts[i]);
        }
    }
}
