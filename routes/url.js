const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const base = require('base-converter');
const config = require('config');

const Url = require('../models/Url');

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
  const currCount = await Url.countDocuments();
  urlCode = base.decTo62(currCount + 1);
  // Check if long url is valid
  if (validUrl.isUri(longUrl)) {
    try {
      let url = await Url.findOne({ longUrl });

      if (url) {
        res.json(url);
      } else {
        const shortUrl = baseUrl + '/' + urlCode;

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