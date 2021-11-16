import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { LootLand } from "../typechain";

describe("LootLand.tokenid", async () => {
  it("generate tokenid", async () => {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    const INT128_MIN = BigNumber.from(2).pow(127).mul(-1);
    const INT128_MAX = BigNumber.from(2).pow(127).sub(1);

    const coordinates = [
      [10, 11],
      [0, -10],
      [10, 0],
      [-10, 0],
      [0, 10],
      [-11, -10],
      [-10, 11],
      [11, -10],
      [INT128_MIN, INT128_MAX],
      [INT128_MAX, INT128_MIN],
    ];

    const dataList = [
      {
        minted: w1,
        gived1: w2,
        gived1XY: coordinates[0],
        gived2: w3,
        gived2XY: coordinates[1],
      },
      {
        minted: w2,
        gived1: w4,
        gived1XY: coordinates[2],
        gived2: w5,
        gived2XY: coordinates[3],
      },
      {
        minted: w3,
        gived1: w6,
        gived1XY: coordinates[4],
        gived2: w7,
        gived2XY: coordinates[5],
      },
      {
        minted: w4,
        gived1: w8,
        gived1XY: coordinates[6],
        gived2: w9,
        gived2XY: coordinates[7],
      },
      {
        minted: w5,
        gived1: w10,
        gived1XY: coordinates[8],
        gived2: w11,
        gived2XY: coordinates[9],
      },
    ];

    for (let i = 0; i < dataList.length; i++) {
      await (
        await landNFTToken
          .connect(dataList[i].minted)
          .mint2AndGiveTo(
            dataList[i].gived1XY[0],
            dataList[i].gived1XY[1],
            dataList[i].gived1.address,
            dataList[i].gived2XY[0],
            dataList[i].gived2XY[1],
            dataList[i].gived2.address,
            { value: BigNumber.from(10).pow(18) }
          )
      ).wait();
    }

    const [rx, ry] = await landNFTToken.getCoordinates(0);
    expect(rx).eq(0);
    expect(ry).eq(0);

    const rtokenId = await landNFTToken.getTokenId(0, 0);
    expect(rtokenId).eq(0);
    for (let i = 0; i < coordinates.length; i++) {
      const tokenId = i + 1;
      const x = coordinates[i][0];
      const y = coordinates[i][1];
      const [rx, ry] = await landNFTToken.getCoordinates(tokenId);
      expect(rx).eq(x);
      expect(ry).eq(y);

      const rtokenId = await landNFTToken.getTokenId(x, y);
      expect(rtokenId).eq(tokenId);
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
      [-10, -11, "W10,S11"],
      [-10, 11, "W10,N11"],
      [10, -11, "E10,S11"],
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
      // console.log("ix, iy", ix.toString(), iy.toString());
      const str = await landNFTToken.getCoordinatesString(ix, iy);
      expect(str).to.eq(dataList[i][2]);
      // console.log("str", str);
    }
  });

  it("token uri", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    let tokenId = await landNFTToken.getTokenId(0, 0);
    let content = await landNFTToken.tokenURI(tokenId);
    console.log("0,0", content);

    // tokenId = await landNFTToken.getTokenId(1, 1);
    // content = await landNFTToken.tokenURI(tokenId);
    // console.log("1,1 no mint", content);

    await (
      await landNFTToken
        .connect(w1)
        .mint(100, -10, { value: BigNumber.from(10).pow(18) })
    ).wait();
    tokenId = await landNFTToken.getTokenId(100, -10);
    content = await landNFTToken.tokenURI(tokenId);
    console.log("100,-10 mint", content);

    await (await landNFTToken.connect(w1).giveTo(100, -10, w2.address)).wait();
    tokenId = await landNFTToken.getTokenId(100, -10);
    content = await landNFTToken.tokenURI(tokenId);
    console.log("100,-10, gived", content);

    await (
      await landNFTToken.connect(w2).setSlogan(100, -10, "hahah<br/>ah")
    ).wait();
    tokenId = await landNFTToken.getTokenId(100, -10);
    content = await landNFTToken.tokenURI(tokenId);
    console.log("100,-10 have slogan", content);
  });
});
