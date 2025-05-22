const nodemailer = require('nodemailer');
require('dotenv').config(); 
const sendVerificationEmail = async (email, verificationCode) => {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE, 
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASSWORD, 
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_USER, 
            to: email, 
            subject: 'Your Account Verification Code',
            html: `<p>Thank you for signing up for Cobu Tech Industry!</p>
                   <p>Your verification code is: <strong>${verificationCode}</strong></p>
                   <p>Please enter this code on the verification page to activate your account.</p>
                   <p>This code will expire in 2 minutes.</p>`,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return true; 
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false; 
    }
};
module.exports = sendVerificationEmail;
