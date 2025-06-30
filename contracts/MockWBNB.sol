// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockWBNB
 * @dev Mock Wrapped BNB contract for testing purposes
 * Allows unlimited minting for testing scenarios
 */
contract MockWBNB is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor() ERC20("Mock Wrapped BNB", "WBNB") Ownable(msg.sender) {
        _decimals = 18;
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**18); // 1M WBNB for testing
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Deposit function to mimic real WBNB
     */
    function deposit() external payable {
        if (msg.value > 0) {
            _mint(msg.sender, msg.value);
        }
    }
    
    // Fallback function to receive ETH
    receive() external payable {
        this.deposit{value: msg.value}();
    }
    
    /**
     * @dev Withdraw function to mimic real WBNB
     */
    function withdraw(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _burn(msg.sender, amount);
        
        // In real WBNB, this would send ETH/BNB
        // For testing, we just burn the tokens
    }
    
    /**
     * @dev Mint tokens to any address (for testing)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Mint tokens to multiple addresses at once
     */
    function mintBatch(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Faucet function - anyone can claim test WBNB
     */
    function faucet() external {
        require(balanceOf(msg.sender) < 100 * 10**18, "Already has enough WBNB");
        _mint(msg.sender, 10 * 10**18); // 10 WBNB per claim
    }
    
    /**
     * @dev Emergency drain function
     */
    function drain(address to) external onlyOwner {
        uint256 balance = balanceOf(address(this));
        if (balance > 0) {
            _transfer(address(this), to, balance);
        }
    }
    
    /**
     * @dev Get contract info
     */
    function getInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        uint256 tokenTotalSupply,
        address tokenOwner
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            owner()
        );
    }
}
