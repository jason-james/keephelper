import React, { useEffect, useState } from "react";
import { useWeb3 } from "../network";
import keepLogo from "../images/keephelper_logo.png";
import loadingSpinner from "../images/infinityLoader.svg";
import RandomBeaconImpl from "@keep-network/keep-core/artifacts/KeepRandomBeaconServiceImplV1.json";

import { Controls } from "../components/RandomBeacon/Controls";
import { CharSpinners } from "../components/RandomBeacon/AlphabetSpinners";

const getRevertReason = require("eth-revert-reason");

function RandomBeacon() {
  const [stdOut, setStdOut] = useState("KeepHelper: Random Beacon");
  const [address, setAddress] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [randomBeacon, setRandomBeacon] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [showRequestInfo, setShowRequestInfo] = useState(false);
  const [entryFee, setEntryFee] = useState(null);
  const [oldEntries, setOldEntries] = useState([]);
  const [noEthError, setNoEthError] = useState(false);
  const { getContract, getWeb3, getAccounts } = useWeb3();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getData(
          setError,
          setAddress,
          setRandomBeacon,
          requestId,
          setStdOut,
          setTxHash,
          setEntryFee,
          setLoading,
          setOldEntries,
          getContract,
          getWeb3,
          getAccounts
        );
      } catch (e) {
        console.log(e);
        setNoEthError(true);
        setStdOut("Please install MetaMask");
      }
    };
    fetchData();
  }, [stdOut, requestId]);

  const requestRelayEntry = async e => {
    setShowRequestInfo(false);
    e.preventDefault();
    setLoading(true);
    setStdOut("Waiting for request to be accepted by the Beacon...");

    try {
      let request = await randomBeacon.methods
        .requestRelayEntry()
        .send({ from: address, value: entryFee });
      let requestId = request.events.RelayEntryRequested.returnValues.requestId;
      setStdOut("Waiting for your entry to be generated...");
      setShowRequestInfo(true);
      setRequestId(requestId);
      setTxHash(request.events.RelayEntryRequested.transactionHash);
    } catch (e) {
      if (e.code) {
        setStdOut(e.message.substr(0, 50) + "...");
        setLoading(false);
      } else {
        try {
          let err = e.toString();
          let errorObject = JSON.parse(
            err.substring(err.indexOf("{"), err.lastIndexOf("}") + 1)
          );
          let reason = await getRevertReason(
            errorObject.transactionHash,
            "ropsten"
          );
          reason = 'Error: "' + reason.toString() + '". Please try again.';
          setStdOut(reason.substr(0, 50) + "...");
          setLoading(false);
        } catch (e2) {
          setStdOut("Error: Unknown error. Please try again.");
          setLoading(false);
        }
      }
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        width: "100%",
        height: "100%",
        marginTop: "8rem"
      }}
    >
      {!loading && (
        <img src={keepLogo} width={350} style={{ marginBottom: "4rem" }} />
      )}
      {loading && (
        <img
          src={loadingSpinner}
          width={350}
          style={{ marginBottom: "4rem", zIndex: 2147483647 }}
        />
      )}
      <div className="bits" style={{ marginBottom: "4rem" }}>
        <CharSpinners num={stdOut} />
      </div>
      <Controls
        showRequestInfo={showRequestInfo}
        requestRelayEntry={requestRelayEntry}
        requestId={requestId}
        txHash={txHash}
        entryFee={entryFee}
        oldEntries={oldEntries}
        noEthError={noEthError}
      />
    </div>
  );
}

async function getData(
  setError,
  setAddress,
  setRandomBeacon,
  requestId,
  setStdOut,
  setTxHash,
  setEntryFee,
  setLoading,
  setOldEntries,
  getContract,
  getWeb3,
  getAccounts
) {
  let randomBeacon;
  let entryFee;
  let Web3 = await getWeb3();

  const accounts = await getAccounts();
  const yourAddress = accounts[0];

  try {
    randomBeacon = await getContract(
      RandomBeaconImpl.abi,
      process.env.REACT_APP_RANDOM_BEACON_CONTRACT_ADDRESS
    );
    entryFee = await randomBeacon.methods.entryFeeEstimate(0).call();
    let generationEvents = await randomBeacon.getPastEvents(
      "RelayEntryGenerated",
      {
        fromBlock: (await Web3.eth.getBlockNumber()) - 10000,
        toBlock: "latest"
      }
    );
    let requestEvents = await randomBeacon.getPastEvents(
      "RelayEntryRequested",
      {
        fromBlock: (await Web3.eth.getBlockNumber()) - 10000,
        toBlock: "latest"
      }
    );
    let rv = [];
    for (let i = 0; i < requestEvents.length; i++) {
      if (
        generationEvents[i].returnValues.requestId ===
        requestEvents[i].returnValues.requestId
      ) {
        rv.push({ generation: generationEvents[i], request: requestEvents[i] });
        if (rv.length >= generationEvents.length) {
          break;
        }
      }
    }
    setOldEntries(rv.reverse());
  } catch (e) {
    setError(true);
  }

  if (randomBeacon) {
    randomBeacon.events.RelayEntryGenerated(null, (error, event) => {
      if (event.returnValues.requestId === requestId) {
        setStdOut(event.returnValues.entry);
        setTxHash(event.transactionHash);
        setLoading(false);
      }
    });
  }

  setEntryFee(entryFee);
  setAddress(yourAddress);
  setRandomBeacon(randomBeacon);
}

export default RandomBeacon;
