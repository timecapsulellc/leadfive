const hre = require("hardhat");

async function verifyProxyContract() {
    try {
        console.log('\n=== VERIFY PROXY CONTRACT ON BSCSCAN ===');
        
        const proxyAddress = '0x86CCF0eb67a7aB09234d5F4aE265F9eFB8E8fb6c';
        const implementationAddress = '0xc58620dd8fD9d244453e421E700c2D3FCFB595b4';
        
        console.log(`Proxy Address: ${proxyAddress}`);
        console.log(`Implementation Address: ${implementationAddress}`);
        
        console.log('\n--- Verifying Proxy Contract ---');
        
        // Verify the proxy as a proxy contract
        await hre.run("verify:verify", {
            address: proxyAddress,
            constructorArguments: [
                implementationAddress, // implementation
                "0x", // admin (will be set during initialization)
                "0x" // data (empty for basic proxy)
            ],
            contract: "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy"
        });
        
        console.log('\n✅ Proxy contract verified successfully!');
        console.log('\nNow you should be able to see write functions at:');
        console.log(`https://bscscan.com/address/${proxyAddress}#writeProxyContract`);
        
    } catch (error) {
        if (error.message.includes('already verified')) {
            console.log('\n✅ Contract is already verified');
            console.log('\nIf you still don\'t see write functions, try:');
            console.log('1. Clear browser cache');
            console.log('2. Wait a few minutes for BSCScan to update');
            console.log('3. Use the "Write as Proxy" tab instead of "Write Contract"');
        } else {
            console.error('Verification error:', error.message);
        }
    }
}

verifyProxyContract();
