import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { LootLand } from "../typechain";


describe("LootLand.slogan", async () => {

  it("token uri", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;
    expect((await landNFTToken.land(0, 0)).slogan).eq("");

    await (
      await landNFTToken.connect(w1).setSlogan(0, 0, "123")
    ).wait();
    expect((await landNFTToken.land(0, 0)).slogan).eq("123");

    expect((await landNFTToken.land(100, -10)).slogan).eq("");

    await (
      await landNFTToken
        .connect(w1)
        .mint(100, -10, { value: BigNumber.from(10).pow(18) })
    ).wait();

    expect((await landNFTToken.land(100, -10)).slogan).eq("");

    await (await landNFTToken.connect(w1).giveTo(100, -10, w2.address)).wait();

    expect((await landNFTToken.land(100, -10)).slogan).eq("");

    await (
      await landNFTToken.connect(w2).setSlogan(100, -10, "hahahah 123")
    ).wait();

    expect((await landNFTToken.land(100, -10)).slogan).eq("hahahah 123");

    await (
      await landNFTToken.connect(w2).setSlogan(100, -10, "hahahah <br/>123")
    ).wait();

    expect((await landNFTToken.land(100, -10)).slogan).eq("hahahah <br/>123");
  });
});
