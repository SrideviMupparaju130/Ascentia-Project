const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const Quest = require('../models/Quest');
const User = require('../models/User'); 
const cron = require('node-cron');
const { exec } = require('child_process');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

// Schedule task for weekly quest updates
cron.schedule('0 0 * * 1', () => {  // Run every Monday at midnight
    console.log("Running weekly quest update...");
    const pythonScriptPath = '/Users/man/Ascentia/scripts/update_quests.py'; // Set the correct path

    exec(`python3 ${pythonScriptPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Script stderr: ${stderr}`);
            return;
        }
        console.log(`Weekly quest update output: ${stdout}`);
    });
});

// Get quests for a specific user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;

        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }

        const quests = await Quest.find({ userId: new ObjectId(userId) });
        if (!quests || quests.length === 0) {
            return res.status(404).json({ message: 'No quests found for this user.' });
        }

        res.json(quests);
    } catch (error) {
        console.error('Error fetching quests:', error);
        res.status(500).json({ message: 'Failed to retrieve quests due to a server error.' });
    }
});

// Put route to mark a quest as complete
router.put('/', async (req, res) => {
    try {
        const { questId } = req.body; // Quest ID is now in the request body
        const userId = req.user.id;

        if (!ObjectId.isValid(questId) || !ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid ID format.' });
        }

        // Find and update the quest completion status if it's not already completed
        const quest = await Quest.findOneAndUpdate(
            { _id: new ObjectId(questId), userId: new ObjectId(userId), completed: false },
            { completed: true },
            { new: true }
        );

        if (!quest) {
            return res.status(404).json({ message: 'Quest not found or already completed.' });
        }

        // Increment user XP upon quest completion
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { XP: quest.rewardXP } },
            { new: true }
        );

        if (!user) {
            return res.status(500).json({ message: 'Failed to update user XP.' });
        }

        res.json({ message: 'Quest marked as completed and XP added!', quest });
    } catch (error) {
        console.error('Error marking quest as completed:', error);
        res.status(500).json({ message: 'Failed to mark quest as completed due to a server error.' });
    }
});

module.exports = router;