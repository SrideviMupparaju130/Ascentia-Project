import { Chart, Filler, LineElement, PointElement, RadarController, RadialLinearScale } from 'chart.js';
import React, { useEffect, useRef, useState } from 'react';
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
        tasks: [],
    });

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

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();

                // Update state with data and initialize radar chart
                setUserStats({
                    name: data.user.name,
                    level: data.user.level,
                    totalXP: data.user.totalXP,
                    streak: data.user.streak,
                    categoryXP: data.stats.tasksByCategory,
                    leaderboard: data.leaderboard,
                    tasks: data.stats.tasksByCategory,
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
                    backgroundColor: 'rgba(255, 0, 255, 0.2)',
                    borderColor: '#0ff',
                    pointBackgroundColor: '#f0f',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#ff0',
                    pointHoverBorderColor: '#0ff'
                }]
            },
            options: {
                elements: {
                    line: {
                        borderWidth: 3
                    }
                },
                scales: {
                    r: {
                        angleLines: { color: '#f0f' },
                        grid: { color: '#0ff' },
                        pointLabels: {
                            color: '#0ff',
                            font: { size: 16, family: 'Arial', weight: 'bold' }
                        },
                        ticks: {
                            backdropColor: 'rgba(0, 0, 0, 0.8)',
                            color: '#fff',
                            font: { size: 14 }
                        }
                    }
                },
            }
        });
    };

    return (
        <div className="main-section">
            <img src={portalImage} alt="Bottom portal" className="portal-image bottom-image" />
            <img src={avatarImage} alt="Avatar" className="avatar-image" />

            {/* Display user stats */}
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

            {/* Player Stats */}
            <div className="level-info-box">
                <div className="stats-content">
                    <h2>Player Stats</h2>
                    <p><span className="stats-type">Name</span> <span className="xp-points">{userStats.name}</span></p>
                    <p><span className="stats-type">Level</span> <span className="xp-points">{userStats.level}</span></p>
                    <p><span className="stats-type">Total XP</span> <span className="xp-points">{userStats.totalXP}</span></p>
                    <p><span className="stats-type">Streak</span> <span className="xp-points">{userStats.streak} Days</span></p>
                </div>
            </div>

            {/* Radar Chart */}
            <div className="chart-container">
                <div className="radar-chart-container">
                    <canvas id="radarChart" ref={chartRef}></canvas>
                </div>
            </div>

            {/* Leaderboard */}
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
        </div>
    );
};

export default Dashboard;