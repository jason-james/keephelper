import React from "react";
import { Avatar, Col, Layout, List, Row, Skeleton, Tabs } from "antd";

const { Content } = Layout;
const { TabPane } = Tabs;

export function SkeletonDashboard() {
  const listData = [0, 0, 0, 0, 0, 0];

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
        <Row>
          <Skeleton active className={"skeleton-dashboard-header"} />
        </Row>

        <Row gutter={48} style={{ padding: "2rem" }}>
            <Col lg={24} xl={24} xxl={12} md={24} xs={24} style={{ marginTop: "4rem" }}>
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        backgroundColor: "white",
                        textAlign: "center",
                        paddingTop: "33%"
                    }}
                >
                    <Skeleton.Avatar active />
                </div>
            </Col>
          <Col lg={24} xl={24} xxl={12} md={24} xs={24}>
            <div className="card-container dash-tabs">
              <Tabs type="card">
                  <TabPane tab="Deposits" key="1">
                      <List
                          itemLayout="vertical"
                          size="large"
                          dataSource={listData}
                          renderItem={item => (
                              <Skeleton active avatar>
                                  <List.Item.Meta
                                      avatar={<Avatar src={item.avatar} />}
                                      title={<a href={item.href}>{item.title}</a>}
                                      description={item.description}
                                  />
                                  {item.content}
                              </Skeleton>
                          )}
                      />{" "}
                  </TabPane>
                <TabPane tab="Transfers" key="2">
                  <List
                    itemLayout="vertical"
                    size="large"
                    dataSource={listData}
                    renderItem={item => (
                      <Skeleton active avatar>
                        <List.Item.Meta
                          avatar={<Avatar src={item.avatar} />}
                          title={<a href={item.href}>{item.title}</a>}
                          description={item.description}
                        />
                        {item.content}
                      </Skeleton>
                    )}
                  />{" "}
                </TabPane>

                <TabPane tab="Mints" key="3">
                  <List
                    itemLayout="vertical"
                    size="large"
                    dataSource={listData}
                    renderItem={item => (
                      <Skeleton active avatar>
                        <List.Item.Meta
                          avatar={<Avatar src={item.avatar} />}
                          title={<a href={item.href}>{item.title}</a>}
                          description={item.description}
                        />
                        {item.content}
                      </Skeleton>
                    )}
                  />{" "}
                </TabPane>

                  <TabPane tab="View Your Deposits" key="4">
                      <List
                          itemLayout="vertical"
                          size="large"
                          dataSource={listData}
                          renderItem={item => (
                              <Skeleton active avatar>
                                  <List.Item.Meta
                                      avatar={<Avatar src={item.avatar} />}
                                      title={<a href={item.href}>{item.title}</a>}
                                      description={item.description}
                                  />
                                  {item.content}
                              </Skeleton>
                          )}
                      />{" "}
                  </TabPane>
              </Tabs>
            </div>
          </Col>

        </Row>
      </Content>
    </Layout>
  );
}
