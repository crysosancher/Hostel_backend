const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken } = require('../utils/tokenUtils');

async function signup(req, res) {
	const { username, password, role_ind = 'USER' } = req.body;
	if (!username || !password) {
			return res.status(400).json({ message: 'Username and password are required.' });
	}

	try {
			// Check if the username already exists
			const existingUser = await User.findByUsername(username);
			if (existingUser) {
					return res.status(409).json({ message: 'Username already exists' });
			}

			// Hash the password and create the user
			const hashedPassword = await bcrypt.hash(password, 10);
			await User.createUser(username, hashedPassword, role_ind);
			res.status(201).json({ message: 'User registered successfully' });
	} catch (err) {
			console.error('Signup error:', err);
			res.status(500).json({ message: 'Signup failed' });
	}
}

async function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });

    try {
        const user = await User.findByUsername(username);
        if (!user || user[4] !== 'Y') return res.status(404).json({ message: 'User not found or inactive' });

        const isPasswordValid = await bcrypt.compare(password, user[2]);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        const token = generateToken({ userId: user[0], username: user[1], role: user[3] });
        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed' });
    }
}

module.exports = { signup, login };
