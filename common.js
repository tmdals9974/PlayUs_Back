require('dotenv').config();
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const bcrypt = require('bcrypt');
const saltRounds = 10;

function resResult(success, msg, details) {
    return {
        success, msg, details
    }
}

function getHashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) return reject(err);

            bcrypt.hash(password, salt, (err, hash) => {
                if (err) return reject(err);
                resolve(hash);
            });
        });
    });
}

function generateToken(_id, email) {
    return new Promise((resolve, reject) => {
        jwt.sign({ _id, email }, secretKey, { expiresIn: '40m' }, (err, token) => {
            if (err) reject(err);
            resolve(token);
        });
    })
}

async function verifyToken(req, res, next) {
    try {
        const accessToken = req.cookies.access_token;
        if (!accessToken) return next();
        const decoded = jwt.verify(accessToken, secretKey);

        if (decoded) {
            if (Date.now() / 1000 - decoded.iat > 60 * 10) { //토큰 만료시간이 10분 남았을 때 재발급
                const freshToken = await generateToken(decoded._id, decoded.email);
                setTokenCookie(res, freshToken);
            }

            req.user = decoded;
            next();
        }
        else {
            setTokenCookie(res, null);
            res.status(401).json(resResult(false, 'unauthorized'));
        }
    }
    catch (err) {
        setTokenCookie(res, null);
        res.status(401).json(resResult(false, 'token expired'));
    };
}

function setTokenCookie(res, token) {
    var cookieName = "access_token";
    if (token === null) res.cookie(cookieName, null, { httpOnly: true, maxAge: 0 });
    else res.cookie(cookieName, token, { httpOnly: true, maxAge: 1000 * 60 * 40 });
}

module.exports = { resResult, getHashPassword, generateToken, verifyToken, setTokenCookie };