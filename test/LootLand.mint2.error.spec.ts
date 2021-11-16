import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { LootLand } from "../typechain";

describe("LootLand.mint2.error", async () => {

  it("no role", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    await expect(landNFTToken.connect(w2).mint2(1, 1, 2, 2)).to.revertedWith(
      "caller is no gived"
    );
  });

  it("mint2 three", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint2(1, 1, 2, 2, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken.connect(w1).mint2(3, 3, 4, 4, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (await landNFTToken.connect(w1).giveTo(1, 1, w2.address)).wait();

    await (
      await landNFTToken
        .connect(w2)
        .mint2(5, 5, 6, 6, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mint2(7, 7, 8, 8, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
  });

  it("mint three", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint(1, 1, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken.connect(w1).mint2(3, 3, 4, 4, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (await landNFTToken.connect(w1).giveTo(1, 1, w2.address)).wait();

    await (
      await landNFTToken
        .connect(w2)
        .mint(5, 5, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mint2(7, 7, 8, 8, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
  });

  it("mint repeat", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint2(1, 1, 2, 2, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken.connect(w1).mint2(1, 1,3,3, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
    await expect(
      landNFTToken.connect(w1).mint(2, 2, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
    await expect(
      landNFTToken.connect(w1).mint(3, 3, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (await landNFTToken.connect(w1).giveTo(1, 1, w2.address)).wait();

    await (
      await landNFTToken
        .connect(w2)
        .mint2(5, 5, 6, 6, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken.connect(w2).mint2(1, 1, 0,0,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
    await expect(
      landNFTToken.connect(w2).mint2(0, 0, 5,5,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
    await expect(
      landNFTToken.connect(w2).mint2(6, 6, 7,7,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
  });

  it("mint gived", async () => {
    const [w1, w2, w3] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint(1, 1, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await (
      await landNFTToken
        .connect(w1)
        .mint(2, 2, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await (await landNFTToken.connect(w1).giveTo(1, 1, w2.address)).wait();
    await (await landNFTToken.connect(w1).giveTo(2, 2, w3.address)).wait();

    await expect(
      landNFTToken.connect(w2).mint2(2, 2, 3,3,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("land is minted");
  });
});
