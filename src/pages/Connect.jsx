import React, { useState } from 'react';
import '../assets/css/Connect.css'; // Import custom CSS for Connect page

function Connect() {
    // Sample friends data
    const friends = [
        { username: 'JohnDoe', level: 8, xp: 1200 },
        { username: 'AliceSmith', level: 15, xp: 2500 },
        { username: 'BobMartin', level: 12, xp: 1800 }
    ];

    // State to manage the followed friends and search input
    const [followedFriends, setFollowedFriends] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [foundFriend, setFoundFriend] = useState(null);

    // Function to search for a friend
    const searchFriend = () => {
        const friend = friends.find(friend => friend.username.toLowerCase() === searchInput.toLowerCase());
        if (friend) {
            setFoundFriend(friend);
        } else {
            alert('Friend not found.');
            setFoundFriend(null); // Clear the found friend if not found
        }
    };

    // Function to follow a user
    const followUser = (username) => {
        if (!followedFriends.includes(username)) {
            setFollowedFriends([...followedFriends, username]);
            alert(`You are now following: ${username}`);
        } else {
            alert(`You are already following: ${username}`);
        }
    };

    // Function to update the leaderboard
    const getLeaderboard = () => {
        return followedFriends.map((username, index) => {
            const friend = friends.find(friend => friend.username === username);
            return (
                <tr key={username}>
                    <td>{index + 1}</td>
                    <td>{friend.username}</td>
                    <td>{friend.level}</td>
                    <td>{friend.xp} XP</td>
                </tr>
            );
        });
    };

    return (
        <div className="background">
            <div className="connect-container">
                <h1>Connect with Friends</h1>

                {/* Search bar */}
                <div className="search-bar">
                    <input 
                        type="text" 
                        id="searchInput" 
                        placeholder="Search by username" 
                        value={searchInput} 
                        onChange={(e) => setSearchInput(e.target.value)} 
                    />
                    <button type="button" onClick={searchFriend}>Search</button>
                </div>

                {/* Friend List */}
                <div className="friend-list" id="friendList">
                    <h2>Your Friends</h2>
                    {foundFriend ? (
                        <div className="friend">
                            <p><strong>Username:</strong> {foundFriend.username}</p>
                            <p><strong>Level:</strong> {foundFriend.level}</p>
                            <p><strong>XP:</strong> {foundFriend.xp}</p>
                            <button onClick={() => followUser(foundFriend.username)}>Follow</button>
                        </div>
                    ) : (
                        <div className="friend placeholder">
                            <p><strong>Username:</strong> </p>
                            <p><strong>Level:</strong> </p>
                            <p><strong>XP:</strong> </p>
                        </div>
                    )}
                </div>

                {/* Leaderboard */}
                <div className="leaderboard">
                    <h2>Leaderboard</h2>
                    <table id="leaderboardTable">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Username</th>
                                <th>Level</th>
                                <th>XP</th>
                            </tr>
                        </thead>
                        <tbody id="leaderboardBody">
                            {followedFriends.length > 0 ? getLeaderboard() : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center' }}>No leaderboard data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Connect;
