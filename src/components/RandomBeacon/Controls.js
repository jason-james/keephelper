import React, { useState } from "react";
import Tag from "antd/es/tag";
import { Button, Modal } from "antd";
import web3 from "web3";
import Table from "antd/es/table";

export function Controls(props) {
  const [visible, setVisible] = useState(false);

  const columns = [
    {
      title: "Request Id",
      dataIndex: "request_id",
      key: "request_id"
    },
    {
      title: "Entry",
      dataIndex: "entry",
      key: "entry"
    },
    {
      title: "Transactions",
      key: "links",
      dataIndex: "links",
      render: links => {
        return (
          <>
            <Tag color={"geekblue"} key={links.requested}>
              <a
                target={"_blank"}
                href={`https://${process.env.REACT_APP_ETHEREUM_NETWORK_VERSION != 1 ? 'ropsten.' : ''}etherscan.io/tx/${links.requested}`}
              >
                REQUESTED
              </a>
            </Tag>
            <Tag color={"green"} key={links.generated}>
              <a
                target={"_blank"}
                href={`https://${process.env.REACT_APP_ETHEREUM_NETWORK_VERSION != 1 ? 'ropsten.' : ''}etherscan.io/tx/${links.generated}`}
              >
                GENERATED
              </a>
            </Tag>
          </>
        );
      }
    }
  ];

  const tableData = props.oldEntries.map((entry, i) => {
    return {
      key: i + 1,
      request_id: entry.request.returnValues.requestId,
      entry: entry.generation.returnValues.entry,
      links: {
        generated: entry.generation.transactionHash,
        requested: entry.request.transactionHash
      }
    };
  });

  return (
    <div
      className="bit-inputs"
      style={{ display: props.noEthError ? "none" : "block" }}
    >
      <Button className={"btn-primary"} onClick={props.requestRelayEntry}>
        Request Entry
      </Button>
      <Button className={"btn-primary"} onClick={() => setVisible(true)}>
        View Old Entries
      </Button>
      <div style={{ textAlign: "center", paddingTop: "1em" }}>
        Fee estimate:{" "}
        {props.entryFee ? web3.utils.fromWei(props.entryFee) : "Checking..."}
      </div>
      <div
        style={{
          textAlign: "center",
          display: props.showRequestInfo ? "block" : "none"
        }}
      >
        <div>Request accepted! Request ID: {props.requestId}</div>
        <div>
          <a
            href={`https://${process.env.REACT_APP_ETHEREUM_NETWORK_VERSION != 1 ? 'ropsten.' : ''}etherscan.io/tx/${props.txHash}`}
            target={"_blank"}
            style={{ marginLeft: "-3rem" }}
          >
            {props.txHash}
          </a>
        </div>
      </div>

      <Modal
        title="Previous entries (Last 10000 blocks)"
        centered
        visible={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        footer={null}
        width={1000}
      >
        <Table columns={columns} dataSource={tableData} />
      </Modal>
    </div>
  );
}
