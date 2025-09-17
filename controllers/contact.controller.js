const Contact = require('../models/Contacts');
const User = require('../models/User.model');

const getListAllContact = async (req, res) => {
    const userId = req.user?.id;
    console.log(req.user);

    if (!userId) {
        return res.status(401).json({ mess: 'Unauthorized' });
    }

    try {
        const contactDoc = await Contact.findOne({ main: userId })
            .populate('contactList', 'name username _id')
            .populate('blockedList', 'name username _id');

        if (!contactDoc) {
            return res.status(200).json({ contacts: [], blocked: [], mess: "Nothing in contact" });
        }

        return res.status(200).json({
            mess: 'Contacts fetched successfully.',
            contacts: contactDoc.contactList,
            blocked: contactDoc.blockedList
        });
    } catch (err) {
        console.error('Error fetching contact list:', err);
        return res.status(500).json({ mess: 'Server error while fetching contact list.' });
    }
};

const addToContact = async (req, res) => {
    const userId = req.user.id;
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ mess: 'username is required' });
    }

    if (username === req.user.username) {
        return res.status(400).json({ mess: 'You cannot add yourself as a contact' });
    }

    try {
        const contactUser = await User.findOne({ username });
        if (!contactUser) {
            return res.status(404).json({ mess: 'User not found' });
        }

        let contactDoc = await Contact.findOne({ main: userId });
        if (!contactDoc) {
            contactDoc = await Contact.create({ main: userId, contactList: [] });
        }
        await Contact.updateOne(
            { main: userId },
            { $addToSet: { contactList: contactUser._id } }
        );

        return res.status(200).json({ mess: 'Contact added successfully' });
    } catch (err) {
        console.error('Error adding contact:', err);
        return res.status(500).json({ mess: 'Server error while adding contact' });
    }
};

const removeContact = async (req, res) => {
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
            { $pull: { contactList: contactId } }
        );

        return res.status(200).json({ mess: 'Contact removed successfully' });
    } catch (err) {
        console.error('Error removing contact:', err);
        return res.status(500).json({ mess: 'Server error while removing contact' });
    }
};

const addToContactAsList = async (req, res) => {
    const userId = req.user.id;
    const { ids } = req.body; 

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ mess: 'Ids are required and should be an array' });
    }

    if (ids.includes(userId)) {
        return res.status(400).json({ mess: 'You cannot add yourself as a contact' });
    }

    try {
        let contactDoc = await Contact.findOne({ main: userId });
        if (!contactDoc) {
            contactDoc = await Contact.create({ main: userId, contactList: [] });
        }

        const existingIds = new Set(contactDoc.contactList.map(id => id.toString()));
        const addedUsers = [];

        for (const id of ids) {
            if (existingIds.has(id)) {
                continue;
            }

            const user = await User.findById(id).select('name username _id');
            if (!user) {
                continue;
            }

            contactDoc.contactList.push(user._id);
            addedUsers.push(user);
            existingIds.add(id);
        }

        await contactDoc.save();

        if (addedUsers.length === 0) {
            return res.status(200).json({ mess: 'No new contacts were added', added: [] });
        }

        return res.status(200).json({ mess: 'Contacts added successfully', added: addedUsers });
    } catch (err) {
        console.error('Error adding contacts:', err);
        return res.status(500).json({ mess: 'Server error while adding contacts' });
    }
};


module.exports = { getListAllContact, addToContact, removeContact, addToContactAsList };