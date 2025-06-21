// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

library ReferralLib {
    
    /**
     * @dev Generate a unique referral code for a user
     */
    function generateCode(
        mapping(string => address) storage referralCodeToUser,
        address user
    ) internal returns (string memory) {
        // Create a simple referral code based on user address
        string memory baseCode = _addressToString(user);
        string memory code = string(abi.encodePacked("LF", baseCode));
        
        // Store the mapping
        referralCodeToUser[code] = user;
        
        return code;
    }
    
    /**
     * @dev Convert address to string (simplified)
     */
    function _addressToString(address user) private pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(user)));
        bytes memory alphabet = "0123456789ABCDEF";
        
        bytes memory str = new bytes(8); // Take first 8 chars
        for (uint256 i = 0; i < 4; i++) {
            str[i*2] = alphabet[uint256(uint8(value[i] >> 4))];
            str[1+i*2] = alphabet[uint256(uint8(value[i] & 0x0f))];
        }
        return string(str);
    }
}
