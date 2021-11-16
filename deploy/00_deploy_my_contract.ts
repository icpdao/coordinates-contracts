import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { BigNumber } from '@ethersproject/bignumber';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployments, getNamedAccounts} = hre;
    const {deploy} = deployments;

    const {deployer} = await getNamedAccounts();
    const owner = "0xAce84e2A50EfcF847c3a1d21018cecc2075E4a78";

    await deploy('LootLand', {
        from: deployer,
        args: [owner],
        log: true,
        gasPrice: BigNumber.from(10).pow(9).mul(112)
    });
};

export default func;
func.tags = ['LootLand'];
