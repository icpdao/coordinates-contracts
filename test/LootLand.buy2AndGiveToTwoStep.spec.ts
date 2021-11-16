import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// eslint-disable-next-line node/no-missing-import
import { LootLand } from "../typechain";

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

const exceptBuy2AndGiveTwoStep = async (
  landContract: LootLand,
  buyed: SignerWithAddress,
  gived1: SignerWithAddress,
  gived2: SignerWithAddress,
  x1: any,
  y1: any,
  x2: any,
  y2: any
) => {
  // expect
  expect(await landContract.buyLandCount(buyed.address)).eq(0);
  const buylands = await landContract.getBuyLands(buyed.address);
  expect(buylands.length).eq(0);

  let [isGived1, land1] = await landContract.givedLand(gived1.address);
  expectLand(
    land1,
    false,
    isGived1,
    0,
    0,
    "",
    ZERO_ADDRESS,
    ZERO_ADDRESS,
    false,
    false
  );
  let [isGived2, land2] = await landContract.givedLand(gived2.address);
  expectLand(
    land2,
    false,
    isGived2,
    0,
    0,
    "",
    ZERO_ADDRESS,
    ZERO_ADDRESS,
    false,
    false
  );

  land1 = await landContract.land(x1, y1);
  expectLand(
    land1,
    land1.isBuyed,
    land1.isGived,
    x1,
    y1,
    "",
    ZERO_ADDRESS,
    ZERO_ADDRESS,
    false,
    false
  );

  land2 = await landContract.land(x2, y2);
  expectLand(
    land2,
    land2.isBuyed,
    land2.isGived,
    x2,
    y2,
    "",
    ZERO_ADDRESS,
    ZERO_ADDRESS,
    false,
    false
  );

  await expect(
    landContract.ownerOf(await landContract.getTokenId(x1, y1))
  ).to.be.revertedWith("ERC721: owner query for nonexistent token");

  await expect(
    landContract.ownerOf(await landContract.getTokenId(x2, y2))
  ).to.be.revertedWith("ERC721: owner query for nonexistent token");

  // buy2
  await (
    await landContract
      .connect(buyed)
      .buy2(x1, y1, x2, y2, { value: BigNumber.from(10).pow(18) })
  ).wait();
  // expect
  land1 = await landContract.land(x1, y1);
  expectLand(
    land1,
    land1.isBuyed,
    land1.isGived,
    x1,
    y1,
    "",
    buyed.address,
    ZERO_ADDRESS,
    true,
    false
  );

  land2 = await landContract.land(x2, y2);
  expectLand(
    land2,
    land2.isBuyed,
    land2.isGived,
    x2,
    y2,
    "",
    buyed.address,
    ZERO_ADDRESS,
    true,
    false
  );

  await expect(
    landContract.ownerOf(await landContract.getTokenId(x1, y1))
  ).to.be.revertedWith("ERC721: owner query for nonexistent token");
  await expect(
    landContract.ownerOf(await landContract.getTokenId(x2, y2))
  ).to.be.revertedWith("ERC721: owner query for nonexistent token");

  expect(await landContract.buyLandCount(buyed.address)).eq(2);
  const buylands2 = await landContract.getBuyLands(buyed.address);
  expect(buylands2.length).eq(2);

  expect(buylands2[0].x).eq(x1);
  expect(buylands2[0].y).eq(y1);
  expect(buylands2[0].buyedAddress).eq(buyed.address);
  expect(buylands2[0].givedAddress).eq(ZERO_ADDRESS);
  expect(buylands2[0].isBuyed).eq(true);
  expect(buylands2[0].isGived).eq(false);

  expect(buylands2[1].x).eq(x2);
  expect(buylands2[1].y).eq(y2);
  expect(buylands2[1].buyedAddress).eq(buyed.address);
  expect(buylands2[1].givedAddress).eq(ZERO_ADDRESS);
  expect(buylands2[1].isBuyed).eq(true);
  expect(buylands2[1].isGived).eq(false);

  // give1
  await (
    await landContract.connect(buyed).giveTo(x1, y1, gived1.address)
  ).wait();

  // expect
  expect(await landContract.ownerOf(await landContract.getTokenId(x1, y1))).eq(
    gived1.address
  );

  land1 = await landContract.land(x1, y1);
  expectLand(
    land1,
    land1.isBuyed,
    land1.isGived,
    x1,
    y1,
    "",
    buyed.address,
    gived1.address,
    true,
    true
  );

  [isGived1, land1] = await landContract.givedLand(gived1.address);
  expectLand(
    land1,
    true,
    isGived1,
    x1,
    y1,
    "",
    buyed.address,
    gived1.address,
    true,
    true
  );

  expect(await landContract.buyLandCount(buyed.address)).eq(2);
  const buylands3 = await landContract.getBuyLands(buyed.address);
  expect(buylands3.length).eq(2);

  expect(buylands3[0].x).eq(x1);
  expect(buylands3[0].y).eq(y1);
  expect(buylands3[0].buyedAddress).eq(buyed.address);
  expect(buylands3[0].givedAddress).eq(gived1.address);
  expect(buylands3[0].isBuyed).eq(true);
  expect(buylands3[0].isGived).eq(true);

  expect(buylands3[1].x).eq(x2);
  expect(buylands3[1].y).eq(y2);
  expect(buylands3[1].buyedAddress).eq(buyed.address);
  expect(buylands2[1].givedAddress).eq(ZERO_ADDRESS);
  expect(buylands3[1].isBuyed).eq(true);
  expect(buylands3[1].isGived).eq(false);

  // give2
  await (
    await landContract.connect(buyed).giveTo(x2, y2, gived2.address)
  ).wait();

  // expect
  expect(await landContract.ownerOf(await landContract.getTokenId(x2, y2))).eq(
    gived2.address
  );

  land2 = await landContract.land(x2, y2);
  expectLand(
    land2,
    land2.isBuyed,
    land2.isGived,
    x2,
    y2,
    "",
    buyed.address,
    gived2.address,
    true,
    true
  );

  [isGived2, land2] = await landContract.givedLand(gived2.address);
  expectLand(
    land2,
    true,
    isGived2,
    x2,
    y2,
    "",
    buyed.address,
    gived2.address,
    true,
    true
  );

  expect(await landContract.buyLandCount(buyed.address)).eq(2);
  const buylands4 = await landContract.getBuyLands(buyed.address);
  expect(buylands4.length).eq(2);

  expect(buylands4[0].x).eq(x1);
  expect(buylands4[0].y).eq(y1);
  expect(buylands4[0].buyedAddress).eq(buyed.address);
  expect(buylands4[0].givedAddress).eq(gived1.address);
  expect(buylands4[0].isBuyed).eq(true);
  expect(buylands4[0].isGived).eq(true);

  expect(buylands4[1].x).eq(x2);
  expect(buylands4[1].y).eq(y2);
  expect(buylands4[1].buyedAddress).eq(buyed.address);
  expect(buylands4[1].givedAddress).eq(gived2.address);
  expect(buylands4[1].isBuyed).eq(true);
  expect(buylands4[1].isGived).eq(true);
};

const exceptBuy2Cost = async (
  price: any,
  contract: any,
  x1: any,
  y1: any,
  x2: any,
  y2: any,
  buyed: any,
  ethValue: any
) => {
  const buyBeforeEthCon = await ethers.provider.getBalance(contract.address);
  const buyBeforeEthW1 = await buyed.getBalance();

  const result = await (
    await contract.connect(buyed).buy2(x1, y1, x2, y2, {
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

describe("LootLand.buy2AndGiveToTwoStep", async () => {
  it("buy and give to", async () => {
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

    await exceptBuy2AndGiveTwoStep(landNFTToken, w1, w2, w3, 1, -2, 2, -3);
    await exceptBuy2AndGiveTwoStep(landNFTToken, w2, w4, w5, 3, -4, 4, -5);
    await exceptBuy2AndGiveTwoStep(landNFTToken, w3, w6, w7, 5, -6, 6, -7);
    await exceptBuy2AndGiveTwoStep(landNFTToken, w4, w8, w9, 7, -8, 8, -9);
    await exceptBuy2AndGiveTwoStep(landNFTToken, w5, w10, w11, 9, -10, 10, -11);
    await exceptBuy2AndGiveTwoStep(
      landNFTToken,
      w6,
      w12,
      w13,
      11,
      -12,
      12,
      -13
    );
    await exceptBuy2AndGiveTwoStep(
      landNFTToken,
      w7,
      w14,
      w15,
      13,
      -14,
      14,
      -15
    );
  });

  it("buy cast eth", async () => {
    const [w1, w2, w3] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    const PRICE = await landNFTToken.PRICE();

    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(0);

    await exceptBuy2Cost(
      PRICE.mul(2),
      landNFTToken,
      1,
      1,
      2,
      2,
      w1,
      BigNumber.from(10).pow(18)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(2)
    );
    await (await landNFTToken.connect(w1).giveTo(1, 1, w2.address)).wait();
    await (await landNFTToken.connect(w1).giveTo(2, 2, w3.address)).wait();
    await exceptBuy2Cost(
      PRICE.mul(2),
      landNFTToken,
      3,
      3,
      4,
      4,
      w2,
      PRICE.mul(2).add(1000)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(4)
    );
    await exceptBuy2Cost(
      PRICE.mul(2),
      landNFTToken,
      5,
      5,
      6,
      6,
      w3,
      PRICE.mul(2)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(6)
    );
    await expectGetEth(landNFTToken, w1);
  });
});
