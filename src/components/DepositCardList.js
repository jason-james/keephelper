import React from "react";
import { Avatar, List, Tag, Button } from "antd";
import { shortenEthAddress } from "../utils";

export function DepositCardList(props) {
  const { setTrackedDeposit, setDashboardTitle, setDashboardSubtitle } = props;

  const setTracked = (e, deposit) => {
    e.preventDefault();
    setTrackedDeposit(deposit);
    setDashboardTitle(`Deposit Tracker`);
    setDashboardSubtitle(
      `Deposit: ${deposit.returnValues._depositContractAddress}`
    );
  };
  return (
    <List
      itemLayout="vertical"
      size="large"
      pagination={{
        onChange: page => {
          console.log(page);
        },
        pageSize: 6
      }}
      dataSource={props.sourceData}
      renderItem={(item, i) => (
        <List.Item
          key={item.transactionHash + i}
          extra={
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ marginRight: "1.5rem" }}>
                <div>
                  Deposit Addr:{" "}
                  <a
                    href={`https://ropsten.etherscan.io/address/${
                      item.returnValues._depositContractAddress
                    }`}
                    target={"_blank"}
                  >
                    {shortenEthAddress(
                      item.returnValues._depositContractAddress
                    )}
                  </a>
                </div>
                <div>
                  Keep Addr:{" "}
                  <a
                    href={`https://ropsten.etherscan.io/address/${
                      item.returnValues._depositContractAddress
                    }`}
                    target={"_blank"}
                  >
                    {shortenEthAddress(item.returnValues._keepAddress)}
                  </a>
                </div>
              </span>
              <span>
                <Button
                  className={"btn-primary"}
                  onClick={e => setTracked(e, item)}
                >
                  Track Progress
                </Button>
              </span>
            </div>
          }
        >
          <List.Item.Meta
            avatar={<Avatar src={item.avatar} />}
            title={
              <a
                href={`https://ropsten.etherscan.io/tx/${item.transactionHash}`}
                target={"_blank"}
              >
                {shortenEthAddress(item.transactionHash)}
              </a>
            }
            description={new Date(item.timestamp).toLocaleString()}
          />
        </List.Item>
      )}
    />
  );
}
