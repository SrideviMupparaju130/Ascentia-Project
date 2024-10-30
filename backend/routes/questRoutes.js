const express = require('express');
const router = express.Router();
const Quest = require('../models/Quest');
const Task = require('../models/Task');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authenticate = require('../middleware/authenticate'); // Correct import for authentication middleware

// Create quests for all users who have tasks
router.post('/generate-all', authenticate, async (req, res) => {
    try {
        // Fetch all unique user IDs with tasks
        const usersWithTasks = await Task.distinct('userId'); // Get unique user IDs
        
        for (const userId of usersWithTasks) {
            // Fetch existing tasks for the user
            const tasks = await Task.find({ userId });
            
            // Prepare prompt based on existing tasks
            const taskDetails = tasks.map(task => ({
                name: task.task,
                difficulty: task.difficulty,
            }));

            const prompt = `Based on the following tasks: ${JSON.stringify(taskDetails)}, generate 5 new challenges with associated XP values.`;

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_URL);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent(prompt);
            const generatedChallenges = JSON.parse(result.response.text); // Adjust based on actual response structure

            // Map generated challenges to Quest objects
            const quests = generatedChallenges.map(challenge => {
                // Set XP based on difficulty
                let xp = 0;
                switch (challenge.difficulty) {
                    case 'easy':
                        xp = 5;
                        break;
                    case 'medium':
                        xp = 10;
                        break;
                    case 'hard':
                        xp = 20;
                        break;
                    default:
                        xp = 0; // Fallback if difficulty is unknown
                }
                // Create and return a new Quest object
                return new Quest({
                    name: challenge.name,
                    xp,
                    userId: userId, // Ensure userId is passed correctly
                });
            });

            // Save all generated quests
            await Quest.insertMany(quests);
        }

        res.status(201).json({ message: 'Quests generated for all users with tasks.' });
    } catch (err) {
        console.error('Error creating quests:', err); // Log the error for debugging
        res.status(500).json({ message: 'Error creating quests', error: err.message });
    }
});

module.exports = router;