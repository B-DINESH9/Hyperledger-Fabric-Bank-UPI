import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import Icon from '../components/Icon';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
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
        socket.disconnect(); // Ensure socket disconnection on logout
    };

    return (
        <nav className='navbar'>
            <div className='logo'>
                <Link to='/'>Bank UPI</Link>
            </div>
            <ul className={`nav-links ${isMobile ? 'mobile' : 'desktop'}`}> 
                <li className={location.pathname === '/' ? 'active' : ''}>
                    <Link to='/'>Home</Link>
                </li>
                <li className={location.pathname === '/about' ? 'active' : ''}>
                    <Link to='/about'>About</Link>
                </li>
                {user ? (
                    <>
                        <li>
                            <Link to='/dashboard'>Dashboard</Link>
                        </li>
                        <li>
                            <button onClick={handleLogout}>Logout</button>
                        </li>
                    </>
                ) : (
                    <li className={location.pathname === '/login' ? 'active' : ''}>
                        <Link to='/login'>Login</Link>
                    </li>
                )}
            </ul>
            <div className='menu-icon' onClick={() => setIsMobile(!isMobile)}>
                <Icon name={isMobile ? 'close' : 'menu'} />
            </div>
        </nav>
    );
};

export default Navbar;