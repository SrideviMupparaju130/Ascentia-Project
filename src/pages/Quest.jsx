import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import '../assets/css/Quest.css';

const Quest = ({ userId }) => {
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Validate userId before making the API call
        if (!userId) {
            setError('User ID is required');
            setLoading(false);
            return;
        }

        const fetchQuests = async () => {
            try {
                console.log('Fetching quests for userId:', userId); // Log userId
                const response = await axios.get(`/api/quests/user/${userId}`); // Correct endpoint
                setQuests(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchQuests();
    }, [userId]);

    if (loading) return <p>Loading quests...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="quest-list">
            {quests.map(quest => (
                <div key={quest._id} className="quest-box">
                    <h3>{quest.name}</h3>
                    <p>XP: {quest.xp}</p>
                    <p>Status: {quest.completed ? 'Completed' : 'Not Completed'}</p>
                </div>
            ))}
        </div>
    );
};

Quest.propTypes = { // Ensure the component name matches
    userId: PropTypes.string.isRequired,
};

export default Quest;