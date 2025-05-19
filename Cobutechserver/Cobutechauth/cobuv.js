const db = require('../cobudb'); // Adjust path as needed

const handleVerifyCode = (app) => {
    app.post('/api/auth/verify-code', async (req, res) => {
        const { email, code } = req.body; // Expecting email and the verification code from the frontend

        if (!email || !code) {
            return res.status(400).json({ message: 'Please provide email and verification code.' });
        }

        try {
            // 1. Find the user by email
            const userResult = await db.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (userResult.rows.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }

            const user = userResult.rows[0];

            // 2. Check if the provided code matches the stored verification_code
            if (code !== user.verification_code) {
                return res.status(400).json({ message: 'Invalid verification code.' });
            }

            // 3. Check if the verification code has expired
            const now = new Date();
            const expiryTime = new Date(user.verification_code_expiry);

            if (now > expiryTime) {
                // Optionally, you might want to allow the user to request a new code here
                return res.status(400).json({ message: 'Verification code has expired.' });
            }

            // 4. Update the user's is_verified status to TRUE
            await db.query(
                'UPDATE users SET is_verified = TRUE, verification_code = NULL, verification_code_expiry = NULL WHERE email = $1',
                [email]
            );

            // 5. Send a success response
            res.status(200).json({ message: 'Email verified successfully!' });

        } catch (error) {
            console.error('Error during verification:', error);
            res.status(500).json({ message: 'An error occurred during verification.' });
        }
    });
};

module.exports = handleVerifyCode;
