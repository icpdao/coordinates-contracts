import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { LootLand } from "../typechain";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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

const exceptBuyAndGive = async (
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
      .buy(x, y, { value: BigNumber.from(10).pow(18) })
  ).wait();
  land = await landContract.land(x, y);
  expectLand(
    land,
    land.isBuyed,
    land.isGived,
    x,
    y,
    "",
    buyed.address,
    ZERO_ADDRESS,
    true,
    false
  );

  await expect(
    landContract.ownerOf(await landContract.getTokenId(x, y))
  ).to.be.revertedWith("ERC721: owner query for nonexistent token");

  expect(await landContract.buyLandCount(buyed.address)).eq(
    buyeBefore.length + 1
  );
  const buylands2 = await landContract.getBuyLands(buyed.address);
  if (buyeBefore.length === 0) {
    expect(buylands2.length).eq(1);
    expect(buylands2[0].x).eq(x);
    expect(buylands2[0].y).eq(y);
    expect(buylands2[0].buyedAddress).eq(buyed.address);
    expect(buylands2[0].givedAddress).eq(ZERO_ADDRESS);
    expect(buylands2[0].isBuyed).eq(true);
    expect(buylands2[0].isGived).eq(false);
  } else {
    expect(buylands2.length).eq(2);
    expect(buylands2[0].x).eq(buyeBefore[0][0]);
    expect(buylands2[0].y).eq(buyeBefore[0][1]);
    expect(buylands2[0].buyedAddress).eq(buyed.address);
    expect(buylands2[0].givedAddress).eq(buyeBefore[0][2]);
    expect(buylands2[0].isBuyed).eq(true);
    expect(buylands2[0].isGived).eq(true);

    expect(buylands2[1].x).eq(x);
    expect(buylands2[1].y).eq(y);
    expect(buylands2[1].buyedAddress).eq(buyed.address);
    expect(buylands2[1].givedAddress).eq(ZERO_ADDRESS);
    expect(buylands2[1].isBuyed).eq(true);
    expect(buylands2[1].isGived).eq(false);
  }

  await (await landContract.connect(buyed).giveTo(x, y, gived.address)).wait();

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

const exceptBuyCost = async (price: any, contract: any, x: any, y: any, buyed: any, ethValue: any) => {
  const buyBeforeEthCon = await ethers.provider.getBalance(contract.address);
  const buyBeforeEthW1 = await buyed.getBalance();

  const gasPrice = 10000000;
  const result = await (
    await contract.connect(buyed).buy(x, y, {
      value: ethValue,
      gasPrice: gasPrice,
    })
  ).wait();
  const fee = result.gasUsed.mul(gasPrice);
  const buyAfterEthW1 = await buyed.getBalance();
  const buyAfterEthCon = await ethers.provider.getBalance(contract.address);

  expect(buyBeforeEthW1.sub(buyAfterEthW1)).eq(fee.add(price));
  expect(buyAfterEthCon.sub(buyBeforeEthCon)).eq(price);
};

const expectGetEth = async (contract: any, owner: any) => {
  const getEthBeforeEthCon = await ethers.provider.getBalance(contract.address);
  const getEthBeforeEthOwner = await owner.getBalance();

  const gasPrice = 10000000;
  const result = await (
    await contract.connect(owner).getEth({
      gasPrice: gasPrice,
    })
  ).wait();
  const fee = result.gasUsed.mul(gasPrice);
  const getEthAfterEthOwner = await owner.getBalance();
  const getEthAfterEthCon = await ethers.provider.getBalance(contract.address);

  expect(getEthAfterEthCon).eq(0);
  expect(getEthAfterEthOwner).eq(
    getEthBeforeEthOwner.add(getEthBeforeEthCon).sub(fee)
  );
};

describe("LandNFT", async () => {
  it("token and coordinates", async () => {
    const [w1] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    const INT128_MIN = BigNumber.from(2).pow(127).mul(-1);
    const INT128_MAX = BigNumber.from(2).pow(127).sub(1);

    const dataList = [
      [0, 0],
      [10, 11],
      [0, -10],
      [10, 0],
      [-10, 0],
      [0, 10],
      [-10, -10],
      [-10, 10],
      [10, -10],
      [INT128_MIN, INT128_MAX],
      [INT128_MAX, INT128_MIN],
    ];

    for (let i = 0; i < dataList.length; i++) {
      const ix = dataList[i][0];
      const iy = dataList[i][1];
      const tokenId = await landNFTToken.getTokenId(ix, iy);
      const { x: rx, y: ry } = await landNFTToken.getCoordinates(tokenId);
      expect(rx).to.eq(ix);
      expect(ry).to.eq(iy);
      const rTokenId = await landNFTToken.getTokenId(rx, ry);
      expect(tokenId).to.eq(rTokenId);
      console.log("tokenId", tokenId);
      console.log("ix, iy", ix, iy);
      console.log("rx, ry", rx, ry);
    }
  });

  it("coordinates string", async () => {
    const [w1] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    const INT128_MIN = BigNumber.from(2).pow(127).mul(-1);
    const INT128_MAX = BigNumber.from(2).pow(127).sub(1);

    const dataList = [
      [0, 0, "0,0"],
      [10, 11, "E10,N11"],
      [0, -10, "0,S10"],
      [10, 0, "E10,0"],
      [-10, 0, "W10,0"],
      [0, 10, "0,N10"],
      [-10, -10, "W10,S10"],
      [-10, 10, "W10,N10"],
      [10, -10, "E10,S10"],
      [
        INT128_MIN.add(1),
        INT128_MAX.sub(1),
        "W170141183460469231731687303715884105727,N170141183460469231731687303715884105726",
      ],
      [
        INT128_MAX.sub(1),
        INT128_MIN.add(1),
        "E170141183460469231731687303715884105726,S170141183460469231731687303715884105727",
      ],
      [
        INT128_MIN,
        INT128_MAX,
        "W170141183460469231731687303715884105728,N170141183460469231731687303715884105727",
      ],
      [
        INT128_MAX,
        INT128_MIN,
        "E170141183460469231731687303715884105727,S170141183460469231731687303715884105728",
      ],
    ];

    for (let i = 0; i < dataList.length; i++) {
      const ix = dataList[i][0];
      const iy = dataList[i][1];
      console.log("ix, iy", ix.toString(), iy.toString());
      const str = await landNFTToken.getCoordinatesString(ix, iy);
      expect(str).to.eq(dataList[i][2]);
      console.log("str", str);
    }
  });

  it("token uri", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    let tokenId = await landNFTToken.getTokenId(1, 1);
    await expect(landNFTToken.tokenURI(tokenId)).to.revertedWith("not buyed");

    tokenId = await landNFTToken.getTokenId(0, 0);
    let content = await landNFTToken.tokenURI(tokenId);
    console.log(content);

    await (
      await landNFTToken
        .connect(w1)
        .buy(100, -10, { value: BigNumber.from(10).pow(18) })
    ).wait();
    tokenId = await landNFTToken.getTokenId(100, -10);
    content = await landNFTToken.tokenURI(tokenId);
    console.log(content);

    await (await landNFTToken.connect(w1).giveTo(100, -10, w2.address)).wait();
    tokenId = await landNFTToken.getTokenId(100, -10);
    content = await landNFTToken.tokenURI(tokenId);
    console.log(content);

    await (
      await landNFTToken.connect(w2).setSlogan(100, -10, "hahahah")
    ).wait();
    tokenId = await landNFTToken.getTokenId(100, -10);
    content = await landNFTToken.tokenURI(tokenId);
    console.log(content);

    const a = await landNFTToken.getBuyLands(w1.address);

    console.log(a);
    console.log(a[0].x);
  });

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

    await exceptBuyAndGive(landNFTToken, w1, w2, 1, -2, []);
    await exceptBuyAndGive(landNFTToken, w1, w3, 2, -3, [[1, -2, w2.address]]);

    await exceptBuyAndGive(landNFTToken, w2, w4, 3, -4, []);
    await exceptBuyAndGive(landNFTToken, w2, w5, 4, -5, [[3, -4, w4.address]]);

    await exceptBuyAndGive(landNFTToken, w3, w6, 5, -6, []);
    await exceptBuyAndGive(landNFTToken, w3, w7, 6, -7, [[5, -6, w6.address]]);

    await exceptBuyAndGive(landNFTToken, w4, w8, 7, -8, []);
    await exceptBuyAndGive(landNFTToken, w4, w9, 8, -9, [[7, -8, w8.address]]);

    await exceptBuyAndGive(landNFTToken, w5, w10, 9, -10, []);
    await exceptBuyAndGive(landNFTToken, w5, w11, 10, -11, [
      [9, -10, w10.address],
    ]);

    await exceptBuyAndGive(landNFTToken, w6, w12, 11, -12, []);
    await exceptBuyAndGive(landNFTToken, w6, w13, 12, -13, [
      [11, -12, w12.address],
    ]);

    await exceptBuyAndGive(landNFTToken, w7, w14, 13, -14, []);
    await exceptBuyAndGive(landNFTToken, w7, w15, 14, -15, [
      [13, -14, w14.address],
    ]);
  });

  it("buy cast eth", async () => {
    const [w1, w2, w3] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    const PRICE = await landNFTToken.PRICE();

    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(0);

    await exceptBuyCost(PRICE, landNFTToken, 1, 1, w1, BigNumber.from(10).pow(18));
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE
    );
    await exceptBuyCost(PRICE, landNFTToken, 2, 2, w1, PRICE);
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(2)
    );

    await (await landNFTToken.connect(w1).giveTo(1, 1, w2.address)).wait();
    await exceptBuyCost(PRICE, landNFTToken, 3, 3, w2, PRICE.add(100));
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(3)
    );
    await expectGetEth(landNFTToken, w1);
  });
});
