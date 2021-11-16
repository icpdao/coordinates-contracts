import { ethers } from "hardhat";
import { expect } from "chai";
import { LootLand } from "../typechain";
import { BigNumber } from "ethers";

describe("LootLand.giveTo.error", async () => {
  it("no gived", async () => {
    const [w1, w2, w3] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    await expect(
      landNFTToken.connect(w2).giveTo(1, 1, w3.address)
    ).to.revertedWith("caller is no gived");

    await (
      await landNFTToken
        .connect(w1)
        .mint(1, 1, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken.connect(w2).giveTo(1, 1, w3.address)
    ).to.revertedWith("caller is no gived");

    await (await landNFTToken.connect(w1).giveTo(1, 1, w3.address)).wait();

    await expect(
      landNFTToken.connect(w2).giveTo(1, 1, w3.address)
    ).to.revertedWith("caller is no gived");
  });

  it("no role", async () => {
    const [w1, w2, w3, w4] = await ethers.getSigners();
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
      landNFTToken.connect(w2).giveTo(2, 2, w4.address)
    ).to.revertedWith("land not minted");

    await (
      await landNFTToken
        .connect(w1)
        .mint(2, 2, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken.connect(w2).giveTo(2, 2, w4.address)
    ).to.revertedWith("caller didn't minted this land");

    await (await landNFTToken.connect(w1).giveTo(2, 2, w3.address)).wait();

    await expect(
      landNFTToken.connect(w2).giveTo(2, 2, w4.address)
    ).to.revertedWith("caller didn't minted this land");
    await expect(
      landNFTToken.connect(w2).giveTo(1, 1, w4.address)
    ).to.revertedWith("caller didn't minted this land");
  });

  it("give repeat", async () => {
    const [w1, w2, w3, w4, w5] = await ethers.getSigners();
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
    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(2, 2, w3.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await (
      await landNFTToken
        .connect(w2)
        .mint(3, 3, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken.connect(w2).giveTo(3, 3, w3.address)
    ).to.revertedWith("givedAddress have gived land");
    await (await landNFTToken.connect(w2).giveTo(3, 3, w4.address)).wait();
    await expect(
      landNFTToken.connect(w2).giveTo(3, 3, w5.address)
    ).to.revertedWith("land is gived");
  });
});
