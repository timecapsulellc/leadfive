const hre = require("hardhat");
const { ethers } = require("hardhat");

async function getInitData() {
    try {
        const LeadFive = await ethers.getContractFactory("LeadFive");
        const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
        const priceFeedAddress = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
        
        const initData = LeadFive.interface.encodeFunctionData("initialize", [
            usdtAddress,
            priceFeedAddress
        ]);
        
        console.log("Constructor arguments for proxy verification:");
        console.log("Implementation:", "0x10965e40d90054FDE981dd1A470937C68719F707");
        console.log("Init data:", initData);
        console.log("Init data (without 0x):", initData.slice(2));
        
    } catch (error) {
        console.error("Error:", error.message);
    }
}

getInitData();
