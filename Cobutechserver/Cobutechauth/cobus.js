const bcrypt = require('bcrypt');
const db = require('../cobudb');
const sendVerificationEmail = require('../Cobutechutils/cobuut.js');

const handleSignup = (app) => {
    app.post('/api/auth/signup', async (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        try {
            // Check if user exists by email
            const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);

            if (userCheck.rows.length > 0) {
                const existingUser = userCheck.rows[0];

                if (existingUser.is_verified) {
                    return res.status(409).json({ message: 'Email already exists and is verified.' });
                }

                // Unverified user — update password and resend code
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                const expiryTime = new Date(Date.now() + 120000); // 2 minutes

                await db.query(
                    `UPDATE users 
                     SET username = $1, password_hash = $2, verification_code = $3, verification_code_expiry = $4, verification_token = $5 
                     WHERE email = $6`,
                    [username, hashedPassword, verificationCode, expiryTime, verificationCode, email]
                );

                const emailSent = await sendVerificationEmail(email, verificationCode);
                if (emailSent) {
                    return res.status(200).json({ message: 'Verification code resent to your email. Please verify your account.' });
                } else {
                    return res.status(500).json({ message: 'Failed to resend verification email.' });
                }
            }

            // New user registration
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiryTime = new Date(Date.now() + 120000); // 2 minutes

            const newUser = await db.query(
                `INSERT INTO users (username, email, password_hash, verification_code, verification_code_expiry, registration_date, verification_token, is_verified)
                 VALUES ($1, $2, $3, $4, $5, NOW(), $6, false)
                 RETURNING user_id, username, email`,
                [username, email, hashedPassword, verificationCode, expiryTime, verificationCode]
            );

            const emailSent = await sendVerificationEmail(email, verificationCode);
            if (emailSent) {
                res.status(201).json({
                    message: 'User created successfully! Please check your email for the verification code.',
                    user: newUser.rows[0]
                });
            } else {
                res.status(500).json({ message: 'Failed to send verification email.' });
            }
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ message: 'An error occurred during sign-up.' });
        }
    });
};

module.exports = handleSignup;
