const mongoose = require('mongoose');
/*
const urlSchema = new mongoose.Schema({
    urlCode: String,
    longUrl: String,
    shortUrl: String,
    redirectCount: String,
    date: { type:String, default: Date.now }
});
*/
const { Url, urlSchema } = require('../models/Url');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        max: 255
    },
    urls: [urlSchema], //urls: [urlSchema]
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);