import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
// eslint-disable-next-line node/no-missing-import
import { PeopleLand } from "../typechain";

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

describe("PeopleLand.getEth", async () => {
  it("mint cast eth", async () => {
    const [deploy, owner, startUp, w2, w3, w4, w5, w6, w7] = await ethers.getSigners();
    const LandNFTFactory = await ethers.getContractFactory("PeopleLand");
    const landNFTToken = (await LandNFTFactory.connect(deploy).deploy(
      owner.address,
      startUp.address
    )) as PeopleLand;

    expect(await landNFTToken.owner()).eq(owner.address);

    const PRICE = await landNFTToken.PRICE();

    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(0);

    await exceptMint2Cost(
      PRICE.mul(2),
      landNFTToken,
      111,
      111,
      112,
      112,
      startUp,
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
      113,
      113,
      114,
      114,
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
      115,
      115,
      116,
      116,
      w3,
      w6,
      w7,
      PRICE.mul(2)
    );
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      PRICE.mul(6)
    );
    await expectGetEth(landNFTToken, owner, PRICE.mul(4));
    await expectGetEth(landNFTToken, owner, PRICE.mul(2));
    expect(await ethers.provider.getBalance(landNFTToken.address)).eq(
      0
    );
  });
});
