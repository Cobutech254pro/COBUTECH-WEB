// Cobutechserver/server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const handleSignup = require('./Cobutechauth/cobus');
const handleSignin = require('./Cobutechauth/cobusn.js'); // Import the signin route handler

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Mount the signup route handler
handleSignup(app);

// Mount the signin route handler
handleSignin(app);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
