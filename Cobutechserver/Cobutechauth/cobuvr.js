// Cobutechserver/Cobutechauth/resendVerification.js
const db = require('../cobudb'); // Adjust path as needed
const sendVerificationEmail = require('../Cobutechutils/cobuut.js'); // Assuming your email utility is here

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
            // Find the user by email
            const userResult = await db.query(
                'SELECT user_id, is_verified FROM users WHERE email = $1',
                [email]
            );

            if (userResult.rows.length === 0) {
                console.log('User not found for resend request (hiding this from user).');
                // For security, always return a generic success message even if email not found
                return res.status(200).json({ message: 'If an account with that email exists, a new verification code has been sent.' });
            }

            const user = userResult.rows[0];

            // If user is already verified, no need to resend
            if (user.is_verified) {
                console.log('User already verified, no resend needed for:', user.email);
                return res.status(200).json({ message: 'Your account is already verified.' });
            }

            // Generate a new verification code and expiry time
            const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const newExpiryTime = new Date(Date.now() + 120000); // 2 minutes (120,000 milliseconds) from now

            // Update the user's record with the new code and expiry
            await db.query(
                'UPDATE users SET verification_code = $1, verification_code_expiry = $2 WHERE user_id = $3',
                [newVerificationCode, newExpiryTime, user.user_id]
            );

            // Send the new email
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

module.exports = handleResendVerificationCode;
