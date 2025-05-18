// Cobutechserver/db.js
const { Pool } = require('pg');

// Replace with your Neon PostgreSQL connection details
const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432, // Default PostgreSQL port
    ssl: {
        rejectUnauthorized: false, // For secure connection (recommended for production)
    },
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(), // Optional: for more complex transactions
};
