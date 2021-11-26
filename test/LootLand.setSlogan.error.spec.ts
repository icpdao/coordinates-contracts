import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { LootLand } from "../typechain";

describe("LootLand.setSlogan.error", async () => {
  it("not owner", async () => {
    const [w1, w2] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    await expect(
      landNFTToken.connect(w1).setSlogan(12, 12, "123")
    ).to.revertedWith("land not minted");

    await (
      await landNFTToken
        .connect(w1)
        .mint(12, 12, { value: BigNumber.from(10).pow(18) })
    ).wait();
    await expect(
      landNFTToken.connect(w1).setSlogan(12, 12, "123")
    ).to.revertedWith("ERC721: owner query for nonexistent token");

    await (await landNFTToken.connect(w1).giveTo(12, 12, w2.address)).wait();
    await expect(
      landNFTToken.connect(w1).setSlogan(12, 12, "123")
    ).to.revertedWith("land is not belong to caller");
    await (
      await landNFTToken.connect(w2).setSlogan(12, 12, "hahahah <br/>123")
    ).wait();
    expect((await landNFTToken.land(12, 12)).slogan).eq("hahahah <br/>123");
  });
});
