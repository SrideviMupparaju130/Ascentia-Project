const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Define level thresholds
const levelThresholds = [20, 50, 100, 200, 400]; // Extend as necessary

// Helper function to determine the current level and next level XP
const calculateLevelInfo = (totalXP) => {
    let level = 1;
    let nextLevelXP = levelThresholds[0];
    let currentLevelXP = 0;

    for (let i = 0; i < levelThresholds.length; i++) {
        if (totalXP < levelThresholds[i]) {
            nextLevelXP = levelThresholds[i];
            break;
        }
        currentLevelXP = levelThresholds[i];
        level = i + 2;
    }

    const progressToNextLevel = ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return { level, nextLevelXP, currentLevelXP, progressToNextLevel };
};

// Get dashboard data for the authenticated user
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user data
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

        // Group tasks by date
        const groupedTasksByDate = tasks.reduce((acc, task) => {
            const taskDate = task.date.toISOString().split('T')[0]; // Get date in 'YYYY-MM-DD' format
            if (!acc[taskDate]) {
                acc[taskDate] = [];
            }
            acc[taskDate].push(task);
            return acc;
        }, {});

        // Calculate category-wise XP based on task difficulty
        tasks.forEach(task => {
            if (task.completed) {
                const taskXP = task.difficulty === 'easy' ? 5 : task.difficulty === 'medium' ? 10 : 20;
                categoryXP[task.type] += taskXP;
            }
        });

        // Prepare the task stats for response
        const taskStats = {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(task => task.completed).length,
            tasksByCategory: categoryXP,
            groupedTasksByDate,  // Send grouped tasks by date
        };

        // Calculate level info based on user's total XP
        const { level, nextLevelXP, currentLevelXP, progressToNextLevel } = calculateLevelInfo(user.XP);

        // Fetch leaderboard
        const leaderboard = await User.find().sort({ XP: -1 }).limit(5);
        const leaderboardData = leaderboard.map(user => ({
            username: user.name,
            totalXP: user.XP,
        }));

        res.status(200).json({
            user: {
                name: user.name,
                level,
                nextLevelXP,
                currentLevelXP,
                progressToNextLevel,  // Send progress percentage for frontend
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
