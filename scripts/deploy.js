const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Starting deployment of Orphi CrowdFund system...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());

  // Configuration based on network
  let usdtAddress;
  let adminReserve;
  let matrixRoot;
  let oracleAddress; // Added oracleAddress

  if (network.chainId === 97n) { // BSC Testnet
    usdtAddress = process.env.USDT_TESTNET || "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // Example BSC Testnet USDT
    adminReserve = process.env.ADMIN_RESERVE_TESTNET || deployer.address;
    matrixRoot = process.env.MATRIX_ROOT_TESTNET || deployer.address;
    oracleAddress = process.env.ORACLE_ADDRESS_TESTNET || "0x0000000000000000000000000000000000000000"; // Placeholder for Oracle
    console.log("Deploying to BSC Testnet");
  } else if (network.chainId === 56n) { // BSC Mainnet
    usdtAddress = process.env.USDT_MAINNET || "0x55d398326f99059fF775485246999027B3197955";
    adminReserve = process.env.ADMIN_RESERVE_MAINNET;
    matrixRoot = process.env.MATRIX_ROOT_MAINNET;
    oracleAddress = process.env.ORACLE_ADDRESS_MAINNET;
    
    if (!adminReserve || !matrixRoot || !oracleAddress) {
      throw new Error("ADMIN_RESERVE_MAINNET, MATRIX_ROOT_MAINNET, and ORACLE_ADDRESS_MAINNET must be set for mainnet deployment in .env file");
    }
    console.log("Deploying to BSC Mainnet");
  } else if (network.chainId === 1337n || network.chainId === 31337n) { // Local/Hardhat
    console.log("Deploying Mock USDT for local testing...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();
    usdtAddress = await mockUSDT.getAddress();
    console.log("Mock USDT deployed to:", usdtAddress);
    
    adminReserve = deployer.address;
    matrixRoot = deployer.address;
    oracleAddress = deployer.address; // Using deployer as a mock oracle for local
    console.log("Deploying to Local/Hardhat network");
  } else {
    throw new Error(`Unsupported network: ${network.name} (Chain ID: ${network.chainId})`);
  }

  console.log("\nConfiguration:");
  console.log("- USDT Address:", usdtAddress);
  console.log("- Admin Reserve:", adminReserve);
  console.log("- Matrix Root:", matrixRoot);
  console.log("- Oracle Address:", oracleAddress); // Log oracle address

  // Deploy the main contract
  console.log("\nDeploying OrphiCrowdFund...");
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFund");
  
  // Ensure your contract's initialize function matches these arguments
  const orphiCrowdFund = await upgrades.deployProxy(
    OrphiCrowdFund,
    [usdtAddress, adminReserve, matrixRoot, oracleAddress], // Added oracleAddress
    {
      initializer: "initialize",
      kind: "uups", // Specify UUPS proxy kind
      timeout: 0 // Potentially long deployment, disable timeout
    }
  );
  await orphiCrowdFund.waitForDeployment();
  const contractAddress = await orphiCrowdFund.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(contractAddress);
  
  console.log("OrphiCrowdFund Proxy deployed to:", contractAddress);
  console.log("OrphiCrowdFund Implementation deployed to:", implementationAddress);
  
  // Output summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
  console.log("OrphiCrowdFund Proxy:", contractAddress);
  console.log("OrphiCrowdFund Implementation:", implementationAddress);
  console.log("USDT:", usdtAddress);
  console.log("Admin Reserve:", adminReserve);
  console.log("Matrix Root:", matrixRoot);
  console.log("Oracle Address:", oracleAddress);
  console.log("Deployer:", deployer.address);
  
  // Security reminder
  console.log("\n⚠️ IMPORTANT: Keep your deployment information secure and never share private keys.");
  console.log("For verification, use 'npx hardhat verify --network <network> <PROXY_CONTRACT_ADDRESS>'");
  console.log("To verify the implementation: 'npx hardhat verify --network <network> <IMPLEMENTATION_CONTRACT_ADDRESS>'");
  
  return {
    contractAddress,
    implementationAddress,
    usdtAddress,
    adminReserve,
    matrixRoot,
    oracleAddress,
    deployer: deployer.address
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
