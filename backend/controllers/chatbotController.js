const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require('../models/Task'); // Ensure this path is correct

// Initialize the Gemini client
// Note: Using "gemini-1.5-flash-latest" as it's a valid and efficient model for this use case.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Uses the Gemini AI to determine the user's intent and extract relevant details.
 * @param {string} message - The user's input message.
 * @returns {Promise<{intent: string, details: object}>} - An object with the intent and extracted details.
 */
async function getIntentAndDetails(message) {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
    Analyze the user's request: "${message}"

    Determine the intent. It can be one of: "create_task", "retrieve_tasks", "general_query".
    Today's date is ${today}.

    If the intent is "create_task":
    - Extract the "task" description.
    - Extract the date information. If a single date is mentioned (e.g., "tomorrow", "Oct 31"), convert it to a 'YYYY-MM-DD' format and return it in a "date" field.
    - If a date range is mentioned (e.g., "every day this week", "from Monday to Wednesday"), return it as a 'date_range' object with 'start' and 'end' properties in 'YYYY-MM-DD' format.
    - If no date is mentioned, both "date" and "date_range" should be null.

    If the intent is "retrieve_tasks":
    - Analyze the time period.
    - If a specific day is mentioned (e.g., "today", "yesterday", "August 5th 2024"), return it as a 'date' property in 'YYYY-MM-DD' format.
    - If a range is mentioned (e.g., "this week", "this month"), return it as a 'date_range' object.
    
    Return ONLY a single, raw JSON object with the "intent" and its corresponding "details". Do not add any extra text or markdown formatting.
    
    Examples:
    - User: "create a new task to read a book tomorrow" -> {"intent": "create_task", "details": {"task": "read a book", "date": "${new Date(Date.now() + 86400000).toISOString().split('T')[0]}"}}
    - User: "remind me to workout every day this week" -> {"intent": "create_task", "details": {"task": "workout", "date_range": {"start": "YYYY-MM-DD for start of week", "end": "YYYY-MM-DD for end of week"}}}
    - User: "add go to the gym" -> {"intent": "create_task", "details": {"task": "go to the gym", "date": null, "date_range": null}}
    - User: "show me my tasks for tomorrow" -> {"intent": "retrieve_tasks", "details": {"date": "${new Date(Date.now() + 86400000).toISOString().split('T')[0]}"}}
    - User: "hello how are you" -> {"intent": "general_query", "details": {}}
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Error parsing intent from AI:", e);
        return { intent: 'general_query', details: {} }; // Fallback to a general query on error
    }
}

/**
 * Main handler for chatbot messages.
 */
exports.handleMessage = async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id; // Assumes auth middleware sets `req.user.id`

    if (!message) {
        return res.status(400).json({ reply: "Message cannot be empty." });
    }

    try {
        const { intent, details } = await getIntentAndDetails(message);

        if (intent === 'create_task') {
            // **Handle Task Creation**
            if (!details.task) {
                 return res.json({ reply: "Please specify the task you want to create." });
            }

            // Case 1: Create a task for a range of dates
            if (details.date_range && details.date_range.start && details.date_range.end) {
                const startDate = new Date(details.date_range.start);
                const endDate = new Date(details.date_range.end);
                
                const tasksToCreate = [];
                // Loop from start date to end date
                for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                    tasksToCreate.push({
                        userId,
                        task: details.task,
                        date: new Date(d), // Create new Date object to avoid reference issues
                        difficulty: 'medium',
                        type: 'Self Care',
                    });
                }
                
                if (tasksToCreate.length > 0) {
                    await Task.insertMany(tasksToCreate); // Efficiently insert all tasks at once
                    return res.json({ reply: `Great! I've scheduled "${details.task}" every day from ${new Date(details.date_range.start).toLocaleDateString()} to ${endDate.toLocaleDateString()}.` });
                }
            
            // Case 2: Create a task for a single date
            } else if (details.date) {
                const taskDate = new Date(details.date);
                await Task.create({
                    userId,
                    task: details.task,
                    date: taskDate,
                    difficulty: 'medium',
                    type: 'Self Care',
                });
                return res.json({ reply: `Task "${details.task}" has been created for ${taskDate.toLocaleDateString()}!` });

            // Case 3: No date provided
            } else {
                return res.json({ reply: "Of course! For which date or date range should I set this task?" });
            }

        } else if (intent === 'retrieve_tasks') {
            // This logic remains the same as it already handles both date and date_range
            let query = { userId };
            let periodMessage = '';

            if (details.date) {
                const startDate = new Date(details.date);
                startDate.setUTCHours(0, 0, 0, 0);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 1);
                query.date = { $gte: startDate, $lt: endDate };
                periodMessage = `for ${startDate.toLocaleDateString()}`;
            } else if (details.date_range && details.date_range.start && details.date_range.end) {
                const startDate = new Date(details.date_range.start);
                const endDate = new Date(details.date_range.end);
                endDate.setDate(endDate.getDate() + 1);
                query.date = { $gte: startDate, $lt: endDate };
                periodMessage = `from ${startDate.toLocaleDateString()} to ${new Date(details.date_range.end).toLocaleDateString()}`;
            } else {
                return res.json({ reply: "When would you like to see tasks for? You can ask for 'today', 'this week', or a specific date." });
            }

            const tasks = await Task.find(query).sort({ date: 1 });
            if (tasks.length === 0) {
                return res.json({ reply: `You have no tasks scheduled ${periodMessage}.` });
            }
            const taskList = tasks.map(t => `- ${t.task} (${t.completed ? 'Done' : 'Pending'})`).join('\n');
            return res.json({ reply: `Here are your tasks ${periodMessage}:\n${taskList}` });

        } else {
            // **Fallback for General Queries**
            const genericPrompt = `The user asked: "${message}". As a helpful and encouraging AI assistant for a productivity app called Ascentia, provide a brief, friendly response.`;
            const result = await model.generateContent(genericPrompt);
            return res.json({ reply: result.response.text() });
        }
    } catch (error) {
        console.error('Chatbot handler error:', error);
        res.status(500).json({ reply: "I'm having some trouble right now. Please try again later." });
    }
};