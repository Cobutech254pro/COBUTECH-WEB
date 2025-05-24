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

// This function is now solely for sending account verification codes.
// The 'type' parameter and 'password_reset' logic have been removed.
const sendVerificationEmail = async (email, code) => {
    // Subject for account verification
    const subject = 'Your Cobutech Account Verification Code';

    // HTML content for account verification
    const htmlContent = `
        <p>Thank you for signing up for Cobu Tech Industry!</p>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>Please enter this code on the verification page to activate your account.</p>
        <p>This code will expire in 2 minutes.</p>
    `;

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Error sending verification email to ${email}:`, error);
        return false;
    }
};

module.exports = sendVerificationEmail;
