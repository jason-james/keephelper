const axios = require("axios");
const cors = require('cors')
const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3100;

app.use(express.static(path.join(__dirname, '/build')));
app.use(cors())

app.listen(port, () => {
    console.log('Server is up!');
});

app.get('/btcAddress', async (req, res) => {
    try {
        let btcAddressHistory = await axios.get(`https://api.blockcypher.com/v1/btc/test3/addrs/${req.query.btcAddress}`)
        res.send(btcAddressHistory.data)
    } catch  (e) {
        res.send(e)
    }
});

if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname + '/build/index.html'));
    });

}

