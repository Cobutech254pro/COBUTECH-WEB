// Cobutechserver/server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const handleSignup = require('./Cobutechauth/cobus');
const handleSignin = require('./Cobutechauth/cobusn.js'); // Import the signin route handler

const app = express();
const port = process.env.PORT || 3000; // Use environment port or default to 3000
const frontendPath = path.join(__dirname, '..','Cobutech'); // Point to the parent directory (root)

app.use(bodyParser.json());

// Serve index.html as the entry point (using environment variable)
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Mount the signup route handler
handleSignup(app);

// Mount the signin route handler
handleSignin(app);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
