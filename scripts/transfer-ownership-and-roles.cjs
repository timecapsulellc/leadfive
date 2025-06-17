// scripts/transfer-ownership-and-roles.cjs
// This script transfers all contract ownership and admin roles to the Trezor wallet after deployment.

const { ethers } = require("hardhat");
const fs = require("fs");

// === CONFIGURATION ===
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0xA514Ef7b0238276C09034BB1759B696A90CE3D5b"; // Deployed contract address
const NEW_OWNER = "0xDf628ed21f0B27197Ad02fc29EbF4417C04c4D29"; // Trezor wallet

async function main() {
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS.includes("[")) {
        throw new Error("Set CONTRACT_ADDRESS in this script or via env before running.");
    }
    console.log("\n🔑 Transferring contract ownership and all admin roles to:", NEW_OWNER);

    const [deployer] = await ethers.getSigners();
    const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundOptimized");
    const contract = OrphiCrowdFund.attach(CONTRACT_ADDRESS);

    // Transfer ownership (Ownable)
    const tx1 = await contract.transferOwnership(NEW_OWNER);
    await tx1.wait();
    console.log("✅ Ownership transferred.");

    // Grant all roles to Trezor
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const POOL_MANAGER_ROLE = await contract.POOL_MANAGER_ROLE();
    const EMERGENCY_ROLE = await contract.EMERGENCY_ROLE();

    await (await contract.grantRole(DEFAULT_ADMIN_ROLE, NEW_OWNER)).wait();
    await (await contract.grantRole(POOL_MANAGER_ROLE, NEW_OWNER)).wait();
    await (await contract.grantRole(EMERGENCY_ROLE, NEW_OWNER)).wait();
    console.log("✅ All admin roles granted to Trezor.");

    // Revoke all roles from deployer
    await (await contract.revokeRole(DEFAULT_ADMIN_ROLE, deployer.address)).wait();
    await (await contract.revokeRole(POOL_MANAGER_ROLE, deployer.address)).wait();
    await (await contract.revokeRole(EMERGENCY_ROLE, deployer.address)).wait();
    console.log("✅ All admin roles revoked from deployer.");

    // Final check
    const owner = await contract.owner();
    const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, NEW_OWNER);
    const isPoolManager = await contract.hasRole(POOL_MANAGER_ROLE, NEW_OWNER);
    const isEmergency = await contract.hasRole(EMERGENCY_ROLE, NEW_OWNER);
    console.log("\n🔍 Final status:");
    console.log("  Owner:", owner);
    console.log("  Trezor is admin:", isAdmin);
    console.log("  Trezor is pool manager:", isPoolManager);
    console.log("  Trezor is emergency:", isEmergency);
    console.log("\n✅ Handover complete. Deployer has no admin rights.");
}

// NOTE: This script now uses OrphiCrowdFundOptimized.sol only. All references to OrphiCrowdFundSimplified have been removed.

main().catch((err) => {
    console.error("❌ Error during ownership/role transfer:", err);
    process.exit(1);
});
