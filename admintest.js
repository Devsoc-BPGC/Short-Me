const connectDB = require('./config/db');
connectDB();

const User = require('../Tiny-Url/models/User');
user = new User ({ name: '@Admin', email: 'Admin@123', password: '123456'});
try{
    user.save();
    console.log('Saved!');
} catch (err) {
    console.log(err);
}