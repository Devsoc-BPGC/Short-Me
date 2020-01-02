// Handle authentication of users
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require('config');
const User = require("../models/User");
const Url = require("../models/Url");
const querystring = require('querystring'); //Just added to send query
const verify = require('../verifyToken');
const MT = require('mersenne-twister');
const base = require('base-converter');
const generator = new MT();

const {
  registerValidation,
  loginValidation
} = require("../validation");

//Checks whitespaces in username (even white spaces like tab)
function hasWhiteSpace(s) {
  return /\s/g.test(s);
}

async function tokenVerified(token) {
  //function replies with a value only if verified else null.
  if(!token) {return null};
  const TOKEN_SECRET = config.get("tokenSecret");
  //token can be verifies async, check if its a better method
  const verified = jwt.verify(token, TOKEN_SECRET, function (err) {
      if (err) {return null;}
  }); 
  return verified;
}
//Since no session we are not using redirectLogin so need to find different way to redirect back to loginpage in case of user not found.
// Login middleware
/* const redirectLogin = (req, res, next) => {
  if(!req.session.userId) {
    console.log(req.session.userId);
    res.redirect('/api/user/loginpage'); //redirecting becomes easier if we change name from login to loginpage
  } else {
    next();
  }
}
// Dashboard middleware
const redirectDashboard = (req, res, next) => {
  if(req.session.userId) {
    res.redirect('/api/user/dashboard');
  } else {
    next();
  }
} */

// @route   POST /api/user/register
// @desc    Register user
router.post("/register", async (req, res) => {
  // Validate the register data
  const {
    value,
    error
  } = registerValidation(req.body);

  if (error) {
  console.log('Invalid user credentials.', error.details[0].message);
  return res.redirect(400 ,'/api/user/registerpage'); //I think front-end should send error on registerpage like invalid email,etc.
  }
  // Check if user already exists
  const emailExist = await User.findOne({
    email: req.body.email
  });
  if (emailExist) {
  //console.log('This email already exists.')
  return res.redirect('/api/user/registerpage');
  }
  
  const nameExist = await User.findOne({
    name: req.body.name
  });
  if (nameExist) {
  //console.log('This username already exists.')
  return res.redirect('/api/user/registerpage');
  }

  if(hasWhiteSpace(req.body.name)){
    //res.send('Username cannot contain a whitespace');
    return res.redirect('/api/user/loginpage');
  }
  // Hash passwords
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // TODO: Modify user object wrt new schema with urls empty object {}
  // Create a new user 
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    urls: []
  });
  try {
    await user.save();
    // Create and assign a token
    const TOKEN_SECRET = config.get("tokenSecret")
    const token = jwt.sign({_id: user._id}, TOKEN_SECRET);
    //Redirect with query params 
    const query = querystring.stringify({
    "token": token,
    "username": user.name
    });
    res.redirect('/api/user/dashboard/?' + query);
  } catch (err) {
    return res.redirect('/api/user/registerpage');
  }
});


// @route   POST /api/user/login
// @desc    Login user
router.post("/login", async (req, res) => {
  // Validate the login data
  const {
    value,
    error
  } = loginValidation(req.body);

  if (error) {
    res.status(400).send(error.details[0].message);
    return res.redirect('/api/user/loginpage');
  }

  // Check if email exists
  let user = await User.findOne({
    email: req.body.email
  });
  if (!user) {
    //res.status(400).send("Email or the password is wrong");
    return res.redirect('/api/user/loginpage');
  }
  // Check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) {
    //res.status(400).send("Email or the password is wrong");
    return res.redirect('/api/user/loginpage');
  }

  // Create and assign a token
  const TOKEN_SECRET = config.get("tokenSecret")
  const token = jwt.sign({_id: user._id}, TOKEN_SECRET);
  //Redirect with query params 
  // frontend needs to store this token and userID for further tasks in dashboard
  const query = querystring.stringify({
  "token": token,
  "username": user.name
  });
  //if error comes to use try-catch for throwing into async function, use it for register as well
  try{
  return res.redirect('/api/user/dashboard/?' + query);
  // console.log('Redirected.');
  } catch (err) {
  console.log('error', err);
  // return res.redirect('/api/user/loginpage');
  }
});
  


// @route   GET /api/user/dashboard
// @desc    Dashboard for the logged in  user ( private route )
router.get('/dashboard', async (req, res) => {
  const username = req.query.username;
  //console.log(username);
  if (verify(req)) {
    let user = await User.findOne({name: username});
    if (user) {
    //console.log(req.query.token);
    //console.log('In dashboard');
    res.send(user);
    } else {
      console.log('User not found');
      return res.redirect('/api/user/loginpage');
    }
  }
  else {
    console.log('Not verified.');
    return res.redirect('/api/user/loginpage');
  }
})


// @route   POST /api/user/shorten
// @desc    Api for generating short url from dashboard
// Shorten might require session and cookies since we need to keep the user logged in throughout the preocess. And we have no other way to send the data.
router.post('/shorten/:token/:name', async (req, res) => {
    // the frontend needs to keep the token saved
    const token = req.params.token;
    const username = req.params.name;
    const user = await User.findOne({name: username});
    //console.log(user.name);
    const longUrl = req.body.longUrl;
    const customCode = req.body.customCode;
    const baseUrl = config.get('baseUrl');
    if (tokenVerified(token)){
      //function to pad 0s upto 6 digits
      function padDigits (number, digits) {
        return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
      }
      let userp = await User.findOne({"urls.longUrl": longUrl});
      if(userp.name === username){
        return res.status(422).json('You already have this longUrl.');
      }
      //No two users can have same randomurl since both of them should have different redirectCount and no way to tell if they have same hash
      //Another reason is that the users might generate short url at different time and one user might have generated some redirectCount in that time.  
      if (!customCode) {
        try {
          urlCode = padDigits(base.decTo62(generator.random_int()), 6); //generating a mersenne-twister random number
          let user = await User.findOne({"urls.urlCode": urlCode});
          //The while block runs until the urlCode generated is unique
          while (user) {
          urlCode = padDigits(base.decTo62(generator.random_int()), 6); //generating a mersenne-twister random number
          user = await User.findOne({"urls.urlCode": urlCode});
          }
          const shortUrl = baseUrl + '/' + urlCode;
    
          url = new Url({
          longUrl,
          shortUrl,
          urlCode,
          redirectCount: 0,
          date: new Date()
          });

          await user.urls.push( url );
          await user.save();
          //console.log(user);
          //console.log(user.email);
          const query = querystring.stringify({
          "token": token,
          "username": user.name
          });
          //if error comes to use try-catch for throwing into async function, use it for register as well
          try{
          return res.redirect('/api/user/dashboard/?' + query);
          // console.log('Redirected.');
          } catch (err) {
          console.log('error', err);
          }
        } catch (err) {
          console.error(err);
          res.status(500).json('Server error');
        }
      } //The following block runs when customCode is given
      else {
        try {
          let user = await User.findOne({"urls.urlCode": customCode}) // Check if the custom code already exists
          
          if (user){
            //If customCode is already present in the document then we let anyone use it.
            res.status(400).json("That url code is already used. Try another");
        } //The custom url entered is unique and can be used to generate short url.
          else {
            const shortUrl = baseUrl + '/' + customCode;
            const urlCode = customCode;
            url = new Url({
            longUrl,
            shortUrl,
            urlCode,
            redirectCount: 0,
            date: new Date()
            });

            await user.urls.push(url);
            await user.save();
     
            const query = querystring.stringify({
              "token": token,
              "username": user.name
              });
              //if error comes to use try-catch for throwing into async function, use it for register as well
              try{
              return res.redirect('/api/user/dashboard/?' + query);
              // console.log('Redirected.');
              } catch (err) {
              console.log('error', err);
            }
          }
        } catch (err) {
          console.error(err);
          res.status(500).json('Server error');
        }
      }
  }
});

router.get('/loginpage',  (req, res) => {
  //Render login page
  res.send("At login");
})

router.get('/registerpage',  (req, res) => {
  //Render register page
  res.send("At register page");
})

router.get('/signout',  (req, res) => {
  //Redirect to home page.
  return res.redirect('/api/user/loginpage');
})
module.exports = router;