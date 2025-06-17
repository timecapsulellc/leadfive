// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

library AssemblyLib {
    // Optimized multiplication with overflow check
    function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        assembly {
            c := mul(a, b)
            if iszero(eq(div(c, a), b)) {
                revert(0, 0)
            }
        }
    }

    // Optimized division with zero check
    function div(uint256 a, uint256 b) internal pure returns (uint256 c) {
        assembly {
            if iszero(b) {
                revert(0, 0)
            }
            c := div(a, b)
        }
    }

    // Optimized addition with overflow check
    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        assembly {
            c := add(a, b)
            if lt(c, a) {
                revert(0, 0)
            }
        }
    }

    // Optimized subtraction with underflow check
    function sub(uint256 a, uint256 b) internal pure returns (uint256 c) {
        assembly {
            if gt(b, a) {
                revert(0, 0)
            }
            c := sub(a, b)
        }
    }

    // Optimized bit manipulation
    function setBit(uint256 x, uint256 i) internal pure returns (uint256) {
        assembly {
            x := or(x, shl(i, 1))
        }
        return x;
    }

    function clearBit(uint256 x, uint256 i) internal pure returns (uint256) {
        assembly {
            x := and(x, not(shl(i, 1)))
        }
        return x;
    }

    function getBit(uint256 x, uint256 i) internal pure returns (bool) {
        assembly {
            x := and(shr(i, x), 1)
        }
        return x != 0;
    }

    // Optimized memory operations
    function memcpy(uint256 dest, uint256 src, uint256 len) internal pure {
        assembly {
            for { let i := 0 } lt(i, len) { i := add(i, 32) } {
                mstore(add(dest, i), mload(add(src, i)))
            }
        }
    }

    // Optimized keccak256 for small inputs
    function keccakSmall(bytes memory data) internal pure returns (bytes32) {
        assembly {
            let result := keccak256(add(data, 32), mload(data))
            mstore(0x00, result)
            return(0x00, 32)
        }
    }

    // Optimized address operations
    function isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    // Optimized balance check
    function getBalance(address addr) internal view returns (uint256) {
        assembly {
            let bal := balance(addr)
            mstore(0x00, bal)
            return(0x00, 32)
        }
    }

    // Optimized timestamp operations
    function getTimestamp() internal view returns (uint256) {
        assembly {
            let ts := timestamp()
            mstore(0x00, ts)
            return(0x00, 32)
        }
    }
} 