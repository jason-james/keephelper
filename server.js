const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3100;

app.use(express.static(path.join(__dirname, '/build')));

app.listen(port, () => {
    console.log('Server is up!');
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

