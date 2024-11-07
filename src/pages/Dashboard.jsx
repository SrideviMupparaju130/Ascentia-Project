import { Chart, Filler, LineElement, PointElement, RadarController, RadialLinearScale } from 'chart.js';
import React, { useEffect, useRef, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../assets/css/Dashboard.css';
import avatarImage from '../assets/images/girl.png';
import portalImage from '../assets/images/por.png';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler);

const Dashboard = () => {
    const [userStats, setUserStats] = useState({
        name: '',
        level: 0,
        totalXP: 0,
        streak: 0,
        categoryXP: { Career: 0, Health: 0, 'Self Care': 0, Intellectual: 0, Finance: 0 },
        leaderboard: [],
        groupedTasksByDate: {},
        progressToNextLevel: 0,
    });

    const [selectedDate, setSelectedDate] = useState(new Date());
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5500/api/dashboard', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
                const data = await response.json();
                setUserStats({
                    name: data.user.name,
                    level: data.user.level,
                    totalXP: data.user.totalXP,
                    streak: data.user.streak,
                    categoryXP: data.stats.tasksByCategory,
                    leaderboard: data.leaderboard,
                    groupedTasksByDate: data.stats.groupedTasksByDate,
                    progressToNextLevel: data.user.progressToNextLevel,
                });
                updateRadarChart(data.stats.tasksByCategory);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, []);

    const updateRadarChart = (categoryXP) => {
        const ctx = chartRef.current.getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Career', 'Health', 'Self-Care', 'Intellectual', 'Finance'],
                datasets: [{
                    label: 'XP by Category',
                    data: [
                        categoryXP.Career,
                        categoryXP.Health,
                        categoryXP['Self Care'],
                        categoryXP.Intellectual,
                        categoryXP.Finance
                    ],
                    backgroundColor: 'rgba(70, 70, 70, 0)',  // Semi-transparent purple
                    borderColor: '#0ff',  // Neon cyan border
                    pointBackgroundColor: '#f0f',  // Neon pink for points
                    pointBorderColor: '#fff',  // White border for points
                    pointHoverBackgroundColor: '#ff0',  // Neon yellow on hover
                    pointHoverBorderColor: '#0ff'  // Neon cyan on hover
                }]
            },
            options: {
                elements: { line: { borderWidth: 3, tension: 0.4 } }, // Cyberpunk style with smooth lines
                scales: {
                    r: {
                        angleLines: { color: '#f0f' },  // Neon pink for angle lines
                        grid: { color: 'rgba(255, 0, 255, 0.3)' },  // Semi-transparent grid in purple
                        pointLabels: {
                            color: '#0ff',  // Neon cyan for labels
                            font: { size: 18, weight: 'bold' }  // Orbitron font and cyberpunk styling
                        },
                        ticks: {
                            backdropColor: 'rgba(0, 0, 0, 0.8)',  // Dark backdrop for ticks
                            color: '#fff',  // White ticks for contrast
                            font: { size: 14, weight: 'bold' }  // Orbitron font for ticks
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff',  // White text for the legend
                            font: { size: 16, weight: 'bold' }  // Orbitron font for legend
                        }
                    }
                }
            }
        });
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const formattedDate = date.toISOString().split('T')[0];
            const tasks = userStats.groupedTasksByDate[formattedDate] || [];
            return (
                <div className="task-dots">
                    {tasks.map((task, index) => (
                        <span key={index} className="task-dot" title={task.task}></span>
                    ))}
                </div>
            );
        }
    };

    // New function to filter tasks for the selected date
    const getTasksForSelectedDate = () => {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        return userStats.groupedTasksByDate[formattedDate] || [];
    };

    return (
        <div className="main-section">
            <img src={portalImage} alt="Bottom portal" className="portal-image bottom-image" />
            <img src={avatarImage} alt="Avatar" className="avatar-image" />

            <div className="stats-box">
                <div className="stats-content">
                    <h2>Stats</h2>
                    {Object.entries(userStats.categoryXP).map(([category, xp]) => (
                        <p key={category}>
                            <span className="stats-type">{category}</span> 
                            <span className="xp-points">{xp} XP</span>
                        </p>
                    ))}
                </div>
            </div>

            <div className="level-info-box">
                <div className="stats-content">
                    <h2>Player Stats</h2>
                    <p><span className="stats-type">Name</span> <span className="xp-points">{userStats.name}</span></p>
                    <p><span className="stats-type">Level</span> <span className="xp-points">{userStats.level}</span></p>
                    <p><span className="stats-type">Total XP</span> <span className="xp-points">{userStats.totalXP}</span></p>
                    <p><span className="stats-type">Streak</span> <span className="xp-points">{userStats.streak} Days</span></p>
                </div>
            </div>

            <div className="level-container">
                <div className="level-circle">{userStats.level}</div>
                <div className="level-bar">
                    <div className="level-progress" style={{ width: `${userStats.progressToNextLevel}%` }}></div>
                </div>
                <div className="xp-info">
                    Current XP: <span className="xp-value">{userStats.totalXP}</span>
                </div>
            </div>

            <div className="chart-container">
                <div className="radar-chart-container">
                    <canvas id="radarChart" ref={chartRef}></canvas>
                </div>
            </div>

            <div className="leaderboard-box">
                <div className="leaderboard-title">Leaderboard</div>
                <ul className="leaderboard-list">
                    {userStats.leaderboard.map((user, index) => (
                        <li key={index}>
                            <span className="leaderboard-rank">{index + 1}</span>
                            <span className="leaderboard-name">{user.username}</span>
                            <span className="leaderboard-score">{user.totalXP} XP</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="calendar-container">
                <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileContent={tileContent}
                />
            </div>

            {/* Display tasks for the selected date */}
            {/* Display tasks for the selected date */}
            <div className="task-list-for-date">
                <h3>Tasks on {selectedDate.toDateString()}</h3>
                <ul>
                    {getTasksForSelectedDate().map((task, index) => (
                        <li key={index}>
                            <span>{task.task}</span> - <em>{task.completed ? 'Completed' : 'Incomplete'}</em>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
