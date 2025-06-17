const { ethers } = require("hardhat");

async function main() {
  const proxyAddress = "0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732";
  
  // Get the current signer
  const [signer] = await ethers.getSigners();
  console.log("🔍 Checking contract ownership with account:", signer.address);
  
  // Connect to the proxy using the current implementation ABI
  const OrphiCrowdFund = await ethers.getContractFactory("OrphiCrowdFundMain");
  const contract = OrphiCrowdFund.attach(proxyAddress);
  
  try {
    // Check ownership
    const owner = await contract.owner();
    console.log("📋 Contract owner:", owner);
    console.log("🔑 Current signer:", signer.address);
    console.log("✅ Is owner:", owner.toLowerCase() === signer.address.toLowerCase());
    
    // Check if it has DEFAULT_ADMIN_ROLE (for AccessControl)
    try {
      const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
      const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
      console.log("🛡️  Has DEFAULT_ADMIN_ROLE:", hasAdminRole);
    } catch (e) {
      console.log("⚠️  No AccessControl roles found");
    }
    
    // Check if contract is paused
    try {
      const paused = await contract.paused();
      console.log("⏸️  Contract paused:", paused);
    } catch (e) {
      console.log("⚠️  No pause functionality");
    }
    
  } catch (error) {
    console.error("❌ Error checking ownership:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
