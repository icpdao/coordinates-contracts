import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { LootLand } from "../typechain";

describe("LootLand.mint2AndGiveTo.error", async () => {
  it("no role", async () => {
    const [w1, w2, w3, w4] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    await expect(
      landNFTToken
        .connect(w2)
        .mint2AndGiveTo(1, 1, w3.address, 2,2, w4.address,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is no gived");
  });

  it("mint2AndGiveTo three", async () => {
    const [w1, w2, w3, w4, w5, w6, w7] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint2AndGiveTo(1, 1, w2.address, 2,2, w3.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w1)
        .mint2AndGiveTo(3, 3, w4.address, 4, 4, w5.address,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (
      await landNFTToken
        .connect(w2)
        .mint2AndGiveTo(5, 5, w4.address, 6, 6, w5.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mint2AndGiveTo(7, 7, w6.address, 8, 8, w7.address, {
          value: BigNumber.from(10).pow(18),
        })
    ).to.revertedWith("caller is already minted");
  });

  it("mintAndGiveTo three", async () => {
    const [w1, w2, w3, w4, w5, w6, w7] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(1, 1, w2.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w1)
        .mint2AndGiveTo(3, 3, w4.address, 4, 4, w5.address,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(5, 5, w4.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mint2AndGiveTo(7, 7, w6.address, 8, 8, w7.address, {
          value: BigNumber.from(10).pow(18),
        })
    ).to.revertedWith("caller is already minted");
  });
});
