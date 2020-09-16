import React, { useEffect, useState } from "react";
import RandomBeacon from "./views/RandomBeacon";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Web3 from "./network";
import { Layout } from "antd";
import { SideNav } from "./components/SideNav";
import { Connect } from "./components/Connect";

function App() {
  const [connected, setConnected] = useState(null);

  return (
    <Web3>
      <Layout style={{ minHeight: "100%" }}>
        <SideNav connected={connected} />
        <Router>
          {!connected ? (
            <Connect setConnected={setConnected} />
          ) : (
            <Switch>
              <Route>
                <RandomBeacon path="/" />
              </Route>
            </Switch>
          )}
        </Router>
      </Layout>
    </Web3>
  );
}

export default App;
