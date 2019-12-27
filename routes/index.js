const express = require('express')
const router = express.Router();

const Url = require('../models/Url');


// @route   GET /:code
// @desc    Redirect short URL to original URL
router.get('/:code', async (req, res) => {
    try {
        const code = req.params.code;
        const url = await Url.findOne({ urlCode: code });
    
        if (url){
            const clicks = url.redirectCount + 1;
            url.update({redirectCount: clicks});
            return res.redirect(url.longUrl);
        } else {
            return res.status(404).json('No url found with given code');
        }

    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
        
    }


})

module.exports = router;