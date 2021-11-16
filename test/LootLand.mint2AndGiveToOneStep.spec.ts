import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// eslint-disable-next-line node/no-missing-import
import { LootLand } from "../typechain";

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

const exceptMint2AndGiveOneStep = async (
  landContract: LootLand,
  minted: SignerWithAddress,
  gived1: SignerWithAddress,
  gived2: SignerWithAddress,
  x1: any,
  y1: any,
  x2: any,
  y2: any
) => {
  // expect
  expect(await landContract.mintLandCount(minted.address)).eq(0);
  const mintlands = await landContract.getMintLands(minted.address);
  expect(mintlands.length).eq(0);

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
    land1.isMinted,
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
    land2.isMinted,
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
    landContract.getTokenId(x1, y1)
  ).to.be.revertedWith("not minted");

  await expect(
    landContract.getTokenId(x2, y2)
  ).to.be.revertedWith("not minted");

  // mint2AndGiveTo
  await (
    await landContract
      .connect(minted)
      .mint2AndGiveTo(x1, y1, gived1.address, x2, y2, gived2.address, {
        value: BigNumber.from(10).pow(18),
      })
  ).wait();
  // expect
  expect(await landContract.ownerOf(await landContract.getTokenId(x1, y1))).eq(
    gived1.address
  );
  expect(await landContract.ownerOf(await landContract.getTokenId(x2, y2))).eq(
    gived2.address
  );

  land1 = await landContract.land(x1, y1);
  expectLand(
    land1,
    land1.isMinted,
    land1.isGived,
    x1,
    y1,
    "",
    minted.address,
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
    minted.address,
    gived1.address,
    true,
    true
  );

  land2 = await landContract.land(x2, y2);
  expectLand(
    land2,
    land2.isMinted,
    land2.isGived,
    x2,
    y2,
    "",
    minted.address,
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
    minted.address,
    gived2.address,
    true,
    true
  );

  expect(await landContract.mintLandCount(minted.address)).eq(2);
  const mintlands4 = await landContract.getMintLands(minted.address);
  expect(mintlands4.length).eq(2);

  expect(mintlands4[0].x).eq(x1);
  expect(mintlands4[0].y).eq(y1);
  expect(mintlands4[0].mintedAddress).eq(minted.address);
  expect(mintlands4[0].givedAddress).eq(gived1.address);
  expect(mintlands4[0].isMinted).eq(true);
  expect(mintlands4[0].isGived).eq(true);

  expect(mintlands4[1].x).eq(x2);
  expect(mintlands4[1].y).eq(y2);
  expect(mintlands4[1].mintedAddress).eq(minted.address);
  expect(mintlands4[1].givedAddress).eq(gived2.address);
  expect(mintlands4[1].isMinted).eq(true);
  expect(mintlands4[1].isGived).eq(true);
};

const exceptMint2Cost = async (
  price: any,
  contract: any,
  x1: any,
  y1: any,
  x2: any,
  y2: any,
  minted: any,
  gived1: any,
  gived2: any,
  ethValue: any
) => {
  const mintBeforeEthCon = await ethers.provider.getBalance(contract.address);
  const mintBeforeEthW1 = await minted.getBalance();

  const result = await (
    await contract
      .connect(minted)
      .mint2AndGiveTo(x1, y1, gived1.address, x2, y2, gived2.address, {
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

describe("LootLand.mint2AndGiveToOneStep", async () => {
  it("mint and give to", async () => {
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

    await exceptMint2AndGiveOneStep(landNFTToken, w1, w2, w3, 1, -2, 2, -3);
    await exceptMint2AndGiveOneStep(landNFTToken, w2, w4, w5, 3, -4, 4, -5);
    await exceptMint2AndGiveOneStep(landNFTToken, w3, w6, w7, 5, -6, 6, -7);
    await exceptMint2AndGiveOneStep(landNFTToken, w4, w8, w9, 7, -8, 8, -9);
    await exceptMint2AndGiveOneStep(landNFTToken, w5, w10, w11, 9, -10, 10, -11);
    await exceptMint2AndGiveOneStep(
      landNFTToken,
      w6,
      w12,
      w13,
      11,
      -12,
      12,
      -13
    );
    await exceptMint2AndGiveOneStep(
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

  it("mint cast eth", async () => {
    const [w1, w2, w3, w4, w5, w6, w7] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    const PRICE = await landNFTToken.PRICE();

    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(0);

    await exceptMint2Cost(
      PRICE.mul(2),
      landNFTToken,
      1,
      1,
      2,
      2,
      w1,
      w2,
      w3,
      BigNumber.from(10).pow(18)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(2)
    );
    await exceptMint2Cost(
      PRICE.mul(2),
      landNFTToken,
      3,
      3,
      4,
      4,
      w2,
      w4,
      w5,
      PRICE.mul(2).add(1000)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(4)
    );
    await exceptMint2Cost(
      PRICE.mul(2),
      landNFTToken,
      5,
      5,
      6,
      6,
      w3,
      w6,
      w7,
      PRICE.mul(2)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(6)
    );
    await expectGetEth(landNFTToken, w1);
  });
});
