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
      w1.address
    )) as PeopleLand;

    await expect(landNFTToken.connect(w2).mint2(11, 11, 12, 12)).to.revertedWith(
      "caller is no gived"
    );
  });

  it("mint2 three", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint2(11, 11, 12, 12, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken.connect(w1).mint2(13, 13, 14, 14, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (await landNFTToken.connect(w1).giveTo(11, 11, w2.address)).wait();

    await (
      await landNFTToken
        .connect(w2)
        .mint2(15, 15, 16, 16, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mint2(17, 17, 18, 18, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
  });

  it("mint three", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint(11, 11, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken.connect(w1).mint2(13, 13, 14, 14, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (await landNFTToken.connect(w1).giveTo(11, 11, w2.address)).wait();

    await (
      await landNFTToken
        .connect(w2)
        .mint(15, 15, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mint2(17, 17, 18, 18, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
  });

  it("mint repeat", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint2(11, 11, 12, 12, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken.connect(w1).mint2(11, 11, 13, 13, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
    await expect(
      landNFTToken.connect(w1).mint(12, 12, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
    await expect(
      landNFTToken.connect(w1).mint(13, 13, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (await landNFTToken.connect(w1).giveTo(11, 11, w2.address)).wait();

    await (
      await landNFTToken
        .connect(w2)
        .mint2(15, 15, 16, 16, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken.connect(w2).mint2(11, 11, 0, 0,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
    await expect(
      landNFTToken.connect(w2).mint2(0, 0, 15, 15,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("land is reserved");
    await expect(
      landNFTToken.connect(w2).mint2(16, 16, 17, 17,{ value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
  });

  it("mint gived", async () => {
    const [w1, w2, w3] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mint(11, 11, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await (
      await landNFTToken
        .connect(w1)
        .mint(12, 12, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await (await landNFTToken.connect(w1).giveTo(11, 11, w2.address)).wait();
    await (await landNFTToken.connect(w1).giveTo(12, 12, w3.address)).wait();

    await expect(
      landNFTToken.connect(w2).mint2(12, 12, 13, 13, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("land is minted");
  });

  it("mint2 reserved", async () => {
    const [w1] = await ethers.getSigners();
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
          .mint2(xy[0], xy[1], 100, 100, { value: BigNumber.from(10).pow(18) })
      ).to.revertedWith("land is reserved");
    }
  });
});
