require('dotenv').config();
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

function resResult(success, msg, details) {
    return {
        success, msg, details
    }
}

function verifyToken(req, res, next) {
    try {
        const accessToken = req.cookies.access_token
        const decoded = jwt.verify(accessToken, secretKey);

        if (decoded) {
            //res.locals.accessToken = decoded.accessToken;
            console.log(decoded);
            next();
        }
        else {
            res.status(401).json(resResult(false, 'unauthorized'));
        }
    }
    catch (err) {
        res.status(401).json(resResult(false, 'token expired'))
    };
};

module.exports = resResult, verifyToken;