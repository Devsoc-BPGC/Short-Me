// Middleware function to create private routes by using json web tokens

const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next){
    const token = req.header('auth-token');
    if(!token) return res.status(401).send('Access Denied');
    try {
        const TOKEN_SECRET = config.get("tokenSecret")
        const verified = jwt.verify(token, TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.log(err);
        res.status(400).send('Invalid token');
    }
 } 
