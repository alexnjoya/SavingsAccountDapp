const hre = require("hardhat");

async function main() {

  // staking contract 
  const tokenStaking = await hre.ethers.deployContract("TokenStaking");
  await tokenStaking.waitForDeployment();

  
  // token contract 
  const theblockExpert = await hre.ethers.deployContract("TheblockExpert");
  await theblockExpert.waitForDeployment();

  console.log(` STACKING: ${theblockExpert.target}`);
  console.log(` STACKING: ${tokenStaking.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
