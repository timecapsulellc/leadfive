// Deploy OrphiCrowdFundAdvanced to BSC Testnet
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with:", deployer.address);
    const OrphiCrowdFundAdvanced = await hre.ethers.getContractFactory("OrphiCrowdFundAdvanced");
    const contract = await OrphiCrowdFundAdvanced.deploy();
    await contract.deployed();
    console.log("OrphiCrowdFundAdvanced deployed to:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
