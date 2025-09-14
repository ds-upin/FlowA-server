const mongoose = require('mongoose');

const UnverifiedUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        requied: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    code: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
});

const UnverifiedUser = mongoose.model('UnverifiedUser', UnverifiedUserSchema);

module.exports = UnverifiedUser;