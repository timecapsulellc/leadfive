// Quick test to check uint96 limits
const { ethers } = require('ethers');

// Calculate uint96 max value
const uint96Max = BigInt(2) ** BigInt(96) - BigInt(1);
console.log('uint96 max value:', uint96Max.toString());

// Calculate 200 * 10^18 (200 USDT with 18 decimals)
const price200USDT18Dec = BigInt(200) * (BigInt(10) ** BigInt(18));
console.log('200 USDT with 18 decimals:', price200USDT18Dec.toString());

// Check if it fits
console.log('Does it fit in uint96?', price200USDT18Dec <= uint96Max);

// Calculate max USDT amount with 18 decimals that fits in uint96
const maxUSDTAmount = uint96Max / (BigInt(10) ** BigInt(18));
console.log('Max USDT amount with 18 decimals:', maxUSDTAmount.toString());

// For 6 decimals
const price200USDT6Dec = BigInt(200) * (BigInt(10) ** BigInt(6));
console.log('200 USDT with 6 decimals:', price200USDT6Dec.toString());
console.log('Does 6 decimal version fit?', price200USDT6Dec <= uint96Max);
