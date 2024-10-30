import axios from 'axios'; // Import axios for making HTTP requests
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import '../assets/css/Login.css';

function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simple client-side validation
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            // Post the data to the backend
            const response = await axios.post('http://localhost:5500/api/users/signup', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            // Handle response
            if (response.status === 201) {
                alert('User registered successfully. Please login.');
            }
        } catch (err) {
            console.error('Error during registration:', err);
            alert(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div>
            <div className="background">
                <div className="login-container">
                    <h2>Create An Account</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email address</label>
                            <input 
                                type="email" 
                                className="form-control" 
                                id="email" 
                                placeholder="Enter email" 
                                value={formData.email}
                                onChange={handleChange} 
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Nick Name</label>
                            <input 
                                className="form-control" 
                                id="name" 
                                placeholder="Enter name" 
                                value={formData.name}
                                onChange={handleChange} 
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
                                value={formData.password}
                                onChange={handleChange} 
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                id="confirmPassword" 
                                placeholder="Confirm Password" 
                                value={formData.confirmPassword}
                                onChange={handleChange} 
                                required
                            />
                        </div>
                        <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="rememberMe" />
                            <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">Signup</button>
                        <hr /> 
                        <button type="button" className="btn btn-google btn-block">
                            <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google Logo" /> Sign in with Google
                        </button>
                    </form>
                    <div className="text-center mt-3"> {/* Added div for better styling */}
                        <span>Already have an account? </span>
                        <Link to="/login" className="text-primary">Login</Link> {/* Link to the login page */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;