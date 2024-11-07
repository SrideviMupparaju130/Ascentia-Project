const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    XP: {
        type: Number,
        default: 0,
    }, 
    level: {
        type: Number,
        default: 1,
    },
    streak: { type: Number, default: 0 }, // Streak in days or other unit
});

const User = mongoose.model('User', userSchema);

module.exports = User;
