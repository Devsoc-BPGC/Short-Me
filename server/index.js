const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();

dotenv.config();

// Connect to database
connectDB();

var corsoption = {
  origin: 'https://bp-gc.in',
};
// Middleware functions
app.use(cors(corsoption));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname));
// Define Routes
app.use('/', require('./routes/index'));
app.use('/api/url', require('./routes/url'));
app.use('/api/user', require('./routes/user'));
app.use('/api/login/google', require('./routes/googleAuth'));

const PORT = 5010;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
