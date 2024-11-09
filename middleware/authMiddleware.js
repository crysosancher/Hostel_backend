const jwt = require('jsonwebtoken');
const config = require('../config/env');

function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided.' });

    jwt.verify(token, config.jwt.secret, (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token.' });
        req.user = decoded;
        next();
    });
}

module.exports = authMiddleware;
