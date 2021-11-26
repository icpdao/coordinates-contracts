import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { PeopleLand } from "../typechain";

describe("PeopleLand.setSlogan.error", async () => {
  it("not owner", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as PeopleLand;

    await expect(
      landNFTToken.connect(w1).setSlogan(112, 112, "123")
    ).to.revertedWith("land not minted");

    await (
      await landNFTToken
        .connect(w1)
        .mint(112, 112, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken.connect(w1).setSlogan(112, 112, "123")
    ).to.revertedWith("ERC721: owner query for nonexistent token");

    await (await landNFTToken.connect(w1).giveTo(112, 112, w2.address)).wait();
    await expect(
      landNFTToken.connect(w1).setSlogan(112, 112, "123")
    ).to.revertedWith("land is not belong to caller");
    await (
      await landNFTToken.connect(w2).setSlogan(112, 112, "hahahah <br/>123")
    ).wait();
    expect((await landNFTToken.land(112, 112)).slogan).eq("hahahah <br/>123");
  });
});
