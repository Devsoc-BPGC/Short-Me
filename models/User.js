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
const Url = require('../models/Url').schema;//Should be .schema?

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        max: 255
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    
    urls: [Url], //urls: [urlSchema]

    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);