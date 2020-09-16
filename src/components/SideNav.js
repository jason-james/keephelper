import { Menu } from "antd";
import React, { useState } from "react";
import Sider from "antd/es/layout/Sider";
import { NumberOutlined, StopOutlined } from "@ant-design/icons";

export function SideNav(props) {
  const [collapsed, setCollapsed] = useState(true);

  const onCollapse = collapsed => {
    setCollapsed(collapsed);
  };

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div className="logo" />
      <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
        <Menu.Item
          key="1"
          icon={props.connected ? <NumberOutlined /> : <StopOutlined />}
        >
          RandomBeacon
        </Menu.Item>
      </Menu>
    </Sider>
  );
}
