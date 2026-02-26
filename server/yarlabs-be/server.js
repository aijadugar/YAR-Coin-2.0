const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
dotenv.config();
const studentRoutes = require('./routes/studentRoutes');
const Student = require('./models/Student');
const teacherRoutes = require('./routes/teacherRoutes');
const Teacher = require('./models/Teacher');
const biddingRoutes = require('./routes/biddingRoutes');
const Bidding = require('./models/Bidding')
const DEXRoutes = require('./routes/DEXRoutes');
const Message = require('./models/Message');
const statRoutes = require('./routes/statRoutes');
const paneltyRoutes = require('./routes/paneltyRoutes');
const nftRoutes = require('./routes/nftRoutes');

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/biddings', biddingRoutes);
app.use('/stat', statRoutes);
app.use('/panelty', paneltyRoutes);
app.use('/mint', nftRoutes);
app.use('/', DEXRoutes);

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

io.on("connection", (socket) => {
    // console.log("User connected:", socket.id);
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
        // console.log("User disconnected:", socket.id);
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