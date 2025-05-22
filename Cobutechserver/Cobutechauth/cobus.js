const bcrypt = require('bcrypt'); 
const db = require('../cobudb'); 
const sendVerificationEmail = require('../Cobutechutils/cobuut.js');

const handleSignup = (app) = { 
    app.post('/api/auth/signup', async (req, res) => { 
        const { username, email, password } = req.body;

if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // Check for existing email
        const existingUserByEmail = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUserByEmail.rows.length > 0) {
            const user = existingUserByEmail.rows[0];

            if (!user.verified) {
                // Resend verification code if unverified
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                const expiryTime = new Date(Date.now() + 120000); // 2 minutes

                await db.query(
                    'UPDATE users SET verification_code = $1, verification_code_expiry = $2 WHERE email = $3',
                    [verificationCode, expiryTime, email]
                );

                const emailSent = await sendVerificationEmail(email, verificationCode);
                if (emailSent) {
                    return res.status(200).json({
                        message: 'Account exists but is not verified. Verification code has been resent.',
                        userId: user.user_id,
                        email: user.email
                    });
                } else {
                    return res.status(500).json({ message: 'Failed to resend verification code.' });
                }
            }

            return res.status(409).json({ message: 'Email already exists and is verified.' });
        }

        // Check for existing username
        const existingUserByUsername = await db.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        if (existingUserByUsername.rows.length > 0) {
            return res.status(409).json({ message: 'Username already exists.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTime = new Date(Date.now() + 120000);

        const newUserResult = await db.query(
            'INSERT INTO users (username, email, password_hash, verification_code, verification_code_expiry, registration_date, verification_token) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING user_id, username, email',
            [username, email, hashedPassword, verificationCode, expiryTime, verificationCode]
        );

        const emailSent = await sendVerificationEmail(email, verificationCode);

        if (emailSent) {
            res.status(201).json({
                message: 'User created successfully! Please check your email for the verification code.',
                user: newUserResult.rows[0]
            });
        } else {
            console.error('Error sending verification email to:', email);
            res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
        }
    } catch (error) {
        console.error('Error during sign-up:', error);
        res.status(500).json({ message: 'An error occurred during sign-up.' });
    }
});

};

module.exports = handleSignup;

