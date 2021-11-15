import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { LootLand } from "../typechain";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const GAS_PRICE = 300000000;

const expectLand = (
  land: any,
  landIsBuyed: any,
  landIsGived: any,
  x: any,
  y: any,
  slogan: any,
  buyedAddress: any,
  givedAddress: any,
  isBuyed: any,
  isGived: any
) => {
  expect(landIsBuyed).eq(isBuyed);
  expect(landIsGived).eq(isGived);
  expect(land.isBuyed).eq(isBuyed);
  expect(land.isGived).eq(isGived);
  expect(land.x).eq(x);
  expect(land.y).eq(y);
  expect(land.slogan).eq(slogan);
  expect(land.buyedAddress).eq(buyedAddress);
  expect(land.givedAddress).eq(givedAddress);
};

const exceptBuyAndGiveOneStep = async (
  landContract: LootLand,
  buyed: SignerWithAddress,
  gived: SignerWithAddress,
  x: any,
  y: any,
  buyeBefore: any
) => {
  expect(await landContract.buyLandCount(buyed.address)).eq(buyeBefore.length);
  const buylands = await landContract.getBuyLands(buyed.address);
  if (buyeBefore.length === 0) {
    expect(buylands.length).eq(0);
  } else {
    expect(buylands.length).eq(1);
    expect(buylands[0].x).eq(buyeBefore[0][0]);
    expect(buylands[0].y).eq(buyeBefore[0][1]);
    expect(buylands[0].buyedAddress).eq(buyed.address);
    expect(buylands[0].givedAddress).eq(buyeBefore[0][2]);
    expect(buylands[0].isBuyed).eq(true);
    expect(buylands[0].isGived).eq(true);
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
    land.isBuyed,
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
    landContract.ownerOf(await landContract.getTokenId(x, y))
  ).to.be.revertedWith("ERC721: owner query for nonexistent token");

  await (
    await landContract
      .connect(buyed)
      .buyAndGiveTo(x, y, gived.address, { value: BigNumber.from(10).pow(18) })
  ).wait();

  expect(await landContract.ownerOf(await landContract.getTokenId(x, y))).eq(
    gived.address
  );

  land = await landContract.land(x, y);
  expectLand(
    land,
    land.isBuyed,
    land.isGived,
    x,
    y,
    "",
    buyed.address,
    gived.address,
    true,
    true
  );

  [isGived, land] = await landContract.givedLand(gived.address);
  expectLand(
    land,
    land.isBuyed,
    isGived,
    x,
    y,
    "",
    buyed.address,
    gived.address,
    true,
    true
  );

  expect(await landContract.buyLandCount(buyed.address)).eq(
    buyeBefore.length + 1
  );
  const buylands3 = await landContract.getBuyLands(buyed.address);
  if (buyeBefore.length === 0) {
    expect(buylands3.length).eq(1);
    expect(buylands3[0].x).eq(x);
    expect(buylands3[0].y).eq(y);
    expect(buylands3[0].buyedAddress).eq(buyed.address);
    expect(buylands3[0].givedAddress).eq(gived.address);
    expect(buylands3[0].isBuyed).eq(true);
    expect(buylands3[0].isGived).eq(true);
  } else {
    expect(buylands3.length).eq(2);
    expect(buylands3[0].x).eq(buyeBefore[0][0]);
    expect(buylands3[0].y).eq(buyeBefore[0][1]);
    expect(buylands3[0].buyedAddress).eq(buyed.address);
    expect(buylands3[0].givedAddress).eq(buyeBefore[0][2]);
    expect(buylands3[0].isBuyed).eq(true);
    expect(buylands3[0].isGived).eq(true);

    expect(buylands3[1].x).eq(x);
    expect(buylands3[1].y).eq(y);
    expect(buylands3[1].buyedAddress).eq(buyed.address);
    expect(buylands3[1].givedAddress).eq(gived.address);
    expect(buylands3[1].isBuyed).eq(true);
    expect(buylands3[1].isGived).eq(true);
  }
};

const exceptBuyCost = async (
  price: any,
  contract: any,
  x: any,
  y: any,
  buyed: any,
  givedAddress: any,
  ethValue: any
) => {
  const buyBeforeEthCon = await ethers.provider.getBalance(contract.address);
  const buyBeforeEthW1 = await buyed.getBalance();

  const result = await (
    await contract.connect(buyed).buyAndGiveTo(x, y, givedAddress, {
      value: ethValue,
      gasPrice: GAS_PRICE,
    })
  ).wait();
  const fee = result.gasUsed.mul(GAS_PRICE);
  const buyAfterEthW1 = await buyed.getBalance();
  const buyAfterEthCon = await ethers.provider.getBalance(contract.address);

  expect(buyBeforeEthW1.sub(buyAfterEthW1)).eq(fee.add(price));
  expect(buyAfterEthCon.sub(buyBeforeEthCon)).eq(price);
};

const expectGetEth = async (contract: any, owner: any) => {
  const getEthBeforeEthCon = await ethers.provider.getBalance(contract.address);
  const getEthBeforeEthOwner = await owner.getBalance();

  const result = await (
    await contract.connect(owner).getEth({
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

describe("LootLand.buyAndGiveToOneStep", async () => {
  it("buyAndGiveTo", async () => {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11, w12, w13, w14, w15] =
      await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    const [isGived, givedLandW1] = await landNFTToken.givedLand(w1.address);
    expectLand(
      givedLandW1,
      givedLandW1.isBuyed,
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

    await exceptBuyAndGiveOneStep(landNFTToken, w1, w2, 1, -2, []);
    await exceptBuyAndGiveOneStep(landNFTToken, w1, w3, 2, -3, [[1, -2, w2.address]]);

    await exceptBuyAndGiveOneStep(landNFTToken, w2, w4, 3, -4, []);
    await exceptBuyAndGiveOneStep(landNFTToken, w2, w5, 4, -5, [[3, -4, w4.address]]);

    await exceptBuyAndGiveOneStep(landNFTToken, w3, w6, 5, -6, []);
    await exceptBuyAndGiveOneStep(landNFTToken, w3, w7, 6, -7, [[5, -6, w6.address]]);

    await exceptBuyAndGiveOneStep(landNFTToken, w4, w8, 7, -8, []);
    await exceptBuyAndGiveOneStep(landNFTToken, w4, w9, 8, -9, [[7, -8, w8.address]]);

    await exceptBuyAndGiveOneStep(landNFTToken, w5, w10, 9, -10, []);
    await exceptBuyAndGiveOneStep(landNFTToken, w5, w11, 10, -11, [
      [9, -10, w10.address],
    ]);

    await exceptBuyAndGiveOneStep(landNFTToken, w6, w12, 11, -12, []);
    await exceptBuyAndGiveOneStep(landNFTToken, w6, w13, 12, -13, [
      [11, -12, w12.address],
    ]);

    await exceptBuyAndGiveOneStep(landNFTToken, w7, w14, 13, -14, []);
    await exceptBuyAndGiveOneStep(landNFTToken, w7, w15, 14, -15, [
      [13, -14, w14.address],
    ]);
  });

  it("buy cast eth", async () => {
    const [w1, w2, w3, w4, w5, w6, w7] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    const PRICE = await landNFTToken.PRICE();

    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(0);

    await exceptBuyCost(
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
    await exceptBuyCost(PRICE, landNFTToken, 2, 2, w1, w3.address, PRICE);
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(2)
    );

    await exceptBuyCost(
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
    await exceptBuyCost(PRICE, landNFTToken, 4, 4, w2, w5.address, PRICE);
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(4)
    );
    await expectGetEth(landNFTToken, w1);
  });
});
