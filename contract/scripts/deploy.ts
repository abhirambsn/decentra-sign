import { ethers } from "hardhat";

async function main() {

  const DecentraSign = await ethers.getContractFactory("DecentraSign");
  const decentraSign = await DecentraSign.deploy();

  await decentraSign.deployed();

  console.log(`DecentraSign deployed to ${decentraSign.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
