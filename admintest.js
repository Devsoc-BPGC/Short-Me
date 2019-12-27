const connectDB = require('./config/db');
connectDB();

let User = require('../Tiny-Url/models/User').schema;
var user = new User ({ name: '@Admin', email: 'Admin@123', password: '123456', urls: undefined});
try{
    user.save();
    console.log('Saved!');
} catch (err) {
    console.log(err);
}