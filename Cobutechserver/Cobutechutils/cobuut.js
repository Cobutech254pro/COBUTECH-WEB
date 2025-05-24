const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
const sendVerificationEmail = async (email, code, type = 'account_verification') => {
    let subject, htmlContent;

    if (type === 'password_reset') {
        subject = 'Your Cobutech Password Reset Code';
        htmlContent = `
            <p>You requested to reset your Cobutech account password.</p>
            <p>Your password reset code is: <strong>${code}</strong></p>
            <p>Enter this code to proceed. It will expire in 2 minutes.</p>
        `;
    } else {
        subject = 'Your Cobutech Account Verification Code';
        htmlContent = `
            <p>Thank you for signing up for Cobutech!</p>
            <p>Your verification code is: <strong>${code}</strong></p>
            <p>Please enter this code to activate your account. It expires in 2 minutes.</p>
        `;
    }
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            html: htmlContent,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        return false;
    }
};
module.exports = sendVerificationEmail;
