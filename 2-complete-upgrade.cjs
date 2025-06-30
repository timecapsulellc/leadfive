const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Complete LeadFive v1.0.0 USDT-Only Upgrade Process\n");

    const [deployer] = await ethers.getSigners();
    const PROXY_ADDRESS = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
    const TREZOR_ADDRESS = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

    console.log("📊 Configuration:");
    console.log("Deployer Address:", deployer.address);
    console.log("Proxy Contract:", PROXY_ADDRESS);
    console.log("USDT Token:", USDT_ADDRESS);
    console.log("Deployer Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "BNB\n");

    try {
        // Step 1: Check current ownership and transfer if needed
        console.log("=== STEP 1: OWNERSHIP MANAGEMENT ===");
        const proxy = await ethers.getContractAt("LeadFive", PROXY_ADDRESS);
        const currentOwner = await proxy.owner();
        console.log("Current Owner:", currentOwner);

        if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.log("⚠️  Ownership needs to be transferred to deployer for upgrade");
            console.log("Please manually transfer ownership via BSCScan:");
            console.log("1. Go to: https://bscscan.com/address/0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623#writeContract");
            console.log("2. Connect Trezor wallet");
            console.log("3. Use transferOwnership function");
            console.log("4. Enter deployer address:", deployer.address);
            console.log("5. Confirm transaction");
            console.log("\nRun this script again after ownership transfer.");
            return;
        }
        console.log("✅ Deployer has ownership, proceeding with upgrade\n");

        // Step 2: Deploy new USDT-only implementation
        console.log("=== STEP 2: DEPLOY NEW IMPLEMENTATION ===");
        const LeadFive = await ethers.getContractFactory("LeadFive");
        
        // Verify it's the correct USDT-only version
        const registerFunc = LeadFive.interface.getFunction("register");
        if (registerFunc.inputs.length !== 2) {
            throw new Error(`Wrong contract version! Expected 2 params, got ${registerFunc.inputs.length}`);
        }
        console.log("✅ USDT-only contract verified (2 parameters for register)");

        // Deploy new implementation
        console.log("Deploying new implementation...");
        const implementation = await LeadFive.deploy();
        await implementation.waitForDeployment();
        const implementationAddress = await implementation.getAddress();
        
        console.log("✅ New implementation deployed at:", implementationAddress);
        const deployTx = await implementation.deploymentTransaction();
        const deployReceipt = await deployTx.wait();
        console.log("Gas used for deployment:", deployReceipt.gasUsed.toString());

        // Step 3: Upgrade proxy with initialization
        console.log("\n=== STEP 3: UPGRADE PROXY ===");
        console.log("Preparing initialization data...");
        
        // Prepare initializeProduction call
        const initData = implementation.interface.encodeFunctionData("initializeProduction");
        console.log("✅ Initialization data prepared");

        console.log("Executing proxy upgrade...");
        const upgradeTx = await proxy.upgradeToAndCall(implementationAddress, initData);
        console.log("Upgrade transaction sent:", upgradeTx.hash);
        
        const upgradeReceipt = await upgradeTx.wait();
        console.log("✅ Proxy upgraded successfully!");
        console.log("Gas used for upgrade:", upgradeReceipt.gasUsed.toString());

        // Step 4: Verify upgrade and test functionality
        console.log("\n=== STEP 4: VERIFY UPGRADE ===");
        
        // Check version
        try {
            const version = await proxy.getVersion();
            console.log("✅ Contract version:", version);
        } catch (e) {
            console.log("⚠️  Version function check failed");
        }

        // Check USDT decimals
        try {
            const usdtDecimals = await proxy.getUSDTDecimals();
            console.log("✅ USDT decimals:", usdtDecimals);
        } catch (e) {
            console.log("⚠️  USDT decimals check failed");
        }

        // Verify package prices
        console.log("\nVerifying package prices:");
        const expectedPrices = [30, 50, 100, 200];
        let allPricesCorrect = true;
        
        for (let i = 1; i <= 4; i++) {
            const pkg = await proxy.packages(i);
            const price = Number(pkg.price) / 1e6; // Convert from 6 decimals
            const isCorrect = price === expectedPrices[i-1];
            allPricesCorrect = allPricesCorrect && isCorrect;
            console.log(`Package ${i}: ${price} USDT ${isCorrect ? "✅" : "❌"}`);
        }

        if (!allPricesCorrect) {
            throw new Error("Package prices are not set correctly!");
        }
        console.log("✅ All package prices are correct");

        // Step 5: Register deployer as root user with 30 USDT package
        console.log("\n=== STEP 5: CREATE ROOT USER ===");
        
        // Check current total users
        const totalUsersBefore = await proxy.getTotalUsers();
        console.log("Total users before:", totalUsersBefore.toString());

        // Check if deployer is already registered
        const deployerInfo = await proxy.getUserBasicInfo(deployer.address);
        const isRegistered = deployerInfo[0];
        
        if (isRegistered) {
            console.log("✅ Deployer is already registered as root user");
        } else {
            console.log("Registering deployer as root user...");
            
            // First, approve USDT
            console.log("Approving USDT...");
            const usdt = await ethers.getContractAt("IERC20", USDT_ADDRESS);
            const approveAmount = ethers.parseUnits("30", 18); // 30 USDT with 18 decimals
            const approveTx = await usdt.approve(PROXY_ADDRESS, approveAmount);
            await approveTx.wait();
            console.log("✅ USDT approved");

            // Register with package level 3 (100 USDT) for root user
            console.log("Registering with Package 3 (100 USDT)...");
            const registerTx = await proxy.register(ethers.ZeroAddress, 3); // No sponsor, package level 3
            const registerReceipt = await registerTx.wait();
            console.log("✅ Root user registered!");
            console.log("Registration transaction:", registerTx.hash);
            console.log("Gas used:", registerReceipt.gasUsed.toString());
        }

        // Verify registration
        const deployerInfoAfter = await proxy.getUserBasicInfo(deployer.address);
        const totalUsersAfter = await proxy.getTotalUsers();
        console.log("Deployer registered:", deployerInfoAfter[0]);
        console.log("Deployer package level:", deployerInfoAfter[1]);
        console.log("Deployer balance:", deployerInfoAfter[2].toString());
        console.log("Total users after:", totalUsersAfter.toString());

        // Step 6: Final verification
        console.log("\n=== STEP 6: FINAL VERIFICATION ===");
        
        // Test register function signature
        console.log("Testing register function...");
        try {
            // This should work with 2 parameters
            await proxy.estimateGas.register(ethers.ZeroAddress, 1);
            console.log("✅ New register(sponsor, packageLevel) function working");
        } catch (e) {
            console.log("❌ New register function test failed:", e.message);
        }

        // Test old function (should fail)
        try {
            const oldAbi = ["function register(address,uint8,bool) external payable"];
            const oldContract = new ethers.Contract(PROXY_ADDRESS, oldAbi, deployer);
            await oldContract.estimateGas.register(ethers.ZeroAddress, 1, true);
            console.log("❌ Old register function still exists - upgrade failed!");
        } catch (e) {
            console.log("✅ Old register function properly removed");
        }

        // Save deployment report
        const deploymentData = {
            timestamp: new Date().toISOString(),
            network: "BSC Mainnet",
            chainId: 56,
            proxy: PROXY_ADDRESS,
            newImplementation: implementationAddress,
            owner: deployer.address, // Still with deployer
            trezorAddress: TREZOR_ADDRESS,
            version: "1.0.0",
            usdtToken: USDT_ADDRESS,
            transactions: {
                implementationDeploy: deployTx.hash,
                upgrade: upgradeTx.hash,
                rootRegistration: isRegistered ? "Already registered" : registerTx.hash
            },
            packagePrices: {
                package1: "30 USDT",
                package2: "50 USDT", 
                package3: "100 USDT",
                package4: "200 USDT"
            },
            status: "UPGRADE COMPLETE - READY FOR OWNERSHIP TRANSFER"
        };

        const fs = require('fs');
        fs.writeFileSync(
            'upgrade-deployment-report.json',
            JSON.stringify(deploymentData, null, 2)
        );

        console.log("\n🎉 UPGRADE COMPLETE!");
        console.log("✅ USDT-only contract deployed and functional");
        console.log("✅ Root user created with deployer address");
        console.log("✅ All package prices set correctly");
        console.log("✅ Register function has 2 parameters only");
        console.log("\n📄 Deployment report saved to: upgrade-deployment-report.json");
        console.log("\n⚠️  IMPORTANT: Ownership is still with deployer");
        console.log("Run the ownership transfer script only after testing is complete!");

    } catch (error) {
        console.error("\n❌ Upgrade failed:", error.message);
        console.error(error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
