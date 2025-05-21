require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const handleSignup = require('./Cobutechauth/cobus');
const handleSignin = require('./Cobutechauth/cobusn.js');
const handleVerifyCode = require('./Cobutechauth/cobuv');
const handleResendVerificationCode  = require('./Cobutechauth/cobuvr');
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
handleVerifyCode(app);
handleResendVerificationCode(app); 

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
