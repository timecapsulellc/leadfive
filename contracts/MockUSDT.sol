// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Mock Tether USD", "USDT") {
        _mint(msg.sender, 1000000 * 10**18); // Mint 1M tokens to deployer
    }
    
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
    
    function faucet() public {
        _mint(msg.sender, 1000 * 10**18); // 1000 USDT per faucet call
    }
}
