const PendingMessage = require('../models/PendingMessage');

const getPendingMessages = async (req, res) => {
    const receiverId = req.user.id;

    if (!receiverId) {
        return res.status(401).json({ error: 'Unauthorized: No user ID provided' });
    }

    try {
        const messages = await PendingMessage.find({ receiverId });
        const formatted = messages.map(msg => ({
            senderId: msg.senderId,
            recieverId: msg.receiverId,
            message: msg.content,
            date: msg.date,
        }));
        await PendingMessage.deleteMany({ receiverId });

        res.status(200).json({ messages: formatted });

    } catch (error) {
        console.error('Error retrieving pending messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getPendingMessages };
