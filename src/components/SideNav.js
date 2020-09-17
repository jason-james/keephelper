import { Menu } from "antd";
import Icon from "@ant-design/icons";
import React, { useState } from "react";
import Sider from "antd/es/layout/Sider";
import {
  NumberOutlined,
  StopOutlined,
  SlidersOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import KeepHelperLogo from '../images/keephelper_logo_light.png'
import KeepHelperLogoText from '../images/keephelper_text_2.png'

export function SideNav(props) {
  const [collapsed, setCollapsed] = useState(false);

  const onCollapse = collapsed => {
    setCollapsed(collapsed);
  };

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
      {collapsed && <div className="sidebar-logo" ><img src={KeepHelperLogo} width={50}></img></div>}
      {!collapsed && <div className="sidebar-logo" ><img src={KeepHelperLogoText} height={40}></img></div>}

      <Menu theme="dark" mode="inline">
        <Menu.Item
          key="1"
          icon={props.connected ? <NumberOutlined /> : <StopOutlined />}
        >
          <Link to="/">RandomBeacon</Link>
        </Menu.Item>
        <Menu.Item
          key="2"
          icon={
            props.connected ? <SlidersOutlined /> : <StopOutlined />
          }
        >
          <Link to="/liquidations">tBTC Liquidations</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}
