const connectDB = require('./config/db');
connectDB();

const Url = require('../Tiny-Url/models/Url')
const User = require('../Tiny-Url/models/User');

/*Run the code commented below in order to store admin details 
let user = new User({name: '@Admin', email: 'Admin@123.com', password: '123456', urls:[]});
try {
    user.save();
    console.log('Saved!');
} catch (err) {
    console.log(err);
}
*/

/*
async function findUser () {
let url = await Url.findOne({urlCode: '3pbYju'});
const count = url.redirectCount +1;
user = await User.find({'urls._id': url._id});
//console.log(user[0]); 
/* const user = await User.findOne({name: 'TinyRick'});
console.log(user.urls) */
let i =0;
while(user[i]){
const filter =  {name: user[i].name, "urls._id": url._id};
const update = {"urls.$.redirectCount": count};
userp = await User.findOneAndUpdate(filter, update);
await url.update({redirectCount: count});
await userp.save();
console.log(userp);
console.log(count);
i++;
}
}

findUser();
*/
