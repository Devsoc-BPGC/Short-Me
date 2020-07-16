// Middleware function to create private routes by using json web tokens

const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next){
    const token = req.header('token');
    if(!token) return res.status(401).json({"error": "Access Denied"});
    try {
        const TOKEN_SECRET = config.get("tokenSecret")
        const verified = jwt.verify(token, TOKEN_SECRET);
        req.user = {
            email: verified.email
        };
        next();
    } catch (err) {
        console.log(err);
        res.status(400).json({"error": 'Invalid token'});
    }
 } 
