import { ethers } from "hardhat";
import { expect } from "chai";
import { PeopleLand } from "../typechain";
import { BigNumber } from "ethers";

describe("PeopleLand.giveTo.error", async () => {
  it("no gived", async () => {
    const [w1, w2, w3] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await expect(
      landNFTToken.connect(w2).giveTo(11, 11, w3.address)
    ).to.revertedWith("caller is no gived");

    await (
      await landNFTToken
        .connect(w1)
        .mint(11, 11, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken.connect(w2).giveTo(11, 11, w3.address)
    ).to.revertedWith("caller is no gived");

    await (await landNFTToken.connect(w1).giveTo(11, 11, w3.address)).wait();

    await expect(
      landNFTToken.connect(w2).giveTo(11, 11, w3.address)
    ).to.revertedWith("caller is no gived");
  });

  it("no role", async () => {
    const [w1, w2, w3, w4] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(11, 11, w2.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken.connect(w2).giveTo(12, 12, w4.address)
    ).to.revertedWith("land not minted");

    await (
      await landNFTToken
        .connect(w1)
        .mint(12, 12, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken.connect(w2).giveTo(12, 12, w4.address)
    ).to.revertedWith("caller didn't minted this land");

    await (await landNFTToken.connect(w1).giveTo(12, 12, w3.address)).wait();

    await expect(
      landNFTToken.connect(w2).giveTo(12, 12, w4.address)
    ).to.revertedWith("caller didn't minted this land");
    await expect(
      landNFTToken.connect(w2).giveTo(11, 11, w4.address)
    ).to.revertedWith("caller didn't minted this land");
  });

  it("give repeat", async () => {
    const [w1, w2, w3, w4, w5] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(11, 11, w2.address, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(12, 12, w3.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await (
      await landNFTToken
        .connect(w2)
        .mint(13, 13, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken.connect(w2).giveTo(13, 13, w3.address)
    ).to.revertedWith("givedAddress have gived land");
    await (await landNFTToken.connect(w2).giveTo(13, 13, w4.address)).wait();
    await expect(
      landNFTToken.connect(w2).giveTo(13, 13, w5.address)
    ).to.revertedWith("land is gived");
  });
});
