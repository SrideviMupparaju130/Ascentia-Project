const express = require('express');
const router = express.Router();
const Connect = require('../models/Connect');
const User = require('../models/User');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

const sendResponse = (res, status, message, data = null) => {
    res.status(status).json(data ? { message, data } : { message });
};

// In the router file for users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'name XP level'); // Select required fields
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

// Fetch friends for the authenticated user
router.get('/friends', async (req, res) => {
    const userId = req.user.id; // Get the authenticated user's ID from the request

    try {
        const connect = await Connect.findOne({ userId }).populate('friends.friendId', 'name XP level'); // Populate friendId with user details
        if (!connect) return sendResponse(res, 404, 'No friends found for this user');

        sendResponse(res, 200, 'Friends fetched successfully', connect.friends); // Send friends array in the response
    } catch (error) {
        sendResponse(res, 500, 'Error fetching friends', { error });
    }
});

router.post('/send-request/:friendId', async (req, res) => {
    const { friendId } = req.params;
    const userId = req.user.id;

    try {
        let connect = await Connect.findOne({ userId });
        if (!connect) connect = new Connect({ userId });

        const isAlreadyFriend = connect.friends.some(friend => friend.friendId.toString() === friendId);
        if (isAlreadyFriend) {
            return sendResponse(res, 400, 'Already connected or request pending');
        }

        connect.friends.push({ friendId, status: 'pending' });
        connect.actionsLog.push({ actionType: 'add_friend', targetId: friendId });
        await connect.save();

        sendResponse(res, 200, 'Friend request sent');
    } catch (error) {
        sendResponse(res, 500, 'Error sending friend request', { error });
    }
});

router.post('/accept-request/:friendId', async (req, res) => {
    const { friendId } = req.params;
    const userId = req.user.id;

    try {
        const connect = await Connect.findOne({ userId }).populate('friends.friendId', 'name email XP level');
        if (!connect) return sendResponse(res, 404, 'Connection not found');

        const friend = connect.friends.find(f => f.friendId.toString() === friendId && f.status === 'pending');
        if (!friend) return sendResponse(res, 400, 'Friend request not found or already accepted');

        friend.status = 'accepted';
        connect.actionsLog.push({ actionType: 'accept_friend', targetId: friendId });
        await connect.save();

        sendResponse(res, 200, 'Friend request accepted');
    } catch (error) {
        sendResponse(res, 500, 'Error accepting friend request', { error });
    }
});

router.post('/reject-request/:friendId', async (req, res) => {
    const { friendId } = req.params;
    const userId = req.user.id;

    try {
        const connect = await Connect.findOne({ userId });
        if (!connect) return sendResponse(res, 404, 'Connection not found');

        const friendIndex = connect.friends.findIndex(f => f.friendId.toString() === friendId && f.status === 'pending');
        if (friendIndex === -1) return sendResponse(res, 400, 'Friend request not found or already processed');

        connect.friends[friendIndex].status = 'rejected';
        connect.actionsLog.push({ actionType: 'reject_friend', targetId: friendId });
        await connect.save();

        sendResponse(res, 200, 'Friend request rejected');
    } catch (error) {
        sendResponse(res, 500, 'Error rejecting friend request', { error });
    }
});

module.exports = router;