const express = require('express');
const router = express.Router();
const base = require('base-converter');
const config = require('config');
const MT = require('mersenne-twister');
const generator = new MT();

const hostCheck = require('../hosts/hostCheck');

const Url = require('../models/Url');
const User = require('../models/User');

//All the urls generated for non-users would be saved under admin.
async function FindAdmin() {
  user = await User.findOne({ name: '@Admin' });
  //console.log(user.email);
}
FindAdmin();
//function pads 0 upto 6 digits
function padDigits (number, digits) {
	return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

// @route     POST /api/url/shorten
// @desc      Create short URL from long URL
router.post('/shorten', async (req, res) => {
  const longUrl = req.body.longUrl;
  //Check whether customCode has space, tab or new line character
  const customCode = req.body.customCode;
  const baseUrl = config.get('baseUrl');

  // Use the hosts file to check if any unsafe URL is being shortened
  const safe = await hostCheck.checkSafeURL(longUrl);
  if(!safe) {
    return res.status(400).json({"error": "This URL will not be shortened"});
  }
  // Check if custom code exists
  //If no, the following block generates random urlCode
  if (!customCode) {
    try {
      //generating different randomUrl due to redirectcount problem(refer user.js)
        urlCode = padDigits(base.decTo62(generator.random_int()), 6); //generating a mersenne-twister random number
        let userpresent = await User.findOne({"urls.urlCode": urlCode});
        //The while block runs until the urlCode generated is unique
        while (userpresent) {
          urlCode = padDigits(base.decTo62(generator.random_int()), 6); //generating a mersenne-twister random number
          userpresent = await User.findOne({"urls.urlCode": urlCode});
        }
        const shortUrl = baseUrl + '/' + urlCode;

        url = new Url({
        longUrl,
        shortUrl,
        urlCode,
        redirectCount: 0,
        date: new Date()
        });

        await user.urls.push(url);
        await user.save();

        return res.json(url);
    } catch (err) {
      console.error(err);
      return res.status(500).json({"error": "Server error"});
    }
  } //The following block runs when customCode is given
  else {
    try {
      let userpresent = await User.findOne({"urls.urlCode": customCode});
      // Check if the custom code already exists

      if (userpresent) {  
        //No user can use customUrl already present in the database.
        return res.status(400).json({"error": "That url code is already used. Try another"});
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

        return res.json(url);
      }
    } catch (err) {
      return res.status(500).json({"error": "Server error"});
    }
  }
  });

module.exports = router;