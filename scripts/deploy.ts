// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";
import { LedgerSigner } from "@ethersproject/hardware-wallets";

const deployByHardwareWallet = async (
  owner: any,
  startUp: any,
  gasGwei: any,
  ledgerIndex: any
) => {
  const ledger = await new LedgerSigner(
    ethers.provider,
    "hid",
    `m/44'/60'/${ledgerIndex}'/0/0`
  );

  console.log("deploy use ledger account", await ledger.getAddress());
  console.log("owner", owner);
  console.log("startUp", startUp);
  console.log("gasPrice", gasGwei, "gwei");

  const LootLand = await ethers.getContractFactory("LootLand", ledger);
  const gasPrice = BigNumber.from(10).pow(9).mul(gasGwei);
  const lootLand = await LootLand.connect(ledger).deploy(owner, startUp, {
    gasPrice: gasPrice,
  });
  console.log("deploy...");
  await lootLand.deployed();
  console.log("LootLand deployed to:", lootLand.address);
};

const deployByEnvAccount = async (owner: any, startUp: any, gasGwei: any) => {
  const [wDeploy] = await ethers.getSigners();
  console.log("deploy use env account", wDeploy.address);
  console.log("owner", owner);
  console.log("startUp", startUp);
  console.log("gasPrice", gasGwei, "gwei");

  const LootLand = await ethers.getContractFactory("LootLand");
  const gasPrice = BigNumber.from(10).pow(9).mul(gasGwei);
  const lootLand = await LootLand.connect(wDeploy).deploy(owner, startUp, {
    gasPrice: gasPrice,
  });
  console.log("deploy...");
  await lootLand.deployed();
  console.log("LootLand deployed to:", lootLand.address);
};

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  const owner = "0x04493be637f6ED9b527A8BFe9fC4c277734Ef412";
  const startUp = "0x26Ac833AEde4ee4b330E7A67b57F4eaB40B65E5c";
  const ledgerIndex = 2; // Ledger from 0 start
  const gasGwei = 3;

  await deployByEnvAccount(owner, startUp, gasGwei);
  // await deployByHardwareWallet(owner, startUp, gasGwei, ledgerIndex);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
