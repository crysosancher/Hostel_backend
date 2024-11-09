require('dotenv').config();

const config = {
    db: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECTION_STRING,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h'  // Set default expiration for tokens
    },
    server: {
        port: process.env.PORT || 3000
    }
};

module.exports = config;
