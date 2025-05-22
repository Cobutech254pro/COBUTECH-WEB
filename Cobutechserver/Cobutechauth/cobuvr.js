const db = require('../cobudb'); 
const sendVerificationEmail = require('../Cobutechutils/cobuut.js'); 
const handleResendVerificationCode = (app, jwtSecret) => { 
    app.post('/api/auth/resend-verification-code', async (req, res) => {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Please provide your email address.' });
        }
        try {
            const userResult = await db.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            if (userResult.rows.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }
            const user = userResult.rows[0];
            if (user.is_verified) {
                return res.status(200).json({ message: 'Your account is already verified. Please log in.' });
            }
            const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const newExpiryTime = new Date(Date.now() + 120000); 
            await db.query(
                'UPDATE users SET verification_code = $1, verification_code_expiry = $2 WHERE email = $3',
                [newVerificationCode, newExpiryTime, email]
            );
            const emailSent = await sendVerificationEmail(email, newVerificationCode);
            if (emailSent) {
                res.status(200).json({ message: 'New verification code sent to your email.' });
            } else {
                console.error('Error sending new verification email to:', email);
                res.status(500).json({ message: 'Failed to send new verification email. Please try again later.' });
            }
        } catch (error) {
            console.error('Error during resending verification code:', error);
            res.status(500).json({ message: 'An error occurred while resending the verification code.' });
        }
    });
};
module.exports = handleResendVerificationCode;
