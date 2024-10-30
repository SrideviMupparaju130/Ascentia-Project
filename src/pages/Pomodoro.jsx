import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import '../assets/css/Pomodoro.css'; // Import custom CSS for Pomodoro page

function Pomodoro() {
    const navigate = useNavigate(); // Initialize navigate
    const [time, setTime] = useState(30 * 60); // 30 minutes in seconds
    const [isActive, setIsActive] = useState(false); // Timer active state
    const [sessionType, setSessionType] = useState('work'); // Current session type
    const [cycles, setCycles] = useState(0); // Count completed cycles

    const handleSessionComplete = () => {
        if (sessionType === 'work') {
            setCycles(prevCycles => prevCycles + 1);
            if (cycles < 3) {
                setSessionType('break');
                setTime(5 * 60); // Short break
            } else {
                setSessionType('long-break');
                setCycles(0); // Reset cycles
                setTime(30 * 60); // Long break
            }
        } else {
            setSessionType('work');
            setTime(30 * 60); // Work session
        }
    };

    useEffect(() => {
        let interval = null;

        if (isActive && time > 0) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime - 1);
            }, 1000);
        } else if (!isActive && time !== 0) {
            clearInterval(interval);
        } else if (time === 0) {
            // Timer has completed
            handleSessionComplete();
        }

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [isActive, time, cycles]); // Removed handleSessionComplete from dependency array

    const formatTime = (time) => {
        const minutes = String(Math.floor(time / 60)).padStart(2, '0');
        const seconds = String(time % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const handleStartClick = () => {
        setIsActive(true);
    };

    const handlePauseClick = () => {
        setIsActive(false);
    };

    const handleResetClick = () => {
        setIsActive(false);
        setCycles(0);
        setSessionType('work');
        setTime(30 * 60); // Reset to work session
    };

    const handleBackClick = () => {
        navigate('/task'); // Change this to your actual task page route
    };

    return (
        <div className="background">
            <div className="timer-container">
                <h2>Pomodoro Timer</h2>
                <div id="timer">
                    <div id="time">{formatTime(time)}</div>
                    <div id="control-buttons">
                        <button id="start" className="control-btn" onClick={handleStartClick}>Start</button>
                        <button id="pause" className="control-btn" onClick={handlePauseClick}>Pause</button>
                        <button id="reset" className="control-btn" onClick={handleResetClick}>Reset</button>
                    </div>
                    <div id="stats">
                        <div id="session">Session: {sessionType === 'work' ? 'Focus' : sessionType === 'break' ? 'Short Break' : 'Long Break'}</div>
                        <div id="cycles">Cycles Completed: {cycles}</div>
                    </div>
                </div>
                <button 
                    id="back-button" 
                    className="control-btn" 
                    onClick={handleBackClick} 
                    style={{ position: 'absolute', bottom: '20px', right: '20px' }} // Style the button to position it at the corner
                >
                    Back to Task 
                </button>
            </div>
        </div>
    );
}

export default Pomodoro;
