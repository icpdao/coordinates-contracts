import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { LootLand } from "../typechain";

describe("LootLand.setSlogan.error", async () => {
  it("not owner", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    await expect(
      landNFTToken.connect(w1).setSlogan(2, 2, "123")
    ).to.revertedWith("land not minted");

    await (
      await landNFTToken
        .connect(w1)
        .mint(2, 2, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken.connect(w1).setSlogan(2, 2, "123")
    ).to.revertedWith("ERC721: owner query for nonexistent token");

    await (await landNFTToken.connect(w1).giveTo(2, 2, w2.address)).wait();
    await expect(
      landNFTToken.connect(w1).setSlogan(2, 2, "123")
    ).to.revertedWith("land is not belong to caller");
    await (
      await landNFTToken.connect(w2).setSlogan(2, 2, "hahahah <br/>123")
    ).wait();
    expect((await landNFTToken.land(2, 2)).slogan).eq("hahahah <br/>123");
  });
});
