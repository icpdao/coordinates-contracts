import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { PeopleLand } from "../typechain";

describe("PeopleLand.mint2.error", async () => {
  it("no role", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address,
      w1.address,
    )) as PeopleLand;

    await expect(landNFTToken.connect(w2).mint2(111, 111, 112, 112)).to.revertedWith(
      "caller is no gived"
    );
  });

  it("mint2 three", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address,
      w1.address,
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint2(111, 111, 112, 112, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken.connect(w1).mint2(113, 113, 114, 114, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (await landNFTToken.connect(w1).giveTo(111, 111, w2.address)).wait();

    await (
      await landNFTToken
        .connect(w2)
        .mint2(115, 115, 116, 116, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mint2(117, 117, 118, 118, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
  });

  it("mint three", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address,
      w1.address,
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint(111, 111, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken.connect(w1).mint2(113, 113, 114, 114, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (await landNFTToken.connect(w1).giveTo(111, 111, w2.address)).wait();

    await (
      await landNFTToken
        .connect(w2)
        .mint(115, 115, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mint2(117, 117, 118, 118, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
  });

  it("mint repeat", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address,
      w1.address,
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint2(111, 111, 112, 112, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken.connect(w1).mint2(111, 111, 113, 113, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
    await expect(
      landNFTToken.connect(w1).mint(112, 112, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
    await expect(
      landNFTToken.connect(w1).mint(113, 113, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (await landNFTToken.connect(w1).giveTo(111, 111, w2.address)).wait();

    await (
      await landNFTToken
        .connect(w2)
        .mint2(115, 115, 116, 116, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken.connect(w2).mint2(111, 111, 0, 0,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
    await expect(
      landNFTToken.connect(w2).mint2(0, 0, 115, 115,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("land is people reserved");
    await expect(
      landNFTToken.connect(w2).mint2(116, 116, 117, 117,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
  });

  it("mint gived", async () => {
    const [w1, w2, w3] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address,
      w1.address,
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint(111, 111, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await (
      await landNFTToken
        .connect(w1)
        .mint(112, 112, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await (await landNFTToken.connect(w1).giveTo(111, 111, w2.address)).wait();
    await (await landNFTToken.connect(w1).giveTo(112, 112, w3.address)).wait();

    await expect(
      landNFTToken.connect(w2).mint2(112, 112, 113, 113, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("land is minted");
  });

  it("mint2 reserved", async () => {
    const [w1] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address,
      w1.address,
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
          .mint2(xy[0], xy[1], 100, 100, { value: BigNumber.from(10).pow(18) })
      ).to.revertedWith("land is people reserved");
    }
  });
});
