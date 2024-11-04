const mongoose = require('mongoose');
const { Schema } = mongoose;

const questSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Challenge: {
        type: String,
        required: true
    },
    XP: {
        type: Number,
        required: true
    },
    completed: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true  // Automatically add createdAt and updatedAt timestamps
});

module.exports = mongoose.model('Quest', questSchema);