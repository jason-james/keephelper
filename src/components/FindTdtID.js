import React, { useEffect, useState } from "react";
import { Input, List, message, Table } from "antd";
import { SecurityScanOutlined, CopyOutlined } from "@ant-design/icons";
import search from "../images/search.svg";
import axios from "axios";
import { getTbtc, shortenEthAddress } from "../utils";
import { DEPOSIT_STATES } from "../views/Liquidations";
import { CopyToClipboard } from "react-copy-to-clipboard";

const { Search } = Input;

const columns = [
  {
    title: "TDT id",
    dataIndex: "tdt",
    render: data => {
      return (
        <>
          {shortenEthAddress(data) + " "}
          <CopyToClipboard
            text={data}
            onCopy={() => message.success("Copied!", 2)}
          >
            <CopyOutlined />
          </CopyToClipboard>
        </>
      );
    },
    fixed: "left"
  },
  {
    title: "Owner",
    dataIndex: "owner",
    render: data => {
      return (
        <>
          {data === process.env.REACT_APP_TBTC_VENDING_MACHINE_CONTRACT_ADDRESS
            ? "Vending Machine "
            : shortenEthAddress(data) + " "}
          <CopyToClipboard
              text={data}
              onCopy={() => message.success("Copied!", 2)}
          >
            <CopyOutlined />
          </CopyToClipboard>
        </>
      );
    }
  },

  {
    title: "Lot Size (tBTC)",
    dataIndex: "lotSize",
    render: num => num.toString() / 1e18
  },
  {
    title: "State",
    dataIndex: "state",
    render: state => DEPOSIT_STATES[state]
  },
  {
    title: "Timestamp",
    dataIndex: "timestamp",
    render: ts => new Date(ts).toLocaleString()
  }
];

export function FindTdtID(props) {
  const [loading, setLoading] = useState(false);
  const [foundDeposits, setFoundDeposits] = useState(null);
  const [tbtc, setTbtc] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const web3 = await props.getWeb3();
      const tbtc = await getTbtc(web3);
      setTbtc(tbtc);
    };
    fetchData();
  }, []);

  const handleSearch = async address => {
    try {
      setLoading(true);
      let r = await axios.get(`/ethAddress`, {
        params: {
          ethAddress: address
        }
      });
      let hashes = r.data.map(item => {
        return item.hash;
      });
      let foundDeposits = props.deposits.filter(deposit => {
        return hashes.includes(deposit.transactionHash);
      });
      for (let i = 0; i < foundDeposits.length; i++) {
        let deposit = await tbtc.Deposit.withAddress(
            foundDeposits[i].returnValues._depositContractAddress
        );
        let lotSize = await deposit.getLotSizeTBTC();
        let owner = await deposit.getOwner();
        let state = await deposit.getCurrentState();

        foundDeposits[i] = {
          ...foundDeposits[i],
          tdt: foundDeposits[i].returnValues._depositContractAddress,
          lotSize,
          owner,
          state
        };
      }
      setLoading(false);
      setFoundDeposits(foundDeposits);
    } catch (e) {
      message.error(e + " Please try again.", 15)
      setLoading(false)
    }

  };

  return (
    <>
      <Search
        size="large"
        placeholder="Enter your Ethereum address"
        prefix={<SecurityScanOutlined size={"large"} />}
        onSearch={handleSearch}
        loading={loading}
        enterButton
        style={{ marginBottom: "1rem" }}
      />
      {!foundDeposits && (
        <div style={{ textAlign: "center" }}>
          <img height={350} src={search} style={{ margin: "6rem" }} />
        </div>
      )}
      {foundDeposits && (
        <Table
          columns={columns}
          dataSource={foundDeposits}
          size="small"
          pagination={{
            onChange: page => {
              console.log(page);
            },
            pageSize: 8
          }}
          scroll={{ x: 780 }}
        />
      )}
    </>
  );
}
