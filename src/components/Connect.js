import React from "react";
import Layout from "antd/es/layout";
import { Card , Row} from "antd";
import metamaskIcon from "../images/metamask.svg";
import KeepHelperLogoText from "../images/keephelper_text_2.svg";
const { Content } = Layout;
const { Meta } = Card;

export function Connect(props) {
  const connect = async () => {
    if (!window.web3) {
      window.open("https://metamask.io/");
    }
    try {
      await window.ethereum.enable();
      props.setConnected(true);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Layout>
      <Content>
        <div
          className="site-layout-background"
          style={{ padding: 24, minHeight: 360, textAlign: "center" }}
        >
          <div className="sidebar-logo"  ><img src={KeepHelperLogoText} height={180} style={{marginTop: '5rem'}}></img></div>
          <Row type="flex" justify="center" align="middle">
            <Card
                onClick={connect}
                className={'green-shadow'}
                hoverable
                style={{ width: 450, margin: "5% 38% 0 38%", borderRadius: '0px' }}
            >
              <img
                  alt="metmask icon"
                  src={metamaskIcon}
                  style={{ width: 80, paddingBottom: "2rem" }}
              />
              <Meta
                  title={
                    window.web3
                        ? "Connect With MetaMask"
                        : "Please Install MetaMask"
                  }
                  description="MetaMask is crypto wallet & gateway to blockchain apps"
              />
            </Card>
          </Row>


        </div>
      </Content>
    </Layout>
  );
}
