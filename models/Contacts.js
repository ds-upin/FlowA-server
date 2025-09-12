const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    main: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },

    contactList: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
    ],
    blockedList: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ]
}, { timestamps: true });

const Contact = mongoose.model('Contacts', ContactSchema);
module.exports = Contact;