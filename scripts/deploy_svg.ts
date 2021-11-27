// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";
import { LedgerSigner } from "@ethersproject/hardware-wallets";

const deployByHardwareWallet = async (gasGwei: any, ledgerIndex: any) => {
  const ledger = await new LedgerSigner(
    ethers.provider,
    "hid",
    `m/44'/60'/${ledgerIndex}'/0/0`
  );

  console.log("deploy use ledger account", await ledger.getAddress());
  console.log("gasPrice", gasGwei, "gwei");

  const Factory = await ethers.getContractFactory("TokenSVG", ledger);
  const gasPrice = BigNumber.from(10).pow(9).mul(gasGwei);
  const svg = await Factory.connect(ledger).deploy({
    gasPrice: gasPrice,
  });
  console.log("deploy...");
  await svg.deployed();
  console.log("TokenSVG deployed to:", svg.address);
};

const deployByEnvAccount = async (gasGwei: any) => {
  const [wDeploy] = await ethers.getSigners();
  console.log("deploy use env account", wDeploy.address);
  console.log("gasPrice", gasGwei, "gwei");

  const Factory = await ethers.getContractFactory("TokenSVG");
  const gasPrice = BigNumber.from(10).pow(9).mul(gasGwei);
  const svg = await Factory.connect(wDeploy).deploy({
    gasPrice: gasPrice,
  });
  console.log("deploy...");
  await svg.deployed();
  console.log("TokenSVG deployed to:", svg.address);
};

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  const ledgerIndex = 2; // Ledger from 0 start
  const gasGwei = 3;

  await deployByEnvAccount(gasGwei);
  // await deployByHardwareWallet(gasGwei, ledgerIndex);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
