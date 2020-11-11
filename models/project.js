const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    content: { type: String },
    returntype: { type: Number, default: 0, }, //0: JSON  1: XML
    lock: { type: Boolean, default: false },
},
    {
        timestamps: true
    });

projectSchema.methods.getPublicFields = function () {
    const returnObject = {
        _id: this._id,
        name: this.name,
        content: this.content,
        returntype: this.returntype,
        lock: this.lock
    };
    return returnObject;
};

projectSchema.index({ user: 1, name: 1 }, { unique: true });
module.exports = mongoose.model('project', projectSchema);
