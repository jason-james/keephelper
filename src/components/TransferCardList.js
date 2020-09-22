import React from "react";
import { Avatar, List, Tag } from "antd";
import tBtcLogo from "../images/tbtc_logo.png";
import { shortenEthAddress } from "../utils";

export function TransferCardList(props) {
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
                  From:{" "}
                  <a
                    href={`https://${process.env.REACT_APP_ETHEREUM_NETWORK_VERSION != 1 ? 'ropsten.' : ''}etherscan.io/address/${
                      item.returnValues.from
                    }`}
                    target={"_blank"}
                  >
                    {shortenEthAddress(item.returnValues.from)}
                  </a>
                </div>
                <div>
                  To:
                  <a
                    href={`https://${process.env.REACT_APP_ETHEREUM_NETWORK_VERSION != 1 ? 'ropsten.' : ''}etherscan.io/address/${
                      item.returnValues.to
                    }`}
                    target={"_blank"}
                  >
                    {" "}
                    {shortenEthAddress(item.returnValues.to)}
                  </a>
                </div>
              </span>
              <img src={tBtcLogo} height={40} />
              <span>
                <Tag className={"ml-2"} color={"cyan"}>
                  {(item.returnValues.value / 1e18).toFixed(5)}
                </Tag>
              </span>
            </div>
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
