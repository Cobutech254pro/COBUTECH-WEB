
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const handleSignup = require('./Cobutechauth/cobus');
const handleSignin = require('./Cobutechauth/cobusn.js');
const handleVerifyCode = require('./Cobutechauth/cobuv'); 
const handleResendVerificationCode = require('./Cobutechauth/cobuv'); 

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));

});
handleSignup(app);
handleSignin(app);
handleVerifyCode(app);
handleResendVerificationCode(app);

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
