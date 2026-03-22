const express = require('express');
const Router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Bidding = require('../models/Bidding');

Router.post('/bids', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ message: "Wallet address is required" });
        }
        const student = await Student.findOne({ walletAddress });
        if (!student) {
            return res.status(404).json({ message: "Member not found" });
        }
        const highestBid = await Bidding.findOne({ studentId: student._id }).sort({ bidAmount: -1 });
        if (!highestBid) {
            return res.status(404).json({ message: "No bids found for this member" });
        }
        return res.status(200).json({ studentName: student.name, studentEmail: student.email, highestBid: highestBid.bidAmount });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

Router.get('/student/:studentId', async (req, res) => {
    try {
        const bids = await Bidding.find({ studentId: req.params.studentId }).sort({ bidAmount: -1 });
        res.status(200).json(bids);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});

Router.post('/', async (req, res) => {
    try {
        const { studentId, teacherId, bidAmount } = req.body;
        const student = await Student.findById(studentId);
        const teacher = await Teacher.findById(teacherId);
        const bidding = new Bidding(req.body);
        if (!student) {
            return res.status(404).json({ message: `Member not found` });
        }
        if (!teacher) {
            return res.status(404).json({ message: `Admin not found` });
        }
        const bids = await Bidding.find({ studentId }).sort({ bidAmount: -1 });
        if (bids.length == 0) {
        } else {
            const highestBid = bids[0];
            if (bidAmount <= highestBid.bidAmount) {
                return res.status(400).json({ message: `Bidding amount must be higher than current bid of ${highestBid.bidAmount}` });
            }
        }
        if (bids.length === 0 && bidAmount < student.basePrice) {
            return res.status(400).json({ message: `First bid must be at least the base price of ${student.basePrice}` });
        }
        await bidding.save();
        res.status(200).json(bidding);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = Router;