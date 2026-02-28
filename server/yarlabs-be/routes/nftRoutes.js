const express = require('express');
const Router = express.Router();
const NFT = require('../models/NFT');

Router.get('/nft/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        if (!walletAddress) {
            return res.status(400).json({ message: "Member not found" });
        }
        const nfts = await NFT.find({ assignedTo: walletAddress })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: nfts.length, nfts });
    } catch (err) {
        res.status(500).json({ success: false, message: "server error" });
    }
});

Router.post('/nft', async (req, res) => {
    try {
        const { title, description, assignedTo, assignedBy } = req.body;
        if (!title || !assignedBy || !assignedTo) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const existingNFT = await NFT.findOne({ title });
        if (existingNFT) {
            return res.status(400).json({ message: "NFT with this tag already exists" });
        }
        const newNFT = new NFT({ title, description, assignedTo, assignedBy });
        await newNFT.save();
        res.status(201).json({ success: true, message: "NFT created successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = Router;