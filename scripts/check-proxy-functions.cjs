const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("🔍 CHECKING PROXY UPGRADE FUNCTIONS");
        console.log("===================================");
        
        const mainContractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
        
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Deployer:", deployer.address);
        
        // Try different ways to connect to the proxy
        console.log("\n🔍 Checking available functions...");
        
        // Method 1: Try as UUPSUpgradeable
        try {
            const UUPSProxy = await ethers.getContractAt("UUPSUpgradeable", mainContractAddress);
            console.log("✅ Connected as UUPSUpgradeable");
            
            // Check if upgradeToAndCall exists
            const contractInterface = UUPSProxy.interface;
            const functions = Object.keys(contractInterface.functions);
            console.log("Available functions:", functions.filter(f => f.includes('upgrade')));
            
        } catch (error) {
            console.log("❌ UUPSUpgradeable connection failed:", error.message);
        }
        
        // Method 2: Try as ERC1967Proxy
        try {
            const ERC1967Proxy = await ethers.getContractAt("ERC1967Proxy", mainContractAddress);
            console.log("✅ Connected as ERC1967Proxy");
        } catch (error) {
            console.log("❌ ERC1967Proxy connection failed:", error.message);
        }
        
        // Method 3: Try to get implementation address
        try {
            const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
            const implementation = await ethers.provider.getStorageAt(mainContractAddress, implementationSlot);
            console.log("Current implementation from storage:", ethers.getAddress("0x" + implementation.slice(-40)));
        } catch (error) {
            console.log("❌ Storage read failed:", error.message);
        }
        
        // Method 4: Try as the actual contract interface
        try {
            const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
            const contract = LeadFiveV1_10.attach(mainContractAddress);
            
            // Check current owner
            const owner = await contract.owner();
            console.log("✅ Current owner:", owner);
            
            // Try to find upgrade function
            const contractInterface = contract.interface;
            const upgradeFunctions = Object.keys(contractInterface.functions).filter(f => f.toLowerCase().includes('upgrade'));
            console.log("Available upgrade functions:", upgradeFunctions);
            
            // Check if it's UUPS upgradeable
            if (upgradeFunctions.length > 0) {
                console.log("✅ Found upgrade functions in contract");
            } else {
                console.log("❌ No upgrade functions found");
            }
            
        } catch (error) {
            console.log("❌ Contract connection failed:", error.message);
        }
        
        // Method 5: Check if it has _authorizeUpgrade
        try {
            const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
            const contract = LeadFiveV1_10.attach(mainContractAddress);
            
            // Try calling upgradeTo directly
            console.log("\n🧪 Testing upgrade function...");
            const newImplementation = "0x2cc37CB4e1F5D3D56E86c8792fD241d46064B2cF";
            
            // Estimate gas for upgrade
            try {
                const gasEstimate = await contract.upgradeTo.estimateGas(newImplementation);
                console.log("✅ upgradeTo function exists, estimated gas:", gasEstimate.toString());
            } catch (error) {
                console.log("❌ upgradeTo gas estimation failed:", error.message);
            }
            
        } catch (error) {
            console.log("❌ Upgrade test failed:", error.message);
        }
        
    } catch (error) {
        console.error("💥 Check failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
