require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, trim: true },
    receiveMail: { type: Boolean, default: false }
},
    {
        timestamps: true
    });

userSchema.statics.join = async function (payload) {
    const user = new this(payload); // this === Model
    try {
        user.password = await getHashPassword(user.password);
    }
    catch (err) {
        throw err;
    }
    return user.save();
};

userSchema.statics.login = function (payload) {
    return new Promise((resolve, reject) => {
        this.findOne({ email: payload.email })
            .then(user => {
                if (!user) throw { status: '404', msg: 'User not found' };
                return bcrypt.compare(payload.password, user.password)
            })
            .then(result => {
                if (!result) throw { status: '401', msg: 'Password Mismatch' };
                return jwt.sign({ email: payload.email }, secretKey, { expiresIn: '7d' });
            })
            .then(token => resolve(token))
            .catch(err => { return reject(err) });
    })
};

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

module.exports = mongoose.model('user', userSchema);
