import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// eslint-disable-next-line node/no-missing-import
import { LootLand } from "../typechain";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const GAS_PRICE = 200000000000;

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

const exceptMintAndGiveTwoStep = async (
  landContract: LootLand,
  minted: SignerWithAddress,
  gived: SignerWithAddress,
  x: any,
  y: any,
  minteBefore: any
) => {
  expect(await landContract.mintLandCount(minted.address)).eq(
    minteBefore.length
  );
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

  await expect(landContract.getTokenId(x, y)).to.be.revertedWith("not minted");

  await (
    await landContract
      .connect(minted)
      .mint(x, y, { value: BigNumber.from(10).pow(18) })
  ).wait();
  land = await landContract.land(x, y);
  expectLand(
    land,
    land.isMinted,
    land.isGived,
    x,
    y,
    "",
    minted.address,
    ZERO_ADDRESS,
    true,
    false
  );

  await expect(
    landContract.ownerOf(await landContract.getTokenId(x, y))
  ).to.be.revertedWith("ERC721: owner query for nonexistent token");

  expect(await landContract.mintLandCount(minted.address)).eq(
    minteBefore.length + 1
  );
  const mintlands2 = await landContract.getMintLands(minted.address);
  if (minteBefore.length === 0) {
    expect(mintlands2.length).eq(1);
    expect(mintlands2[0].x).eq(x);
    expect(mintlands2[0].y).eq(y);
    expect(mintlands2[0].mintedAddress).eq(minted.address);
    expect(mintlands2[0].givedAddress).eq(ZERO_ADDRESS);
    expect(mintlands2[0].isMinted).eq(true);
    expect(mintlands2[0].isGived).eq(false);
  } else {
    expect(mintlands2.length).eq(2);
    expect(mintlands2[0].x).eq(minteBefore[0][0]);
    expect(mintlands2[0].y).eq(minteBefore[0][1]);
    expect(mintlands2[0].mintedAddress).eq(minted.address);
    expect(mintlands2[0].givedAddress).eq(minteBefore[0][2]);
    expect(mintlands2[0].isMinted).eq(true);
    expect(mintlands2[0].isGived).eq(true);

    expect(mintlands2[1].x).eq(x);
    expect(mintlands2[1].y).eq(y);
    expect(mintlands2[1].mintedAddress).eq(minted.address);
    expect(mintlands2[1].givedAddress).eq(ZERO_ADDRESS);
    expect(mintlands2[1].isMinted).eq(true);
    expect(mintlands2[1].isGived).eq(false);
  }

  await (await landContract.connect(minted).giveTo(x, y, gived.address)).wait();

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
  ethValue: any
) => {
  const mintBeforeEthCon = await ethers.provider.getBalance(contract.address);
  const mintBeforeEthW1 = await minted.getBalance();

  const result = await (
    await contract.connect(minted).mint(x, y, {
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

describe("LootLand.mintToBuilderByOwner", async () => {
  it("mint and give", async () => {
    const [
      deployAcc,
      owner,
      w1
    ] = await ethers.getSigners();
    const wList = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.connect(deployAcc).deploy(
      owner.address,
      w1.address
    )) as LootLand;

    expect(await landNFTToken.owner()).eq(owner.address);

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

    const land0 = await landNFTToken.land(0, 0);
    expectLand(
      land0,
      land0.isMinted,
      land0.isGived,
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
        const w = wList[3+i]

        await (await landNFTToken
          .connect(owner)
          .mintToBuilderByOwner(
            xy[0],
            xy[1],
            w.address
        )).wait()
       
        const [isGivedw, givedLandw] = await landNFTToken.givedLand(
          w.address
        );
        expectLand(
          givedLandw,
          givedLandw.isMinted,
          isGivedw,
          xy[0],
          xy[1],
          "",
          ZERO_ADDRESS,
          w.address,
          true,
          true
        );
        const landw = await landNFTToken.land(xy[0], xy[1]);
        expectLand(
          landw,
          landw.isMinted,
          landw.isGived,
          xy[0],
          xy[1],
          "",
          ZERO_ADDRESS,
          w.address,
          true,
          true
        );
      }


    const wb = wList[11];
    const w2 = wList[30];
    const w3 = wList[31];
    const w4 = wList[32];
    const w5 = wList[33];
    const w6 = wList[34];
    const w7 = wList[35];
    const w8 = wList[36];
    const w9 = wList[37];
    const w10 = wList[38];
    const w11 = wList[39];
    const w12 = wList[40];
    const w13 = wList[41];
    const w14 = wList[42];
    const w15 = wList[43];
    await exceptMintAndGiveTwoStep(landNFTToken, wb, w2, 11, -12, []);
    await exceptMintAndGiveTwoStep(landNFTToken, wb, w3, 12, -13, [
      [11, -12, w2.address],
    ]);

    await exceptMintAndGiveTwoStep(landNFTToken, w2, w4, 13, -14, []);
    await exceptMintAndGiveTwoStep(landNFTToken, w2, w5, 14, -15, [
      [13, -14, w4.address],
    ]);

    await exceptMintAndGiveTwoStep(landNFTToken, w3, w6, 15, -16, []);
    await exceptMintAndGiveTwoStep(landNFTToken, w3, w7, 16, -17, [
      [15, -16, w6.address],
    ]);

    await exceptMintAndGiveTwoStep(landNFTToken, w4, w8, 17, -18, []);
    await exceptMintAndGiveTwoStep(landNFTToken, w4, w9, 18, -19, [
      [17, -18, w8.address],
    ]);

    await exceptMintAndGiveTwoStep(landNFTToken, w5, w10, 19, -20, []);
    await exceptMintAndGiveTwoStep(landNFTToken, w5, w11, 20, -21, [
      [19, -20, w10.address],
    ]);

    await exceptMintAndGiveTwoStep(landNFTToken, w6, w12, 21, -22, []);
    await exceptMintAndGiveTwoStep(landNFTToken, w6, w13, 22, -23, [
      [21, -22, w12.address],
    ]);

    await exceptMintAndGiveTwoStep(landNFTToken, w7, w14, 23, -24, []);
    await exceptMintAndGiveTwoStep(landNFTToken, w7, w15, 24, -25, [
      [23, -24, w14.address],
    ]);
  });

  it("mint cast eth", async () => {
    const [w1, owner, wWiiteList1, w2, w3] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      owner.address,
      w1.address
    )) as LootLand;

    await (
      await landNFTToken
        .connect(owner)
        .mintToBuilderByOwner(
          1,
          1,
          wWiiteList1.address
        )
    ).wait();

    const PRICE = await landNFTToken.PRICE();

    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(0);

    await exceptMintCost(
      PRICE,
      landNFTToken,
      11,
      11,
      wWiiteList1,
      BigNumber.from(10).pow(18)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(PRICE);
    await exceptMintCost(PRICE, landNFTToken, 12, 12, wWiiteList1, PRICE);
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(2)
    );

    await (await landNFTToken.connect(wWiiteList1).giveTo(11, 11, w2.address)).wait();
    await exceptMintCost(PRICE, landNFTToken, 13, 13, w2, PRICE.add(100));
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(3)
    );
    await expectGetEth(landNFTToken, owner);
  });
});
