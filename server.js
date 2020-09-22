const axios = require("axios");
const cors = require("cors");
const path = require("path");
const express = require("express");
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT || 3100;

app.use(express.static(path.join(__dirname, "/build")));
app.use(cors());

app.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});

app.get("/btcAddress", async (req, res) => {
  let url;
  if (process.env.REACT_APP_ETHEREUM_NETWORK_VERSION == 1) {
    url = `https://api.blockcypher.com/v1/btc/main/addrs/${
      req.query.btcAddress
    }`;
  } else {
    url = `https://api.blockcypher.com/v1/btc/test3/addrs/${
      req.query.btcAddress
    }`;
  }
  try {
    let btcAddressHistory = await axios.get(url);
    res.send(btcAddressHistory.data);
  } catch (e) {
    res.send(e);
  }
});

app.get("/ethAddress", async (req, res) => {
  let url;
  if (process.env.REACT_APP_ETHEREUM_NETWORK_VERSION == 1) {
    url = `https://api.etherscan.io/api?module=account&action=txlist&address=${
      req.query.ethAddress
    }&startblock=0&endblock=99999999&sort=asc&apikey=${
      process.env.ETHERSCAN_API_KEY
    }`;
  } else {
    url = `https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=${
      req.query.ethAddress
    }&startblock=0&endblock=99999999&sort=asc&apikey=${
      process.env.ETHERSCAN_API_KEY
    }`;
  }
  try {
    let ethAddressHistory = await axios.get(url);
    res.send(ethAddressHistory.data.result);
  } catch (e) {
    res.send(e);
  }
});

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/build/index.html"));
  });
}
