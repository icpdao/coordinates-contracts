import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { PeopleLand } from "../typechain";

describe("PeopleLand.mint2AndGiveTo.error", async () => {
  it("no role", async () => {
    const [w1, w2, w3, w4] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await expect(
      landNFTToken
        .connect(w2)
        .mint2AndGiveTo(111, 111, w3.address, 112, 112, w4.address,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is no gived");
  });

  it("mint2AndGiveTo three", async () => {
    const [w1, w2, w3, w4, w5, w6, w7] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint2AndGiveTo(111, 111, w2.address, 112, 112, w3.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w1)
        .mint2AndGiveTo(113, 113, w4.address, 114, 114, w5.address,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (
      await landNFTToken
        .connect(w2)
        .mint2AndGiveTo(115, 115, w4.address, 116, 116, w5.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mint2AndGiveTo(117, 117, w6.address, 118, 118, w7.address, {
          value: BigNumber.from(10).pow(18),
        })
    ).to.revertedWith("caller is already minted");
  });

  it("mintAndGiveTo three", async () => {
    const [w1, w2, w3, w4, w5, w6, w7] = await ethers.getSigners();
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
        .mint2AndGiveTo(113, 113, w4.address, 114, 114, w5.address,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(115, 115, w4.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mint2AndGiveTo(117, 117, w6.address, 118, 118, w7.address, {
          value: BigNumber.from(10).pow(18),
        })
    ).to.revertedWith("caller is already minted");
  });

  it("mint2AndGiveTo reserved", async () => {
    const [w1, w2, w3] = await ethers.getSigners();
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
          .mint2AndGiveTo(xy[0], xy[1], w2.address, 100, 100, w3.address, { value: BigNumber.from(10).pow(18) })
      ).to.revertedWith("land is people reserved");
    }
  });
});
