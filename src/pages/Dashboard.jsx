import { Chart, Filler, LineElement, PointElement, RadarController, RadialLinearScale } from 'chart.js';
import React, { useEffect, useRef } from 'react';
import '../assets/css/Dashboard.css';
import avatarImage from '../assets/images/girl.png';
import portalImage from '../assets/images/por.png';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler);

const Dashboard = () => {
    const chartRef = useRef(null);

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');
        const radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Career', 'Health', 'Self-Care', 'Intellectual', 'Finance'],
                datasets: [{
                    label: 'Dataset',
                    data: [65, 59, 90, 81, 56],
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
                        angleLines: {
                            color: '#f0f'
                        },
                        grid: {
                            color: '#0ff'
                        },
                        pointLabels: {
                            color: '#0ff',
                            font: {
                                size: 16,
                                family: 'Arial',
                                style: 'normal',
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            backdropColor: 'rgba(0, 0, 0, 0.8)',
                            color: '#fff',
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                plugins: {
                    beforeDraw: function (chart) {
                        const ctx = chart.ctx;
                        const fontSize = 16;
                        ctx.font = `${fontSize}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
        
                        chart.data.labels.forEach((label, index) => {
                            const angle = (Math.PI * 2) * (index / chart.data.labels.length) - Math.PI / 2;
                            const radius = chart.chartArea.r;
                            const x = chart.chartArea.x + chart.chartArea.width / 2 + Math.cos(angle) * radius;
                            const y = chart.chartArea.y + chart.chartArea.height / 2 + Math.sin(angle) * radius;
        
                            ctx.shadowColor = '#0ff';
                            ctx.shadowBlur = 20;
                            ctx.fillStyle = '#0ff';
                            ctx.fillText(label, x, y);
                            ctx.shadowBlur = 0;
                        });
                    }
                }
            }
        });

        return () => {
            radarChart.destroy();
        };
    }, []);

    return(
            <div className="main-section">
                <img src={portalImage} alt="Bottom portal" className="portal-image bottom-image" />
                <img src={avatarImage} alt="Avatar" className="avatar-image" />

                {/* Stats Box Container with Hologram */}
                <div className="stats-box">
                    <div className="stats-content">
                        <div className="title-wrapper">
                            <h2>Stats</h2>
                        </div>
                        <p><span className="stats-type">Career</span> <span className="xp-points">0/100 XP</span></p>
                        <p><span className="stats-type">Health</span> <span className="xp-points">0/100 XP</span></p>
                        <p><span className="stats-type">Self-Care</span> <span className="xp-points">0/100 XP</span></p>
                        <p><span className="stats-type">Intellectual</span> <span className="xp-points">0/100 XP</span></p>
                        <p><span className="stats-type">Finance</span> <span className="xp-points">0/100 XP</span></p>
                    </div>
                </div>

                <div className="level-info-box">
                    <div className="stats-content">
                        <div className="title-wrapper">
                            <h2>Player Stats</h2>
                        </div>
                        <p><span className="stats-type">Name</span> <span className="xp-points">[Player Name]</span></p>
                        <p><span className="stats-type">Level</span> <span className="xp-points">[Current Level]</span></p>
                        <p><span className="stats-type">Total XP</span> <span className="xp-points">[XP Gained]</span></p>
                        <p><span className="stats-type">Streak</span> <span className="xp-points">[Days]</span></p>
                    </div>
                </div>

                {/* Tasks Box Container with Hologram */}
                <div className="tasks-box">
                    <div className="stats-content">
                        <div className="title-wrapper">
                            <h2>Tasks</h2>
                        </div>
                        <p><span className="tasks-box1">Module 1</span></p>
                        <p><span className="tasks-box2">Daily Exercise</span></p>
                        <p><span className="tasks-box3">Meditation</span></p>
                        <p><span className="tasks-box4">Budget Review</span></p>
                        <p><span className="tasks-box5">Read for 30 min</span></p>
                    </div>
                </div>

                <div className="level-container">
                    <div className="level-circle">1</div>
                    <div className="level-bar">
                        <div className="level-progress"></div>
                    </div>
                </div>
                <div className="xp-info">
                    Current XP: <span className="xp-value">1500</span> / <span className="xp-required">3000</span>
                </div>

                {/* Radar Spider Chart Container */}
                <div className="chart-container">
                    <div className="radar-chart-container">
                        <canvas id="radarChart" ref={chartRef}></canvas>
                    </div>
                </div>

                <div className="scroll-background" id="scrollBackground"></div>

                <div className="leaderboard-box">
                    <div className="leaderboard-title">Leaderboard</div>
                    <ul className="leaderboard-list">
                        <li><span className="leaderboard-rank">1</span> <span className="leaderboard-name">CyberWarrior</span> <span className="leaderboard-score">5000 XP</span></li>
                        <li><span className="leaderboard-rank">2</span> <span className="leaderboard-name">NeonGhost</span> <span className="leaderboard-score">4500 XP</span></li>
                        <li><span className="leaderboard-rank">3</span> <span className="leaderboard-name">TechMage</span> <span className="leaderboard-score">4000 XP</span></li>
                        <li><span className="leaderboard-rank">4</span> <span className="leaderboard-name">PixelHacker</span> <span className="leaderboard-score">3500 XP</span></li>
                        <li><span className="leaderboard-rank">5</span> <span className="leaderboard-name">DataNinja</span> <span className="leaderboard-score">3000 XP</span></li>
                    </ul>
                </div>

                {/* New background section */}
                <div className="scroll-background" id="scrollBackground"></div>

                {/* Leaderboard Box Container */}
                <div className="leaderboard-box">
                    <div className="leaderboard-title">Leaderboard</div>
                    <ul className="leaderboard-list">
                        <li><span className="leaderboard-rank">1</span> <span className="leaderboard-name">CyberWarrior</span> <span className="leaderboard-score">5000 XP</span></li>
                        <li><span className="leaderboard-rank">2</span> <span className="leaderboard-name">NeonGhost</span> <span className="leaderboard-score">4500 XP</span></li>
                        <li><span className="leaderboard-rank">3</span> <span className="leaderboard-name">TechMage</span> <span className="leaderboard-score">4000 XP</span></li>
                        <li><span className="leaderboard-rank">4</span> <span className="leaderboard-name">PixelHacker</span> <span className="leaderboard-score">3500 XP</span></li>
                        <li><span className="leaderboard-rank">5</span> <span className="leaderboard-name">DataNinja</span> <span className="leaderboard-score">3000 XP</span></li>
                    </ul>
                </div>

                <div className="heatmap-container">
                    <div className="heatmap-navigation">
                        <span className="arrow left-arrow">◀</span>
                        <span className="month-label">October 2024</span>
                        <span className="arrow right-arrow">▶</span>
                    </div>
                    <div className="heatmap-box">
                        <div className="day-label">Sun</div>
                        <div className="day-label">Mon</div>
                        <div className="day-label">Tue</div>
                        <div className="day-label">Wed</div>
                        <div className="day-label">Thu</div>
                        <div className="day-label">Fri</div>
                        <div className="day-label">Sat</div>

                        {/* Cells for each day in October (adjust according to the actual month layout) */}
                        <div class="heatmap-cell no"></div> 
                        <div class="heatmap-cell no"></div>
                        <div class="heatmap-cell no"></div>
                        <div class="heatmap-cell low">1</div>
                        <div class="heatmap-cell medium">2</div>
                        <div class="heatmap-cell high">3</div>
                        <div class="heatmap-cell low">4</div>
                        <div class="heatmap-cell medium">5</div>
                        <div class="heatmap-cell high">6</div>
                        <div class="heatmap-cell low">7</div>
                        <div class="heatmap-cell medium">8</div>
                        <div class="heatmap-cell high">9</div>
                        <div class="heatmap-cell low">10</div>
                        <div class="heatmap-cell medium">11</div>
                        <div class="heatmap-cell high">12</div>
                        <div class="heatmap-cell low">13</div>
                        <div class="heatmap-cell medium">14</div>
                        <div class="heatmap-cell high">15</div>
                        <div class="heatmap-cell low">16</div>
                        <div class="heatmap-cell medium">17</div>
                        <div class="heatmap-cell high">18</div>
                        <div class="heatmap-cell low">19</div>
                        <div class="heatmap-cell medium">20</div>
                        <div class="heatmap-cell high">21</div>
                        <div class="heatmap-cell low">22</div>
                        <div class="heatmap-cell medium">23</div>
                        <div class="heatmap-cell high">24</div>
                        <div class="heatmap-cell low">25</div>
                        <div class="heatmap-cell medium">26</div>
                        <div class="heatmap-cell high">27</div>
                        <div class="heatmap-cell low">28</div>
                        <div class="heatmap-cell medium">29</div>
                        <div class="heatmap-cell high">30</div>
                        <div class="heatmap-cell low">31</div>
                        <div class="heatmap-cell no"></div> 
                        <div class="heatmap-cell no"></div>
                        <div class="heatmap-cell no"></div>
                        {/* Add other cells as needed */}
                    </div>
                </div>
            </div>
    );
}

export default Dashboard;