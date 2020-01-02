const express = require('express')
const router = express.Router();

const Url = require('../models/Url');
const User = require('../models/User');

//This function updates the field redirectCount in both url and user 

// @route   GET /:code
// @desc    Redirect short URL to original URL
router.get('/:code', async (req, res) => {
    try {
        const code = req.params.code;
        let user = await User.findOne({"urls.urlCode": code});
        if (user){
            const filter = {"urls.urlCode": code};
            const update = {$inc: {"urls.$.redirectCount": 1}};
            user = await User.findOneAndUpdate(filter, update);
            await user.save();
            const url = await User.findOne({"urls.urlCode": code}, {"_id": 0, "urls.$":1 });
            const longUrl = url["urls"][0]["longUrl"];
            res.redirect(longUrl);
        } else {
            res.status(404).json('Url not found.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
        
    }
})

module.exports = router;