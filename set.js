// Updated set.js to use environment variables for sensitive data

const dotenv = require('dotenv');
dotenv.config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_database'
};

module.exports = config;