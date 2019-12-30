const express = require('express');
const router = express.Router();
const base = require('base-converter');
const config = require('config');
const MT = require('mersenne-twister');
const generator = new MT();

const Url = require('../models/Url');
const User = require('../models/User');

user = User.findOne({ name: '@Admin' });

//function pads 0 upto 6 digits
function padDigits (number, digits) {
	return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

// @route     POST /api/url/shorten
// @desc      Create short URL from long URL
router.post('/shorten', async (req, res) => {
  const longUrl = req.body.longUrl;
  const customCode = req.body.customCode;
  const baseUrl = config.get('baseUrl');
  const name = config.get('name');
  const email = config.get('email');
  const password = config.get('password');
  
  // Check if custom code exists
  //If no, the following block generates random urlCode
  if (!customCode) {
    try {
      let url = await Url.findOne({ longUrl });//to check if url already exists
    //generating different randomUrl due to redirectcount problem(refer user.js)
      /* if (url) {
        res.json(url);
      } else { */
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
        redirectCount: 0,
        date: new Date()
        });

        await url.save();
        user.urls.push(url);

        res.json(url);
      //}
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
        redirectCount: 0,
        date: new Date()
        });

        await url.save();
        user.urls.push(url);

        res.json(url);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json('Server error');
    }
  }
  });

module.exports = router;