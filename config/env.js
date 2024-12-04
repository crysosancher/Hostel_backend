require('dotenv').config();

const config = {
    db: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECTION_STRING
        // testUser: process.env.DB_TEST_USER,
        // testPassword: process.env.DB_TEST_PASSWORD,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '12h'  // Set default expiration for tokens
    },
    server: {
        port: process.env.PORT || 5000
    }
};

module.exports = config;
