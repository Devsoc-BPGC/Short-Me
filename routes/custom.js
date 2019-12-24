const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const config = require('config');

const Url = require('../models/Url');


// @route     POST /api/custom/shorten
// @desc      Create custom short URL for long URL
router.post('/shorten', async (req, res) => {
  const longUrl = req.body.longUrl;
  const customCode = req.body.customCode;
  const baseUrl = config.get('baseUrl');

  // Check if base url is valid
  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).json('Invalid base url');
  }

  // Check if long url is valid
  if (validUrl.isUri(longUrl)) {
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
