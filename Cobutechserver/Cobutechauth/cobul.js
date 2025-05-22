const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../cobudb'); // Ensure this path is correct relative to cobusn.js

// Renamed function to handleLogin
const handleLogin = (app, jwtSecret) => {
    // Renamed endpoint to /api/auth/login
    app.post('/api/auth/login', async (req, res) => {
        // --- Debugging: Log incoming request body ---
        console.log('--- LOGIN ATTEMPT (Backend) ---'); // Renamed from SIGNIN ATTEMPT
        console.log('Received login request body:', req.body);
        const { email, password } = req.body;

        // --- Data Cleaning: Trim whitespace ---
        const cleanedEmail = email ? email.trim() : '';
        const cleanedPassword = password ? password.trim() : '';

        console.log('Cleaned Email:', cleanedEmail);
        console.log('Cleaned Password (first 5 chars):', cleanedPassword.substring(0, 5) + '...');

        if (!cleanedEmail || !cleanedPassword) {
            console.log('Error: Missing email or password in request.');
            return res.status(400).json({ message: 'Please provide both email and password.' });
        }

        try {
            const userResult = await db.query(
                'SELECT user_id, username, email, password_hash, is_verified, verification_code_expiry FROM users WHERE email = $1',
                [cleanedEmail]
            );

            // --- Debugging: Log database query result ---
            console.log('Database query result for email:', cleanedEmail);
            console.log('Number of rows found:', userResult.rows.length);

            if (userResult.rows.length === 0) {
                console.log('User not found for email:', cleanedEmail);
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            const user = userResult.rows[0];
            // --- Debugging: Log retrieved user data (excluding full hash for safety) ---
            console.log('User found:', {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                is_verified: user.is_verified,
                password_hash_prefix: user.password_hash.substring(0, 10) + '...'
            });

            // --- Verification Status Check ---
            if (!user.is_verified) {
                console.log('User email not verified:', user.email);
                return res.status(403).json({
                    message: 'Your email is not verified. Please check your email for the verification code.',
                    email: user.email,
                    user: { // Ensure 'user' object is included for frontend to check is_verified
                        is_verified: false
                    }
                });
            }

            // --- Password Comparison Debugging ---
            console.log('Comparing input password with stored hash...');
            console.log('Input password (cleaned, partial):', cleanedPassword.substring(0, 5) + '...');
            console.log('Stored hash (partial):', user.password_hash.substring(0, 10) + '...');

            const passwordMatch = await bcrypt.compare(cleanedPassword, user.password_hash);

            console.log('Password comparison result (passwordMatch):', passwordMatch);

            if (!passwordMatch) {
                console.log('Password comparison FAILED for email:', cleanedEmail);
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            // If we reach here, credentials are correct and email is verified
            console.log('Login successful for user:', user.username);

            // --- JWT Generation ---
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
            console.error('CRITICAL ERROR during login process:', error); // Renamed from sign-in process
            res.status(500).json({ message: 'An internal server error occurred during login.' }); // Renamed from sign-in
        }
    });
};

module.exports = handleLogin; // This exports the handleLogin function
