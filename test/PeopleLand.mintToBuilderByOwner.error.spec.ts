import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { PeopleLand } from "../typechain";

describe("PeopleLand.mintToBuilderByOwner.error", async () => {
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
        .mintToBuilderByOwner(11, 11, w3.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("Ownable: caller is not the owner");
  });

  it("no reserved", async () => {
    const [w1, w2, w3] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await expect(
      landNFTToken
        .connect(w1)
        .mintToBuilderByOwner(11, 11, w3.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("land is not reserved");
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
        .mintToBuilderByOwner(1, 1, w2.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(11, 11, w3.address, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(12, 12, w4.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w2)
        .mintAndGiveTo(13, 13, w5.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");

    await (
      await landNFTToken
        .connect(w3)
        .mintAndGiveTo(15, 15, w5.address, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await (
      await landNFTToken
        .connect(w3)
        .mintAndGiveTo(16, 16, w6.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w3)
        .mintAndGiveTo(17, 17, w7.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("caller is already minted");
  });

  it("mintToBuilderByOwner repeat", async () => {
    const [w1, w2, w3, w4, w5, w6] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(w1)
        .mintToBuilderByOwner(1, 1, w2.address, { value: BigNumber.from(10).pow(18) })
    ).wait();

    await expect(
      landNFTToken
        .connect(w1)
        .mintToBuilderByOwner(1, 1, w2.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("givedAddress is minted or have gived");

    await expect(
      landNFTToken
        .connect(w1)
        .mintToBuilderByOwner(2, 2, w2.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("givedAddress is minted or have gived");

    await expect(
      landNFTToken
        .connect(w1)
        .mintToBuilderByOwner(1, 1, w3.address, { value: BigNumber.from(10).pow(18) })
    ).to.revertedWith("land is minted");
  });

  it("mintToBuilderByOwner not reserved", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    const data = [
      [-3, -3],
      [3, 3],
    ];

    for(let i = 0; i < data.length; i++) {
      const xy = data[i];

      await expect(
        landNFTToken
          .connect(w1)
          .mintToBuilderByOwner(xy[0], xy[1], w2.address, { value: BigNumber.from(10).pow(18) })
      ).to.revertedWith("land is not reserved");
    }
  });
});
