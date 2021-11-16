import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
// eslint-disable-next-line node/no-missing-import
import { LootLand } from "../typechain";


const GAS_PRICE = 3000000000;

const exceptBuy2Cost = async (
  price: any,
  contract: any,
  x1: any,
  y1: any,
  x2: any,
  y2: any,
  buyed: any,
  gived1: any,
  gived2: any,
  ethValue: any
) => {
  const buyBeforeEthCon = await ethers.provider.getBalance(contract.address);
  const buyBeforeEthW1 = await buyed.getBalance();

  const result = await (
    await contract
      .connect(buyed)
      .buy2AndGiveTo(x1, y1, gived1.address, x2, y2, gived2.address, {
        value: ethValue,
        gasPrice: GAS_PRICE,
      })
  ).wait();
  const fee = result.gasUsed.mul(GAS_PRICE);
  const buyAfterEthW1 = await buyed.getBalance();
  const buyAfterEthCon = await ethers.provider.getBalance(contract.address);

  expect(buyBeforeEthW1.sub(buyAfterEthW1)).eq(fee.add(price));
  expect(buyAfterEthCon.sub(buyBeforeEthCon)).eq(price);
};

const expectGetEth = async (contract: any, owner: any, value: any) => {
  const getEthBeforeEthCon = await ethers.provider.getBalance(contract.address);
  const getEthBeforeEthOwner = await owner.getBalance();

  const result = await (
    await contract.connect(owner).getEth(value, {
      gasPrice: GAS_PRICE,
    })
  ).wait();
  const fee = result.gasUsed.mul(GAS_PRICE);
  const getEthAfterEthOwner = await owner.getBalance();
  const getEthAfterEthCon = await ethers.provider.getBalance(contract.address);

  expect(getEthAfterEthCon).eq(getEthBeforeEthCon.sub(value));
  expect(getEthAfterEthOwner).eq(getEthBeforeEthOwner.add(value).sub(fee));
};

describe("LootLand.getEth", async () => {
  it("buy cast eth", async () => {
    const [w1, w2, w3, w4, w5, w6, w7] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("LootLand");
    const landNFTToken = (await LandNFTFactory.deploy(w1.address)) as LootLand;

    const PRICE = await landNFTToken.PRICE();

    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(0);

    await exceptBuy2Cost(
      PRICE.mul(2),
      landNFTToken,
      1,
      1,
      2,
      2,
      w1,
      w2,
      w3,
      BigNumber.from(10).pow(18)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(2)
    );
    await exceptBuy2Cost(
      PRICE.mul(2),
      landNFTToken,
      3,
      3,
      4,
      4,
      w2,
      w4,
      w5,
      PRICE.mul(2).add(1000)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(4)
    );
    await exceptBuy2Cost(
      PRICE.mul(2),
      landNFTToken,
      5,
      5,
      6,
      6,
      w3,
      w6,
      w7,
      PRICE.mul(2)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(6)
    );
    await expectGetEth(landNFTToken, w1, PRICE.mul(4));
    await expectGetEth(landNFTToken, w1, PRICE.mul(2));
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      0
    );
  });
});
