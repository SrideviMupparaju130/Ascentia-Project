import { faCommentDots, faPaperPlane, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import '../assets/css/Chatbot.css';

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen && messages.length === 0) {
<<<<<<< HEAD
=======
            // Initial greeting from bot when chat opens for the first time
>>>>>>> 8fd30af78489fc0a53f3d845f8f085afb3032478
            setMessages([{ sender: 'bot', text: "Hello! I'm Ascentia's AI. How can I help you create tasks or find task info?" }]);
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

<<<<<<< HEAD
    const sendUserMessage = async (messageText) => {
        if (messageText.trim() === '') return;

        const newMessage = { sender: 'user', text: messageText };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setInputValue(''); // Clear input after sending
=======
    const handleSendMessage = async () => {
        if (inputValue.trim() === '') return;

        const newMessage = { sender: 'user', text: inputValue };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setInputValue('');
>>>>>>> 8fd30af78489fc0a53f3d845f8f085afb3032478
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5500/api/chatbot/message',
<<<<<<< HEAD
                { message: messageText },
=======
                { message: inputValue },
>>>>>>> 8fd30af78489fc0a53f3d845f8f085afb3032478
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: response.data.reply }]);
        } catch (error) {
            console.error('Error sending message to chatbot:', error);
            setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };
<<<<<<< HEAD

    const handleSendMessage = () => {
        sendUserMessage(inputValue);
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading) {
=======
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
>>>>>>> 8fd30af78489fc0a53f3d845f8f085afb3032478
            handleSendMessage();
        }
    };

<<<<<<< HEAD
    const handleSuggestionClick = (suggestion) => {
        sendUserMessage(suggestion);
    };

=======
>>>>>>> 8fd30af78489fc0a53f3d845f8f085afb3032478
    return (
        <>
            <button className="chatbot-fab" onClick={toggleChat} aria-label="Toggle Chatbot">
                <FontAwesomeIcon icon={isOpen ? faTimes : faCommentDots} />
            </button>
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        Ascentia AI
                        <button onClick={toggleChat} aria-label="Close Chatbot">
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
<<<<<<< HEAD
                                {/* Render newlines correctly */}
                                {msg.text.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                            </div>
                        ))}
                        {isLoading && <div className="loading-indicator">Ascentia AI is typing...</div>}

                        {/* Suggestions for new features */}
                        {messages.filter(m => m.sender === 'user').length === 0 && (
                            <div className="chatbot-suggestions">
                                <button onClick={() => handleSuggestionClick("Create a task: Read a chapter tomorrow")}>Create a new task</button>
                                <button onClick={() => handleSuggestionClick("Show me my tasks for today")}>See today's tasks</button>
                                <button onClick={() => handleSuggestionClick("What are my tasks for this week?")}>See this week's tasks</button>
                            </div>
                        )}
=======
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && <div className="loading-indicator">Ascentia AI is typing...</div>}
>>>>>>> 8fd30af78489fc0a53f3d845f8f085afb3032478
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask something or create a task..."
                            disabled={isLoading}
                        />
<<<<<<< HEAD
                        <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
=======
                        <button onClick={handleSendMessage} disabled={isLoading}>
>>>>>>> 8fd30af78489fc0a53f3d845f8f085afb3032478
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Chatbot;