import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { PeopleLand } from "../typechain";

describe("PeopleLand.mintAndGiveTo.error", async () => {
  it("no role", async () => {
    const [w1, w2, w3] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await expect(
      landNFTToken
        .connect(w2)
        .mintAndGiveTo(111, 111, w3.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is no gived");
  });

  it("mintAndGiveTo three", async () => {
    const [w1, w2, w3, w4, w5, w6] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(111, 111, w2.address, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(112, 112, w3.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w1)
        .mintAndGiveTo(113, 113, w4.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(115, 115, w4.address, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(116, 116, w5.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mintAndGiveTo(117, 117, w6.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
  });

  it("mintAndGiveTo repeat", async () => {
    const [w1, w2, w3, w4, w5, w6] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(111, 111, w2.address, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken
        .connect(w1)
        .mintAndGiveTo(111, 111, w3.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("land is minted");
    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(112, 112, w3.address, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken
        .connect(w1)
        .mintAndGiveTo(112, 112, w4.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
    await expect(
      landNFTToken
        .connect(w1)
        .mintAndGiveTo(113, 113, w4.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(115, 115, w4.address, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken
        .connect(w2)
        .mintAndGiveTo(111, 111, w5.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("land is minted");
    await expect(
      landNFTToken
        .connect(w2)
        .mintAndGiveTo(0, 0, w5.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("land is people reserved");
    await expect(
      landNFTToken
        .connect(w2)
        .mintAndGiveTo(115, 115, w5.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("land is minted");
    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(116, 116, w5.address, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken.connect(w2).mintAndGiveTo(116, 116, w6.address,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await expect(
      landNFTToken
        .connect(w2)
        .mintAndGiveTo(117, 117, w6.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
  });

  it("mintAndGiveTo gived", async () => {
    const [w1, w2, w3, w4] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(111, 111, w2.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();

    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(112, 112, w3.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mintAndGiveTo(112, 112, w3.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("land is minted");
    await expect(
      landNFTToken
        .connect(w2)
        .mintAndGiveTo(112, 112, w4.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("land is minted");
  });

  it("mintAndGiveTo reserved", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;


    const data = [
      [-2, -2],
      [-2, -1],
      [-2, 0],
      [-2, 1],
      [-2, 2],

      [-1, -2],
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [-1, 2],

      [0, -2],
      [0, -1],
      [0, 1],
      [0, 2],

      [1, -2],
      [1, -1],
      [1, 0],
      [1, 1],
      [1, 2],

      [2, -2],
      [2, -1],
      [2, 0],
      [2, 1],
      [2, 2],

      [30, 30],
      [29, 29],
      [-30, -30],
      [-29, -29],
      [-30, 0],
      [30, 0],
      [0, -30],
      [0, 30],
    ];

    for(let i = 0; i < data.length; i++) {
      const xy = data[i];

      await expect(
        landNFTToken
          .connect(w1)
          .mintAndGiveTo(xy[0], xy[1], w2.address, { value: BigNumber.from(10).pow(18) })
      ).to.revertedWith("land is people reserved");
    }
  });
});
