// Handle authentication of users
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require('config');
const User = require("../models/User");
const Url = require("../models/Url");
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

// @route   POST /api/user/register
// @desc    Register user
router.post("/register", async (req, res) => {
  // Validate the register data
  const {
    value,
    error
  } = registerValidation(req.body);

  if (error) {
  return res.status(500).json({"error": error.details[0].message});
  }
  // Check if user already exists
  const emailExist = await User.findOne({
    email: req.body.email
  });

  if (emailExist) {
    return res.status(400).json({"error": "Email already exists"});
  }
  
  const nameExist = await User.findOne({
    name: req.body.name
  });

  if (nameExist) {
    return res.status(400).json({"error": "Username already exists"});
  }

  if(hasWhiteSpace(req.body.name)){
    return res.status(400).json({"error": "Username cannot contain a whitespace"});
  }
  // Hash passwords
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create a new user 
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    urls: []
  });

  try {
    await user.save();

    return res.status(200).json({"msg": "Registration successful!"});

  } catch (err) {
    return res.status(400).json({"error": err});
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
    return res.status(400).json({"error": error.details[0].message});
  }

  // Check if email exists
  let user = await User.findOne({
    email: req.body.email
  });

  if (!user) {
    return res.status(400).json({"error": "Email or the password is wrong"});
  }

  // Check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass){
    return res.status(400).json({"error": "Email or the password is wrong"});
  }

  // Create and assign a token
  const TOKEN_SECRET = config.get("tokenSecret")
  const token = jwt.sign({_id: user._id}, TOKEN_SECRET);
  res.json({
    "user_id": user._id,
    "auth-token": token
  });
});

// @route   GET /api/user/dashboard
// expects 'auth-token' and 'user-id' in header of request
// @desc    Dashboard for the logged in  user ( private route )
router.get('/dashboard', verify, async (req, res) => {
  const user_id = req.header('user_id');
  if(!user_id) return res.status(500).json({"error": "user_id not provided"});
  try {
    let user = await User.findById(user_id);
    res.json(user);
  } catch (err) {
    res.status(500).json({"error": "User not found"});
  }

})

// @route   POST /api/user/shorten
// expects 'auth-token' and 'user-id' in header of request
// @desc    Api for generating short url from dashboard
router.post('/shorten', verify, async (req, res) => {
  const user_id = req.header('user_id');
  
  try {
    var user = await User.findById(user_id);
  } catch (err) {
    return res.status(500).json({"error": "User not found"});
  }
  const longUrl = req.body.longUrl;
  const customCode = req.body.customCode;

  const baseUrl = config.get('baseUrl');

    //function to pad 0s upto 6 digits
    function padDigits (number, digits) {
      return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
    }
    //No two users can have same randomurl since both of them should have different redirectCount and no way to tell if they have same hash
    //Another reason is that the users might generate short url at different time and one user might have generated some redirectCount in that time.  
     
      //No two users can have same randomurl since both of them should have different redirectCount and no way to tell if they have same hash
      //Another reason is that the users might generate short url at different time and one user might have generated some redirectCount in that time.  
      if (!customCode) {
        let userpresent = await User.findOne({"urls.longUrl": longUrl});
        if(userpresent){
        if(userpresent.name === user.name){
          return res.status(422).json({"error": "You already have this longUrl."});
          }
        }
        try {
          urlCode = padDigits(base.decTo62(generator.random_int()), 6); //generating a mersenne-twister random number
          let users = await User.findOne({"urls.urlCode": urlCode});
          //The while block runs until the urlCode generated is unique
          while (users) {
          urlCode = padDigits(base.decTo62(generator.random_int()), 6); //generating a mersenne-twister random number
          users = await User.findOne({"urls.urlCode": urlCode});
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

          return res.status(200).json({
            "Message": "Url saved",
            "short_url": url.shortUrl
          });
        } catch (err) {
          return res.status(500).json({"error": err});
        }
      } //The following block runs when customCode is given
      else {
        try {
          let users = await User.findOne({"urls.urlCode": customCode}) // Check if the custom code already exists

          if (users){
            //If customCode is already present in the document then we let anyone use it.
            res.status(400).json({"error": "That url code is already used. Try another"});
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

            return res.status(200).json({
              "Message": "Url saved",
              "short_url": url.shortUrl
            });
          }
        } catch (err) {
          return res.status(500).json({"error": err});
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
  return res.send("Signed out");
})
module.exports = router;
