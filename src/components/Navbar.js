import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../assets/css/Navbar.css';
import LogoImage from '../assets/images/LOGO.png';


const Navbar = ({ userName, setUserName }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    let lastScrollY = window.scrollY;

    const handleLogout = () => {
        setUserName(null);
        navigate('/login');
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY) {
                setHidden(true); // Hide navbar on scroll down
            } else {
                setHidden(false); // Show navbar on scroll up
            }
            lastScrollY = window.scrollY;
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar navbar-expand-lg ${scrolled ? 'navbar-scrolled' : 'navbar-dark'} ${hidden ? 'navbar-hidden' : ''} fixed-top`}>
            <Link className="navbar-brand" to="/">
                <img src={LogoImage} alt="Ascentia Logo" className="navbar-logo" />
            </Link>

            <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ml-auto">
                    {userName ? (
                        <>
                            <li className="nav-item">
                                <span className="nav-link">{userName}</span>
                            </li>
                            <li className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/dashboard">Dashboard</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/task' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/task">Task</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/pomodoro' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/pomodoro">Pomodoro</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/friend' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/friend">Connect+</Link>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link btn btn-link transparent-logout" onClick={handleLogout}>
                                    <FontAwesomeIcon icon={faSignOutAlt} title="Logout" />
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className={`nav-item ${location.pathname === '/login' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/login">Login</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/signup' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/signup">Sign Up</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

Navbar.propTypes = {
    userName: PropTypes.string,
    setUserName: PropTypes.func.isRequired,
};

export default Navbar;