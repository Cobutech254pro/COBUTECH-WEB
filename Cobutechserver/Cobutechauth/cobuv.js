const db = require('../cobudb');
const handleVerifyCode = (app, jwtSecret) => {
    app.post('/api/auth/verify-code', async (req, res) => {
        const { email, verificationCode } = req.body;
        if (!email || !verificationCode) {
            return res.status(400).json({ message: 'Please provide email and verification code.' });
        }
        try {
            const userResult = await db.query(
                'SELECT user_id, email, is_verified, verification_code, verification_code_expiry FROM users WHERE email = $1',
                [email]
            );
            if (userResult.rows.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }
            const user = userResult.rows[0];
            if (user.is_verified) {
                return res.status(200).json({ message: 'Account is already verified.' });
            }
            const currentTime = new Date();
            if (user.verification_code === verificationCode && currentTime < user.verification_code_expiry) {
                await db.query(
                    'UPDATE users SET is_verified = TRUE, verification_code = NULL, verification_code_expiry = NULL WHERE user_id = $1',
                    [user.user_id]
                );
                return res.status(200).json({ message: 'Account verified successfully! You can now log in.' });
            } else if (currentTime >= user.verification_code_expiry) {
                return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            } else {
                return res.status(400).json({ message: 'Invalid verification code.' });
            }
        } catch (error) {
            console.error('Error during code verification:', error);
            res.status(500).json({ message: 'An error occurred during verification.' });
        }
    });
};
module.exports = handleVerifyCode;
