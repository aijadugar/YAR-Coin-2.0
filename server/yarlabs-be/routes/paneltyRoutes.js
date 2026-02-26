const express = require('express');
const Student = require('../models/Student');
const Router = express.Router();

Router.get("/:walletAddress/:amount", async (req, res) => {
    try {
        const { walletAddress, amount } = req.params;

        if (!walletAddress || !amount) {
            return res.status(400).json({ message: "Missing wallet address or amount" });
        }
        const student = await Student.findOne({ walletAddress });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        student.yarBalance -= parseInt(amount);
        await student.save();

        res.status(200).json({ message: "Penalty applied successfully", student });
    } catch (err) {
        res.status(500).json({ message: "Error applying penalty", error: err.message });
    }
});

module.exports = Router;