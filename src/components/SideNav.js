import { Menu } from "antd";
import React, { useState } from "react";
import Sider from "antd/es/layout/Sider";
import { NumberOutlined, StopOutlined, DollarCircleOutlined } from "@ant-design/icons";
import {Link} from "react-router-dom";

export function SideNav(props) {
  const [collapsed, setCollapsed] = useState(true);

  const onCollapse = collapsed => {
    setCollapsed(collapsed);
  };

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <div className="logo" />
      <Menu theme="dark" mode="inline">
        <Menu.Item
          key="1"
          icon={props.connected ? <NumberOutlined /> : <StopOutlined />}
        >
            <Link to='/'>RandomBeacon</Link>

        </Menu.Item>
          <Menu.Item
              key="2"
              icon={props.connected ? <DollarCircleOutlined /> : <StopOutlined />}
          >
              <Link to='/liquidations'>tBTC Liquidations</Link>
          </Menu.Item>
      </Menu>
    </Sider>
  );
}
