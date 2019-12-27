const connectDB = require('./config/db');
connectDB();

const Url = require('../Tiny-Url/models/Url')
const User = require('../Tiny-Url/models/User');

/*
let user = new User({name: '@admin', email: 'admin@123', password: '123456', urls:[]});
try {
    user.save();
    console.log('Saved!');
} catch (err) {
    console.log(err);
}
*/

let user = User.findOne({name: '@admin' });
let url = new Url({longUrl: 'Sarvesh', shortUrl: 'sarvesh', urlCode: 'shinde', redirectCount: 0});
user.urls.push(url);
console.log(user);