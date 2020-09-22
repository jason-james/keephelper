import React from "react";
import {Row, Avatar, List, Tag, Button } from "antd";
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
              <Row>
                  <div style={{ display: "flex", alignItems: "center" }}>
              <span className={'card-list-extras'} style={{marginRight: '2rem'}}>
                <div>
                  Deposit Addr:{" "}
                    <a
                        href={`https://${process.env.REACT_APP_ETHEREUM_NETWORK_VERSION != 1 ? 'ropsten.' : ''}etherscan.io/address/${
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
                        href={`https://${process.env.REACT_APP_ETHEREUM_NETWORK_VERSION != 1 ? 'ropsten.' : ''}etherscan.io/address/${
                            item.returnValues._keepAddress
                        }`}
                        target={"_blank"}
                    >
                    {shortenEthAddress(item.returnValues._keepAddress)}
                  </a>
                </div>
              </span>
                      <span>
                <Button
                    className={"btn-primary card-list-btn"}
                    onClick={e => setTracked(e, item)}
                >
                  Track Progress
                </Button>
              </span>
                  </div>
              </Row>

          }
        >
          <List.Item.Meta
            avatar={<Avatar src={item.avatar} />}
            title={
              <a
                href={`https://${process.env.REACT_APP_ETHEREUM_NETWORK_VERSION != 1 ? 'ropsten.' : ''}etherscan.io/tx/${item.transactionHash}`}
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
