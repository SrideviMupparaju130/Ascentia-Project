const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Get dashboard data for the authenticated user
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user stats (XP, level, streak, etc.)
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Fetch user tasks
        const tasks = await Task.find({ userId });

        // Initialize category-wise XP
        const categoryXP = {
            Career: 0,
            Health: 0,
            'Self Care': 0,
            Intellectual: 0,
            Finance: 0,
        };

        // Calculate category-wise XP based on task difficulty
        tasks.forEach(task => {
            if (task.completed) {
                let taskXP = task.difficulty === 'easy' ? 5 : task.difficulty === 'medium' ? 10 : 20;
                categoryXP[task.type] += taskXP;
            }
        });

        // Prepare the task stats for response
        const taskStats = {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(task => task.completed).length,
            tasksByCategory: categoryXP,
        };

        // Fetch leaderboard - all users sorted by totalXP
        const leaderboard = await User.find().sort({ XP: -1 }).limit(5);
        const leaderboardData = leaderboard.map(user => ({
            username: user.name,
            totalXP: user.XP,
        }));

        res.status(200).json({
            user: {
                name: user.name,
                level: user.level,
                streak: user.streak || 0,
                totalXP: user.XP,
            },
            stats: taskStats,
            leaderboard: leaderboardData,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

module.exports = router;