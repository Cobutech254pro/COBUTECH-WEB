// Cobutechserver/auth/signup.js
const bcrypt = require('bcrypt');
const db = require('../cobudb'); // Adjust path as needed

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

            const newUser = await db.query(
                'INSERT INTO users (username, email, password_hash,) VALUES ($1, $2, $3,NOW) RETURNING user_id, username, email',
                [username, email, hashedPassword]
            );

            res.status(201).json({ message: 'User created successfully!', user: newUser.rows[0] });

        } catch (error) {
            console.error('Error during sign-up:', error);
            res.status(500).json({ message: 'An error occurred during sign-up.' });
        }
    });
};

module.exports = handleSignup;
              
