const Teacher = require('../models/Teacher');
const express = require('express');
const Router = express.Router();
const { ethers } = require('ethers');
const dotenv = require('dotenv');
dotenv.config();

let hardhatAccounts = [];
let currentAccountIndex = 1;
const provider = new ethers.JsonRpcProvider(process.env.HARDHAT_RPC);
(async () => {
    try {
        const addresses = await provider.send("eth_accounts", []);
        hardhatAccounts = addresses;
    } catch (err) {
        console.error("Error loading Hardhat accounts:", err);
    }
})();
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
const deployerWallet = new ethers.Wallet(deployerPrivateKey, provider);
const tokenAbi = [
    "function transfer(address to, uint amount) public returns (bool)",
    "function balanceOf(address account) public view returns (uint256)"
];
const tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;
const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, deployerWallet);

Router.get('/', async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json(teachers);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});

Router.post('/', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ error: "Connect to Metamask wallet!" });
        }
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
        const contractAddress = process.env.YAR_CONTRACT_ADDRESS;
        const abi = ["function transfer(address to, uint256 value) public returns (bool)",
                     "function balanceOf(address owner) view returns (uint256)"];
        const contract = new ethers.Contract(contractAddress, abi, wallet);
        const amount = ethers.parseUnits("100", 18);
        const tx = await contract.transfer(walletAddress, amount);
        await tx.wait();
        const balance = await contract.balanceOf(walletAddress);
        const YARBalance = Number(ethers.formatUnits(balance, 18));
        const teacher = new Teacher({...req.body, purse: YARBalance});
        await teacher.save();
        return res.status(200).json({ message: "Registered successfully...", txHash: tx.hash, contractAddress: contractAddress });
    } catch (err) {
        return res.status(500).json({ message: "Transfer failed!" });
    }
});

// Router.post('/', async (req, res) => {
//     try {
//         if (currentAccountIndex >= 6) {
//             return res.status(400).json({ error: 'No more hardhat teacher accounts available.' });
//         }
//         const walletAddress = hardhatAccounts[currentAccountIndex];
//         const amount = ethers.parseUnits("10000", 18);
//         const tx = await tokenContract.transfer(walletAddress, amount);
//         await tx.wait();
//         req.body.walletAddress = walletAddress;
//         currentAccountIndex++;

//         const teacher = new Teacher(req.body);
//         await teacher.save();
//         res.status(200).json(teacher);
//     }
//     catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

module.exports = Router;