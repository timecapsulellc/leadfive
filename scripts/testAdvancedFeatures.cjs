// Test all advanced features of OrphiCrowdFundAdvanced
const hre = require("hardhat");

async function main() {
    const [tester] = await hre.ethers.getSigners();
    const contractAddress = process.env.ORPHI_ADVANCED_TESTNET;
    const OrphiCrowdFundAdvanced = await hre.ethers.getContractFactory("OrphiCrowdFundAdvanced");
    const contract = OrphiCrowdFundAdvanced.attach(contractAddress);

    // Test user registration
    // ...add more tests for all new features...
    console.log("Testing advanced features...");
    // Example: get package amount
    const pkg = await contract.getPackageAmount(1);
    console.log("Tier 1 package:", pkg.toString());
    // Example: get direct referrals
    const refs = await contract.getDirectReferrals(tester.address);
    console.log("Direct referrals:", refs);
    // Example: distribute bonuses
    // await contract.distributeBonuses();
    // ...add more tests as needed...
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
