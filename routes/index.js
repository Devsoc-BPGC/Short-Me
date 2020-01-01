const express = require('express')
const router = express.Router();

const Url = require('../models/Url');
const User = require('../models/User');

//This function updates the field redirectCount in both url and user 
async function Count(url){
    const clicks = url.redirectCount + 1;
    user = await User.find({'urls._id': url._id});
    let i=0;
    //If more than one user have the same url document embedded in them.
    while(user[i]){
        const filter = {name: user[i].name, "urls._id": url._id};
        const update = {"urls.$.redirectCount": clicks};
        userp = await User.findOneAndUpdate(filter, update);
        await url.update({redirectCount: clicks});
        await userp.save();
        i++;
    }
}
// @route   GET /:code
// @desc    Redirect short URL to original URL
router.get('/:code', async (req, res) => {
    try {
        const code = req.params.code;
        const url = await Url.findOne({ urlCode: code });
    
        if (url){
            Count(url);
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