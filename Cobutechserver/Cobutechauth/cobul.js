const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const db = require('../cobudb'); 
const jwtSecret = process.env.JWT_SECRET ||
const handleSignin = (app) => {
    app.post('/api/auth/signin', async (req, res) => {
        const { email, password } = req.body; 
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password.' });
        }
        try {
            const userResult = await db.query(
                'SELECT user_id, username, email, password_hash, is_verified, verification_code_expiry FROM users WHERE email = $1',
                [email]
            );

            if (userResult.rows.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }
            const user = userResult.rows[0]; 
            if (!user.is_verified) {
                return res.status(403).json({
                    message: 'Your email is not verified. Please check your email for the verification code or sign up again.',
                email: user.email
                });
            }
            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }
            const token = jwt.sign(
                { userId: user.user_id, email: user.email, username: user.username }, 
                jwtSecret, 
                { expiresIn: '1h' } 
            );
            res.status(200).json({
                message: 'Login successful!',
                token: token, 
                user: { 
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    is_verified: user.is_verified 
                }
            });
        } catch (error) {
            // Handle any unexpected errors during the process
            console.error('Error during sign-in:', error);
            res.status(500).json({ message: 'An error occurred during sign-in.' });
        }
    });
};
module.exports = handleSignin; 
