require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { getHashPassword, generateToken } = require('../common');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    receiveMail: { type: Boolean, default: false }
},
    {
        timestamps: true
    });

userSchema.methods.getPublicFields = function () {
    const returnObject = {
        email: this.email,
        password: this.password,
        receiveMail: this.receiveMail
    };
    return returnObject;
};

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
                payload._id = user._id;
                return bcrypt.compare(payload.password, user.password);
            })
            .then(result => {
                if (!result) throw { status: '401', msg: 'Password Mismatch' };
                return generateToken(payload._id, payload.email);
            })
            .then(token => resolve(token))
            .catch(err => { return reject(err) });
    })
};

module.exports = mongoose.model('user', userSchema);
