const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User'); 
const authenticate = require('../middleware/authenticate'); 

router.use(authenticate);

// Function to update user level based on XP
const updateUserLevel = async (userId, xp) => {
    let level = 1; // Start from level 1

    // Define level thresholds
    const levelThresholds = [20, 50, 100, 200];

    // Determine the level based on XP
    for (let i = 0; i < levelThresholds.length; i++) {
        if (xp >= levelThresholds[i]) {
            level = i + 2; // Increment level (Level 2 corresponds to threshold 1)
        } else {
            break;
        }
    }

    // Update the user's level if it has changed
    await User.findByIdAndUpdate(userId, { level });
};

/**
 * @route   POST /tasks
 * @desc    Add a new task
 * @access  Private
 */
router.post('/', async (req, res) => {
    try {
        const { task, date, difficulty, type, pomodoro } = req.body;
        const userId = req.user.id; 

        const newTask = new Task({
            userId,
            task,
            date,
            difficulty,
            type,
            pomodoro,
            completed: false, 
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /tasks
 * @desc    Get all tasks for the authenticated user
 * @access  Private
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id; 
        const tasks = await Task.find({ userId }).sort({ date: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /tasks/category
 * @desc    Get tasks for a specific category for the authenticated user
 * @access  Private
 */
router.get('/category', async (req, res) => {
    try {
        const userId = req.user.id; 
        const { type } = req.query; 

        const tasks = await Task.find({ userId, type }).sort({ date: -1 });
        
        if (!tasks.length) {
            return res.status(404).json({ message: 'No tasks found for this category.' });
        }

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks by category:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   PUT /tasks/:id
 * @desc    Update task completion status and user XP
 * @access  Private
 */
router.put('/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        const { completed } = req.body; 

        // Find the task
        const task = await Task.findOne({ _id: taskId, userId });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Calculate XP based on difficulty level
        let xpIncrease = 0;
        switch (task.difficulty) {
            case 'easy':
                xpIncrease = 5;
                break;
            case 'medium':
                xpIncrease = 10;
                break;
            case 'hard':
                xpIncrease = 20;
                break;
            default:
                break;
        }

        // Update the user's XP if the task is being marked as completed
        if (completed) {
            await User.findByIdAndUpdate(userId, { $inc: { XP: xpIncrease } });
            const user = await User.findById(userId);
            await updateUserLevel(userId, user.XP); // Check and update the level
        }

        // Update the 'completed' field of the task
        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, userId },
            { completed },
            { new: true }
        );

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
