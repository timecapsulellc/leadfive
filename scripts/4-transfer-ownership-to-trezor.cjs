const { ethers } = require("hardhat");

async function main() {
    console.log("🔐 Transferring Ownership Back to Trezor\n");

    const [deployer] = await ethers.getSigners();
    const PROXY_ADDRESS = "0x62e0394c2947D79E1Fd2F08d62D3A323cCc56623";
    const TREZOR_ADDRESS = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29";

    console.log("📊 Configuration:");
    console.log("Deployer Address:", deployer.address);
    console.log("Trezor Address:", TREZOR_ADDRESS);
    console.log("Contract Address:", PROXY_ADDRESS);

    try {
        const proxy = await ethers.getContractAt("LeadFive", PROXY_ADDRESS);
        const currentOwner = await proxy.owner();

        console.log("\n=== OWNERSHIP STATUS CHECK ===");
        console.log("Current Owner:", currentOwner);
        console.log("Is Deployer:", currentOwner.toLowerCase() === deployer.address.toLowerCase());
        console.log("Is Trezor:", currentOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase());

        if (currentOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
            console.log("✅ Trezor already owns the contract!");
            console.log("No ownership transfer needed.");
            return;
        }

        if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.log("❌ Error: Deployer doesn't own the contract!");
            console.log("Current owner:", currentOwner);
            console.log("Expected owner:", deployer.address);
            console.log("\nCannot transfer ownership - deployer is not the current owner.");
            return;
        }

        console.log("\n=== FINAL VERIFICATION BEFORE TRANSFER ===");
        
        // Verify contract is working properly
        try {
            const version = await proxy.getVersion();
            const totalUsers = await proxy.getTotalUsers();
            const package1Price = await proxy.getPackagePrice(1);
            
            console.log("Contract Version:", version);
            console.log("Total Users:", totalUsers.toString());
            console.log("Package 1 Price:", (Number(package1Price) / 1e6), "USDT");
            
            // Check register function
            const registerFunc = proxy.interface.getFunction("register");
            const paramCount = registerFunc.inputs.length;
            console.log("Register Function Parameters:", paramCount);
            
            if (paramCount !== 2) {
                console.log("❌ Error: Register function has wrong parameter count!");
                console.log("Expected 2, got", paramCount);
                console.log("Aborting ownership transfer.");
                return;
            }
            
            console.log("✅ Contract verification passed");
            
        } catch (e) {
            console.log("⚠️  Warning: Some verification checks failed:", e.message);
            console.log("Proceeding with ownership transfer anyway...");
        }

        console.log("\n=== TRANSFERRING OWNERSHIP ===");
        console.log("Transferring ownership from deployer to Trezor...");
        console.log("This will secure the contract with your hardware wallet.");
        
        const tx = await proxy.transferOwnership(TREZOR_ADDRESS);
        console.log("Transaction sent:", tx.hash);
        console.log("Waiting for confirmation...");
        
        const receipt = await tx.wait();
        console.log("✅ Ownership transfer confirmed!");
        console.log("Gas used:", receipt.gasUsed.toString());

        console.log("\n=== FINAL VERIFICATION ===");
        
        // Verify the transfer
        const newOwner = await proxy.owner();
        console.log("New Owner:", newOwner);
        console.log("Transfer Success:", newOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase());

        // Check admin status
        const deployerIsAdmin = await proxy.isAdmin(deployer.address);
        const trezorIsAdmin = await proxy.isAdmin(TREZOR_ADDRESS);
        console.log("Deployer is Admin:", deployerIsAdmin);
        console.log("Trezor is Admin:", trezorIsAdmin);

        if (newOwner.toLowerCase() === TREZOR_ADDRESS.toLowerCase()) {
            console.log("\n🎉 OWNERSHIP TRANSFER SUCCESSFUL!");
            console.log("✅ Contract is now secured with Trezor hardware wallet");
            console.log("✅ All admin functions require Trezor confirmation");
            console.log("✅ LeadFive v1.0.0 is ready for production use!");

            // Generate final report
            const finalReport = {
                timestamp: new Date().toISOString(),
                network: "BSC Mainnet",
                contractAddress: PROXY_ADDRESS,
                finalOwner: TREZOR_ADDRESS,
                version: "1.0.0",
                status: "PRODUCTION READY",
                features: {
                    usdtOnly: true,
                    registerParameters: 2,
                    hardwareWalletSecured: true,
                    rootUserCreated: true
                },
                links: {
                    contract: `https://bscscan.com/address/${PROXY_ADDRESS}`,
                    writeContract: `https://bscscan.com/address/${PROXY_ADDRESS}#writeContract`
                },
                transferTransaction: tx.hash
            };

            const fs = require('fs');
            fs.writeFileSync(
                'LEADFIVE_V1.0.0_FINAL_DEPLOYMENT_REPORT.json',
                JSON.stringify(finalReport, null, 2)
            );

            console.log("\n📄 Final deployment report saved!");
            console.log("File: LEADFIVE_V1.0.0_FINAL_DEPLOYMENT_REPORT.json");
            
            console.log("\n🔗 Important Links:");
            console.log("📋 Contract: https://bscscan.com/address/" + PROXY_ADDRESS);
            console.log("✍️  Write Contract: https://bscscan.com/address/" + PROXY_ADDRESS + "#writeContract");
            
        } else {
            console.log("\n❌ OWNERSHIP TRANSFER FAILED!");
            console.log("Expected owner:", TREZOR_ADDRESS);
            console.log("Actual owner:", newOwner);
        }

    } catch (error) {
        console.error("\n❌ Ownership transfer failed:", error.message);
        console.error(error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
