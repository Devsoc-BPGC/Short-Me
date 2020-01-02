const connectDB = require('./config/db');
connectDB();

const User = require('../models/User');


//This below commented code is to be run to store admin
/*let user = new User({name: '@Admin', email: 'Admin@123', password: '1234567', urls:[]});
try {
    user.save();
    console.log('Saved!');
} catch (err) {
    console.log(err);
}  

*/