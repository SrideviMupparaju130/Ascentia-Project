const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai'); // Import necessary enums
const dotenv = require('dotenv');
const Task = require('../models/Task'); // Assuming your Task model

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("FATAL: GEMINI_API_KEY is not defined in your .env file or environment.");
    // Consider exiting or throwing a more specific startup error if the key is essential
}

const genAI = new GoogleGenerativeAI(apiKey);

// Safety settings for the model - adjust as needed
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

async function callGemini(prompt) {
    console.log("Attempting to call Gemini with prompt (first 500 chars):", prompt.substring(0, 500));
    try {
        // Try a generally available and stable model name
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings }); 
        // Or try: const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", safetySettings });

        if (!model || typeof model.generateContent !== 'function') {
            console.error("Critical: genAI.getGenerativeModel did not return a valid model object.");
            throw new Error("AI Model initialization failed.");
        }

        console.log("Model object obtained. Calling generateContent...");
        const generationResult = await model.generateContent(prompt);
        console.log("Received result from model.generateContent");

        // For SDK v0.x.x, `generationResult.response` is NOT a promise.
        // It directly contains the GenerateContentResponse object.
        const response = generationResult.response;

        if (!response) {
            console.error("AI result.response is undefined. Full result:", JSON.stringify(generationResult, null, 2));
            // Check for blocked content
            if (generationResult.promptFeedback && generationResult.promptFeedback.blockReason) {
                 console.error("Prompt was blocked:", generationResult.promptFeedback.blockReason);
                 console.error("Safety ratings:", generationResult.promptFeedback.safetyRatings);
                 throw new Error(`AI content generation blocked due to: ${generationResult.promptFeedback.blockReason}. Please revise your prompt.`);
            }
            throw new Error("AI response structure is not as expected (missing response object).");
        }
        
        // Check if candidates exist and have content
        if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content || !response.candidates[0].content.parts || response.candidates[0].content.parts.length === 0) {
            console.error("AI response is missing expected content structure. Full response:", JSON.stringify(response, null, 2));
             // Check for blocked content here as well, as some errors might manifest this way
            if (response.promptFeedback && response.promptFeedback.blockReason) {
                console.error("Prompt was blocked (in response object):", response.promptFeedback.blockReason);
                console.error("Safety ratings (in response object):", response.promptFeedback.safetyRatings);
                throw new Error(`AI content generation blocked due to: ${response.promptFeedback.blockReason}. Please revise your prompt.`);
            }
            if (response.candidates && response.candidates[0] && response.candidates[0].finishReason && response.candidates[0].finishReason !== 'STOP') {
                throw new Error(`AI content generation finished due to: ${response.candidates[0].finishReason}.`);
            }
            throw new Error("AI response did not contain any usable content.");
        }

        const text = response.text(); // This helper function extracts text from the first candidate's parts.
        
        if (typeof text !== 'string') {
            console.error("AI response.text() did not return a string. Full response:", JSON.stringify(response, null, 2));
            throw new Error("AI response structure is not as expected (text() did not return a string).");
        }
        
        console.log("Successfully got text from AI:", text.substring(0,100) + "...");
        return text;

    } catch (error) {
        console.error("Error in callGemini function:", error); // Log the full error object
        // Provide a more specific error message if possible
        if (error.message.includes("blocked due to")) {
            throw error; // Re-throw specific block errors
        }
        throw new Error(`Failed to get response from AI model. Original error: ${error.message}`);
    }
}

exports.handleMessage = async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id; 

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`Handling message for user ${userId}: "${message}"`);

    try {
        const intentExtractionPrompt = `
System Prompt: You are a helpful assistant for a task management application called Ascentia.
Your goal is to understand user requests to either create a new task or retrieve information about existing tasks.
User ID for context: ${userId}.
Current Date for reference: ${new Date().toISOString()}

If the user wants to create a task, identify:
- "task": The task description (string, required).
- "date": Due date in YYYY-MM-DD format if specified (string, optional, default null). Interpret relative dates like "tomorrow", "next Monday". If a specific time is mentioned, append it. If only a day like "Monday" is mentioned and it's in the past for the current week, assume next week's Monday.
- "difficulty": (string, optional, default "medium", options: "easy", "medium", "hard").
- "type": (string, optional, default "Career", options: "Career", "Health", "Self Care", "Intellectual", "Finance").
- "pomodoro": (boolean, optional, default false, true if pomodoro or focus mode is mentioned).

If the user is asking about their tasks, identify:
- "query_summary": A concise summary of what the user is asking (string).
- "keywords": An array of important keywords extracted from the user's message for searching task descriptions (array of strings).
- "date_filter": If the query involves a specific date or range (e.g., "today", "last week", "next month", "on Nov 15th"), provide it as "today", "yesterday", "YYYY-MM-DD", or a range like {start: "YYYY-MM-DD", end: "YYYY-MM-DD"}. Default null.
- "completion_status": If the query is about task completion, indicate "completed", "incomplete", or "any". Default "any".

Respond ONLY in valid JSON format.

For task creation:
{
  "intent": "CREATE_TASK",
  "taskDetails": {
    "task": "...",
    "date": "YYYY-MM-DD" | "YYYY-MM-DD HH:mm:ss" | null,
    "difficulty": "easy" | "medium" | "hard",
    "type": "Career" | "Health" | "Self Care" | "Intellectual" | "Finance",
    "pomodoro": true | false
  }
}

For task query:
{
  "intent": "QUERY_TASK",
  "query_summary": "...",
  "keywords": ["...", "..."],
  "date_filter": "today" | "YYYY-MM-DD" | {"start": "YYYY-MM-DD", "end": "YYYY-MM-DD"} | null,
  "completion_status": "completed" | "incomplete" | "any"
}

If the intent is unclear or information is insufficient:
{
  "intent": "CLARIFY",
  "clarification_needed": "Could you please provide more details about...?"
}

User message: "${message}"
`;

        const aiResponseText = await callGemini(intentExtractionPrompt);
        let aiData;
        try {
            // Attempt to clean the response text if it's not perfect JSON
            // This is a common issue with LLMs producing malformed JSON strings
            const cleanedAiResponseText = aiResponseText.replace(/```json\n?/, '').replace(/\n?```$/, '').trim();
            aiData = JSON.parse(cleanedAiResponseText);
            console.log("Parsed AI Data:", aiData);
        } catch (parseError) {
            console.error("Error parsing AI JSON response:", parseError, "\nRaw AI Response was:", aiResponseText);
            return res.status(500).json({ reply: "I had trouble processing that response. Could you try rephrasing?" });
        }

        // ... (rest of your handleMessage logic for CREATE_TASK, QUERY_TASK, CLARIFY)
        // Ensure this logic is robust and handles cases where aiData or aiData.taskDetails might be undefined
        if (aiData.intent === 'CREATE_TASK') {
            if (!aiData.taskDetails || !aiData.taskDetails.task) {
                console.error("AI Create Task: Missing task details or task description", aiData.taskDetails);
                return res.json({ reply: "I need a description for the task. What would you like to do?" });
            }
            const { task, date, difficulty, type, pomodoro } = aiData.taskDetails;
            
            let taskDate = null;
            if (date) {
                // Basic attempt to parse common date strings, might need a more robust library
                taskDate = new Date(date);
                if (isNaN(taskDate.getTime())) { // Invalid date
                    console.warn(`Could not parse date: ${date}. Setting to null.`);
                    taskDate = null;
                }
            }

            const newTask = new Task({
                userId,
                task,
                date: taskDate,
                difficulty: difficulty || 'medium',
                type: type || 'Career',
                pomodoro: pomodoro || false,
                completed: false,
            });
            await newTask.save();
            console.log("Task created:", newTask);
            return res.json({ reply: `Task "${task}" created successfully!` });

        } else if (aiData.intent === 'QUERY_TASK') {
            let query = { userId };
            if (aiData.keywords && aiData.keywords.length > 0) {
                query.task = { $regex: aiData.keywords.join('|'), $options: 'i' };
            }
             
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            if (aiData.date_filter) {
                if (aiData.date_filter === 'today') {
                    query.date = { $gte: today, $lt: tomorrow };
                } else if (typeof aiData.date_filter === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(aiData.date_filter)) {
                     const specificDate = new Date(aiData.date_filter + "T00:00:00.000Z"); 
                     const nextDay = new Date(specificDate);
                     nextDay.setDate(specificDate.getDate() + 1);
                     query.date = { $gte: specificDate, $lt: nextDay };
                }
                // TODO: Add more robust date range handling for aiData.date_filter if it's an object {start, end}
            }
            if (aiData.completion_status && aiData.completion_status !== 'any') {
                query.completed = aiData.completion_status === 'completed';
            }

            console.log("Constructed MongoDB query:", query);
            const tasks = await Task.find(query).sort({ date: -1 }).limit(10); 

            if (tasks.length === 0) {
                return res.json({ reply: "I couldn't find any tasks matching your description." });
            }

            const taskSummaries = tasks.map(t => `- ${t.task} (Due: ${t.date ? new Date(t.date).toLocaleDateString() : 'No date'}, Status: ${t.completed ? 'Completed' : 'Pending'}, Type: ${t.type})`).join('\n');
            const answerPrompt = `
System Prompt: You are an AI assistant. Based ONLY on the provided task list, answer the user's question concisely and helpfully.
User's question: "${aiData.query_summary || message}"
Here are the relevant tasks found for the user:
${taskSummaries}

Answer the user's question based strictly on these tasks. If the tasks don't provide a direct answer, state that you couldn't find the information in their current tasks.
`;
            const naturalReply = await callGemini(answerPrompt);
            return res.json({ reply: naturalReply });

        } else if (aiData.intent === 'CLARIFY') {
             return res.json({ reply: aiData.clarification_needed || "I need a bit more information to help with that. Could you be more specific?" });
        } else {
            console.warn("AI intent not recognized or fallback:", aiData);
            return res.json({ reply: "I'm not sure how to help with that. You can ask me to create a task or find information about your tasks." });
        }

    } catch (error) {
        console.error('Error in handleMessage:', error);
        res.status(500).json({ reply: error.message || 'Sorry, something went wrong on my end.' });
    }
};