import React, { useCallback, useEffect, useState } from 'react';
import '../assets/css/Connect.css';

function Connect() {
    const [activeTab, setActiveTab] = useState('allUsers');
    const [searchTerm, setSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'http://localhost:5500/api';

    const customFetch = async (url, options = {}) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            Authorization: `Bearer ${token}`,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    };

    const fetchAllUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await customFetch(`${API_BASE_URL}/connects/users`);
            setAllUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            setError('Failed to load users. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    const fetchFriends = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await customFetch(`${API_BASE_URL}/connects/friends`);
            setFriends(data.friends);
        } catch (error) {
            console.error('Error fetching friends:', error);
            setError('Failed to load friends. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    const addFriend = async (user) => {
        try {
            await customFetch(`${API_BASE_URL}/connects/send-request/${user._id}`, {
                method: 'POST'
            });

            alert('Friend request sent!');
            fetchFriends(); // Refresh friends list
        } catch (error) {
            console.error('Error sending friend request:', error);
            alert('An error occurred while sending the friend request. Please try again.');
        }
    };

    const filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isFriend = (userId) => friends.some(friend => String(friend.friendId) === userId);

    useEffect(() => {
        fetchAllUsers();
        fetchFriends();
    }, [fetchAllUsers, fetchFriends]);

    return (
        <div className="background">
            <div className="friends-page">
                <div className="tabs">
                    <button 
                        className={`tab ${activeTab === 'allUsers' ? 'active-tab' : ''}`} 
                        onClick={() => setActiveTab('allUsers')}
                    >
                        All Users
                    </button>
                    <button 
                        className={`tab ${activeTab === 'myFriends' ? 'active-tab' : ''}`} 
                        onClick={() => setActiveTab('myFriends')}
                    >
                        My Friends
                    </button>
                </div>

                {activeTab === 'allUsers' && (
                    <div className="search-bar">
                        <input 
                            type="text" 
                            placeholder="Search for friends..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}

                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : activeTab === 'allUsers' ? (
                    <div className="user-list">
                        {filteredUsers.map(user => (
                            <div key={user._id} className="user-card">
                                <div className="user-info">
                                    <h3>{user.name}</h3>
                                    <p>XP: {user.XP}</p>
                                    <p>Level: {user.level}</p>
                                </div>
                                <button 
                                    className="add-btn" 
                                    onClick={() => addFriend(user)} 
                                    disabled={isFriend(user._id)}
                                >
                                    {isFriend(user._id) ? 'Added' : 'Add'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="user-list">
                        {friends.map(friend => (
                            <div key={friend._id} className="user-card">
                                <div className="user-info">
                                    <h3>{friend.name}</h3>
                                    <p>XP: {friend.XP}</p>
                                    <p>Level: {friend.level}</p>
                                </div>
                                <button className="add-btn" disabled>Added</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Connect;