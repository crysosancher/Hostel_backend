const config = require('./config/env');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');  // Add more routes as needed

const app = express();
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);  // Example of another route grouping

const PORT = config.server.port;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
