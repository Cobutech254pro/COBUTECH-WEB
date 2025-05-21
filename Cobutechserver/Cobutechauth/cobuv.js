
const db = require('../cobudb'); 
const sendVerificationEmail = require('../Cobutechutils/cobuut.js'); 
const handleVerifyCode = (app) => {
    app.post('/api/auth/verify-code', async (req, res) => {
        const { email, code } = req.body; 
        console.log('--- VERIFY CODE ATTEMPT ---');
        console.log('Received verification request for email:', email, 'code:', code);
        if (!email || !code) {
            console.log('Error: Missing email or code for verification.');
            return res.status(400).json({ message: 'Please provide email and verification code.' });
        }
        try {
            const userResult = await db.query(
                'SELECT user_id, username, email, verification_code, verification_code_expiry, is_verified FROM users WHERE email = $1',
                [email]
            );

            if (userResult.rows.length === 0) {
                console.log('User not found for email:', email);
                return res.status(404).json({ message: 'User not found.' });
            }

            const user = userResult.rows[0];
            if (user.is_verified) {
                console.log('User already verified:', user.email);
                return res.status(200).json({ message: 'Email is already verified!' });
            }
            if (code !== user.verification_code) {
                console.log('Invalid verification code provided for email:', email);
                return res.status(400).json({ message: 'Invalid verification code.' });
            }
            const now = new Date();
            const expiryTime = new Date(user.verification_code_expiry);

            if (now > expiryTime) {
                console.log('Verification code expired for email:', email);
                return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
            await db.query(
                'UPDATE users SET is_verified = TRUE, verification_code = NULL, verification_code_expiry = NULL WHERE email = $1',
                [email]
            );
            console.log('Email verified successfully for user:', email);
            res.status(200).json({ message: 'Email verified successfully!' });

        } catch (error) {
            console.error('CRITICAL ERROR during verification:', error);
            res.status(500).json({ message: 'An internal server error occurred during verification.' });
        }
    });
};
const handleResendVerificationCode = (app) => {
    app.post('/api/auth/resend-verification-code', async (req, res) => {
        const { email } = req.body;
        console.log('--- RESEND VERIFICATION ATTEMPT ---');
        console.log('Received resend request for email:', email);
        if (!email) {
            console.log('Error: Email missing for resend request.');
            return res.status(400).json({ message: 'Email is required to resend verification code.' });
        }
        try {
            const userResult = await db.query(
                'SELECT user_id, is_verified FROM users WHERE email = $1',
                [email]
            );
            if (userResult.rows.length === 0) {
                console.log('User not found for resend request (hiding this from user).');
                return res.status(200).json({ message: 'If an account with that email exists, a new verification code has been sent.' });
            }
            const user = userResult.rows[0]
            if (user.is_verified) {
                console.log('User already verified, no resend needed for:', user.email);
                return res.status(200).json({ message: 'Your account is already verified.' });
            }
            const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const newExpiryTime = new Date(Date.now() + 120000); 
            await db.query(
                'UPDATE users SET verification_code = $1, verification_code_expiry = $2 WHERE user_id = $3',
                [newVerificationCode, newExpiryTime, user.user_id]
            );
            const emailSent = await sendVerificationEmail(email, newVerificationCode);

            if (emailSent) {
                console.log('New verification email sent successfully to:', email);
                res.status(200).json({ message: 'A new verification code has been sent to your email.' });
            } else {
                console.error('Error sending new verification email to:', email);
                res.status(500).json({ message: 'Failed to send new verification email. Please try again later.' });
            }

        } catch (error) {
            console.error('CRITICAL ERROR during resend verification:', error);
            res.status(500).json({ message: 'An internal server error occurred during resend verification.' });
        }
    });
};
module.exports = {
    handleVerifyCode,
    handleResendVerificationCode
};
