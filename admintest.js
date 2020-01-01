const connectDB = require('./config/db');
connectDB();

const Url = require('../Tiny-Url/models/Url')
const User = require('../Tiny-Url/models/User');

/* async function Finduser() {
user =await User.findOne({name: '@Admin'});
console.log(user.email);
} */
//Finduser();
async function UpdateInc(){
    let user = await User.findOne({"urls.urlCode": 'hjoKK'});
    const filter = {"urls.urlCode": 'hjoKK'};
    const update = {$inc: {"urls.$.redirectCount": 1}};
    user = await User.findOneAndUpdate(filter, update);
    await user.save();
    /* let user = await User.findOneAndUpdate({"urls.urlCode": 'hjoKK'}, {$inc: {"urls.$.redirectCount": 1}});
    await user.save();
     */
    console.log(user)
}
UpdateInc();
/*  let user = new User({name: '@Admin', email: 'Admin@123', password: '1234567', urls:[]});
try {
    user.save();
    console.log('Saved!');
} catch (err) {
    console.log(err);
}  */
/*
function hasWhiteSpace(s) {
    return /\s/g.test(s);
  }
const s = 'ewmfwie  ncw';
if(hasWhiteSpace(s)){
    console.log('Wassup');
}
*/
/* async function findUser () {
let url = await Url.findOne({urlCode: '3pbYju'});
const count = url.redirectCount +1;
user = await User.find({'urls._id': url._id});
//console.log(user[0]); 
/* const user = await User.findOne({name: 'TinyRick'});
console.log(user.urls) */
/* let i =0;
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

findUser(); */