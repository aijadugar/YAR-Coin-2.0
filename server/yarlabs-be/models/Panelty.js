const { default: mongoose } = require("mongoose");

const PaneltySchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    description: { type: String, default: "" },
    amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Panelty', PaneltySchema);