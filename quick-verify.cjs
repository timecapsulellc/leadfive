const { ethers } = require("hardhat");

async function quickVerify() {
    const contractAddress = "0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732";
    const expectedAdmin = "0xD29ef4aE187AB9E07B7E0839CF64508A3D70A229";
    
    console.log("🔍 Quick Contract Verification");
    console.log(`Contract: ${contractAddress}`);
    console.log(`Expected Admin: ${expectedAdmin}`);
    
    try {
        // Check if contract exists
        const code = await ethers.provider.getCode(contractAddress);
        console.log(`✅ Contract deployed: ${code !== "0x"}`);
        
        if (code !== "0x") {
            console.log("✅ Contract successfully deployed on BSC Mainnet");
            console.log("🔗 View on BSCScan: https://bscscan.com/address/" + contractAddress);
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

quickVerify();
