import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { LootLand } from "../typechain";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const GAS_PRICE = 3000000000;

const expectLand = (
  land: any,
  landIsMinted: any,
  landIsGived: any,
  x: any,
  y: any,
  slogan: any,
  mintedAddress: any,
  givedAddress: any,
  isMinted: any,
  isGived: any
) => {
  expect(landIsMinted).eq(isMinted);
  expect(landIsGived).eq(isGived);
  expect(land.isMinted).eq(isMinted);
  expect(land.isGived).eq(isGived);
  expect(land.x).eq(x);
  expect(land.y).eq(y);
  expect(land.slogan).eq(slogan);
  expect(land.mintedAddress).eq(mintedAddress);
  expect(land.givedAddress).eq(givedAddress);
};

const exceptMintAndGiveOneStep = async (
  landContract: LootLand,
  minted: SignerWithAddress,
  gived: SignerWithAddress,
  x: any,
  y: any,
  minteBefore: any
) => {
  expect(await landContract.mintLandCount(minted.address)).eq(minteBefore.length);
  const mintlands = await landContract.getMintLands(minted.address);
  if (minteBefore.length === 0) {
    expect(mintlands.length).eq(0);
  } else {
    expect(mintlands.length).eq(1);
    expect(mintlands[0].x).eq(minteBefore[0][0]);
    expect(mintlands[0].y).eq(minteBefore[0][1]);
    expect(mintlands[0].mintedAddress).eq(minted.address);
    expect(mintlands[0].givedAddress).eq(minteBefore[0][2]);
    expect(mintlands[0].isMinted).eq(true);
    expect(mintlands[0].isGived).eq(true);
  }

  let [isGived, land] = await landContract.givedLand(gived.address);
  expectLand(
    land,
    false,
    isGived,
    0,
    0,
    "",
    ZERO_ADDRESS,
    ZERO_ADDRESS,
    false,
    false
  );

  land = await landContract.land(x, y);
  expectLand(
    land,
    land.isMinted,
    land.isGived,
    x,
    y,
    "",
    ZERO_ADDRESS,
    ZERO_ADDRESS,
    false,
    false
  );

  await expect(
    landContract.getTokenId(x, y)
  ).to.be.revertedWith("not minted");

  await (
    await landContract
      .connect(minted)
      .mintAndGiveTo(x, y, gived.address, { value: BigNumber.from(10).pow(18) })
  ).wait();

  expect(await landContract.ownerOf(await landContract.getTokenId(x, y))).eq(
    gived.address
  );

  land = await landContract.land(x, y);
  expectLand(
    land,
    land.isMinted,
    land.isGived,
    x,
    y,
    "",
    minted.address,
    gived.address,
    true,
    true
  );

  [isGived, land] = await landContract.givedLand(gived.address);
  expectLand(
    land,
    land.isMinted,
    isGived,
    x,
    y,
    "",
    minted.address,
    gived.address,
    true,
    true
  );

  expect(await landContract.mintLandCount(minted.address)).eq(
    minteBefore.length + 1
  );
  const mintlands3 = await landContract.getMintLands(minted.address);
  if (minteBefore.length === 0) {
    expect(mintlands3.length).eq(1);
    expect(mintlands3[0].x).eq(x);
    expect(mintlands3[0].y).eq(y);
    expect(mintlands3[0].mintedAddress).eq(minted.address);
    expect(mintlands3[0].givedAddress).eq(gived.address);
    expect(mintlands3[0].isMinted).eq(true);
    expect(mintlands3[0].isGived).eq(true);
  } else {
    expect(mintlands3.length).eq(2);
    expect(mintlands3[0].x).eq(minteBefore[0][0]);
    expect(mintlands3[0].y).eq(minteBefore[0][1]);
    expect(mintlands3[0].mintedAddress).eq(minted.address);
    expect(mintlands3[0].givedAddress).eq(minteBefore[0][2]);
    expect(mintlands3[0].isMinted).eq(true);
    expect(mintlands3[0].isGived).eq(true);

    expect(mintlands3[1].x).eq(x);
    expect(mintlands3[1].y).eq(y);
    expect(mintlands3[1].mintedAddress).eq(minted.address);
    expect(mintlands3[1].givedAddress).eq(gived.address);
    expect(mintlands3[1].isMinted).eq(true);
    expect(mintlands3[1].isGived).eq(true);
  }
};

const exceptMintCost = async (
  price: any,
  contract: any,
  x: any,
  y: any,
  minted: any,
  givedAddress: any,
  ethValue: any
) => {
  const mintBeforeEthCon = await ethers.provider.getBalance(contract.address);
  const mintBeforeEthW1 = await minted.getBalance();

  const result = await (
    await contract.connect(minted).mintAndGiveTo(x, y, givedAddress, {
      value: ethValue,
      gasPrice: GAS_PRICE,
    })
  ).wait();
  const fee = result.gasUsed.mul(GAS_PRICE);
  const mintAfterEthW1 = await minted.getBalance();
  const mintAfterEthCon = await ethers.provider.getBalance(contract.address);

  expect(mintBeforeEthW1.sub(mintAfterEthW1)).eq(fee.add(price));
  expect(mintAfterEthCon.sub(mintBeforeEthCon)).eq(price);
};

const expectGetEth = async (contract: any, owner: any) => {
  const getEthBeforeEthCon = await ethers.provider.getBalance(contract.address);
  const getEthBeforeEthOwner = await owner.getBalance();

  const result = await (
    await contract.connect(owner).getAllEth({
      gasPrice: GAS_PRICE,
    })
  ).wait();
  const fee = result.gasUsed.mul(GAS_PRICE);
  const getEthAfterEthOwner = await owner.getBalance();
  const getEthAfterEthCon = await ethers.provider.getBalance(contract.address);

  expect(getEthAfterEthCon).eq(0);
  expect(getEthAfterEthOwner).eq(
    getEthBeforeEthOwner.add(getEthBeforeEthCon).sub(fee)
  );
};

describe("LootLand.mintAndGiveToOneStep", async () => {
  it("mintAndGiveTo", async () => {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12, w13, w14, w15] =
      await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    const [isGived, givedLandW1] = await landNFTToken.givedLand(w1.address);
    expectLand(
      givedLandW1,
      givedLandW1.isMinted,
      isGived,
      0,
      0,
      "",
      ZERO_ADDRESS,
      w1.address,
      true,
      true
    );
    expect(await landNFTToken.ownerOf(await landNFTToken.getTokenId(0, 0))).eq(
      w1.address
    );

    await exceptMintAndGiveOneStep(landNFTToken, w1, w2, 1, -2, []);
    await exceptMintAndGiveOneStep(landNFTToken, w1, w3, 2, -3, [[1, -2, w2.address]]);

    await exceptMintAndGiveOneStep(landNFTToken, w2, w4, 3, -4, []);
    await exceptMintAndGiveOneStep(landNFTToken, w2, w5, 4, -5, [[3, -4, w4.address]]);

    await exceptMintAndGiveOneStep(landNFTToken, w3, w6, 5, -6, []);
    await exceptMintAndGiveOneStep(landNFTToken, w3, w7, 6, -7, [[5, -6, w6.address]]);

    await exceptMintAndGiveOneStep(landNFTToken, w4, w8, 7, -8, []);
    await exceptMintAndGiveOneStep(landNFTToken, w4, w9, 8, -9, [[7, -8, w8.address]]);

    await exceptMintAndGiveOneStep(landNFTToken, w5, w10, 9, -10, []);
    await exceptMintAndGiveOneStep(landNFTToken, w5, w11, 10, -11, [
      [9, -10, w10.address],
    ]);

    await exceptMintAndGiveOneStep(landNFTToken, w6, w12, 11, -12, []);
    await exceptMintAndGiveOneStep(landNFTToken, w6, w13, 12, -13, [
      [11, -12, w12.address],
    ]);

    await exceptMintAndGiveOneStep(landNFTToken, w7, w14, 13, -14, []);
    await exceptMintAndGiveOneStep(landNFTToken, w7, w15, 14, -15, [
      [13, -14, w14.address],
    ]);
  });

  it("mint cast eth", async () => {
    const [w1, w2, w3, w4, w5, w6, w7] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    const PRICE = await landNFTToken.PRICE();

    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(0);

    await exceptMintCost(
      PRICE,
      landNFTToken,
      1,
      1,
      w1,
      w2.address,
      BigNumber.from(10).pow(18)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE
    );
    await exceptMintCost(PRICE, landNFTToken, 2, 2, w1, w3.address, PRICE);
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(2)
    );

    await exceptMintCost(
      PRICE,
      landNFTToken,
      3,
      3,
      w2,
      w4.address,
      PRICE.add(100)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(3)
    );
    await exceptMintCost(PRICE, landNFTToken, 4, 4, w2, w5.address, PRICE);
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(4)
    );
    await expectGetEth(landNFTToken, w1);
  });
});
