const db = require('../cobudb'); 
const bcrypt = require('bcrypt');
const sendVerificationEmail = require('../../Cobutechutils/cobuut.js');
const handleForgotPasswordReset = (app) => {
    app.post('/api/auth/request-password-reset-code', async (req, res) => {
        console.log('--- PASSWORD RESET CODE REQUEST (Backend) ---');
        const { email } = req.body;
        const cleanedEmail = email ? email.trim() : '';
        console.log('Received email for reset code:', cleanedEmail);
        if (!cleanedEmail) {
            return res.status(400).json({ message: 'Email is required.' });
        }
        try {
            const userResult = await db.query('SELECT user_id FROM users WHERE email = $1', [cleanedEmail]);
            const user = userResult.rows[0];
            if (!user) {
                console.log('Email not found in DB:', cleanedEmail);
                return res.status(200).json({ message: 'If an account with that email exists, a password reset code has been sent.' });
            }
            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = new Date(Date.now() + 2 * 60 * 1000);
            await db.query(
                'UPDATE users SET password_reset_code = $1, password_reset_expiry = $2 WHERE user_id = $3',
                [resetCode, expiry, user.user_id]
            );
            console.log(`Reset code for ${cleanedEmail} generated and stored.`);
            const emailSent = await sendVerificationEmail(cleanedEmail, resetCode, 'password_reset'); // Pass type for subject
            if (emailSent) {
                console.log(`Password reset code email sent to ${cleanedEmail}`);
                res.status(200).json({ message: 'A password reset code has been sent to your email.' });
            } else {
                console.error('Failed to send password reset email to:', cleanedEmail);
                res.status(500).json({ message: 'Failed to send reset code. Please try again later.' });
            }
        } catch (error) {
            console.error('Error requesting password reset code:', error);
            res.status(500).json({ message: 'An error occurred while processing your request.' });
        }
    });
    app.post('/api/auth/verify-password-reset-code', async (req, res) => {
        console.log('--- PASSWORD RESET CODE VERIFICATION (Backend) ---');
        const { email, code } = req.body;
        const cleanedEmail = email ? email.trim() : '';
        const cleanedCode = code ? code.trim() : '';
        console.log('Received verification for email:', cleanedEmail, 'with code:', cleanedCode);
        if (!cleanedEmail || !cleanedCode) {
            return res.status(400).json({ message: 'Email and code are required.' });
        }
        try {
            const userResult = await db.query(
                'SELECT user_id, password_reset_code, password_reset_expiry FROM users WHERE email = $1',
                [cleanedEmail]
            );
            const user = userResult.rows[0];
            if (!user) {
                console.log('User not found for verification:', cleanedEmail);
                return res.status(404).json({ message: 'User not found.' });
            }
            if (!user.password_reset_code || user.password_reset_code !== cleanedCode) {
                console.log('Invalid or incorrect reset code for user:', cleanedEmail);
                return res.status(400).json({ message: 'Invalid verification code.' });
            }
            if (new Date() > new Date(user.password_reset_expiry)) {
                console.log('Expired reset code for user:', cleanedEmail);
                await db.query('UPDATE users SET password_reset_code = NULL, password_reset_expiry = NULL WHERE user_id = $1', [user.user_id]);
                return res.status(400).json({ message: 'Verification code has expired.' });
            }
            await db.query('UPDATE users SET password_reset_code = NULL, password_reset_expiry = NULL WHERE user_id = $1', [user.user_id]);
            console.log(`Reset code for ${cleanedEmail} verified and invalidated.`);
            res.status(200).json({
                message: 'Code verified successfully. You can now set your new password.',
                email: cleanedEmail
            });
        } catch (error) {
            console.error('Error verifying password reset code:', error);
            res.status(500).json({ message: 'An error occurred during code verification.' });
        }
    });
    app.post('/api/auth/reset-password', async (req, res) => {
        console.log('--- PASSWORD RESET (Backend) ---');
        const { email, newPassword } = req.body;
        const cleanedEmail = email ? email.trim() : '';
        const cleanedNewPassword = newPassword ? newPassword.trim() : '';
        console.log('Received password reset for email:', cleanedEmail);
        if (!cleanedEmail || !cleanedNewPassword) {
            return res.status(400).json({ message: 'Email and new password are required.' });
        }
        if (cleanedNewPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }
        try {
            const userResult = await db.query('SELECT user_id FROM users WHERE email = $1', [cleanedEmail]);
            const user = userResult.rows[0];
            if (!user) {
                console.log('User not found for password reset:', cleanedEmail);
                return res.status(404).json({ message: 'User not found.' });
            }
            const hashedPassword = await bcrypt.hash(cleanedNewPassword, 10);
            console.log('New password hashed successfully.');
            await db.query(
                'UPDATE users SET password_hash = $1 WHERE user_id = $2',
                [hashedPassword, user.user_id]
            );
            console.log(`Password reset successfully for ${cleanedEmail}`);
            res.status(200).json({ message: 'Your password has been reset successfully. You can now log in with your new password.' });

        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: 'An error occurred while resetting your password.' });
        }
    });
};
module.exports = handleForgotPasswordReset;
