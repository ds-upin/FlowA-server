require('dotenv').config();
const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

const connectToMongoDB = require('./connections');
connectToMongoDB(MONGO_URI);

const express = require('express');
const http = require('http')
const { Server } = require('socket.io');

const authRoute = require('./routes/authRouter');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.status(200).json({ 'message': 'Server looks healthy' });
});

app.use('/api/auth',authRoute);
app.use('/api/contact');
app.use('/api/pendingMessage');
app.use('/api/sentPendingMessage');











io.use((socket, next) => {
    const token = socket.handshake.auth.token?.startWith('Bearer ')
        ? socket.handshake.auth.token.slice(7)
        : null;

    if (!token) return next(new Error('Authentication error'));
    try {
        const decoded = jwt.verify(token, secret);
        socket.user = decoded;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

io.on();

server.listen(PORT, () => {
    console.log('Server is running.')
})

