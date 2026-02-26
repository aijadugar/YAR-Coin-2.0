const express = require('express');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Panelty = require('../models/Panelty');
const Router = express.Router();

Router.get('/panelty/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const student = await Student.findOne({ walletAddress });
        if (!student) {
            return res.status(400).json({ message: "Wallet address not found" });
        }
        const paneltyHistory = await Panelty.find({ student: student._id }).populate("teacher", "name walletAddress").sort({ createdAt: -1 });
        res.status(200).json({ totalPanelty: paneltyHistory.length, history: paneltyHistory });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

Router.post("/panelty", async (req, res) => {
    try {
        const { fromWallet, toWallet, amount, description } = req.body;

        if (!fromWallet || !toWallet || !amount) {
            return res.status(400).json({ message: "Missing one of the wallet address or amount" });
        }

        const student = await Student.findOne({ walletAddress: fromWallet });
        const teacher = await Teacher.findOne({ walletAddress: toWallet });
        if (!student || !teacher) {
            return res.status(404).json({ message: "Admin and Member not found" });
        }
        if (student.yarBalance < parseInt(amount)) {
            return res.status(400).json({ message: "There is no sufficient YARC's on member's balance" })
        }

        student.yarBalance -= parseInt(amount);
        teacher.purse += parseInt(amount);
        await student.save();
        await teacher.save();

        const panelty = new Panelty({
            student: student._id,
            teacher: teacher._id,
            amount,
            description
        });
        await panelty.save();

        res.status(200).json({ message: "Penalty applied successfully", panelty });
    } catch (err) {
        res.status(500).json({ message: "Error applying penalty", error: err.message });
    }
});

module.exports = Router;