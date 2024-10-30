// models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Assumes you have a User model
    },
    task: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'easy',
    },
    type: {
        type: String,
        enum: ['Career', 'Finance', 'Self Care', 'Intellectual', 'Health'],
        required: true,
    },
    pomodoro: {
        type: Boolean,
        default: false,
    },
    completed: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
