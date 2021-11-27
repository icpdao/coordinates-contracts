import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// eslint-disable-next-line node/no-missing-import
import { PeopleLand } from "../typechain";

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

describe("PeopleLand.mintToSelf.error", async () => {
  it("not in whitelist", async () => {
    const [deployAcc, owner, w1, wWiiteList1] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.connect(deployAcc).deploy(
      owner.address,
      w1.address,
      w1.address
    )) as PeopleLand;

    await (await landNFTToken.connect(owner).openMintSelfSwitch()).wait();

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

    await expect(
      landNFTToken
        .connect(wWiiteList1)
        .mintToSelf(
          100,
          100,
          "0xaf6ad62b5e6d1f690412d722469494cc7b34c7471fa095cc710b3fe52e35adab",
          28,
          "0xc931735518513b2f345c6ff175d7179c7963746195fcca5682a5e3f644567330",
          "0x44b459d3ef18347891d13c9cbdd975946dea793b1a5927a88282c05b02ea3820"
        )
    ).to.revertedWith("not in whitelist");
  });

  it("mintself and not gived", async () => {
    const [deployAcc, owner, w1, wWiiteList1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.connect(deployAcc).deploy(
      owner.address,
      w1.address,
      w1.address
    )) as PeopleLand;

    await (await landNFTToken.connect(owner).openMintSelfSwitch()).wait();

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
          29,
          -29,
          "0xc4281b3214e620b93415b5865789810d6924d18e26959c759cdc29b16909b3a5",
          27,
          "0x1fa1de2bdbb061e3a7786854c708a5ed3a8a0c905ff0af74b1841702e1dd3e1f",
          "0x2236b862a8741f8cccbac01b8b519c4bce6969533ff3c91721ddb39de6341a74"
        )
    ).wait();

    expect(
      await landNFTToken.connect(wWiiteList1).isPeople(wWiiteList1.address)
    ).eq(true);

    await expect(
      landNFTToken.connect(w1).mintAndGiveTo(29, -29, w2.address, {
        value: BigNumber.from(10).pow(18),
      })
    ).to.revertedWith("land is people reserved");
    await expect(
      landNFTToken.connect(w1).mintAndGiveTo(101, 101, wWiiteList1.address, {
        value: BigNumber.from(10).pow(18),
      })
    ).to.revertedWith("givedAddress have gived land");
  });

  it("gived and not mintself", async () => {
    const [deployAcc, owner, w1, wWiiteList1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.connect(deployAcc).deploy(
      owner.address,
      w1.address,
      w1.address
    )) as PeopleLand;

    await (await landNFTToken.connect(owner).openMintSelfSwitch()).wait();

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
        .connect(w1)
        .mintAndGiveTo(100, 100, wWiiteList1.address, {
          value: BigNumber.from(10).pow(18),
        })
    ).wait();

    expect(
      await landNFTToken.connect(wWiiteList1).isPeople(wWiiteList1.address)
    ).eq(false);

    console.log(wWiiteList1.address)
    await expect(
      landNFTToken
        .connect(wWiiteList1)
        .mintToSelf(
          100,
          100,
          "0xc4281b3214e620b93415b5865789810d6924d18e26959c759cdc29b16909b3a5",
          27,
          "0x1fa1de2bdbb061e3a7786854c708a5ed3a8a0c905ff0af74b1841702e1dd3e1f",
          "0x2236b862a8741f8cccbac01b8b519c4bce6969533ff3c91721ddb39de6341a74"
        )
    ).to.revertedWith("caller is minted or have gived");

    await expect(
      landNFTToken.connect(w1).mintAndGiveTo(100, 100, w2.address, {
        value: BigNumber.from(10).pow(18),
      })
    ).to.revertedWith("land is minted");
    await expect(
      landNFTToken.connect(w1).mintAndGiveTo(101, 101, wWiiteList1.address, {
        value: BigNumber.from(10).pow(18),
      })
    ).to.revertedWith("givedAddress have gived land");
  });

  it("mintToSelf reserved", async () => {
    const [deployAcc, owner, w1, wWiiteList1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.connect(deployAcc).deploy(
      owner.address,
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
          .connect(wWiiteList1)
          .mintToSelf(
            xy[0],
            xy[1],
            "0xc4281b3214e620b93415b5865789810d6924d18e26959c759cdc29b16909b3a5",
            27,
            "0x1fa1de2bdbb061e3a7786854c708a5ed3a8a0c905ff0af74b1841702e1dd3e1f",
            "0x2236b862a8741f8cccbac01b8b519c4bce6969533ff3c91721ddb39de6341a74"
          )
      ).to.revertedWith("land is reserved");
    }
  });

  it("close", async () => {
    const [deployAcc, owner, w1, wWiiteList1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.connect(deployAcc).deploy(
      owner.address,
      w1.address,
      w1.address
    )) as PeopleLand;

    expect(await landNFTToken.owner()).eq(owner.address);

    await expect(
      landNFTToken
        .connect(wWiiteList1)
        .mintToSelf(
          29,
          -29,
          "0xc4281b3214e620b93415b5865789810d6924d18e26959c759cdc29b16909b3a5",
          27,
          "0x1fa1de2bdbb061e3a7786854c708a5ed3a8a0c905ff0af74b1841702e1dd3e1f",
          "0x2236b862a8741f8cccbac01b8b519c4bce6969533ff3c91721ddb39de6341a74"
        )
    ).revertedWith("close");

    await expect(landNFTToken.connect(w1).openMintSelfSwitch()).revertedWith("Ownable: caller is not the owner");

    await (await landNFTToken.connect(owner).openMintSelfSwitch()).wait();

    await (
      await landNFTToken
        .connect(wWiiteList1)
        .mintToSelf(
          29,
          -29,
          "0xc4281b3214e620b93415b5865789810d6924d18e26959c759cdc29b16909b3a5",
          27,
          "0x1fa1de2bdbb061e3a7786854c708a5ed3a8a0c905ff0af74b1841702e1dd3e1f",
          "0x2236b862a8741f8cccbac01b8b519c4bce6969533ff3c91721ddb39de6341a74"
        )
    ).wait();

    expect(
      await landNFTToken.connect(wWiiteList1).isPeople(wWiiteList1.address)
    ).eq(true);
  });
});
