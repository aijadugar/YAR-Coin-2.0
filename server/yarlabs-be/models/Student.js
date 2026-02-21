const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name : String,
    email : {type: String, unique: true},
    walletAddress : { type: String, default: null},
    skills : [String],
    achievements : [String],
    basePrice : Number,
    yarBalance : { type: Number, default: 0 },
    ownedBy : { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    createdAt : {type: Date, default: Date.now}, 
});

module.exports = mongoose.model('Student', studentSchema);