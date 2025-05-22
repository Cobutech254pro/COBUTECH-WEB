const db = require('../cobudb'); // Adjust path as needed
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); // Assuming Nodemailer is set up
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // Use 'true' for 465 (SSL/TLS)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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

            // Security: Always send a generic response to prevent email enumeration
            if (!user) {
                console.log('Email not found in DB:', cleanedEmail);
                return res.status(200).json({ message: 'If an account with that email exists, a password reset code has been sent.' });
            }

            // Generate a 6-digit numeric code
            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
            // Code expires in 2 minutes
            const expiry = new Date(Date.now() + 2 * 60 * 1000);

            // Store code and expiry in the database
            await db.query(
                'UPDATE users SET password_reset_code = $1, password_reset_expiry = $2 WHERE user_id = $3',
                [resetCode, expiry, user.user_id]
            );
            console.log(`Reset code for ${cleanedEmail} generated and stored.`);

            // Send email with the code
            const mailOptions = {
                from: process.env.EMAIL_USER, // Your sender email
                to: cleanedEmail,
                subject: 'Password Reset Code for Your Account',
                html: `
                    <p>Hello,</p>
                    <p>You recently requested to reset your password.</p>
                    <p>Your password reset code is: <strong>${resetCode}</strong></p>
                    <p>This code is valid for 2 minutes. If you did not request a password reset, please ignore this email.</p>
                    <p>Thank you,</p>
                    <p>The Cobutech Team</p>
                `,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Password reset code email sent to ${cleanedEmail}`);

            res.status(200).json({ message: 'A password reset code has been sent to your email.' });

        } catch (error) {
            console.error('Error requesting password reset code:', error);
            res.status(500).json({ message: 'An error occurred while processing your request.' });
        }
    });

    // =========================================================
    // API 2: POST /api/auth/verify-password-reset-code
    // Verifies the 6-digit code. If valid, allows setting new password.
    // =========================================================
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
                // Clear the expired code from DB to prevent reuse
                await db.query('UPDATE users SET password_reset_code = NULL, password_reset_expiry = NULL WHERE user_id = $1', [user.user_id]);
                return res.status(400).json({ message: 'Verification code has expired.' });
            }

            // Code is valid and not expired. Invalidate it immediately.
            await db.query('UPDATE users SET password_reset_code = NULL, password_reset_expiry = NULL WHERE user_id = $1', [user.user_id]);
            console.log(`Reset code for ${cleanedEmail} verified and invalidated.`);

            res.status(200).json({
                message: 'Code verified successfully. You can now set your new password.',
                email: cleanedEmail // Send email back for frontend to use in next step
            });

        } catch (error) {
            console.error('Error verifying password reset code:', error);
            res.status(500).json({ message: 'An error occurred during code verification.' });
        }
    });


    // =========================================================
    // API 3: POST /api/auth/reset-password
    // Sets the new password after successful code verification
    // =========================================================
    app.post('/api/auth/reset-password', async (req, res) => {
        console.log('--- PASSWORD RESET (Backend) ---');
        const { email, newPassword } = req.body; // Expect newPassword
        const cleanedEmail = email ? email.trim() : '';
        const cleanedNewPassword = newPassword ? newPassword.trim() : '';

        console.log('Received password reset for email:', cleanedEmail);

        if (!cleanedEmail || !cleanedNewPassword) {
            return res.status(400).json({ message: 'Email and new password are required.' });
        }
        if (cleanedNewPassword.length < 8) { // Example: enforce minimum password length
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }

        try {
            const userResult = await db.query('SELECT user_id FROM users WHERE email = $1', [cleanedEmail]);
            const user = userResult.rows[0];

            if (!user) {
                console.log('User not found for password reset:', cleanedEmail);
                return res.status(404).json({ message: 'User not found.' });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(cleanedNewPassword, 10); // Salt rounds: 10
            console.log('New password hashed successfully.');

            // Update user's password in the database
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
