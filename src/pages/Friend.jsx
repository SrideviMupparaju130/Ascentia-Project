import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../assets/css/Friend.css';

const API_BASE_URL = 'http://localhost:5500/api';

function Connect() {
    const [activeTab, setActiveTab] = useState('allUsers');
    const [searchTerm, setSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [friends, setFriends] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const customFetch = async (url, options = {}) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const headers = {
                'Content-Type': 'application/json',
                ...options.headers,
                Authorization: `Bearer ${token}`,
            };

            const response = await fetch(url, { ...options, headers });
            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Fetch error:", error);
            setError(error.message);
            throw error;
        }
    };

    const fetchAllUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await customFetch(`${API_BASE_URL}/friends/users`);
            setAllUsers(data);
        } catch (error) {
            setError('Failed to load users. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFriends = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await customFetch(`${API_BASE_URL}/friends/friends`);
            setFriends(data.data || []);
        } catch (error) {
            setError('Failed to load friends. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFriendRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const receivedData = await customFetch(`${API_BASE_URL}/friends/requests`);
            const sentData = await customFetch(`${API_BASE_URL}/friends/sent-requests`);
            setReceivedRequests(receivedData);
            setSentRequests(sentData);
        } catch (error) {
            setError('Failed to load friend requests.');
        } finally {
            setLoading(false);
        }
    }, []);

    const addFriend = async (user) => {
        try {
            await customFetch(`${API_BASE_URL}/friends/send-request/${user._id}`, {
                method: 'POST'
            });
            alert('Friend request sent!');
            fetchFriendRequests();
        } catch (error) {
            setError('An error occurred while sending the friend request. Please try again.');
        }
    };

    const acceptRequest = async (requesterId) => {
        try {
            await customFetch(`${API_BASE_URL}/friends/accept-request/${requesterId}`, {
                method: 'POST'
            });
            alert('Friend request accepted!');
            fetchFriends();
            fetchFriendRequests();
        } catch (error) {
            setError('An error occurred while accepting the friend request.');
        }
    };

    const filteredUsers = useMemo(() => {
        return allUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allUsers, searchTerm]);

    const isFriend = (userId) => friends.some(friend => String(friend.friendId) === userId);
    const isRequestPending = (userId) => sentRequests.some(request => String(request.friendId._id) === userId);

    useEffect(() => {
        fetchAllUsers();
        fetchFriends();
        fetchFriendRequests();
    }, [fetchAllUsers, fetchFriends, fetchFriendRequests]);

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
                    <button 
                        className={`tab ${activeTab === 'requests' ? 'active-tab' : ''}`} 
                        onClick={() => setActiveTab('requests')}
                    >
                        Friend Requests
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
                                    disabled={isFriend(user._id) || isRequestPending(user._id)}
                                >
                                    {isFriend(user._id) ? 'Added' : isRequestPending(user._id) ? 'Pending' : 'Add'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'myFriends' ? (
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
                ) : (
                    <div className="request-list">
                        <h4>Received Requests</h4>
                        {receivedRequests.map(request => (
                            <div key={request.userId._id} className="user-card">
                                <div className="user-info">
                                    <h3>{request.userId.name}</h3>
                                    <p>XP: {request.userId.XP}</p>
                                    <p>Level: {request.userId.level}</p>
                                </div>
                                <button 
                                    className="accept-btn" 
                                    onClick={() => acceptRequest(request.userId._id)}
                                >
                                    Accept
                                </button>
                            </div>
                        ))}
                        <h4>Sent Requests</h4>
                        {sentRequests.map(request => (
                            <div key={request.friendId._id} className="user-card">
                                <div className="user-info">
                                    <h3>{request.friendId.name}</h3>
                                    <p>XP: {request.friendId.XP}</p>
                                    <p>Level: {request.friendId.level}</p>
                                </div>
                                <button className="cancel-btn" disabled>
                                    Pending
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Connect;
