import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { PeopleLand, TokenSVG } from "../typechain";

describe("PeopleLand.setSvg", async () => {
  it("setSvg", async () => {
    const [w1, w2] = await ethers.getSigners();

    const TokenSVGFactory = await ethers.getContractFactory("TokenSVG");
    const tokenSVG = (await TokenSVGFactory.deploy()) as TokenSVG;

    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address,
      w1.address
    )) as PeopleLand;

    await expect(landNFTToken.connect(w2).tokenURI(0)).to.revertedWith("");

    await expect(
      landNFTToken.connect(w2).setTokenSVGAddress(tokenSVG.address)
    ).to.revertedWith("Ownable: caller is not the owner");

    await (
      await landNFTToken.connect(w1).setTokenSVGAddress(tokenSVG.address)
    ).wait();
    expect(await landNFTToken.tokenSVGAddress()).eq(tokenSVG.address);

    await landNFTToken.connect(w2).tokenURI(0);
  });
});
