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
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  });
  try {
    const savedUser = await user.save();
    res.send({
      user_id: user._id
    });
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
  const user = await User.findOne({
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
});



// @route   GET /api/user/dashboard
// @desc    Dashboard for the logged in  user ( private route )
router.get('/dashboard', verify, (req, res) => {
    res.send(req.user);
})


module.exports = router;