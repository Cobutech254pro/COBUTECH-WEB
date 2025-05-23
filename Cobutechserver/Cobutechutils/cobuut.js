const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendVerificationEmail = async (email, code, type = 'account_verification') => { 
    let subject = '';
    let htmlContent = '';
    if (type === 'password_reset') {
        subject = 'Password Reset Code for Your Cobutech Account';
        htmlContent = `
            <p>Hello,</p>
            <p>You recently requested to reset your password.</p>
            <p>Your password reset code is: <strong>${code}</strong></p>
            <p>This code is valid for 2 minutes. If you did not request a password reset, please ignore this email.</p>
            <p>Thank you,</p>
            <p>The Cobutech Team</p>
        `;
    } else { 
        subject = 'Your Cobutech Account Verification Code';
        htmlContent = `
            <p>Thank you for signing up for Cobu Tech Industry!</p>
            <p>Your verification code is: <strong>${code}</strong></p>
            <p>Please enter this code on the verification page to activate your account.</p>
            <p>This code will expire in 2 minutes.</p>
        `;
    }
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: htmlContent,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`${type === 'password_reset' ? 'Password reset' : 'Verification'} email sent to ${email}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Error sending ${type === 'password_reset' ? 'password reset' : 'verification'} email to ${email}:`, error);
        return false;
    }
};
module.exports = sendVerificationEmail;
