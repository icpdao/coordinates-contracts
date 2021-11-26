import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
// eslint-disable-next-line node/no-missing-import
import { LootLand } from "../typechain";

const GAS_PRICE = 200000000000;

const exceptMint2Cost = async (
  price: any,
  contract: any,
  x1: any,
  y1: any,
  x2: any,
  y2: any,
  minted: any,
  gived1: any,
  gived2: any,
  ethValue: any
) => {
  const mintBeforeEthCon = await ethers.provider.getBalance(contract.address);
  const mintBeforeEthW1 = await minted.getBalance();

  const result = await (
    await contract
      .connect(minted)
      .mint2AndGiveTo(x1, y1, gived1.address, x2, y2, gived2.address, {
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

describe("LootLand.getEth.error", async () => {
  it("not owner", async () => {
    const [w1, w2, w3, w4, w5, w6, w7] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(
      w1.address,
      w1.address
    )) as LootLand;

    const PRICE = await landNFTToken.PRICE();

    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(0);

    await exceptMint2Cost(
      PRICE.mul(2),
      landNFTToken,
      11,
      11,
      22,
      22,
      w1,
      w2,
      w3,
      BigNumber.from(10).pow(18)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(2)
    );
    await exceptMint2Cost(
      PRICE.mul(2),
      landNFTToken,
      13,
      13,
      14,
      14,
      w2,
      w4,
      w5,
      PRICE.mul(2).add(1000)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(4)
    );
    await exceptMint2Cost(
      PRICE.mul(2),
      landNFTToken,
      15,
      15,
      16,
      16,
      w3,
      w6,
      w7,
      PRICE.mul(2)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(6)
    );

    await expect(landNFTToken.connect(w2).getAllEth()).to.revertedWith(
      "Ownable: caller is not the owner"
    );
    await expect(landNFTToken.connect(w2).getEth(1)).to.revertedWith(
      "Ownable: caller is not the owner"
    );
  });
});
