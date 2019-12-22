
const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const app = express();

// Connect to database
connectDB();

app.use(express.json());
app.use(bodyParser.urlencoded())

// Define Routes
app.use('/', require('./routes/index'));
app.use('/api/url', require('./routes/url'));

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));