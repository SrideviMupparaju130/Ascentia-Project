import React, { useEffect, useState } from 'react';
import '../assets/css/Quest.css';

function Quest() {
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuests = async () => {
            try {
                const response = await fetch('http://localhost:5500/api/quests', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                setQuests(data);
            } catch (error) {
                console.error("Error fetching quests:", error);
                setError('Failed to load quests. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchQuests();
    }, []);

    const handleCompletionChange = async (questId) => {
        const updatedQuests = quests.map(quest =>
            quest._id === questId ? { ...quest, completed: true } : quest
        );
        setQuests(updatedQuests);

        try {
            const response = await fetch('http://localhost:5500/api/quests', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ questId }),
            });

            if (!response.ok) {
                throw new Error('Failed to update quest status.');
            }

            const updatedQuest = await response.json();
            setQuests(quests.map(quest =>
                quest._id === questId ? { ...quest, completed: updatedQuest.quest.completed } : quest
            ));
        } catch (error) {
            console.error('Error updating quest completion:', error);
            alert('An error occurred while updating the quest status. Please try again.');
        }
    };

    return (
        <div className='background'>
            <div className="quests-container">
                {loading ? (
                    <p>Loading quests...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : quests.length === 0 ? (
                    <p>No quests available for this week.</p>
                ) : (
                    <div>
                        <h2 style={{ textAlign: 'center' }}>Your Weekly Quests</h2>
                        <div className="quests-list">
                            {quests.map((quest, index) => (
                                <div 
                                    key={quest._id} 
                                    className={`quest-card color-theme-${(index % 6) + 1}`}
                                >
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={quest.completed}
                                            onChange={() => handleCompletionChange(quest._id)}
                                            disabled={quest.completed}
                                        />
                                        <span>{quest.Challenge}</span>
                                    </label>
                                    <span className="xp-badge">{quest.XP} XP</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Quest;
