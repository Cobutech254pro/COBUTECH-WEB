
// Load environment variables as early as possible
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser'); // bodyParser might not be strictly needed with express.json(), but keeping it if other parts use it
const path = require('path');

// Import your handler functions
const handleSignup = require('./Cobutechauth/cobus');
const handleSignin = require('./Cobutechauth/cobusn.js');
const handleVerifyCode = require('./Cobutechauth/cobuv');
const handleResendVerificationCode = require('./Cobutechauth/cobuv'); 
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
app.use(express.static(path.join(__dirname, '../')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});
handleSignup(app, jwtSecret);
handleSignin(app, jwtSecret);
handleVerifyCode(app, jwtSecret);
handleResendVerificationCode(app, jwtSecret);
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
