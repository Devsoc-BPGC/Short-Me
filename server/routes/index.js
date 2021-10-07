const express = require('express')
const router = express.Router();
const path = require('path');

const hostCheck = require('../hosts/hostCheck');

const Url = require('../models/Url');
const User = require('../models/User');

//This function updates the field redirectCount in both url and user 

// @route GET /
// @desc Serve the homepage
router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'root.html'))
})

// @route   GET /:code
// @desc    Redirect short URL to original URL
router.get('/:code', async (req, res) => {
    try {
        const code = req.params.code;
        let user = await User.findOne({"urls.urlCode": code});
        if (user){
            const url = await User.findOne({"urls.urlCode": code}, {"_id": 0, "urls.$":1 });
            const longUrl = url["urls"][0]["longUrl"];
            if (longUrl) {
                console.log(longUrl);

                // Use the hosts file to check if any unsafe URL is being shortened
                if(await hostCheck.isURLBlocked(longUrl, res)) return;

                res.redirect(longUrl);
                user = await User.findOneAndUpdate({"urls.urlCode": code}, {$inc: {"urls.$.redirectCount": 1}});
                await user.save();
                return;
            }
            else {
                return res.status(500).json({
                    error: 'Internal server error. Long Url not found'
                });
            }
        } else {
            return res.status(404).json('Url not found.');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json('Server error');
        
    }
})

module.exports = router;