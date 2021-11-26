import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// eslint-disable-next-line node/no-missing-import
import { PeopleLand } from "../typechain";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";

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
  landContract: PeopleLand,
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

const expectMintSelf = async (contract: any, w: any, x: any, y: any) => {
  const [isGived2, givedLand2] = await contract.givedLand(
    w.address
  );
  expectLand(
    givedLand2,
    givedLand2.isMinted,
    isGived2,
    x,
    y,
    "",
    ZERO_ADDRESS,
    w.address,
    true,
    true
  );
  const land100 = await contract.land(x, y);
  expectLand(
    land100,
    land100.isMinted,
    land100.isGived,
    x,
    y,
    "",
    ZERO_ADDRESS,
    w.address,
    true,
    true
  );
};

describe("PeopleLand.mintToSelf", async () => {
  it("mint to self and mint give to", async () => {
    const [
      deployAcc,
      owner,
      w1,
      wWiiteList1,
      w2,
      w3,
      w4,
      w5,
      w6,
      w7,
      w8,
      w9,
      w10,
      w11,
      w12,
      w13,
      w14,
      w15,
    ] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.connect(deployAcc).deploy(
      owner.address,
      w1.address
    )) as PeopleLand;

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

    await (
      await landNFTToken
        .connect(wWiiteList1)
        .mintToSelf(
          30,
          -30,
          "0xc4281b3214e620b93415b5865789810d6924d18e26959c759cdc29b16909b3a5",
          27,
          "0x1fa1de2bdbb061e3a7786854c708a5ed3a8a0c905ff0af74b1841702e1dd3e1f",
          "0x2236b862a8741f8cccbac01b8b519c4bce6969533ff3c91721ddb39de6341a74"
        )
    ).wait();

    const [isGived2, givedLand2] = await landNFTToken.givedLand(
      wWiiteList1.address
    );
    expectLand(
      givedLand2,
      givedLand2.isMinted,
      isGived2,
      30,
      -30,
      "",
      ZERO_ADDRESS,
      wWiiteList1.address,
      true,
      true
    );
    const land100 = await landNFTToken.land(30, -30);
    expectLand(
      land100,
      land100.isMinted,
      land100.isGived,
      30,
      -30,
      "",
      ZERO_ADDRESS,
      wWiiteList1.address,
      true,
      true
    );

    await exceptMintAndGiveTwoStep(landNFTToken, wWiiteList1, w2, 111, -112, []);
    await exceptMintAndGiveTwoStep(landNFTToken, wWiiteList1, w3, 112, -113, [
      [111, -112, w2.address],
    ]);

    await exceptMintAndGiveTwoStep(landNFTToken, w2, w4, 113, -114, []);
    await exceptMintAndGiveTwoStep(landNFTToken, w2, w5, 114, -115, [
      [113, -114, w4.address],
    ]);

    await exceptMintAndGiveTwoStep(landNFTToken, w3, w6, 115, -116, []);
    await exceptMintAndGiveTwoStep(landNFTToken, w3, w7, 116, -117, [
      [115, -116, w6.address],
    ]);

    await exceptMintAndGiveTwoStep(landNFTToken, w4, w8, 117, -118, []);
    await exceptMintAndGiveTwoStep(landNFTToken, w4, w9, 118, -119, [
      [117, -118, w8.address],
    ]);

    await exceptMintAndGiveTwoStep(landNFTToken, w5, w10, 119, -120, []);
    await exceptMintAndGiveTwoStep(landNFTToken, w5, w11, 120, -121, [
      [119, -120, w10.address],
    ]);

    await exceptMintAndGiveTwoStep(landNFTToken, w6, w12, 121, -122, []);
    await exceptMintAndGiveTwoStep(landNFTToken, w6, w13, 122, -123, [
      [121, -122, w12.address],
    ]);

    await exceptMintAndGiveTwoStep(landNFTToken, w7, w14, 123, -124, []);
    await exceptMintAndGiveTwoStep(landNFTToken, w7, w15, 124, -125, [
      [123, -124, w14.address],
    ]);
  });

  it("mint cast eth", async () => {
    const [w1, wWiiteList1, w2, w3] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      wWiiteList1.address,
      w1.address
    )) as PeopleLand;

    await (
      await landNFTToken
        .connect(wWiiteList1)
        .mintToSelf(
          100,
          100,
          "0xaf6ad62b5e6d1f690412d722469494cc7b34c7471fa095cc710b3fe52e35adab",
          27,
          "0x9c1685e3173730206236aedac26f445235eca79e137fbedf4e88599655fc5748",
          "0x6c519fb9a2b64221702fe271823abba685e7a6d5e5fefae1a42681135b63fb4e"
        )
    ).wait();

    const PRICE = await landNFTToken.PRICE();

    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(0);

    await exceptMintCost(
      PRICE,
      landNFTToken,
      111,
      111,
      wWiiteList1,
      BigNumber.from(10).pow(18)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(PRICE);
    await exceptMintCost(PRICE, landNFTToken, 112, 112, wWiiteList1, PRICE);
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(2)
    );

    await (await landNFTToken.connect(wWiiteList1).giveTo(111, 111, w2.address)).wait();
    await exceptMintCost(PRICE, landNFTToken, 113, 113, w2, PRICE.add(100));
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(3)
    );
    await expectGetEth(landNFTToken, wWiiteList1);
  });

  it("mint 31 -31", async () => {
    const [
      deployAcc,
      owner,
      w1,
      wWiiteList1
    ] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.connect(deployAcc).deploy(
      owner.address,
      w1.address
    )) as PeopleLand;

    expect(await landNFTToken.owner()).eq(owner.address);

    const [x, y] = [31, -31];
    await (
      await landNFTToken
        .connect(wWiiteList1)
        .mintToSelf(
          x,
          y,
          "0xc4281b3214e620b93415b5865789810d6924d18e26959c759cdc29b16909b3a5",
          27,
          "0x1fa1de2bdbb061e3a7786854c708a5ed3a8a0c905ff0af74b1841702e1dd3e1f",
          "0x2236b862a8741f8cccbac01b8b519c4bce6969533ff3c91721ddb39de6341a74"
        )
    ).wait();

    expectMintSelf(landNFTToken, wWiiteList1, x, y);
  });

  it("mint 3 -3", async () => {
    const [
      deployAcc,
      owner,
      w1,
      wWiiteList1
    ] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.connect(deployAcc).deploy(
      owner.address,
      w1.address
    )) as PeopleLand;

    expect(await landNFTToken.owner()).eq(owner.address);

    const [x, y] = [3, -3];
    await (
      await landNFTToken
        .connect(wWiiteList1)
        .mintToSelf(
          x,
          y,
          "0xc4281b3214e620b93415b5865789810d6924d18e26959c759cdc29b16909b3a5",
          27,
          "0x1fa1de2bdbb061e3a7786854c708a5ed3a8a0c905ff0af74b1841702e1dd3e1f",
          "0x2236b862a8741f8cccbac01b8b519c4bce6969533ff3c91721ddb39de6341a74"
        )
    ).wait();

    expectMintSelf(landNFTToken, wWiiteList1, x, y);
  });

  it("mint 0 3", async () => {
    const [
      deployAcc,
      owner,
      w1,
      wWiiteList1
    ] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.connect(deployAcc).deploy(
      owner.address,
      w1.address
    )) as PeopleLand;

    expect(await landNFTToken.owner()).eq(owner.address);

    const [x, y] = [0, 3];
    await (
      await landNFTToken
        .connect(wWiiteList1)
        .mintToSelf(
          x,
          y,
          "0xc4281b3214e620b93415b5865789810d6924d18e26959c759cdc29b16909b3a5",
          27,
          "0x1fa1de2bdbb061e3a7786854c708a5ed3a8a0c905ff0af74b1841702e1dd3e1f",
          "0x2236b862a8741f8cccbac01b8b519c4bce6969533ff3c91721ddb39de6341a74"
        )
    ).wait();

    expectMintSelf(landNFTToken, wWiiteList1, x, y);
  });

  it("mint 0 -3", async () => {
    const [
      deployAcc,
      owner,
      w1,
      wWiiteList1
    ] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.connect(deployAcc).deploy(
      owner.address,
      w1.address
    )) as PeopleLand;

    expect(await landNFTToken.owner()).eq(owner.address);

    const [x, y] = [0, -3];
    await (
      await landNFTToken
        .connect(wWiiteList1)
        .mintToSelf(
          x,
          y,
          "0xc4281b3214e620b93415b5865789810d6924d18e26959c759cdc29b16909b3a5",
          27,
          "0x1fa1de2bdbb061e3a7786854c708a5ed3a8a0c905ff0af74b1841702e1dd3e1f",
          "0x2236b862a8741f8cccbac01b8b519c4bce6969533ff3c91721ddb39de6341a74"
        )
    ).wait();

    expectMintSelf(landNFTToken, wWiiteList1, x, y);
  });

  it("mint 3 0", async () => {
    const [
      deployAcc,
      owner,
      w1,
      wWiiteList1
    ] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.connect(deployAcc).deploy(
      owner.address,
      w1.address
    )) as PeopleLand;

    expect(await landNFTToken.owner()).eq(owner.address);

    const [x, y] = [3, 0];
    await (
      await landNFTToken
        .connect(wWiiteList1)
        .mintToSelf(
          x,
          y,
          "0xc4281b3214e620b93415b5865789810d6924d18e26959c759cdc29b16909b3a5",
          27,
          "0x1fa1de2bdbb061e3a7786854c708a5ed3a8a0c905ff0af74b1841702e1dd3e1f",
          "0x2236b862a8741f8cccbac01b8b519c4bce6969533ff3c91721ddb39de6341a74"
        )
    ).wait();

    expectMintSelf(landNFTToken, wWiiteList1, x, y);
  });

  it("mint -3 0", async () => {
    const [
      deployAcc,
      owner,
      w1,
      wWiiteList1
    ] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.connect(deployAcc).deploy(
      owner.address,
      w1.address
    )) as PeopleLand;

    expect(await landNFTToken.owner()).eq(owner.address);

    const [x, y] = [-3, 0];
    await (
      await landNFTToken
        .connect(wWiiteList1)
        .mintToSelf(
          x,
          y,
          "0xc4281b3214e620b93415b5865789810d6924d18e26959c759cdc29b16909b3a5",
          27,
          "0x1fa1de2bdbb061e3a7786854c708a5ed3a8a0c905ff0af74b1841702e1dd3e1f",
          "0x2236b862a8741f8cccbac01b8b519c4bce6969533ff3c91721ddb39de6341a74"
        )
    ).wait();

    expectMintSelf(landNFTToken, wWiiteList1, x, y);
  });
});
