const db = require('../cobudb'); 
const bcrypt = require('bcrypt');
const sendVerificationEmail = require('../Cobutechutils/cobuut.js');
const handleForgotPasswordReset = (app) => {
    app.post('/api/auth/request-password-reset-code', async (req, res) => {
        console.log('--- PASSWORD RESET CODE REQUEST (Backend) ---');
        const { email } = req.body;
        const cleanedEmail = email ? email.trim() : '';
        console.log('Received email for reset code:', cleanedEmail);
        if (!cleanedEmail) {
            return res.status(400).json({ message: '𝐄𝐦𝐚𝐢𝐥 𝐢𝐬 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝.' });
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
            const emailSent = await sendVerificationEmail(cleanedEmail, resetCode, 'password_reset'); 
            if (emailSent) {
                console.log(`Password reset code email sent to ${cleanedEmail}`);
                res.status(200).json({ message: '𝐀 𝐩𝐚𝐬𝐬𝐰𝐨𝐫𝐝 𝐫𝐞𝐬𝐞𝐭 𝐜𝐨𝐝𝐞 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐬𝐞𝐧𝐭 𝐭𝐨 𝐲𝐨𝐮𝐫 𝐞𝐦𝐚𝐢𝐥.' });
            } else {
                console.error('Failed to send password reset email to:', cleanedEmail);
                res.status(500).json({ message: '𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐬𝐞𝐧𝐝 𝐫𝐞𝐬𝐞𝐭 𝐜𝐨𝐝𝐞. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.' });
            }
        } catch (error) {
            console.error('Error requesting password reset code:', error);
            res.status(500).json({ message: '𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐫𝐞𝐪𝐮𝐞𝐬𝐭.' });
        }
    });
    app.post('/api/auth/verify-password-reset-code', async (req, res) => {
        console.log('--- PASSWORD RESET CODE VERIFICATION (Backend) ---');
        const { email, code } = req.body;
        const cleanedEmail = email ? email.trim() : '';
        const cleanedCode = code ? code.trim() : '';
        console.log('Received verification for email:', cleanedEmail, 'with code:', cleanedCode);
        if (!cleanedEmail || !cleanedCode) {
            return res.status(400).json({ message: '𝐄𝐦𝐚𝐢𝐥 𝐚𝐧𝐝 𝐜𝐨𝐝𝐞 𝐚𝐫𝐞 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝.' });
        }
        try {
            const userResult = await db.query(
                'SELECT user_id, password_reset_code, password_reset_expiry FROM users WHERE email = $1',
                [cleanedEmail]
            );
            const user = userResult.rows[0];
            if (!user) {
                console.log('User not found for verification:', cleanedEmail);
                return res.status(404).json({ message: '𝐔𝐬𝐞𝐫 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝.' });
            }
            if (!user.password_reset_code || user.password_reset_code !== cleanedCode) {
                console.log('Invalid or incorrect reset code for user:', cleanedEmail);
                return res.status(400).json({ message: '𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐯𝐞𝐫𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐜𝐨𝐝𝐞.' });
            }
            if (new Date() > new Date(user.password_reset_expiry)) {
                console.log('Expired reset code for user:', cleanedEmail);
                await db.query('UPDATE users SET password_reset_code = NULL, password_reset_expiry = NULL WHERE user_id = $1', [user.user_id]);
                return res.status(400).json({ message: '𝐕𝐞𝐫𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐜𝐨𝐝𝐞 𝐡𝐚𝐬 𝐞𝐱𝐩𝐢𝐫𝐞𝐝 ❌.' });
            }
            await db.query('UPDATE users SET password_reset_code = NULL, password_reset_expiry = NULL WHERE user_id = $1', [user.user_id]);
            console.log(`Reset code for ${cleanedEmail} verified and invalidated.`);
            res.status(200).json({
                message: '𝐕𝐄𝐑𝐈𝐅𝐈𝐄𝐃 ✅.',
                email: cleanedEmail
            });
        } catch (error) {
            console.error('Error verifying password reset code:', error);
            res.status(500).json({ message: '𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐝𝐮𝐫𝐢𝐧𝐠 𝐜𝐨𝐝𝐞 𝐯𝐞𝐫𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧.' });
        }
    });
    app.post('/api/auth/reset-password', async (req, res) => {
        console.log('--- PASSWORD RESET (Backend) ---');
        const { email, newPassword } = req.body;
        const cleanedEmail = email ? email.trim() : '';
        const cleanedNewPassword = newPassword ? newPassword.trim() : '';
        console.log('Received password reset for email:', cleanedEmail);
        if (!cleanedEmail || !cleanedNewPassword) {
            return res.status(400).json({ message: '𝐄𝐦𝐚𝐢𝐥 𝐚𝐧𝐝 𝐧𝐞𝐰 𝐩𝐚𝐬𝐬𝐰𝐨𝐫𝐝 𝐚𝐫𝐞 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝.' });
        }
        if (cleanedNewPassword.length < 8) {
            return res.status(400).json({ message: '𝐏𝐚𝐬𝐬𝐰𝐨𝐫𝐝 𝐦𝐮𝐬𝐭 𝐛𝐞 𝐚𝐭 𝐥𝐞𝐚𝐬𝐭 8 𝐜𝐡𝐚𝐫𝐚𝐜𝐭𝐞𝐫𝐬 𝐥𝐨𝐧𝐠.' });
        }
        try {
            const userResult = await db.query('SELECT user_id FROM users WHERE email = $1', [cleanedEmail]);
            const user = userResult.rows[0];
            if (!user) {
                console.log('User not found for password reset:', cleanedEmail);
                return res.status(404).json({ message: '𝐔𝐬𝐞𝐫 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝.' });
            }
            const hashedPassword = await bcrypt.hash(cleanedNewPassword, 10);
            console.log('New password hashed successfully.');
            await db.query(
                'UPDATE users SET password_hash = $1 WHERE user_id = $2',
                [hashedPassword, user.user_id]
            );
            console.log(`Password reset successfully for ${cleanedEmail}`);
            res.status(200).json({ message: '𝐘𝐨𝐮𝐫 𝐩𝐚𝐬𝐬𝐰𝐨𝐫𝐝 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐫𝐞𝐬𝐞𝐭 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐲✅' });
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ message: '𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝‼️❌' });
        }
    });
};
module.exports = handleForgotPasswordReset;
