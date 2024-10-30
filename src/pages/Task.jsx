import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/Task.css'; // Import custom CSS for Task page

function Task() {
    const navigate = useNavigate(); // Make sure this is inside the Task component
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [popupError, setPopupError] = useState('');
    const [isSubmitPopupVisible, setIsSubmitPopupVisible] = useState(false);
    const [taskToSubmit, setTaskToSubmit] = useState(null);
    const [summary, setSummary] = useState('');
    const [file, setFile] = useState(null);

    const toggleFormVisibility = () => {
        setIsFormVisible(!isFormVisible);
        setSuccessMessage('');
        setErrorMessage('');
    };

    // Handle category card click
    const handleCategoryClick = async (category) => {
        setSelectedCategory(category);
        setIsPopupVisible(true);
        setLoading(true);
        setPopupError('');
        try {
            const response = await fetch(`http://localhost:5500/api/tasks/category?type=${category}`, { // Updated endpoint
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Task Not Yet Created In This Category');
            }

            const data = await response.json();
            setTasks(data); // Assuming the API returns an array of tasks directly
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setPopupError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle popup close
    const closePopup = () => {
        setIsPopupVisible(false);
        setSelectedCategory('');
        setTasks([]);
        setPopupError('');
    };

    // Open summary and file submission popup
    const openSubmitPopup = (task) => {
        // Skip popup if task has Pomodoro enabled
        if (task.pomodoro) {
            navigate('/pomodoro');
            handleTaskCompletion(task._id, task.completed); // Mark as completed after one Pomodoro cycle
        } else {
            setIsSubmitPopupVisible(true);
            setTaskToSubmit(task);
        }
    };

    // Close summary and file submission popup
    const closeSubmitPopup = () => {
        setIsSubmitPopupVisible(false);
        setTaskToSubmit(null);
        setSummary('');
        setFile(null);
    };

    // Handle task completion submission with summary and file
    const handleSubmitCompletion = async () => {
        if (!summary || !file) {
            alert('Please provide a summary and upload a file.');
            return;
        }

        closeSubmitPopup(); // Close the popup after validation
        handleTaskCompletion(taskToSubmit._id, taskToSubmit.completed); // Complete the task
    };

    const handleTaskCompletion = async (taskId, currentStatus) => {
        try {
            const updatedTasks = tasks.map(task =>
                task._id === taskId ? { ...task, completed: !currentStatus } : task
            );
            
            setTasks(updatedTasks);

            const response = await fetch(`http://localhost:5500/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ completed: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            const updatedTask = await response.json();
            if (updatedTask.completed !== currentStatus) {
                setTasks(tasks.map(task => 
                    task._id === taskId ? { ...task, completed: updatedTask.completed } : task
                ));
            }
        } catch (error) {
            console.error('Error updating task:', error);
            setPopupError(error.message);
            setTasks(tasks.map(task => 
                task._id === taskId ? { ...task, completed: currentStatus } : task
            ));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const taskData = {
            task: formData.get('task'),
            date: formData.get('date'),
            difficulty: formData.get('difficulty'),
            type: formData.get('type'),
            pomodoro: formData.get('pomodoro') ? true : false,
        };

        try {
            const response = await fetch('http://localhost:5500/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                throw new Error('Failed to add task');
            }

            const result = await response.json();
            console.log('Task added:', result);
            setSuccessMessage('Task added successfully!');
            e.target.reset();
            setIsFormVisible(false);
        } catch (error) {
            console.error('Error adding task:', error);
            setErrorMessage(error.message);
        }
    };

    const handlePomodoroClick = () => {
        navigate('/pomodoro'); // Navigate to the Pomodoro page
    };


    return (
        <div className={isPopupVisible ? 'blur-background' : ''}>
            <div className="background">
                <div className="task-container">
                    <h2>Focus Zones</h2>
                    <div className="task-cards-container">
                        {/* Career Category */}
                        <div className="card task-card" onClick={() => handleCategoryClick('Career')}>
                            <img src={require('../assets/images/Career.jpeg')} alt="Career" className="task-image" />
                            <div className="card-body">
                                <h5 className="card-title">Career</h5>
                                <p className="card-text">Propel your professional journey with tasks that elevate skills, spark connections, and open doors to new opportunities!</p>
                            </div>
                        </div>
                        {/* Health Category */}
                        <div className="card task-card" onClick={() => handleCategoryClick('Health')}>
                            <img src={require('../assets/images/Healthcare.jpeg')} alt="Health" className="task-image" />
                            <div className="card-body">
                                <h5 className="card-title">Health</h5>
                                <p className="card-text">Stay vibrant and active with tasks that enhance your fitness, nutrition, and overall wellness, from daily workouts to balanced meal planning!</p>
                            </div>
                        </div>
                        {/* Self Care Category */}
                        <div className="card task-card" onClick={() => handleCategoryClick('Self Care')}>
                            <img src={require('../assets/images/Selfcare.jpeg')} alt="Self Care" className="task-image" />
                            <div className="card-body">
                                <h5 className="card-title">Self Care</h5>
                                <p className="card-text">Prioritize your well-being with tasks that rejuvenate your mind, body, and soul, from relaxation routines to personal reflection!</p>
                            </div>
                        </div>
                        {/* Intellectual Category */}
                        <div className="card task-card" onClick={() => handleCategoryClick('Intellectual')}>
                            <img src={require('../assets/images/Intellectual.jpeg')} alt="Intellectual" className="task-image" />
                            <div className="card-body">
                                <h5 className="card-title">Intellectual</h5>
                                <p className="card-text">Engage in tasks that challenge and expand your intellect, from learning new skills to diving into thought-provoking content!</p>
                            </div>
                        </div>
                        {/* Finance Category */}
                        <div className="card task-card" onClick={() => handleCategoryClick('Finance')}>
                            <img src={require('../assets/images/Finance.jpeg')} alt="Finance" className="task-image" />
                            <div className="card-body">
                                <h5 className="card-title">Finance</h5>
                                <p className="card-text">Manage and grow your wealth with tasks that streamline budgeting, investing, and financial planning!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Task Button */}
            <button className="create-task-btn" onClick={toggleFormVisibility}>+</button>

            {/* Task Form */}
            {isFormVisible && (
                <form className="task-form" onSubmit={handleSubmit}>
                    <button type="button" className="close-btn" onClick={toggleFormVisibility}>✖</button>
                    <div className="form-group">
                        <label htmlFor="task">Task:</label>
                        <input type="text" id="task" name="task" placeholder="Enter your task..." required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="date">Choose Date:</label>
                        <input type="date" id="date" name="date" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="difficulty">Difficulty Level:</label>
                        <select id="difficulty" name="difficulty" required>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">Task Category:</label>
                        <select id="type" name="type" required>
                            <option value="Career">Career</option>
                            <option value="Finance">Finance</option>
                            <option value="Self Care">Self Care</option>
                            <option value="Intellectual">Intellectual</option>
                            <option value="Health">Health</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="pomodoro">Use Pomodoro Technique?</label>
                        <input type="checkbox" id="pomodoro" name="pomodoro" />
                    </div>
                    <button type="submit" className="btn">Add Task</button>
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </form>
            )}

            {/* Task Popup */}
            {isPopupVisible && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <button className="popup-close-btn" onClick={closePopup}>✖</button>
                        <h3>{selectedCategory} Tasks</h3>
                        {loading ? (
                            <p>Loading tasks...</p>
                        ) : popupError ? (
                            <p className="error-message">{popupError}</p>
                        ) : tasks.length === 0 ? (
                            <p>No tasks found for this category.</p>
                        ) : (
                            <>
                                <ul className="task-list">
                                    {tasks.map(task => (
                                        <li key={task._id} className={task.completed ? 'completed' : ''}>
                                            <label htmlFor={`task-${task._id}`} className="task-label">
                                                <input
                                                    type="checkbox"
                                                    checked={task.completed}
                                                    onChange={() => openSubmitPopup(task)}
                                                    id={`task-${task._id}`}
                                                />
                                                <span className="custom-checkbox"></span>
                                                <span className="task-name">{task.task}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                                {popupError && <p className="error-message">{popupError}</p>}
                            </>
                        )}
                         <button onClick={handlePomodoroClick} className="pomodoro-btn">Go to Pomodoro</button> {/* Pomodoro Button */}
                    </div>
                </div>
            )}
            {/* Task Completion Summary Popup */}
            {isSubmitPopupVisible && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <button className="popup-close-btn" onClick={closeSubmitPopup}>✖</button>
                        <h3>Complete Task</h3>
                        <div className="form-group">
                            <label htmlFor="summary">Task Summary:</label>
                            <textarea
                                id="summary"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="Enter a brief summary..."
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="file">Upload Related File:</label>
                            <input
                                type="file"
                                id="file"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </div>
                        <button className="btn" onClick={handleSubmitCompletion}>Submit</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Task;
