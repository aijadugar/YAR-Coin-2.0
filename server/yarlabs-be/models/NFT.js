const mongoose = require('mongoose');

const NFTSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
}, { timestamps: true });

module.exports = mongoose.model('NFT', NFTSchema);