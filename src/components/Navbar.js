import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; // Import the logout icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import Font Awesome
import PropTypes from 'prop-types'; // Import PropTypes
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/css/Navbar.css';

const Navbar = ({ userName, setUserName }) => {
    const navigate = useNavigate(); // Hook for navigation

    const handleLogout = () => {
        setUserName(null); // Clear userName
        navigate('/login'); // Redirect to login page
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
            <Link className="navbar-brand" to="/">Ascentia</Link>

            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ml-auto">
                    {userName ? ( // Conditionally render based on userName
                        <>
                            <li className="nav-item">
                                <span className="nav-link">{userName}</span>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/task">Task</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/quest">Quest</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/connect">Connect+</Link>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link btn btn-link transparent-logout" onClick={handleLogout}>
                                    <FontAwesomeIcon icon={faSignOutAlt} title="Logout" /> {/* Logout icon */}
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">Login</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/signup">Sign Up</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

// PropTypes validation
Navbar.propTypes = {
    userName: PropTypes.string, // Expect userName to be a string
    setUserName: PropTypes.func.isRequired, // Expect setUserName to be a function
};

export default Navbar;