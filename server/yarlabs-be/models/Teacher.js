const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
	name : String,
	email : {type: String, unique: true},
	walletAddress : { type: String, default: null},
	specialization : [String],
	purse: { type: Number, default: 100000 },
	createdAt : {type: Date, default: Date.now},
});

module.exports = mongoose.model('Teacher', teacherSchema);