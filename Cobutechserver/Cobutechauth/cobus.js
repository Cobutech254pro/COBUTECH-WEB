// Cobutechserver/Cobutechauth/cobus.js
const bcrypt = require('bcrypt');
const db = require('../cobudb'); // Ensure this path is correct
const sendVerificationEmail = require('../Cobutechutils/cobuut.js'); // Ensure this path is correct

// UPDATED: Added jwtSecret to the parameter list
const handleSignup = (app, jwtSecret) => { // <--- ADDED jwtSecret here
    app.post('/api/auth/signup', async (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        try {
            // Check if user already exists by email
            const existingUserResult = await db.query('SELECT user_id, is_verified, verification_code FROM users WHERE email = $1', [email]);
            // ADDED: Select verification_code to reuse if user is unverified

            if (existingUserResult.rows.length > 0) {
                const user = existingUserResult.rows[0];

                if (!user.is_verified) {
                    // Scenario: User exists but is NOT verified.
                    // Update user's details, resend verification code, and guide to verification.
                    console.log(`Unverified user found: ${email}. Updating details and resending verification email.`);

                    // Option 1: Reuse existing verification code if it's recent enough, or generate new.
                    // For simplicity, let's always generate a new one if they're re-registering unverified.
                    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                    const newExpiryTime = new Date(Date.now() + 120000); // 2 minutes from now
                    const hashedPassword = await bcrypt.hash(password, 10); // Re-hash new password

                    await db.query(
                        `UPDATE users
                         SET username = $1, password_hash = $2, verification_code = $3, verification_code_expiry = $4
                         WHERE user_id = $5`,
                        [username, hashedPassword, newVerificationCode, newExpiryTime, user.user_id]
                    );

                    const emailSent = await sendVerificationEmail(email, newVerificationCode);

                    if (emailSent) {
                        return res.status(200).json({ // Use 200 OK for informational success
                            message: 'Account already exists but is not verified. A new verification code has been sent to your email. Please verify your account.',
                            redirectToVerification: true, // Frontend flag
                            email: email
                        });
                    } else {
                        console.error('Error sending verification email to existing unverified user:', email);
                        return res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
                    }
                } else {
                    // Scenario: User exists AND IS verified.
                    console.log(`Verified user already exists: ${email}.`);
                    return res.status(409).json({ message: 'Account already exists and is verified. Please log in.' });
                }
            }

            // Scenario: New user registration.
            const hashedPassword = await bcrypt.hash(password, 10);
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const verificationCodeExpiry = new Date(Date.now() + 120000); // 2 minutes from now

            const newUserResult = await db.query(
                `INSERT INTO users (username, email, password_hash, verification_code, verification_code_expiry, registration_date, is_verified)
                 VALUES ($1, $2, $3, $4, $5, NOW(), FALSE)
                 RETURNING user_id, username, email`,
                [username, email, hashedPassword, verificationCode, verificationCodeExpiry]
            );

            const emailSent = await sendVerificationEmail(email, verificationCode);

            if (emailSent) {
                res.status(201).json({ // Use 201 Created for new resource
                    message: 'Registration successful! A verification code has been sent to your email. Please verify your account.',
                    redirectToVerification: true, // Frontend flag
                    email: newUserResult.rows[0].email
                });
            } else {
                console.error('Error sending verification email for new user:', email);
                res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
            }

        } catch (error) {
            console.error('CRITICAL ERROR during signup:', error);
            res.status(500).json({ message: 'An internal server error occurred during registration.' });
        }
    });
};

module.exports = handleSignup;
