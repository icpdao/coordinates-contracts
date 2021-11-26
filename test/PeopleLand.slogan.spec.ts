import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { PeopleLand } from "../typechain";


describe("PeopleLand.slogan", async () => {

  it("token uri", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    expect((await landNFTToken.land(0, 0)).slogan).eq("");

    await (
      await landNFTToken.connect(w1).setSlogan(0, 0, "123")
    ).wait();
    expect((await landNFTToken.land(0, 0)).slogan).eq("123");

    expect((await landNFTToken.land(100, -110)).slogan).eq("");

    await (
      await landNFTToken
        .connect(w1)
        .mint(100, -110, { value: BigNumber.from(10).pow(18) })
    ).wait();

    expect((await landNFTToken.land(100, -110)).slogan).eq("");

    await (await landNFTToken.connect(w1).giveTo(100, -110, w2.address)).wait();

    expect((await landNFTToken.land(100, -110)).slogan).eq("");

    await (
      await landNFTToken.connect(w2).setSlogan(100, -110, "hahahah 123")
    ).wait();

    expect((await landNFTToken.land(100, -110)).slogan).eq("hahahah 123");

    await (
      await landNFTToken.connect(w2).setSlogan(100, -110, "hahahah <br/>123")
    ).wait();

    expect((await landNFTToken.land(100, -110)).slogan).eq("hahahah <br/>123");
  });
});
