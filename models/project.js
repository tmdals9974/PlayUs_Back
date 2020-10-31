const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    returntype: { type: Number, default: 0, }, //0: JSON  1: XML
    lock: { type: Boolean, default: false },
},
    {
        timestamps: true
    });

projectSchema.methods.getPublicFields = function () {
    var returnObject = {
        name: this.name,
        returntype: this.returntype,
        lock: this.lock
    };
    return returnObject;
};

projectSchema.index({ user: 1, name: 1 }, { unique: true });
module.exports = mongoose.model('project', projectSchema);
