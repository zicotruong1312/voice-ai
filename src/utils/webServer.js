const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

function keepAlive() {
    app.get('/', (req, res) => {
        res.send('Voice AI Bot is alive!');
    });

    app.listen(port, () => {
        console.log(`Dummy web server is running on port ${port} (Required for Render Web Service)`);
    });
}

module.exports = keepAlive;
