// Handle authentication of users
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require('config');
const User = require("../models/User");
const verify = require('../verifyToken');

const {
  registerValidation,
  loginValidation
} = require("../validation");


// @route   POST /api/user/register
// @desc    Register user
router.post("/register", async (req, res) => {
  // Validate the register data
  const {
    value,
    error
  } = registerValidation(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  // Check if user already exists
  const emailExist = await User.findOne({
    email: req.body.email
  });
  if (emailExist) {
    return res.status(400).send("Email already exists");
  }

  // Hash passwords
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create a new user
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  });
  try {
    const savedUser = await user.save();
    res.send({
      user_id: user._id
    });
    //Create and assign token
    const TOKEN_SECRET = config.get("tokenSecret")
    const token = jwt.sign({_id: user._id}, TOKEN_SECRET);
    res.header("auth-token", token).send(token);
    res.header("userid", user._id).send(user._id);
    
    res.redirect('/dashboard');

  } catch (err) {
    res.status(400).send(err);
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
    return res.status(400).send(error.details[0].message);
  }

  // Check if email exists
  let user = await User.findOne({
    email: req.body.email
  });
  if (!user) {
    return res.status(400).send("Email or the password is wrong");
  }
  // Check if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) {
    return res.status(400).send("Email or the password is wrong");
  }

  // Create and assign a token
  const TOKEN_SECRET = config.get("tokenSecret")
  const token = jwt.sign({_id: user._id}, TOKEN_SECRET);
  res.header("auth-token", token).send(token);
  res.header("userid", user._id).send(user._id);

  res.redirect('/dashboard');
});



// @route   GET /api/user/dashboard
// @desc    Dashboard for the logged in  user ( private route )
router.get('/dashboard', verify, (req, res) => {
    res.send(req.user);
})


// @route   POST /api/user/shorten
// @desc    Api for generating short url from dashboard
router.post('/shorten', async (req, res) => {
    const _id = req.header.userid;
    const user = await User.findOne({ _id });
    const longUrl = req.body.longUrl;
    const customCode = req.body.customCode;
    const baseUrl = config.get('baseUrl');

    if (!customCode) {
      try {
        let url = await Url.findOne({ longUrl });//to check if url already exists
  
        if (url) {
          res.json(url);
        } else {
          urlCode = base.decTo62(generator.random_int()); //generating a mersenne-twister random number
          let Code = await Url.findOne({ urlCode });
          //The while block runs until the urlCode generated is unique
          while (Code) {
            urlCode = base.decTo62(generator.random_int()); //generating a mersenne-twister random number
            Code = await Url.findOne({ urlCode });
          }
          const shortUrl = baseUrl + '/' + padDigits(urlCode,6);
  
          url = new Url({
          longUrl,
          shortUrl,
          urlCode,
          date: new Date()
          });
  
          await url.save();
          user.urls.push( url );
          
          //Create and assign a token
          const TOKEN_SECRET = config.get("tokenSecret")
          const token = jwt.sign({_id: user._id}, TOKEN_SECRET);
          res.header("auth-token", token).send(token);
          res.header("userid", user._id).send(user._id);
          
          res.redirect('/dashboard');
        }
      } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
      }
    } //The following block runs when customCode is given
    else {
      try {
        let url = await Url.findOne({ urlCode: customCode }); // Check if the custom code already exists
  
        if (url)
        {
          //To check if the long url entered by the user is already stored in the database with the given custom url.
          if (url.longUrl == longUrl) {
            res.json(url);
          }
          //The custom url entered is already in use and is associated with a different long url.
          else {
              res.status(400).json("That url code is already used. Try another");
        } 
      } //The custom url entered is unique and can be used to generate short url.
        else {
          const shortUrl = baseUrl + '/' + customCode;
          const urlCode = customCode;
          url = new Url({
          longUrl,
          shortUrl,
          urlCode,
          date: new Date()
          });

          await url.save();
          user.urls.push( url );

          //Create and assign a token
          const TOKEN_SECRET = config.get("tokenSecret")
          const token = jwt.sign({_id: user._id}, TOKEN_SECRET);
          res.header("auth-token", token).send(token);
          res.header("userid", user._id).send(user._id);          
  
          res.redirect('/dashboard');
        }
      } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
      }
    }
});

router.get('/login', (req, res) => {
  //Render login page
})

router.get('/register', (req, res) => {
  //Render register page
})

router.get('/signout', (req, res) => {
  //Redirect to home page.
})
module.exports = router;