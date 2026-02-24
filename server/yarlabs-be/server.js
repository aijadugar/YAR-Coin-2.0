const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const http = require('http');
const {Server} = require('socket.io');
const dotenv = require('dotenv');
dotenv.config();
const studentRoutes = require('./routes/studentRoutes');
const Student = require('./models/Student');
const teacherRoutes = require('./routes/teacherRoutes');
const Teacher = require('./models/Teacher');
const biddingRoutes = require('./routes/biddingRoutes');
const Bidding = require('./models/Bidding')
const DEX = require('./models/DEX');
const Message = require('./models/Message');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const server = http.createServer(app);
// ngrok config add-authtoken <YOUR_AUTH_TOKEN>
// ngrok http 5000

// Optional: Use MetaMask

// Add your local Hardhat network to MetaMask:
// Network Name: Hardhat Local
// RPC URL: http://127.0.0.1:8545
// Chain ID: 31337
// Currency: ETH
// Import teacher’s private key into MetaMask.
// Then add YARC token manually in MetaMask:
// Token Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
// Symbol: YARC
// Decimals: 18
// Now you’ll see 10000 YARC in their wallet UI.

// Option A: Hardhat console
// npx hardhat console --network localhost
// const token = await ethers.getContractAt(
//     "YourToken", 
//     "0x5FbDB2315678afecb367f032d93F642f64180aa3"
// );
// const balance = await token.balanceOf("0xTeacherWalletAddress");
// ethers.utils.formatUnits(balance, 18); // shows 10000

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/biddings', biddingRoutes);
app.use('/dashboard', dashboardRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected!'))
    .catch((err) => console.log(err));

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, walletAddress } = req.body;
        if (!email || !walletAddress) {
            return res.status(400).json({ error: 'Email and walletAddres are required!' });
        }
        const student = await Student.findOne({ email, walletAddress });
        if (student) {
            return res.status(200).json({ message: 'Login successful!', role: 'student', user: student });
        }
        const teacher = await Teacher.findOne({ email, walletAddress });
        if (teacher) {
            return res.status(200).json({ message: 'Login successful!', role: 'teacher', user: teacher });
        }
        return res.status(400).json({ error: 'Invalid credentials!' });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

app.post('/convert', async (req, res) => {
    try {
        const { walletAddress, yarAmount } = req.body;

        const amount = Number(yarAmount);

        if (!walletAddress || isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid wallet or YAR amount"
            });
        }

        const student = await Student.findOne({ walletAddress });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        if (student.yarBalance < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient YAR balance"
            });
        }

        const conversionRate = 0.5;
        const usdValue = amount * conversionRate;

        student.yarBalance -= amount;
        await student.save();

        await DEX.create({
            walletAddress,
            fromYar: amount,
            usdBalance: usdValue
        });

        const total = await DEX.aggregate([
            { $match: { walletAddress } },
            { 
                $group: { 
                    _id: null, 
                    totalUsd: { $sum: "$usdBalance" } 
                } 
            }
        ]);

        const totalUsd = total.length > 0 ? total[0].totalUsd : 0;

        res.json({
            success: true,
            convertedUsd: usdValue,
            totalUsd: totalUsd
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

app.get('/transactions/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;

        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                message: "Wallet address required"
            });
        }

        const transactions = await DEX.find({ walletAddress })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("joinRoom", async ({ userId, role }) => {
        try {
            let adminId;

            if (role === "admin") {
                adminId = userId;
            } else {
                const student = await Student.findById(userId);
                if (!student || !student.ownedBy) return;

                adminId = student.ownedBy;
            }

            const roomId = `admin_${adminId}`;

            socket.join(roomId);

            const previousMessages = await Message
                .find({ roomId })
                .sort({ timestamp: 1 });

            socket.emit("previousMessages", previousMessages);

        } catch (error) {
            console.log(error);
        }
    });


    socket.on("sendMessage", async ({ userId, role, message }) => {
        try {
            let adminId;

            if (role === "admin") {
                adminId = userId;
            } else {
                const student = await Student.findById(userId);
                if (!student || !student.ownedBy) return;

                adminId = student.ownedBy;
            }

            const roomId = `admin_${adminId}`;

            const newMessage = await Message.create({
                roomId,
                senderId: userId,
                senderRole: role,
                message
            });

            io.to(roomId).emit("receiveMessage", newMessage);

        } catch (error) {
            console.log(error);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });

});

// cron.schedule('* * * * *', async () => {
//     console.log("Running auction settlements...");
//     const students = await Student.find({ ownedBy: null });
//     for (let student of students) {
//         const lastBid = await Bidding.find({ studentId: student._id }).sort({ createdAt: -1 }).limit(1);

//         const auctionEnd = 1 * 60 * 1000; // 3 * 24 * 60 * 60 * 1000
//         if (new Date() - lastBid[0].createdAt >= auctionEnd) {
//             const highestBid = await Bidding.find({ studentId: student._id }).sort({ bidAmount: -1 }).limit(1);
//             student.ownedBy = highestBid[0].teacherId;
//             const teacher = await Teacher.findById(highestBid[0].teacherId);
//             teacher.purse = teacher.purse - highestBid[0].bidAmount;
//             await teacher.save();
//             student.yarBalance = student.yarBalance + highestBid[0].bidAmount;
//             await student.save();
//         }else{
//             console.log(`Auction is still ongoing.`);
//         }
//     }
//     console.log("Finished auction settlements...");
// });

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
});