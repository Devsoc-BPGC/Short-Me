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

// @route   POST /api/user/register
//          expects 'token' in header
// @desc    Register user
router.post("/register", verify, async (req, res) => {
  // Validate the register data
  userData = req.user;
  console.log(userData);
  const {
    value,
    error
  } = registerValidation(userData);

  if (error) {
  return res.status(500).json({"error": error.details[0].message});
  }
  // Check if user already exists
  const emailExist = await User.findOne({
    email: userData.email.toLowerCase()
  });

  if (emailExist) {
    return res.status(200).json({
      "success": false,
      "error": "Email already exists"
    });
  }

  // Create a new user 
  let user = new User({
    email: userData.email.toLowerCase(),
    urls: []
  });

  try {
    await user.save();

    return res.status(200).json({
      "success": true,
      "msg": "Registration successful!"
    });

  } catch (err) {
    return res.status(400).json({
      "success": false,      
      "error": err
    });
  }
});

/* Commented because we don't need this is CSA app
// @route   POST /api/user/login
// @desc    Login user
router.post("/login", async (req, res) => {
  // Validate the login data
  const {
    value,
    error
  } = loginValidation(req.user);

  if (error) {
    return res.status(400).json({"error": error.details[0].message});
  }

  // Check if email exists
  let user = await User.findOne({
    email: req.body.email.toLowerCase()
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
*/

// @route   GET /api/user/dashboard
// expects 'token'
// @desc    Dashboard for the logged in  user ( private route )
router.get('/dashboard', verify, async (req, res) => {
  userData = req.user;
  try {
    let user = await User.findOne({
      email: userData.email.toLowerCase()
    });
    if (!user) {
      return res.status(500).json({
        "success":false,
        "error": "User does not exist"
      });
    }
    return res.json(user);
  } catch (err) {
    res.status(500).json({
      "success": false,
      "error": "Internal Server Error"
    });
  }

})

// @route   POST /api/user/shorten
// expects 'token' in header
// @desc    Api for generating short url from dashboard
router.post('/shorten', verify, async (req, res) => { 
  userData = req.user;
  try {
    var user = await User.findOne({
      email: userData.email.toLowerCase()
    });
  } catch (err) {
    return res.status(500).json({
      "success": false,
      "error": "User not found"
    });
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
          return res.status(200).json({
            "success": false,
            "error": "You already have this longUrl."
          });
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
            res.status(200).json({
              "success": false,
              "error": "That url code is already used. Try another"
            });
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
          return res.status(500).json({
            "success": false,
            "error": err
          });
        }
    }
});

// @route   DELETE /api/user/url/:id
// expects 'token'
// @desc    Delete the specified shortened url from the user
router.delete('/url/:id', verify, async (req, res) => {
  const userData = req.user;
  const id = req.params.id;
  if (!id){
    return res.status(500).json({
      "success": false,
      "error": "id of the url object not given"
    })
  }
  try {
    const user = await User.findOne({
      email: userData.email.toLowerCase()
    });
    if (!user) {
      return res.status(500).json({
        "success": false,
        "error": "User does not exist"
      });
    }
  let flag = 1;
  for (var i=0; i < user.urls.length; i++){
   if (user.urls[i]._id.toString() === id) {
      user.urls.splice(i,1);
      flag = 0;
      break;
   }}
   if (flag === 1){
    return res.status(500).json({
      "success": false,
      "error": "No url with given custom code"
    });
  }
    await user.save();
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      "success": false,
      "error": "Internal Server Error"
    });
  }
})


// @route   PATCH /api/user/url
// expects 'token'
// @desc    Patch the short url code or the long url code of a shortened url
router.patch('/url/:id', verify, async (req, res) => {
  const userData = req.user;
  const id = req.params.id;
  // optional parameters newCustomCode and newLongUrl
  const customCode = req.body.newCustomCode;
  const longUrl = req.body.newLongUrl;

  if (!id){
    return res.status(500).json({
      "success": false,
      "error": "id of the url object not given"
    })
  }
  try {
    const user = await User.findOne({
      email: userData.email.toLowerCase()
    });
    if (!user) {
      return res.status(500).json({
        "success": false,
        "error": "User does not exist"
      });
    }
  let flag = 1;
  for (var i=0; i < user.urls.length; i++){
   if (user.urls[i]._id.toString() === id) {
     if(customCode) {
      // we need to check if the new custom code given by user is not used anywhere else in database
      try {
        let users = await User.findOne({"urls.urlCode": customCode}) // Check if the custom code already exists

        if (users){
          //If customCode is already present in the document then we dont let anyone use it.
          return res.status(200).json({
            "success": false,
            "error": "That url code is already used. Try another"
          });
      } //The custom url entered is unique and can be used to generate short url.
        else {
          const baseUrl = config.get('baseUrl');
          const shortUrl = baseUrl + '/' + customCode;
          
          // update the short url and custom code
          user.urls[i].shortUrl = shortUrl;
          user.urls[i].urlCode = customCode;

          await user.save();
        }
      } catch (err) {
        return res.status(500).json({
          "success": false,
          "error": err
        });
      }
    }
      // Update the longUrl without any checks as we don't care about multiple long urls
      // and initilise the redirect count to zero if longUrl changed.
      if(longUrl){
        user.urls[i].longUrl = longUrl;
        user.urls[i].redirectCount = 0;
        
        await user.save();
      }
      flag = 0;
      break;
   }}
   if (flag === 1){
    return res.status(500).json({
      "success": false,
      "error": "No url with given custom code"
    });
  }
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      "success": false,
      "error": "Internal Server Error"
    });
  }
})


// @route   DELETE /api/user
// expects 'token'
// @desc    Delete the user whose email is given in token
router.delete('/', verify, async (req, res) => {
  const userData = req.user;
  try {
    await User.findOneAndDelete({
      email: userData.email.toLowerCase()
    });
    res.status(200).json({
      "success": true,
      "msg": "User deleted"
    })
  } catch (err) {
    res.status(500).json({
      "success": false,
      "error": "Internal Server Error"
    });
  }
})


/*
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
*/
module.exports = router;
