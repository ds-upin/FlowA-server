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

const authRoute = require('./routes/authRouter');
const contactRoute = require('./routes/ContactRouter');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(cors()); // to be change in production  *****

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({ 'message': 'Server looks healthy' });
});

app.use('/api/auth', authRoute);
app.use('/api/contact', contactRoute);
//app.use('/api/pendingMessage');
//app.use('/api/sentPendingMessage');








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

    socket.on('sendMessage', (data) => {
        console.log(userSocketMap);
        if (userSocketMap.has(data.id)) {
            io.to(userSocketMap.get(data.id)).emit('recieveMessage', {
                message: data.message,
                senderId: data.senderId,
                recieverId: data.id,
                date: data.date
            });
        } else {
            console.log('Recipient not connected yet, will be implemented later');
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

