
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

// Connect to database
connectDB();

// Middleware functions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

// Define Routes
app.use('/', require('./routes/index'));
app.use('/api/url', require('./routes/url'));
app.use('/api/user', require('./routes/user'));
app.use('/api/login/google', require('./routes/googleAuth'));

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
