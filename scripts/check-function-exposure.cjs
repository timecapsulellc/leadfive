const { ethers, upgrades } = require('hardhat');

async function main() {
    console.log("🔍 Checking function exposure through proxy...\n");

    // Deploy the contract
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
    const orphiCrowdFund = await upgrades.deployProxy(OrphiCrowdFund, [], {
        initializer: 'initialize',
        kind: 'uups',
    });
    await orphiCrowdFund.waitForDeployment();

    const contractAddress = await orphiCrowdFund.getAddress();
    console.log(`📍 Proxy deployed at: ${contractAddress}`);

    // Check what functions are available on the deployed contract
    console.log("\n🔧 Available functions on the proxy:");
    const deployedContract = await ethers.getContractAt("OrphiCrowdFund", contractAddress);
    
    // Test specific functions
    const functionsToTest = [
        'proposeUpgrade',
        'executeUpgrade', 
        'cancelUpgrade',
        'register',
        'getBasisPoints',
        'POOL_MANAGER_ROLE',
        'constants',
        'setupUpgradeMultiSig',
        'EMERGENCY_ROLE'
    ];

    console.log("\n📋 Function availability test:");
    for (const funcName of functionsToTest) {
        try {
            const func = deployedContract[funcName];
            if (func && typeof func === 'function') {
                console.log(`✅ ${funcName}: Available`);
            } else {
                console.log(`❌ ${funcName}: Not available`);
            }
        } catch (error) {
            console.log(`❌ ${funcName}: Error - ${error.message}`);
        }
    }

    // Try to call some constants
    console.log("\n🔧 Testing constant access:");
    try {
        const basisPoints = await deployedContract.getBasisPoints();
        console.log(`✅ BASIS_POINTS: ${basisPoints}`);
    } catch (error) {
        console.log(`❌ BASIS_POINTS: ${error.message}`);
    }

    try {
        const poolManagerRole = await deployedContract.POOL_MANAGER_ROLE();
        console.log(`✅ POOL_MANAGER_ROLE: ${poolManagerRole}`);
    } catch (error) {
        console.log(`❌ POOL_MANAGER_ROLE: ${error.message}`);
    }

    try {
        const constants = await deployedContract.constants();
        console.log(`✅ constants(): ${constants}`);
    } catch (error) {
        console.log(`❌ constants(): ${error.message}`);
    }

    // Check proxy interface
    console.log("\n🔍 Proxy interface functions:");
    const interface = deployedContract.interface;
    const fragmentNames = interface.fragments
        .filter(f => f.type === 'function')
        .map(f => f.name)
        .sort();
    
    console.log("Available functions:", fragmentNames.slice(0, 20), "... (showing first 20)");
    console.log(`Total functions: ${fragmentNames.length}`);

    // Check if specific upgrade functions are in the interface
    const upgradeRelatedFunctions = fragmentNames.filter(name => 
        name.includes('upgrade') || name.includes('Upgrade') || name.includes('propose') || name.includes('execute')
    );
    console.log("\n🔄 Upgrade-related functions:", upgradeRelatedFunctions);
}

main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});
