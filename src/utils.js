import BigNumber from "bignumber";
import TBTC from "@keep-network/tbtc.js";

export function displayAmount(amount, decimals, precision) {
  amount = new BigNumber(amount);
  return amount.dividedBy(10 ** decimals).toFixed(precision);
}

export function formatAmount(amount, decimals) {
  return amount * 10 ** decimals;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function shortenEthAddress(address) {
  if (address.length === 66) {
    return address.substr(0,6) + "..." +address.substr(62,6)
  } else {
    return address.substr(0,6) + "..." +address.substr(38,6)
  }
}

export async function getTbtc(web3) {
  const tbtc = await TBTC.withConfig({
    web3: web3,
    bitcoinNetwork: "testnet",
    electrum: {
      testnet: {
        server: "electrumx-server.test.tbtc.network",
        port: 8443,
        protocol: "wss"
      },
      testnetTCP: {
        server: "electrumx-server.test.tbtc.network",
        port: 50002,
        protocol: "ssl"
      },
    }
  });

  return tbtc;
}
