// Cobutechserver/Cobutechauth/verifyCode.js
const db = require('../cobudb'); 

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
            // 1. Find the user by email
            const userResult = await db.query(
                'SELECT user_id, username, email, verification_code, verification_code_expiry, is_verified FROM users WHERE email = $1',
                [email]
            );

            if (userResult.rows.length === 0) {
                console.log('User not found for email:', email);
                return res.status(404).json({ message: 'User not found.' });
            }

            const user = userResult.rows[0];

            // If already verified, no need to proceed
            if (user.is_verified) {
                console.log('User already verified:', user.email);
                return res.status(200).json({ message: 'Email is already verified!' });
            }

            // 2. Check if the provided code matches the stored verification_code
            if (code !== user.verification_code) {
                console.log('Invalid verification code provided for email:', email);
                return res.status(400).json({ message: 'Invalid verification code.' });
            }

            // 3. Check if the verification code has expired
            const now = new Date();
            const expiryTime = new Date(user.verification_code_expiry);

            if (now > expiryTime) {
                console.log('Verification code expired for email:', email);
                return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }

            // 4. Update the user's is_verified status to TRUE and clear code/expiry
            await db.query(
                'UPDATE users SET is_verified = TRUE, verification_code = NULL, verification_code_expiry = NULL WHERE email = $1',
                [email]
            );

            console.log('Email verified successfully for user:', email);
            // 5. Send a success response
            res.status(200).json({ message: 'Email verified successfully!' });

        } catch (error) {
            console.error('CRITICAL ERROR during verification:', error);
            res.status(500).json({ message: 'An internal server error occurred during verification.' });
        }
    });
};

module.exports = handleVerifyCode;
