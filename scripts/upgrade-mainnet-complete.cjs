const { ethers, upgrades } = require("hardhat");

async function main() {
    try {
        console.log("🔧 MAINNET PROXY UPGRADE USING OPENZEPPELIN");
        console.log("============================================");
        
        const mainContractAddress = "0x29dcCb502D10C042BcC6a02a7762C49595A9E498";
        const newImplementationAddress = "0x2cc37CB4e1F5D3D56E86c8792fD241d46064B2cF";
        
        const [deployer] = await ethers.getSigners();
        console.log("👨‍💼 Deployer:", deployer.address);
        console.log("🎯 Main Contract (Proxy):", mainContractAddress);
        console.log("🆕 New Implementation:", newImplementationAddress);
        
        // Method 1: Try using OpenZeppelin upgrades plugin
        console.log("\n🚀 STEP 1: Attempt Upgrade Using OpenZeppelin Plugin");
        try {
            const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
            
            console.log("   Upgrading proxy using OpenZeppelin upgrades...");
            const upgraded = await upgrades.upgradeProxy(mainContractAddress, LeadFiveV1_10);
            await upgraded.waitForDeployment();
            
            console.log("   ✅ Proxy upgraded successfully using OpenZeppelin!");
            
        } catch (error) {
            console.log("   ❌ OpenZeppelin upgrade failed:", error.message);
            
            // Method 2: Try manual UUPS upgrade
            console.log("\n🔧 STEP 2: Attempt Manual UUPS Upgrade");
            try {
                // Import UUPS interface
                const UUPS_ABI = [
                    "function upgradeTo(address newImplementation) external",
                    "function upgradeToAndCall(address newImplementation, bytes calldata data) external payable",
                    "function owner() external view returns (address)"
                ];
                
                const proxy = new ethers.Contract(mainContractAddress, UUPS_ABI, deployer);
                
                console.log("   Calling upgradeTo directly...");
                const upgradeTx = await proxy.upgradeTo(newImplementationAddress);
                await upgradeTx.wait();
                
                console.log("   ✅ Manual UUPS upgrade successful!");
                console.log("   Transaction:", upgradeTx.hash);
                
            } catch (manualError) {
                console.log("   ❌ Manual upgrade failed:", manualError.message);
                
                // Method 3: Try upgradeToAndCall with initialization
                console.log("\n🔧 STEP 3: Attempt upgradeToAndCall");
                try {
                    const UUPS_ABI = [
                        "function upgradeToAndCall(address newImplementation, bytes calldata data) external payable"
                    ];
                    
                    const proxy = new ethers.Contract(mainContractAddress, UUPS_ABI, deployer);
                    
                    // Encode initialization call
                    const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
                    const initData = LeadFiveV1_10.interface.encodeFunctionData("initializeV1_1", []);
                    
                    console.log("   Calling upgradeToAndCall...");
                    const upgradeTx = await proxy.upgradeToAndCall(newImplementationAddress, initData);
                    await upgradeTx.wait();
                    
                    console.log("   ✅ upgradeToAndCall successful!");
                    console.log("   Transaction:", upgradeTx.hash);
                    
                } catch (callError) {
                    console.log("   ❌ upgradeToAndCall failed:", callError.message);
                    console.log("\n💡 ALTERNATIVE APPROACH:");
                    console.log("   1. Use Trezor wallet interface");
                    console.log("   2. Call upgradeTo function directly from BSCScan");
                    console.log("   3. Use a different wallet interface");
                    return;
                }
            }
        }
        
        // Verify upgrade was successful
        console.log("\n✅ STEP 4: Verify Upgrade Success");
        try {
            // Check implementation address
            const implementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
            const implementation = await ethers.provider.getStorageAt(mainContractAddress, implementationSlot);
            const currentImpl = ethers.getAddress("0x" + implementation.slice(-40));
            
            console.log("   Current Implementation:", currentImpl);
            console.log("   Expected Implementation:", newImplementationAddress);
            
            if (currentImpl.toLowerCase() === newImplementationAddress.toLowerCase()) {
                console.log("   ✅ Upgrade verified successful!");
            } else {
                console.log("   ❌ Upgrade verification failed");
                return;
            }
        } catch (error) {
            console.log("   ❌ Verification error:", error.message);
        }
        
        // Now initialize features
        console.log("\n🔧 STEP 5: Initialize v1.10 Features");
        const LeadFiveV1_10 = await ethers.getContractFactory("LeadFiveV1_10");
        const contract = LeadFiveV1_10.attach(mainContractAddress);
        
        // Initialize v1.1 features (if not already done in upgradeToAndCall)
        try {
            const initTx = await contract.initializeV1_1();
            await initTx.wait();
            console.log("   ✅ V1.1 features initialized");
        } catch (error) {
            if (error.message.includes("Already initialized")) {
                console.log("   ℹ️  V1.1 already initialized");
            } else {
                console.log("   ❌ Initialization error:", error.message);
            }
        }
        
        // Register deployer as root
        try {
            const registerTx = await contract.registerAsRoot(4);
            await registerTx.wait();
            console.log("   ✅ Deployer registered as root");
        } catch (error) {
            if (error.message.includes("Already registered")) {
                console.log("   ℹ️  Deployer already registered as root");
            } else {
                console.log("   ❌ Root registration error:", error.message);
            }
        }
        
        // Activate all levels
        try {
            const activateTx = await contract.activateAllLevelsForRoot();
            await activateTx.wait();
            console.log("   ✅ All levels activated for root");
        } catch (error) {
            console.log("   ❌ Level activation error:", error.message);
        }
        
        // Get final status
        console.log("\n🎉 FINAL STATUS:");
        try {
            const referralCode = await contract.getReferralCode(deployer.address);
            console.log("   🔗 Root Referral Code:", referralCode);
            
            const userInfo = await contract.getUserInfo(deployer.address);
            console.log("   👤 Root Registered:", userInfo.isRegistered);
            console.log("   📦 Root Package:", userInfo.packageLevel.toString());
            
            console.log("\n✅ MAINNET UPGRADE COMPLETE!");
            console.log("📍 Main Contract Address (unchanged):", mainContractAddress);
            console.log("🆕 New Implementation:", newImplementationAddress);
            console.log("👑 Root User:", deployer.address);
            console.log("🔗 Root Referral Code:", referralCode);
            
        } catch (error) {
            console.log("   ❌ Status check error:", error.message);
        }
        
    } catch (error) {
        console.error("💥 Upgrade process failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
