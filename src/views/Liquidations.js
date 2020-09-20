import React, { useEffect, useState } from "react";
import { useWeb3 } from "../components/Web3";
import TBTCSystemJSON from "@keep-network/tbtc/artifacts/TBTCSystem.json";
import TBTCTokenJSON from "@keep-network/tbtc/artifacts/ERC20";
import DepositJSON from "@keep-network/tbtc/artifacts/Deposit.json";
import {
  Tabs,
  Table,
  Skeleton,
  Layout,
  Tag,
  Button,
  message,
  List,
  Progress
} from "antd";
import { shortenEthAddress } from "../utils";
const { TabPane } = Tabs;
const { Content, Header } = Layout;

// Integer constants
const COURTESY_TIMEOUT = process.env.REACT_APP_COURTESY_TIMEOUT * 1000; // 6 hours from event user can liquidate
const SIGNATURE_TIMEOUT = process.env.REACT_APP_SIGNATURE_TIMEOUT * 1000; // 2 hours
const PROOF_TIMEOUT = process.env.REACT_APP_PROOF_TIMEOUT * 1000; // 6 hours
export const DEPOSIT_STATES = {
  // DOES NOT EXIST YET
  0: "START",

  // FUNDING FLOW
  1: "AWAITING_SIGNER_SETUP",
  // Here, we send btc to an address, after its confirmed, we generate a proof that we did it
  // If we are in AWAITING SIGNER SETUP, check the bitcoin address and see if there any deposit at all. If there is, check the confirmation progress against the tx hash
  2: "AWAITING_BTC_FUNDING_PROOF",

  // FAILED SETUP
  3: "FAILED_SETUP",

  // ACTIVE
  4: "ACTIVE", // includes courtesy call

  // REDEMPTION FLOW
  5: "AWAITING_WITHDRAWAL_SIGNATURE",
  6: "AWAITING_WITHDRAWAL_PROOF",
  7: "REDEEMED",

  // SIGNER LIQUIDATION FLOW
  8: "COURTESY_CALL",
  9: "FRAUD_LIQUIDATION_IN_PROGRESS",
  10: "LIQUIDATION_IN_PROGRESS",
  11: "LIQUIDATED"
};

const STATE_TIMEOUT_MAP = {
  5: SIGNATURE_TIMEOUT,
  6: PROOF_TIMEOUT,
  8: COURTESY_TIMEOUT
};

const getLiquidationFeedColumns = callbackFn => {
  return [
    {
      title: "Id",
      dataIndex: "depositContractAddress",
      key: "id",
      render: text => (
        <a
          href={"https://ropsten.etherscan.io/address/" + text}
          target={"_blank"}
          className={"table-a"}
        >
          {shortenEthAddress(text)}
        </a>
      )
    },
    {
      title: "Keep",
      dataIndex: "keepAddress",
      key: "keep",
      render: text => (
        <a
          href={"https://ropsten.etherscan.io/address/" + text}
          target={"_blank"}
        >
          {shortenEthAddress(text)}
        </a>
      )
    },
    {
      title: "tBTC",
      dataIndex: "lotSizeTbtc",
      key: "tbtc",
      render: text => text / 1e18
    },
    {
      title: "Collateralisation",
      dataIndex: "collateralizationPercentage",
      key: "collateralisation",
      render: text => text + " %"
    },
    {
      title: "Can Notify At",
      dataIndex: "expiry",
      key: "expiry",
      render: text => new Date(text).toLocaleString()
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      render: text => (
        <Tag color={"geekblue"} key={text}>
          {text.toUpperCase()}
        </Tag>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => {
        let color;
        let out;
        let now = new Date();
        let expiry = new Date(record.expiry);

        if (
          record.collateralizationPercentage >
          record.undercollateralizedThresholdPercent
        ) {
          color = "cyan";
          out = "Safely Collatoralised";
        } else if (
          record.collateralizationPercentage >
          record.severelyUndercollateralizedThresholdPercent
        ) {
          color = "warning";
          out = "Shaky Collatoralisation";
        } else {
          color = "volcano";
          out = "Liquidate it!";
        }
        if (now > expiry) {
          return (
            <>
              <Tag color={color} key={text}>
                {out.toUpperCase()}
              </Tag>
              <Tag color="warning">CAN NOTIFY</Tag>
            </>
          );
        } else {
          return (
            <Tag color={color} key={text}>
              {out.toUpperCase()}
            </Tag>
          );
        }
      }
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (text, record) => {
        let now = new Date();
        let expiry = new Date(record.expiry);
        if (now > expiry) {
          return (
            <Button
              onClick={e => callbackFn(e, record)}
              className={"btn-primary"}
            >
              Start Liquidation
            </Button>
          );
        }
      }
    }
  ];
};

const getCurrentlyLiquidatingColumns = callbackFn => {
  return [
    {
      title: "Id",
      dataIndex: "depositContractAddress",
      key: "id",
      render: text => (
        <a
          href={"https://ropsten.etherscan.io/address/" + text}
          target={"_blank"}
          className={"table-a"}
        >
          {shortenEthAddress(text)}
        </a>
      )
    },
    {
      title: "Keep",
      dataIndex: "keepAddress",
      key: "keep",
      render: text => (
        <a
          href={"https://ropsten.etherscan.io/address/" + text}
          target={"_blank"}
        >
          {shortenEthAddress(text)}
        </a>
      )
    },
    {
      title: "tBTC needed",
      dataIndex: "lotSizeTbtc",
      key: "tbtc",
      render: text => text / 1e18
    },
    {
      title: "ETH to receive",
      dataIndex: "auctionValue",
      key: "eth",
      render: text => text / 1e18
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      render: text => (
        <Tag color={"cyan"} key={text}>
          AUCTION IN PROGRESS
        </Tag>
      )
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (text, record) => (
        <Button onClick={e => callbackFn(e, record)} className={"btn-primary"}>
          Liquidate
        </Button>
      )
    }
  ];
};

const past_liquidation_columns = [
  {
    title: "Id",
    dataIndex: "depositContractAddress",
    key: "id",
    render: text => (
      <a
        href={"https://ropsten.etherscan.io/address/" + text}
        target={"_blank"}
        className={"table-a"}
      >
        {shortenEthAddress(text)}
      </a>
    )
  },
  {
    title: "Keep",
    dataIndex: "keepAddress",
    key: "keep",
    render: text => (
      <a
        href={"https://ropsten.etherscan.io/address/" + text}
        target={"_blank"}
      >
        {shortenEthAddress(text)}
      </a>
    )
  },
  {
    title: "tBTC used",
    dataIndex: "lotSizeTbtc",
    key: "tbtc",
    render: text => text / 1e18
  },
  // {
  //   title: "ETH purchased",
  //   dataIndex: "auctionValue",
  //   key: "eth",
  //   render: text => text / 1e18
  // },
  {
    title: "State",
    dataIndex: "state",
    key: "state",
    render: text => (
      <Tag color={"cyan"} key={text}>
        LIQUIDATED
      </Tag>
    )
  }
  // {
  //     title: "Info",
  //     dataIndex: "info",
  //     key: "info",
  //     render: text => <Button className={"btn-primary"}>Info</Button>
  // }
];

function SkeletonList() {
  const listData = [0, 0, 0, 0];
  return (
    <>
      <List
        itemLayout="vertical"
        size="large"
        dataSource={listData}
        renderItem={item => (
          <List.Item>
            <Skeleton paragraph={{ rows: 3 }} active>
              {item}
            </Skeleton>
          </List.Item>
        )}
      />
    </>
  );
}

const getExpirationTimestamp = async (eventBlockNumber, duration, web3) => {
  try {
    const blockInfo = await web3.eth.getBlock(eventBlockNumber);
    const expiration = blockInfo.timestamp * 1000 + duration;
    return expiration;
  } catch (error) {
    console.log("Error when fetching block's timestamp.");
  }
};

export function Liquidations(props) {
  const { getContract, getWeb3, getAccounts } = useWeb3();
  const [feed, setFeed] = useState([]);
  const [liquidating, setLiquidating] = useState([]);
  const [pastLiquidations, setPastLiquidations] = useState([]);
  const [loading, setLoading] = useState(null);
  const [loadingPercent, setLoadingPercent] = useState(0);

  useEffect(() => {
    document.title = `Liquidations | KeepHelper`;
    const getData = async () => {
      let contract = await getContract(
        TBTCSystemJSON.abi,
        process.env.REACT_APP_RANDOM_TBTC_SYSTEM_CONTRACT_ADDRESS
      );
      let web3 = await getWeb3();
      setLoading(true);
      const {
        PAST_LIQUIDATIONS,
        FEED,
        CURRENTLY_LIQUIDATING
      } = await getAllDeposits(contract, web3, setLoadingPercent);
      console.log(PAST_LIQUIDATIONS)
      setFeed(FEED.reverse());
      setLiquidating(CURRENTLY_LIQUIDATING.reverse());
      setPastLiquidations(PAST_LIQUIDATIONS.reverse());
      setLoading(false);
    };
    getData();
  }, []);

  const startLiquidation = async (e, record) => {
    e.preventDefault();
    let w = await getWeb3();
    const accounts = await getAccounts();
    const userAddress = accounts[0];
    let contract = new w.eth.Contract(
      DepositJSON.abi,
      record.depositContractAddress
    );

    if (record.state === "AWAITING_WITHDRAWAL_SIGNATURE") {
      contract.methods
        .notifyRedemptionSignatureTimedOut()
        .send({
          from: userAddress
        })
        .on("receipt", function(receipt) {
          message.success(
            `Staring liquidation on ${
              record.depositContractAddress
            } was successful.`
          );
        })
        .on("error", function(error, receipt) {
          message.error(error.message);
        });
    } else if (record.state === "AWAITING_WITHDRAWAL_PROOF") {
      contract.methods
        .notifyRedemptionProofTimedOut()
        .send({
          from: userAddress
        })
        .on("receipt", function(receipt) {
          message.success(
            `Staring liquidation on ${
              record.depositContractAddress
            } was successful.`
          );
        })
        .on("error", function(error, receipt) {
          message.error(error.message);
        });
    } else if (record.state === "COURTESY_CALL") {
      contract.methods
        .notifyCourtesyCallExpired()
        .send({
          from: userAddress
        })
        .on("receipt", function(receipt) {
          message.success(
            `Staring liquidation on ${
              record.depositContractAddress
            } was successful.`
          );
        })
        .on("error", function(error, receipt) {
          message.error(error.message);
        });
    }
  };

  const purchaseBondsAtAuction = async (e, record) => {
    e.preventDefault();
    let w = await getWeb3();
    const accounts = await getAccounts();
    const userAddress = accounts[0];
    let contract = new w.eth.Contract(
      DepositJSON.abi,
      record.depositContractAddress
    );
    let tBtcContract = new w.eth.Contract(
      TBTCTokenJSON.abi,
      process.env.REACT_APP_TBTC_TOKEN_CONTRACT_ADDRESS
    );

    tBtcContract.methods
      .approve(record.depositContractAddress, record.lotSizeTbtc)
      .send({ from: userAddress })
      .on("receipt", function(receipt) {
        message.success(
          `Approved spend of ${
            record.lotSizeTbtc / 1e18
          } tBTC! Next, confirm the liquidation transaction.`,
          15
        );
        contract.methods
          .purchaseSignerBondsAtAuction()
          .send({
            from: userAddress
          })
          .on("receipt", function(receipt) {
            message.success(
                `Deposit ${
                    record.depositContractAddress
                } successfully liquidated! Value: ${
                    record.auctionValue / 1e18
                } ETH. Approve the upcoming transaction to send the funds to your account.`,
                30
            );
            contract.methods
              .withdrawFunds()
              .send({
                from: userAddress
              })
              .on("receipt", function(receipt) {
                message.success(
                  `Withdrawal successful, your ETH has been transferred to your address: ${
                      userAddress
                  }.`,
                  30
                );
              })
              .on("error", function(error, receipt) {
                message.error(
                  `Auction purchase on ${
                    record.depositContractAddress
                  } was successful but could not withdraw, please withdraw manually. Deposit address: ${
                    record.depositContractAddress
                  }. Error message: ${error.message}`,
                  30
                );
              });
          })
          .on("error", function(error, receipt) {
            message.error(error.message);
          });
      })
      .on("error", function(error, receipt) {
        message.error(error.message);
      });
  };

  return (
    <Layout className="site-layout">
      <Content
        className="site-layout-background"
        style={{
          margin: "24px 16px",
          padding: 24,
          minHeight: 280
        }}
      >
        <Header
          style={{
            marginBottom: "2rem",
            color: "#48dbb4",
            background: "#0a0806"
          }}
        >
          <span className={'pg-title'}>TBTC Liquidations (Last 75000 blocks)</span>
        </Header>
        {loading && <Progress percent={loadingPercent} status="active"/>}
        <div className="card-container">
          <Tabs type="card" style={{ height: "85vh" }}>
            <TabPane tab="Feed" key="1">
              {loading ? (
                <SkeletonList />
              ) : (
                <Table
                  columns={getLiquidationFeedColumns(startLiquidation)}
                  dataSource={feed}
                />
              )}
            </TabPane>
            <TabPane tab="Currently Liquidating" key="2">
              {loading ? (
                <SkeletonList />
              ) : (
                <Table
                  columns={getCurrentlyLiquidatingColumns(
                    purchaseBondsAtAuction
                  )}
                  dataSource={liquidating}
                />
              )}
            </TabPane>
            <TabPane tab="Past Liquidations" key="3">
              {loading ? (
                <SkeletonList />
              ) : (
                <Table
                  columns={past_liquidation_columns}
                  dataSource={pastLiquidations}
                />
              )}
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
}

const getAllDeposits = async (contract, web3, setLoadingPercent) => {
  let deposits;
  try {
    deposits = await contract.getPastEvents("Created", {
      fromBlock: (await web3.eth.getBlockNumber()) - 75000,
      toBlock: "latest"
    });
    console.log(deposits);
  } catch (e) {
    console.log(e);
  }
  let processed = await processAllDeposits(deposits, web3, setLoadingPercent);
  return processed;
};

const processAllDeposits = async (deposits, web3, setLoadingPercent) => {
  let FEED = [];
  let CURRENTLY_LIQUIDATING = [];
  let PAST_LIQUIDATIONS = [];
  let lotSizeTbtc;
  let keepAddress;
  let collateralizationPercentage;
  let severelyUndercollateralizedThresholdPercent;
  let undercollateralizedThresholdPercent;
  let auctionValue;
  let rv;
  for (let i = 0; i < deposits.length; i++) {
    setLoadingPercent(((i / deposits.length) * 100).toFixed(0))
    let contract = new web3.eth.Contract(
      DepositJSON.abi,
      deposits[i].returnValues._depositContractAddress
    );
    console.log(deposits[i].returnValues._depositContractAddress);

    let state = await contract.methods.currentState().call();

    if (state == 5 || state == 6 || state == 8) {
      let expiry = await getExpirationTimestamp(
        deposits[i].blockNumber,
        STATE_TIMEOUT_MAP[state],
        web3
      );
      lotSizeTbtc = await contract.methods.lotSizeTbtc().call();
      keepAddress = await contract.methods.keepAddress().call();
      collateralizationPercentage = await contract.methods
        .collateralizationPercentage()
        .call();
      severelyUndercollateralizedThresholdPercent = await contract.methods
        .severelyUndercollateralizedThresholdPercent()
        .call();
      undercollateralizedThresholdPercent = await contract.methods
        .undercollateralizedThresholdPercent()
        .call();
      rv = {
        ...deposits[i],
        lotSizeTbtc,
        keepAddress,
        collateralizationPercentage,
        severelyUndercollateralizedThresholdPercent,
        undercollateralizedThresholdPercent,
        state: DEPOSIT_STATES[state],
        expiry,
        depositContractAddress: deposits[i].returnValues._depositContractAddress
      };
      FEED.push(rv);
    } else if (state == 9 || state == 10) {
      lotSizeTbtc = await contract.methods.lotSizeTbtc().call();
      keepAddress = await contract.methods.keepAddress().call();
      auctionValue = await contract.methods.auctionValue().call();
      rv = {
        ...deposits[i],
        lotSizeTbtc,
        keepAddress,
        state: DEPOSIT_STATES[state],
        auctionValue,
        depositContractAddress: deposits[i].returnValues._depositContractAddress
      };
      CURRENTLY_LIQUIDATING.push(rv);
    } else if (state == 11) {
      lotSizeTbtc = await contract.methods.lotSizeTbtc().call();
      keepAddress = await contract.methods.keepAddress().call();
      auctionValue = await contract.methods.auctionValue().call();
      rv = {
        ...deposits[i],
        lotSizeTbtc,
        keepAddress,
        state: DEPOSIT_STATES[state],
        auctionValue,
        depositContractAddress: deposits[i].returnValues._depositContractAddress
      };
      PAST_LIQUIDATIONS.push(rv);
    } else {
      continue;
    }
  }
  return { PAST_LIQUIDATIONS, FEED, CURRENTLY_LIQUIDATING };
};

