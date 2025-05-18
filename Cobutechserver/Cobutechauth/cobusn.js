// Cobutechserver/Cobutechauth/signin.js
const bcrypt = require('bcrypt');
const db = require('../cobudb'); // Adjust path as needed

const handleSignin = (app) => {
    app.post('/api/auth/signin', async (req, res) => {
        const { usernameOrEmail, password } = req.body;

        if (!usernameOrEmail || !password) {
            return res.status(400).json({ message: 'Please provide both username/email and password.' });
        }

        try {
            // Query the database to find the user by username or email
            const userResult = await db.query(
                'SELECT * FROM users WHERE username = $1 OR email = $1',
                [usernameOrEmail]
            );

            if (userResult.rows.length === 0) {
                return res.status(401).json({ message: 'Invalid username/email or password.' });
            }

            const user = userResult.rows[0];

            // Compare the provided password with the hashed password in the database
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid username/email or password.' });
            }

            // If authentication is successful, you would typically generate a session or a token here
            // For now, let's just send a success message
            res.status(200).json({ message: 'Sign-in successful!', userId: user.id, username: user.username, email: user.email });

        } catch (error) {
            console.error('Error during sign-in:', error);
            res.status(500).json({ message: 'An error occurred during sign-in.' });
        }
    });
};

module.exports = handleSignin;
