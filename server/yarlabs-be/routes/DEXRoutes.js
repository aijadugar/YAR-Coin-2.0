const express = require('express');
const Router = express.Router();
const DEX = require('../models/DEX');
const Student = require('../models/Student');

Router.post('/convert', async (req, res) => {
    try {
        const { walletAddress, yarAmount } = req.body;

        const amount = Number(yarAmount);

        if (!walletAddress || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid wallet or YAR amount" });
        }

        const student = await Student.findOne({ walletAddress });

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        if (student.yarBalance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient YAR balance" });
        }

        const conversionRate = 0.5;
        const usdValue = amount * conversionRate;

        student.yarBalance -= amount;
        await student.save();

        const total = await DEX.aggregate([
            { $match: { walletAddress } },
            {
                $group: {
                    _id: null,
                    totalUsd: { $sum: "$usdBalance" }
                }
            }
        ]);

        const previousTotal = total.length > 0 ? total[0].totalUsd : 0;
        const newTotalUsd = previousTotal + usdValue;

        await DEX.create({
            walletAddress,
            fromYar: amount,
            usdBalance: usdValue,
            totalUsd: newTotalUsd
        });

        res.json({ success: true, convertedUsd: usdValue, totalUsd: newTotalUsd });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

Router.get('/transactions/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;

        if (!walletAddress) {
            return res.status(400).json({ success: false, message: "Wallet address required" });
        }

        const transactions = await DEX.find({ walletAddress })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: transactions.length, transactions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = Router;