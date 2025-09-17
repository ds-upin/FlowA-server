const Contact = require('../models/Contacts');
const User = require('../models/User.model');

const postAddBlock = async (req, res) => {
    const userId = req.user.id;
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ mess: 'username is required' });
    }

    if (username === req.user.username) {
        return res.status(400).json({ mess: 'You cannot block yourself' });
    }

    try {
        const contactUser = await User.findOne({ username });
        if (!contactUser) {
            return res.status(404).json({ mess: 'User not found' });
        }

        let contactDoc = await Contact.findOne({ main: userId });
        if (!contactDoc) {
            contactDoc = await Contact.create({ main: userId, contactList: [], blockedList: [] });
        }
        await Contact.updateOne(
            { main: userId },
            { $addToSet: { blockedList: contactUser._id } }
        );

        return res.status(200).json({ mess: 'Contact added to blocklist successfully' });
    } catch (err) {
        console.error('Error adding contact:', err);
        return res.status(500).json({ mess: 'Server error while adding contact' });
    }
}

const postRemoveBlock = async (req, res) => {
    const userId = req.user.id;
    const { contactId } = req.body;
    console.log("userId", userId);
    console.log("ContactId", contactId);

    if (!contactId) {
        return res.status(400).json({ mess: 'Contact ID is required' });
    }

    try {
        const contactUser = await User.findById(contactId);
        if (!contactUser) {
            return res.status(404).json({ mess: 'User not found' });
        }
        await Contact.updateOne(
            { main: userId },
            { $pull: { blockedList: contactId } }
        );

        return res.status(200).json({ mess: 'Contact removed successfully' });
    } catch (err) {
        console.error('Error removing contact:', err);
        return res.status(500).json({ mess: 'Server error while removing contact' });
    }
};

module.exports = { postAddBlock, postRemoveBlock };