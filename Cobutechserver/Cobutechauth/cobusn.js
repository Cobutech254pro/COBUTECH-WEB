// Cobutechserver/Cobutechauth/signin.js
const bcrypt = require('bcrypt');
const db = require('../cobudb'); // Adjust path as needed
const jwt = require('jsonwebtoken'); // <--- ADD THIS LINE to handle JWTs for successful sign-in

const handleSignin = (app, jwtSecret) => { // <--- Pass jwtSecret here
    app.post('/api/auth/signin', async (req, res) => {
        const { usernameOrEmail, password } = req.body; // 'usernameOrEmail' is from frontend

        console.log('--- SIGN-IN ATTEMPT ---');
        console.log('Received sign-in request for:', usernameOrEmail);

        if (!usernameOrEmail || !password) {
            console.log('Error: Missing username/email or password.');
            return res.status(400).json({ message: 'Please provide both username/email and password.' });
        }

        try {
            // Query the database to find the user by username or email
            const userResult = await db.query(
                'SELECT user_id, username, email, password_hash, is_verified FROM users WHERE username = $1 OR email = $1', // <--- Select password_hash
                [usernameOrEmail]
            );

            if (userResult.rows.length === 0) {
                console.log('User not found for:', usernameOrEmail);
                return res.status(401).json({ message: 'Invalid username/email or password.' });
            }

            const user = userResult.rows[0];

            // Check if the user is verified
            if (!user.is_verified) {
                console.log('Unverified user attempting sign-in:', user.email);
                return res.status(403).json({
                    message: 'Account not verified. Please verify your email first.',
                    redirectToVerification: true, // Custom flag for frontend
                    email: user.email // Send email for frontend to use
                });
            }

            // Compare the provided password with the hashed password in the database
            // FIX: Use user.password_hash, not user.password
            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            if (!passwordMatch) {
                console.log('Password mismatch for user:', user.email);
                return res.status(401).json({ message: 'Invalid username/email or password.' });
            }

            // If authentication is successful, generate a JWT (JSON Web Token)
            const token = jwt.sign(
                { userId: user.user_id, email: user.email, username: user.username },
                jwtSecret, // Use your JWT secret from environment variables
                { expiresIn: '1h' } // Token expires in 1 hour
            );

            console.log('Sign-in successful for user:', user.email);
            res.status(200).json({
                message: 'Sign-in successful!',
                token: token, // Send the JWT to the frontend
                userId: user.user_id,
                username: user.username,
                email: user.email
            });

        } catch (error) {
            console.error('CRITICAL ERROR during sign-in:', error);
            res.status(500).json({ message: 'An internal server error occurred during sign-in.' });
        }
    });
};

module.exports = handleSignin;
