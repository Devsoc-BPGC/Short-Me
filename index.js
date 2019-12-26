
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

const app = express();

// Connect to database
connectDB();

// Middleware functions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

// Define Routes
app.use('/', require('./routes/index'));
app.use('/api/url', require('./routes/url'));


const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
