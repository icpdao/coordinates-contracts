import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import {Land} from "../typechain";
import { base64 } from "ethers/lib/utils";

describe("LandNFT", async () => {
  it("token and coordinates", async () => {
    const [w1] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("Land");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as Land;

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

    for(let i=0; i < dataList.length; i++) {
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
    const LandNFTFactory = await ethers.getContractFactory("Land");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as Land;

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

    for(let i=0; i < dataList.length; i++) {
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
    const LandNFTFactory = await ethers.getContractFactory("Land");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as Land;

    let tokenId = await landNFTToken.getTokenId(1, 1);
    await expect(
      landNFTToken.tokenURI(tokenId)
    ).to.revertedWith("not buyed");

    tokenId = await landNFTToken.getTokenId(0, 0);
    let content = await landNFTToken.tokenURI(tokenId);
    console.log(content);

    await (await landNFTToken.connect(w1).buy(100, -10, {value: BigNumber.from(10).pow(18)})).wait();
    tokenId = await landNFTToken.getTokenId(100, -10);
    content = await landNFTToken.tokenURI(tokenId);
    console.log(content);

    await (await landNFTToken.connect(w1).giveTo(100, -10, w2.address)).wait();
    tokenId = await landNFTToken.getTokenId(100, -10);
    content = await landNFTToken.tokenURI(tokenId);
    console.log(content);

    await (await landNFTToken.connect(w2).setSlogan(100, -10, "hahahah")).wait();
    tokenId = await landNFTToken.getTokenId(100, -10);
    content = await landNFTToken.tokenURI(tokenId);
    console.log(content);
  });
});
