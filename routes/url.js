const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const base = require('base-converter');
const config = require('config');
const MT = require('mersenne-twister');
const generator = new MT();

const Url = require('../models/Url');

//function pads 0 upto 6 digits
function padDigits (number, digits) {
	return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

// @route     POST /api/url/shorten
// @desc      Create short URL from long URL
router.post('/shorten', async (req, res) => {
  const { longUrl } = req.body;
  const baseUrl = config.get('baseUrl');

  // Check if base url is valid
  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).json('Invalid base url');
  }

  // Create url code
  // basically mapping the id of the document in the mongodb schema to
  // a base 62 string.
  // See this for more info: https://stackoverflow.com/a/742047
  
  // Check if long url is valid
  if (validUrl.isUri(longUrl)) {
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

        res.json(url);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json('Server error');
    }
  } else {
    res.status(400).json('Invalid long url');
  }
});

module.exports = router;
