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
            const existingUserByUsername = await db.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );
            if (existingUserByUsername.rows.length > 0) {
                return res.status(409).json({ message: 'Username already exists.' });
            }
            const existingUserByEmail = await db.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            if (existingUserByEmail.rows.length > 0) {
                return res.status(409).json({ message: 'Email already exists.' });
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiryTime = new Date(Date.now() + 120000); 
            const newUserResult = await db.query(
                'INSERT INTO users (username, email, password_hash, verification_code_expiry, registration_date, verification_token) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING user_id, username, email',
                [username, email, hashedPassword, verificationCode, expiryTime, verificationCode] 
            );
            const emailSent = await sendVerificationEmail(email, verificationCode);
            if (emailSent) {
                res.status(201).json({ message: 'User created successfully! Please check your email for the verification code.', user: newUserResult.rows[0] });
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
