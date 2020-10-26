const mongoose = require('mongoose');

// Define Schemes
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, trim: true },
    receiveMail: { type: Boolean, default: false }
},
    {
        timestamps: true
    });

// userSchema.statics.create = function (payload) {
//     const user = new this(payload); // this === Model
//     return user.save();
// };

// userSchema.statics.findAll = function () {
//     return this.find({});
// };

// userSchema.statics.findOneByuserid = function (userid) {
//     return this.findOne({ userid });
// };

// userSchema.statics.updateByuserid = function (userid, payload) {
//     // { new: true }: 원본이 아닌 수정된 값을 리턴해줌. 기본값은 false임.
//     return this.findOneAndUpdate({ userid }, payload, { new: true });
// };

// userSchema.statics.deleteByuserid = function (userid) {
//     return this.remove({ userid });
// };

module.exports = mongoose.model('user', userSchema);
