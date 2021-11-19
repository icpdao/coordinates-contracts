import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { LootLand } from "../typechain";
import * as fs from "fs";

const showXY = async (contract: any, x: any, y: any, title: any) => {
  const tokenId = await contract.getTokenId(x, y);
  const content: string = await contract.tokenURI(tokenId);
  let str: string = content.split(",")[1];
  let buff = Buffer.from(str, "base64");
  str = buff.toString("ascii");
  str = JSON.parse(str).image;
  str = str.split(",")[1];
  buff = Buffer.from(str, "base64");
  str = buff.toString("ascii");
  fs.writeFile("./tmp/" + title + ".svg", str, (err: any) => {
    if (err) {
      console.error(err);
    }
  });
};

describe("LootLand.tokenid", async () => {
  it("generate tokenid", async () => {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10, w11] =
      await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

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
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    const INT128_MIN = BigNumber.from(2).pow(127).mul(-1);
    const INT128_MAX = BigNumber.from(2).pow(127).sub(1);

    const dataList = [
      [0, 0, "0", "0"],
      [10, 11, "E10", "N11"],
      [0, -10, "0", "S10"],
      [10, 0, "E10", "0"],
      [-10, 0, "W10", "0"],
      [0, 10, "0", "N10"],
      [-10, -11, "W10", "S11"],
      [-10, 11, "W10", "N11"],
      [10, -11, "E10", "S11"],
      [
        INT128_MIN.add(1),
        INT128_MAX.sub(1),
        "W170141183460469231731687303715884105727",
        "N170141183460469231731687303715884105726",
      ],
      [
        INT128_MAX.sub(1),
        INT128_MIN.add(1),
        "E170141183460469231731687303715884105726",
        "S170141183460469231731687303715884105727",
      ],
      [
        INT128_MIN,
        INT128_MAX,
        "W170141183460469231731687303715884105728",
        "N170141183460469231731687303715884105727",
      ],
      [
        INT128_MAX,
        INT128_MIN,
        "E170141183460469231731687303715884105727",
        "S170141183460469231731687303715884105728",
      ],
    ];

    for (let i = 0; i < dataList.length; i++) {
      const ix = dataList[i][0];
      const iy = dataList[i][1];
      // console.log("ix, iy", ix.toString(), iy.toString());
      const [sx, sy] = await landNFTToken.getCoordinatesStrings(ix, iy);
      expect(sx).to.eq(dataList[i][2]);
      expect(sy).to.eq(dataList[i][3]);
      // console.log("str", str);
    }
  });

  it("token uri sologan", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    await showXY(landNFTToken, 0, 0, "slogan__0_0_no_slogan");

    await (
      await landNFTToken.connect(w1).setSlogan(0, 0, "hello world!")
    ).wait();
    await showXY(landNFTToken, 0, 0, "slogan__0_0_set_one_line_slogan");

    await (
      await landNFTToken.connect(w1).setSlogan(0, 0, "<br/><br/>hello world!")
    ).wait();
    await showXY(landNFTToken, 0, 0, "slogan__0_0_set_br_br_one_line_slogan");

    await (
      await landNFTToken
        .connect(w1)
        .mint(11, -10, { value: BigNumber.from(10).pow(18) })
    ).wait();

    // tokenId = await landNFTToken.getTokenId(0, 0);
    // content = await landNFTToken.tokenURI(tokenId);
    // console.log("0,0 mint one not give", content);
    //
    // await (
    //   await landNFTToken
    //     .connect(w1)
    //     .mint(100, -10, { value: BigNumber.from(10).pow(18) })
    // ).wait();
    // tokenId = await landNFTToken.getTokenId(100, -10);
    // content = await landNFTToken.tokenURI(tokenId);
    // console.log("100,-10 mint", content);
    //
    // await (await landNFTToken.connect(w1).giveTo(100, -10, w2.address)).wait();
    // tokenId = await landNFTToken.getTokenId(100, -10);
    // content = await landNFTToken.tokenURI(tokenId);
    // console.log("100,-10, gived", content);
    //
    // await (
    //   await landNFTToken.connect(w2).setSlogan(100, -10, "hahah<br/>ah")
    // ).wait();
    // tokenId = await landNFTToken.getTokenId(100, -10);
    // content = await landNFTToken.tokenURI(tokenId);
    // console.log("100,-10 have slogan", content);
  });

  it("token uri invited", async () => {
    const [w1, w2, w3] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    await showXY(landNFTToken, 0, 0, "001_invited__0_0");

    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(11, -10, w2.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();

    await showXY(landNFTToken, 11, -10, "002_invited__11_-10_is_0_0");

    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(13, -14, w3.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();

    await showXY(landNFTToken, 13, -14, "003_invited__13_-14_is_11_-10");
  });

  it("token uri mint and giveto", async () => {
    const [w1, w2, w3, w4, w5] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    await showXY(landNFTToken, 0, 0, "004_mint_and_giveto__0_0_no");

    await (
      await landNFTToken
        .connect(w1)
        .mint(2, 3,{ value: BigNumber.from(10).pow(18) })
    ).wait();

    await showXY(landNFTToken, 0, 0, "005_mint_and_giveto__0_0_m1#1(2,3)");

    await (
      await landNFTToken
        .connect(w1)
        .mint(12, 13,{ value: BigNumber.from(10).pow(18) })
    ).wait();

    await showXY(landNFTToken, 0, 0, "006_mint_and_giveto__0_0_m2#1(2,3)_#2(12,13)");

    await (
      await landNFTToken
        .connect(w1)
        .giveTo(2, 3, w2.address)
    ).wait();

    await showXY(landNFTToken, 0, 0, "007_mint_and_giveto__0_0_m1#2(12,13)_g1#1(2,3)");

    await (
      await landNFTToken
        .connect(w1)
        .giveTo(12, 13, w3.address)
    ).wait();

    await showXY(landNFTToken, 0, 0, "008_mint_and_giveto__0_0_g2#1(2,3)#2(12,13)");

    //
    await showXY(landNFTToken, 2, 3, "009_mint_and_giveto__2_3_no");

    await (
      await landNFTToken
        .connect(w2)
        .mint(20, 30,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 2, 3, "010_mint_and_giveto__2_3_m1#3(20,30)");

    await (
      await landNFTToken
        .connect(w2)
        .mint(120, 130,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 2, 3, "011_mint_and_giveto__2_3_m2#3(20,30)_#4(120,130)");

    await (
      await landNFTToken
        .connect(w2)
        .giveTo(20, 30, w4.address)
    ).wait();
    await showXY(landNFTToken, 2, 3, "012_mint_and_giveto__2_3_m1#4(120,130)_g1#3(20,30)");

    await (
      await landNFTToken
        .connect(w2)
        .giveTo(120, 130, w5.address)
    ).wait();
    await showXY(landNFTToken, 2, 3, "013_mint_and_giveto__2_3_g2#3(20,30)#4(120,130)");

  });

  it("token uri mint and giveto 2", async () => {
    const [w1, w2, w3, w4, w5] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    await showXY(landNFTToken, 0, 0, "014_mint_and_giveto2__0_0_no");


    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(2, 3, w2.address, {value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 0, 0, "015_mint_and_giveto2__0_0_g1#1(2,3)");

    //
    await showXY(landNFTToken, 2, 3, "016_mint_and_giveto2__2_3_no");

    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(20, 30, w4.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 2, 3, "017_mint_and_giveto2__2_3_g1#1(20,30)");
  });

  it("token uri mint and neighbors", async () => {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    await showXY(landNFTToken, 0, 0, "018_neighbors__0_0_no");
    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(-1, 1, w2.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 0, 0, "019_neighbors__0_0_have_1");
    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(0, 1, w3.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 0, 0, "020_neighbors__0_0_have_2");
    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(1, 1, w4.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 0, 0, "021_neighbors__0_0_have_3");
    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(-1, 0, w5.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 0, 0, "022_neighbors__0_0_have_4");
    await (
      await landNFTToken
        .connect(w3)
        .mintAndGiveTo(1, 0, w6.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 0, 0, "023_neighbors__0_0_have_5");
    await (
      await landNFTToken
        .connect(w3)
        .mintAndGiveTo(-1, -1, w7.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 0, 0, "023_neighbors__0_0_have_6");
    await (
      await landNFTToken
        .connect(w4)
        .mintAndGiveTo(0, -1, w8.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 0, 0, "023_neighbors__0_0_have_7");
    await (
      await landNFTToken
        .connect(w4)
        .mintAndGiveTo(1, -1, w9.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 0, 0, "023_neighbors__0_0_have_8");
  });

  it("token uri mint and neighbors 2", async () => {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    const x = 10;
    const y = 10;

    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(10, 10, w2.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, x, y, "024_neighbors__10_10_no");
    await (
      await landNFTToken.connect(w2).mintAndGiveTo(x - 1, y + 1, w3.address, {
        value: BigNumber.from(10).pow(18),
      })
    ).wait();
    await showXY(landNFTToken, x, y, "025_neighbors__10_10_have_1");
    await (
      await landNFTToken.connect(w2).mintAndGiveTo(x, y + 1, w4.address, {
        value: BigNumber.from(10).pow(18),
      })
    ).wait();
    await showXY(landNFTToken, x, y, "026_neighbors__10_10_have_2");
    await (
      await landNFTToken
        .connect(w3)
        .mintAndGiveTo(x+1, y+1, w5.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, x, y, "027_neighbors__10_10_have_3");
    await (
      await landNFTToken
        .connect(w3)
        .mintAndGiveTo(x-1, y, w6.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, x, y, "028_neighbors__10_10_have_4");
    await (
      await landNFTToken
        .connect(w4)
        .mintAndGiveTo(x+1, y, w7.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, x, y, "029_neighbors__10_10_have_5");
    await (
      await landNFTToken
        .connect(w4)
        .mintAndGiveTo(x-1, y-1, w8.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, x, y, "030_neighbors__10_10_have_6");
    await (
      await landNFTToken
        .connect(w5)
        .mintAndGiveTo(x, y-1, w9.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, x, y, "031_neighbors__10_10_have_7");
    await (
      await landNFTToken
        .connect(w5)
        .mintAndGiveTo(x+1, y-1, w10.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, x, y, "032_neighbors__10_10_have_8");
  });

  it("neighbors outside 1", async () => {
    const [w1, w2, w3, w4, w5, w6, w7, w8, w9, w10] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    const INT128_MIN = BigNumber.from(2).pow(127).mul(-1);
    const INT128_MAX = BigNumber.from(2).pow(127).sub(1);

    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(INT128_MIN, INT128_MAX, w2.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, INT128_MIN, INT128_MAX, "033_neighbors__min_max_no");
    await (
      await landNFTToken
        .connect(w1)
        .mintAndGiveTo(0, INT128_MAX, w3.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 0, INT128_MAX, "034_neighbors__0_max_no");
    await (
      await landNFTToken
        .connect(w2)
        .mintAndGiveTo(INT128_MAX, INT128_MAX, w4.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, INT128_MAX, INT128_MAX, "035_neighbors__max_max_no");
    await (
      await landNFTToken
        .connect(w3)
        .mintAndGiveTo(INT128_MIN, 0, w5.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, INT128_MIN, 0, "036_neighbors__min_0_no");
    await (
      await landNFTToken
        .connect(w3)
        .mintAndGiveTo(INT128_MAX, 0, w6.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, INT128_MAX, 0, "037_neighbors__max_0_no");
    await (
      await landNFTToken
        .connect(w4)
        .mintAndGiveTo(INT128_MIN, INT128_MIN, w7.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, INT128_MIN, INT128_MIN, "038_neighbors__min_min_no");
    await (
      await landNFTToken
        .connect(w4)
        .mintAndGiveTo(0, INT128_MIN, w8.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, 0, INT128_MIN, "039_neighbors__0_min_no");
    await (
      await landNFTToken
        .connect(w5)
        .mintAndGiveTo(INT128_MAX, INT128_MIN, w9.address,{ value: BigNumber.from(10).pow(18) })
    ).wait();
    await showXY(landNFTToken, INT128_MAX, INT128_MIN, "040_neighbors__max_min_no");
  });
});
