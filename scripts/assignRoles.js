require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS || '0x4Db5C5C94e0e6eA5553f8432ca1D121DE350B732';
  const adminReserve = process.env.ADMIN_RESERVE;
  const treasury = process.env.TREASURY_ADDRESS;
  const emergency = process.env.EMERGENCY_ADDRESS;
  const poolManager = process.env.POOL_MANAGER_ADDRESS;

  if (!adminReserve || !treasury || !emergency || !poolManager) {
    throw new Error('Missing one or more role addresses in .env');
  }

  console.log('Connecting to OrphiCrowdFund proxy at', proxyAddress);
  const OrphiCrowdFund = await ethers.getContractFactory('OrphiCrowdFund');
  const contract = OrphiCrowdFund.attach(proxyAddress);

  const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
  const TREASURY_ROLE = await contract.TREASURY_ROLE();
  const EMERGENCY_ROLE = await contract.EMERGENCY_ROLE();
  const POOL_MANAGER_ROLE = await contract.POOL_MANAGER_ROLE();

  console.log('Granting DEFAULT_ADMIN_ROLE to', adminReserve);
  await (await contract.grantRole(DEFAULT_ADMIN_ROLE, adminReserve)).wait();

  console.log('Granting TREASURY_ROLE to', treasury);
  await (await contract.grantRole(TREASURY_ROLE, treasury)).wait();

  console.log('Granting EMERGENCY_ROLE to', emergency);
  await (await contract.grantRole(EMERGENCY_ROLE, emergency)).wait();

  console.log('Granting POOL_MANAGER_ROLE to', poolManager);
  await (await contract.grantRole(POOL_MANAGER_ROLE, poolManager)).wait();

  console.log('Revoking DEFAULT_ADMIN_ROLE from current admin', process.env.ADMIN_ADDRESS);
  await (await contract.revokeRole(DEFAULT_ADMIN_ROLE, process.env.ADMIN_ADDRESS)).wait();

  console.log('Role assignment complete');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error assigning roles:', error);
    process.exit(1);
  });
