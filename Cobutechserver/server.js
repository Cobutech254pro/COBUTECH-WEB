// Load environment variables as early as possible
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Import your handler functions
const handleSignup = require('./Cobutechauth/cobus');
const handleSignin = require('./Cobutechauth/cobusn.js');
const handleVerifyCode = require('./Cobutechauth/cobuv'); // This handler
const handleResendVerificationCode  = require('./Cobutechauth/cobuvr'); // This handler
const handleLogingin = require('./Cobutechauth/cobul');
const app = express();
const port = process.env.PORT || 5000;

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
    console.error('Please ensure your .env file exists and contains JWT_SECRET.');
    process.exit(1);
}

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../'))); // Serves static files from parent dir

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Pass jwtSecret to ALL handlers for consistency, even if not directly used in all of them.
handleSignup(app, jwtSecret);
handleSignin(app, jwtSecret);
handleVerifyCode(app, jwtSecret); // <--- UPDATED: Passing jwtSecret
handleResendVerificationCode(app, jwtSecret); // <--- UPDATED: Passing jwtSecret
handleLogingin(app, jwtSecret);
// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
