import React, { useEffect, useState } from "react";
import RandomBeacon from "./views/RandomBeacon";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Web3 from "./components/Web3";
import { Layout } from "antd";
import { SideNav } from "./components/SideNav";
import { Connect } from "./components/Connect";
import { Liquidations } from "./views/Liquidations";

function App() {
  const [connected, setConnected] = useState(null);

  return (
    <Web3>
      <Layout style={{ minHeight: "100%" }}>
        <Router>
            <SideNav connected={connected} />
            {!connected ? (
            <Connect setConnected={setConnected} />
          ) : (
            <Switch>

                <Route path="/liquidations">
                    <Liquidations/>
                </Route>
                <Route path="/">
                    <RandomBeacon/>
                </Route>
            </Switch>
          )}
        </Router>
      </Layout>
    </Web3>
  );
}

export default App;
