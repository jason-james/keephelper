import React, { useEffect, useState } from "react";
import { Layout, Tabs, Statistic, Row, Tag, PageHeader, Col } from "antd";
import keepTokenLogo from "../images/keep-token-main.png";
import ethereumLogo from "../images/ethereumLogo.png";
import { TransferCardList } from "../components/TransferCardList";
import TBTCTokenJSON from "@keep-network/tbtc/artifacts/ERC20";
import { useWeb3 } from "../components/Web3";
import TBTCSystemJSON from "@keep-network/tbtc/artifacts/TBTCSystem.json";
import TBTCVendingMachineJSON from "@keep-network/tbtc/artifacts/VendingMachine.json";
import KeepTokenJSON from "@keep-network/keep-core/artifacts/KeepToken";
import tBtcLogo from "../images/tbtc_logo.png";
import { DepositCardList } from "../components/DepositCardList";
import { MintCardList } from "../components/MintCardList";
import { LineChart } from "../components/DualAxisLineChart";
import { DepositTracker } from "../components/DepositTracker";
import { SkeletonDashboard } from "../components/SkeletonDashboard";
import { FindTdtID } from "../components/FindTdtID";

const { Content } = Layout;
const { TabPane } = Tabs;

function BalanceInfo(props) {
  const { balances } = props;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span className={"mx-2"} style={{ fontSize: "1rem", fontWeight: "900" }}>
        Your Balances:
      </span>

      <img src={keepTokenLogo} height={40} />
      <span className={"mx-2"}>
        {(balances.keepBalance / 1e18).toFixed(2)} KEEP
      </span>

      <img src={tBtcLogo} height={40} />
      <span className={"mx-2"}>
        {(balances.tBtcBalance / 1e18).toFixed(2)} tBTC
      </span>

      <img src={ethereumLogo} height={40} />
      <span className={"ml-2"}>
        {(balances.ethBalance / 1e18).toFixed(2)} ETH
      </span>
    </div>
  );
}

export function TbtcDashboard() {
  const { getContract, getAccounts, getWeb3 } = useWeb3();
  const [transfers, setTransfers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [mints, setMints] = useState([]);
  const [userBalances, setUserBalances] = useState({});
  const [totalMinted, setTotalMinted] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  const [currentSupply, setCurrentSupply] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [trackedDeposit, setTrackedDeposit] = useState(null);
  const [dashboardTitle, setDashboardTitle] = useState("tBTC Dashboard");
  const [dashboardSubtitle, setDashboardSubtitle] = useState(
    `Contract: ${process.env.REACT_APP_TBTC_TOKEN_CONTRACT_ADDRESS}`
  );
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    document.title = `TBTC Dashboard | KeepHelper`;
    const getData = async () => {
      setLoading(true);

      let tbtcTokenContract = await getContract(
        TBTCTokenJSON.abi,
        process.env.REACT_APP_TBTC_TOKEN_CONTRACT_ADDRESS
      );
      let tbtcSystemContract = await getContract(
        TBTCSystemJSON.abi,
        process.env.REACT_APP_RANDOM_TBTC_SYSTEM_CONTRACT_ADDRESS
      );
      let tbtcVendingMachineContract = await getContract(
        TBTCVendingMachineJSON.abi,
        process.env.REACT_APP_TBTC_VENDING_MACHINE_CONTRACT_ADDRESS
      );

      let web3 = await getWeb3();
      const accounts = await getAccounts();
      const userAddress = accounts[0];

      let transfers = await getPastEvents(tbtcTokenContract, "Transfer", web3);
      let deposits = await getPastEvents(tbtcSystemContract, "Created", web3);
      let chartData = await getTokenTransferHistory(transfers, web3, 7);
      let userBalances = await getUserBalances(web3, userAddress);
      let tBtcStats = await getTbtcContractStats(tbtcVendingMachineContract);
      let mintStats = getMintTransactionsFromTransfers(transfers);
      setTransfers(transfers);
      setUserBalances(userBalances);
      setDeposits(deposits);
      setChartData(chartData);
      setTotalMinted(mintStats.totalMinted);
      setMaxSupply(tBtcStats.maxSupply);
      setMints(mintStats.mints);
      setCurrentSupply(mintStats.currentSupply);
      setLoading(false);
    };
    getData();
  }, []);

  const resetDashboardInfo = () => {
    setTrackedDeposit(null);
    setDashboardSubtitle(
      `Contract: ${process.env.REACT_APP_TBTC_TOKEN_CONTRACT_ADDRESS}`
    );
    setDashboardTitle("tBTC Dashboard");
  };

  return (
    <>
      {loading && <SkeletonDashboard />}
      {!loading && (
        <Layout className="site-layout">
          <Content
            className="site-layout-background"
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280
            }}
          >
            <PageHeader
              className="dashboard-header"
              onBack={() => resetDashboardInfo()}
              title={dashboardTitle}
              tags={
                <Tag color="blue">
                  {process.env.REACT_APP_ETHEREUM_NETWORK_VERSION == 1
                    ? "Mainnet"
                    : "Ropsten"}
                </Tag>
              }
              subTitle={dashboardSubtitle}
              extra={<BalanceInfo balances={userBalances} />}
            >
              <Row>
                <Statistic
                  title="Current Supply"
                  style={{
                    margin: "0 16px"
                  }}
                  suffix={"tBTC"}
                  value={currentSupply.toFixed(2)}
                />

                <Statistic
                  title="Total Minted (ever)"
                  style={{
                    margin: "0 16px"
                  }}
                  suffix={"tBTC"}
                  value={totalMinted.toFixed(2)}
                />
                <Statistic
                  title="Max Supply"
                  suffix={"tBTC"}
                  value={(maxSupply / 1e18).toFixed(2)}
                  style={{
                    margin: "0 16px"
                  }}
                />
              </Row>
            </PageHeader>
            <Row gutter={48} style={{ padding: "2rem" }}>
              <Col lg={24} xl={24} xxl={12} md={24} xs={24} className={'figure-margin'}>
                {trackedDeposit ? (
                    <DepositTracker getWeb3={getWeb3} deposit={trackedDeposit} />
                ) : (
                    <LineChart
                        key={chartData}
                        chartData={chartData}
                        formChartData={chartData => {
                          if (!chartData) {
                            return [[], [], []];
                          }

                          const data1 = [];
                          const data2 = [];
                          const xAxis = [];

                          chartData.forEach((current, i) => {
                            data1.push(current.numberOfTransfers);
                            data2.push(current.value.toFixed(2));
                            xAxis.push(chartData.length - i);
                          });
                          let rv = [xAxis, data1, data2];
                          return rv;
                        }}
                    />
                )}
              </Col>
              <Col lg={24} xl={24} xxl={12} md={24} xs={24}>
                <div className="card-container dash-tabs">
                  <Tabs type="card">
                    <TabPane tab="Deposits" key="1">
                      <DepositCardList
                        sourceData={deposits}
                        setTrackedDeposit={setTrackedDeposit}
                        setDashboardTitle={setDashboardTitle}
                        setDashboardSubtitle={setDashboardSubtitle}
                      />
                    </TabPane>
                    <TabPane tab="Transfers" key="2">
                      <TransferCardList sourceData={transfers} />
                    </TabPane>
                    <TabPane tab="Mints" key="3">
                      <MintCardList sourceData={mints} />
                    </TabPane>
                    <TabPane tab="View Your Deposits" key="4">
                      <FindTdtID
                        deposits={deposits}
                        sourceData={deposits}
                        setTrackedDeposit={setTrackedDeposit}
                        setDashboardTitle={setDashboardTitle}
                        setDashboardSubtitle={setDashboardSubtitle}
                        getWeb3={getWeb3}
                      />
                    </TabPane>
                  </Tabs>
                </div>
              </Col>

            </Row>
          </Content>
        </Layout>
      )}
    </>
  );
}

async function getPastEvents(contract, event, web3) {
  try {
    let events = await contract.getPastEvents(event, {
      fromBlock: 0,
      toBlock: "latest"
    });
    events.reverse();
    events = Promise.all(
      events.map(async item => {
        let ts = await web3.eth.getBlock(item.blockNumber);
        return { ...item, timestamp: ts.timestamp * 1000 };
      })
    );
    return events;
  } catch (e) {
    console.log(e);
  }
}

function getMintTransactionsFromTransfers(transfers) {
  let mints = [];
  let totalMinted = 0;
  let totalBurned = 0;
  transfers.forEach(transfer => {
    if (
      transfer.returnValues.from ===
      "0x0000000000000000000000000000000000000000"
    ) {
      mints.push(transfer);
      totalMinted += transfer.returnValues.value / 1e18;
    } else if (
      transfer.returnValues.to === "0x0000000000000000000000000000000000000000"
    ) {
      totalBurned += transfer.returnValues.value / 1e18;
    }
  });
  return { mints, totalMinted, currentSupply: totalMinted - totalBurned };
}

async function getUserBalances(web3, address) {
  let balances;
  let ethBalance;
  let keepBalance;
  let tBtcBalance;

  try {
    ethBalance = await web3.eth.getBalance(address);
    let keepContract = new web3.eth.Contract(
      KeepTokenJSON.abi,
      process.env.REACT_APP_KEEP_TOKEN_CONTRACT_ADDRESS
    );
    keepBalance = await keepContract.methods.balanceOf(address).call();
    let tBtcContract = new web3.eth.Contract(
      TBTCTokenJSON.abi,
      process.env.REACT_APP_TBTC_TOKEN_CONTRACT_ADDRESS
    );
    tBtcBalance = await tBtcContract.methods.balanceOf(address).call();
    balances = { ethBalance, keepBalance, tBtcBalance };
    return balances;
  } catch (e) {
    console.log(e);
  }
}

async function getTbtcContractStats(vendingMachineContract) {
  let maxSupply;

  try {
    maxSupply = await vendingMachineContract.methods.getMaxSupply().call();
    return { maxSupply };
  } catch (e) {
    console.log(e);
  }
}

async function getTokenTransferHistory(transfers, web3, days) {
  const BLOCKS_PER_DAY = 6450;
  let stats = [];
  let currentBlock = await web3.eth.getBlockNumber();

  for (let i = 0; i < days; i++) {
    stats.push({ numberOfTransfers: 0, value: 0 });
  }

  transfers.forEach(tf => {
    for (let i = 0; i < days; i++) {
      if (tf.blockNumber >= currentBlock - BLOCKS_PER_DAY * (i + 1)) {
        stats[i].numberOfTransfers += 1;
        stats[i].value += tf.returnValues.value / 1e18;
        break;
      }
    }
  });

  return stats;
}
