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
        .mint2AndGiveTo(11, 11, w3.address, 12, 12, w4.address,{ value: BigNumber.from(10).pow(18) })
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
        .mint2AndGiveTo(11, 11, w2.address, 12, 12, w3.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w1)
        .mint2AndGiveTo(13, 13, w4.address, 14, 14, w5.address,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (
      await landNFTToken
        .connect(w2)
        .mint2AndGiveTo(15, 15, w4.address, 16, 16, w5.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mint2AndGiveTo(17, 17, w6.address, 18, 18, w7.address, {
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
        .mintAndGiveTo(11, 11, w2.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w1)
        .mint2AndGiveTo(13, 13, w4.address, 14, 14, w5.address,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(15, 15, w4.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mint2AndGiveTo(17, 17, w6.address, 18, 18, w7.address, {
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
    ];

    for(let i = 0; i < data.length; i++) {
      const xy = data[i];

      await expect(
        landNFTToken
          .connect(w1)
          .mint2AndGiveTo(xy[0], xy[1], w2.address, 100, 100, w3.address, { value: BigNumber.from(10).pow(18) })
      ).to.revertedWith("land is reserved");
    }
  });
});
