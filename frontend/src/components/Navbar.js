import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import Icon from '../components/Icon';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleLogout = () => {
        logout();
        if (socket) {
            socket.disconnect(); // Ensure socket disconnection on logout
        }
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className='navbar'>
            <div className='logo'>
                <Link to='/' onClick={closeMenu}>Bank UPI</Link>
            </div>
            <ul className={`nav-links ${isMobile && isMenuOpen ? 'mobile-open' : ''} ${isMobile ? 'mobile' : 'desktop'}`}> 
                <li className={location.pathname === '/' ? 'active' : ''}>
                    <Link to='/' onClick={closeMenu}>Home</Link>
                </li>
                <li className={location.pathname === '/about' ? 'active' : ''}>
                    <Link to='/about' onClick={closeMenu}>About</Link>
                </li>
                {user ? (
                    <>
                        <li className={location.pathname === '/dashboard' ? 'active' : ''}>
                            <Link to='/dashboard' onClick={closeMenu}>Dashboard</Link>
                        </li>
                        <li>
                            <button className='logout-btn' onClick={handleLogout}>Logout</button>
                        </li>
                    </>
                ) : (
                    <li className={location.pathname === '/login' ? 'active' : ''}>
                        <Link to='/login' onClick={closeMenu}>Login</Link>
                    </li>
                )}
            </ul>
            {isMobile && (
                <div className='menu-icon' onClick={toggleMenu}>
                    <Icon name={isMenuOpen ? 'close' : 'menu'} />
                </div>
            )}
        </nav>
    );
};

export default Navbar;