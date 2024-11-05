const mongoose = require('mongoose');
const { Schema } = mongoose;

const connectSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    friends: [
        {
            friendId: { 
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected'],
                default: 'pending'
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    actionsLog: [
        {
            actionType: {
                type: String,
                enum: ['add_friend', 'remove_friend', 'view_friend'],
                required: true
            },
            targetId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

// Index for fast lookups of friend relationships
connectSchema.index({ userId: 1, "friends.friendId": 1 }, { unique: true });

module.exports = mongoose.model('Connect', connectSchema);
