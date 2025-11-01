require('dotenv').config();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;
const secret = process.env.JWT_SECRET;

const connectToMongoDB = require('./connections');
connectToMongoDB(MONGO_URI);

const userSocketMap = new Map();

const express = require('express');
const jwt = require('jsonwebtoken');
const http = require('http')
const { Server } = require('socket.io');
const cors = require('cors');

const Contact = require('./models/Contacts');
const User = require('./models/User.model');

const authRoute = require('./routes/authRouter');
const contactRoute = require('./routes/ContactRouter');
const pendingMessageRouter = require('./routes/PendingMessageRouter');
const PendingMessage = require('./models/PendingMessage');
const BlockUserRouter = require('./routes/blockUserRouter');

const app = express();
app.get('/', (req, res) => {
    res.status(200).json({ 'message': 'Server looks healthy' });
});
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://flow-six-dusky.vercel.app",    // ********
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(cors({
    origin: "https://flow-six-dusky.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
})); // to be change in production  ********

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/contact', contactRoute);
app.use('/api/block', BlockUserRouter);
app.use('/api/pendingMessage', pendingMessageRouter);
app.get('/api/health', (req,res)=>{
    return res.status(200).json({'mess':'Server is healthy'});
});



io.use((socket, next) => {
    const authHeader = socket.handshake.auth.token;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new Error("Authentication error: Invalid format"));
    }

    const token = authHeader.slice(7);

    try {
        const decoded = jwt.verify(token, secret);
        socket.user = decoded;
        console.log("Socket.user", socket.user);
        next();
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        next(new Error("Authentication error: Invalid token"));
    }
});

io.on('connection', (socket) => {
    socket.on('registerUser', () => {
        console.log(socket.user.id, "   ", socket.id);
        console.log(userSocketMap)
        userSocketMap.set(socket.user.id, socket.id);
    });

    socket.on('sendMessage', async (data, callback) => {
        const { message, senderId, id: receiverId, date } = data;

        if (userSocketMap.has(receiverId)) {
            io.to(userSocketMap.get(receiverId)).emit('recieveMessage', {
                message,
                senderId,
                recieverId: receiverId,
                date
            });
            callback && callback({ status: 'delivered' });
        } else {
            try {
                const receiverContact = await Contact.findOne({ main: receiverId });
                if (receiverContact?.blockedList?.some(id => id.toString() === senderId.toString())) {
                    console.log(`Message from ${senderId} blocked by receiver ${receiverId}, skipping save.`);
                    callback && callback({ status: 'blocked' });
                    return;
                }

                await PendingMessage.create({
                    senderId,
                    receiverId,
                    content: message,
                    date: date
                });
                callback && callback({ status: 'pending' });
            } catch (err) {
                console.error('Error saving pending message:', err);
                callback && callback({ status: 'error', error: err.message });
            }
        }
    });


    socket.on('disconnect', () => {
        for (const [userId, sockId] of userSocketMap.entries()) {
            if (sockId === socket.id) {
                userSocketMap.delete(userId);
                break;
            }
        }
    });
});


server.listen(PORT, () => {
    console.log('Server is running.')
})

