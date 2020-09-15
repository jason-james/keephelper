import Network from './network';
import web3 from 'web3'
import RandomBeaconImpl from "@keep-network/keep-core/artifacts/KeepRandomBeaconServiceImplV1.json"

export async function getKeepRandomBeaconImplementation(address) {
    const code = await Network.getCode(address);
    if (!code || code === '0x0' || code === '0x') throw Error('No contract at address');
    const provider = await Network.provider();
    let Web3 = new web3(provider)

    const KeepRandomBeaconImplementation = new Web3.eth.Contract(RandomBeaconImpl.abi, address);
    return [KeepRandomBeaconImplementation, Web3];
}