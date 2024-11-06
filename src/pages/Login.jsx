import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/Login.css';

function Login({ setUserName }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // State for loading
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true); // Set loading to true when login starts
    
        try {
            const response = await axios.post('http://localhost:5500/api/users/login', {
                email,
                password,
            }, {
                withCredentials: true // If you're using cookies for session management
            });
        
            console.log(response.data); // Check the response structure
            if (response.data.token) { // Check if token is in the response
                setUserName(response.data.user.name); // Set user name on successful login
                localStorage.setItem('token', response.data.token); // Store JWT
                navigate('/dashboard'); // Redirect to task page
            } else {
                setError('Unexpected response format.'); // Handle unexpected response
            }
        } catch (err) {
            // Check if error has a response and set appropriate message
            if (err.response) {
                console.error(err.response.data); // Log the error response
                setError(err.response.data.message || 'Login failed');
            } else {
                console.error(err); // Log the error object
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false); // Set loading to false after the request is complete
        }
    };

    return (
        <div className="background">
            <div className="login-container">
                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="rememberMe" />
                        <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
                    </div>
                    <hr />
                    <button type="button" className="btn btn-google btn-block">
                        <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google Logo" /> Login with Google
                    </button>
                </form>
                <div className="text-center mt-3">
                    <span>Don't have an account? </span>
                    <Link to="/signup" className="text-primary">Sign up</Link>
                </div>
            </div>
        </div>
    );
}

// PropTypes validation
Login.propTypes = {
    setUserName: PropTypes.func.isRequired,
};

export default Login;