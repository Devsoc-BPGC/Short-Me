const express = require('express');
const router = express.Router();
const base = require('base-converter');
const config = require('config');
const MT = require('mersenne-twister');
const generator = new MT();

const Url = require('../models/Url');
const User = require('../models/User');

//All the urls generated for non-users would be saved under admin.
async function FindAdmin() {
  user = await User.findOne({ name: '@Admin' });
  console.log(user.email);
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
  const customCode = req.body.customCode;
  const baseUrl = config.get('baseUrl');

  // Check if custom code exists
  //If no, the following block generates random urlCode
  if (!customCode) {
    try {
      //generating different randomUrl due to redirectcount problem(refer user.js)
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

        await user.urls.push(url);
        await user.save();

        res.json(url);
      //}
    } catch (err) {
      res.status(500).json(err);
    }
  } //The following block runs when customCode is given
  else {
    try {
      let user = await User.findOne({"urls.urlCode": customCode});
      // Check if the custom code already exists

      if (user) {  
        //No user can use customUrl already present in the database.
        res.status(500).json("That url code is already used. Try another");
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

        res.json(url);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
  });

module.exports = router;