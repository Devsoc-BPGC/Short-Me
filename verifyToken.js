const config = require('config');
const jwt = require('jsonwebtoken');

module.exports = async function (req) {
    //function replies with a value only if verified else null.
    const token = req.query.token;
    if(!token) {return null};
    const TOKEN_SECRET = config.get("tokenSecret");
    //token can be verifies async, check if its a better method
    const verified = jwt.verify(token, TOKEN_SECRET, function (err) {
        if (err) {return null;}
    }); 
    return verified;
}