const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');
const Task = require('../models/Task'); // Assuming you have a Task model
const User = require('../models/User'); // Assuming you have a User model

// Initialize the generative AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const handleNewMessage = async (req, res) => {
    const { message } = req.body;
    const token = req.headers.authorization.split(' ')[1];

    if (!message || !token) {
        return res.status(400).json({ error: 'Message and token are required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `
            You are an intelligent assistant for a productivity app called Ascentia. Your role is to help users manage their tasks based on their natural language messages.

            The user's message is: "${message}"
            Today's date is: ${new Date().toISOString().split('T')[0]}

            Analyze the user's intent. The possible intents are: 'create_task', 'get_info', and 'general_conversation'.

            1. If the intent is 'create_task':
               - Extract the task description.
               - Extract the due date. If not specified, use today's date. If a relative date like "tomorrow" or "next Friday" is used, calculate the absolute date in YYYY-MM-DD format.
               - Extract the difficulty. Valid options are 'easy', 'medium', 'hard'. If not specified, default to 'medium'.
               - Determine the most relevant category for the task. The ONLY valid categories are: 'Career', 'Health', 'Self Care', 'Intellectual', 'Finance'. You MUST choose one of these. If the user specifies a valid category, use it. Otherwise, infer the best fit from the task description.
               - Respond ONLY with a JSON object in this exact format, with no extra text or markdown:
               {"intent": "create_task", "task": {"task": "The task description", "date": "YYYY-MM-DD", "difficulty": "easy|medium|hard", "type": "Career|Health|Self Care|Intellectual|Finance"}}

            2. If the intent is to ask for information ('get_info') like "show my tasks" or "what is due tomorrow":
               - Respond ONLY with a JSON object in this exact format, with no extra text or markdown:
               {"intent": "get_info", "query": "${message}"}

            3. If the message is a general question or conversation (e.g., "hello", "how are you"):
               - Respond ONLY with a JSON object in this exact format, with no extra text or markdown:
               {"intent": "general_conversation", "reply": "A friendly, conversational response."}
        `;
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const aiResponse = JSON.parse(responseText);

        if (aiResponse.intent === 'create_task') {
            const { task, date, difficulty, type } = aiResponse.task;

            // Save the task to the database
            const newTask = new Task({
                userId,
                task,
                date,
                difficulty,
                type,
                completed: false,
                pomodoro: false,
            });
            await newTask.save();
            
            return res.json({ reply: `Task created: "${task}" in the ${type} category for ${date}.` });

        } else if (aiResponse.intent === 'get_info') {
            // For a "get_info" intent, you could build out more complex logic here
            // to query your database based on the user's request.
            const userTasks = await Task.find({ userId }).sort({ date: 1 }).limit(5);
            if (userTasks.length === 0) {
                return res.json({ reply: "You don't have any tasks right now." });
            }
            const taskList = userTasks.map(t => `- ${t.task} (Due: ${new Date(t.date).toLocaleDateString()})`).join('\n');
            return res.json({ reply: `Here are some of your upcoming tasks:\n${taskList}` });

        } else { // general_conversation
            return res.json({ reply: aiResponse.reply });
        }

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ reply: "I'm sorry, I encountered an error. Please try again." });
    }
};

module.exports = { handleNewMessage };