const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const User = require('../models/User');
const Friend = require('../models/Friend');

// Fetch all users except the current user
router.get('/users', authenticate, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } });
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// Fetch all friends
router.get('/friends', authenticate, async (req, res) => {
    try {
        const friends = await Friend.find({ 
            userId: req.user.id, 
            status: 'accepted' 
        }).populate('friendId', 'name XP level');
        res.json({ data: friends.map(f => ({ ...f.friendId._doc, friendId: f.friendId._id })) });
    } catch (error) {
        console.error("Error fetching friends:", error);
        res.status(500).json({ message: "Failed to fetch friends" });
    }
});

// Fetch pending friend requests
router.get('/requests', authenticate, async (req, res) => {
    try {
        const requests = await Friend.find({
            friendId: req.user.id,
            status: 'pending'
        }).populate('userId', 'name XP level');
        res.json(requests);
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ message: "Failed to fetch friend requests" });
    }
});

// Fetch sent friend requests
router.get('/sent-requests', authenticate, async (req, res) => {
    try {
        const sentRequests = await Friend.find({
            userId: req.user.id,
            status: 'pending'
        }).populate('friendId', 'name XP level');
        
        res.json(sentRequests);
    } catch (error) {
        console.error("Error fetching sent friend requests:", error);
        res.status(500).json({ message: "Failed to fetch sent friend requests" });
    }
});

// Send friend request
router.post('/send-request/:id', authenticate, async (req, res) => {
    const { id: friendId } = req.params;

    try {
        const existingRequest = await Friend.findOne({
            userId: req.user.id,
            friendId,
            status: { $in: ['pending', 'accepted'] },
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent or accepted" });
        }

        const friendRequest = new Friend({
            userId: req.user.id,
            friendId,
            status: 'pending'
        });

        await friendRequest.save();
        res.json({ message: "Friend request sent" });
    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Failed to send friend request" });
    }
});

// Accept friend request
router.post('/accept-request/:id', authenticate, async (req, res) => {
    const { id: requesterId } = req.params;
    try {
        const request = await Friend.findOneAndUpdate(
            { userId: requesterId, friendId: req.user.id, status: 'pending' },
            { status: 'accepted' },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        // Add reciprocal friend entry for requester
        await new Friend({
            userId: req.user.id,
            friendId: requesterId,
            status: 'accepted'
        }).save();

        res.json({ message: "Friend request accepted" });
    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "Failed to accept friend request" });
    }
});

module.exports = router;
