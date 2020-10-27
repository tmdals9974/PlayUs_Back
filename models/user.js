const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const saltRounds = 10

// Define Schemes
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, trim: true },
    receiveMail: { type: Boolean, default: false }
},
    {
        timestamps: true
    });

userSchema.statics.create = async function (payload) {
    const user = new this(payload); // this === Model
    try {
        user.password = await getHashPassword(user.password);
    }
    catch (err) {
        throw err;
    }
    return user.save();
};

function getHashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) reject(err);

            bcrypt.hash(password, salt, (err, hash) => {
                if (err) reject(err);
                resolve(hash);
            });
        });
    });
}

module.exports = mongoose.model('user', userSchema);
