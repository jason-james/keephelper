import Web3Constructor from "web3";
import { sleep } from "./utils";
import React, { createContext, useContext, useState } from "react";

export const Web3Context = createContext(null);

export function useWeb3() {
  return useContext(Web3Context);
}

function Web3({ children }) {
  const [web3Instance, setWeb3Instance] = useState(null);

  const getWeb3 = async () => {
    if (web3Instance) {
      return web3Instance;
    } else {
      const provider = await getProvider();
      const instance = new Web3Constructor(provider);
      setWeb3Instance(instance);
      return instance;
    }
  };

  const getCode = async address => {
    let web3 = await getWeb3();
    let code = await web3.eth.getCode(address);
    return code;
  };

  const getContract = async (abi, address) => {
    const code = await getCode(address);
    if (!code || code === "0x0" || code === "0x")
      throw Error("No contract at address");

    let web3 = await getWeb3();

    return new web3.eth.Contract(abi, address);
  };

  const getProvider = async () => {
    let { web3 } = window;

    while (web3 === undefined) {
      await sleep(500);
      web3 = window.web3;
    }

    return web3.currentProvider;
  };

  const getAccounts = async () => {
    let web3 = await getWeb3();
    return web3.eth.getAccounts();
  };

  return (
    <Web3Context.Provider
      value={{
        getContract,
        getWeb3,
        getAccounts
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export default Web3;
