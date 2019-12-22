const express = require('express')
const router = express.Router();

const Url = require('../models/Url');


// @route   GET /:code
// @desc    Redirect to original url
router.get('/:code', async (req, res) => {
    try {
        const code = req.params.code;
        const url = await Url.findOne({ urlCode: code });
    
        if (url){
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