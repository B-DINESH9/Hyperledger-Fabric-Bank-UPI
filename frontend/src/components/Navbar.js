import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { 
  FaHome, 
  FaExchangeAlt, 
  FaHistory, 
  FaUser, 
  FaShieldAlt, 
  FaChartBar, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBell
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { socket, connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/transfer', label: 'Transfer', icon: FaExchangeAlt },
    { path: '/transactions', label: 'Transactions', icon: FaHistory },
    { path: '/profile', label: 'Profile', icon: FaUser },
  ];

  const adminItems = [
    { path: '/admin', label: 'Admin Dashboard', icon: FaShieldAlt },
    { path: '/admin/transactions', label: 'All Transactions', icon: FaHistory },
    { path: '/admin/fraud-alerts', label: 'Fraud Alerts', icon: FaBell },
    { path: '/admin/analytics', label: 'Analytics', icon: FaChartBar },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-lg border-b border-blue-500">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between h-12">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center shadow-lg group-hover:bg-white/30 transition-all duration-300">
                <span className="text-white font-bold text-xs">🔗</span>
              </div>
              <span className="text-sm font-bold text-white hidden sm:block">Blockchain UPI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Main Navigation */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-300 flex items-center space-x-1 ${
                      isActive(item.path)
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                        : 'text-blue-100 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden lg:block">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Admin Navigation */}
            {isAdmin && (
              <div className="flex items-center space-x-1 border-l border-white/20 pl-2">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-300 flex items-center space-x-1 ${
                        isActive(item.path)
                          ? 'bg-yellow-400/20 text-yellow-200 shadow-lg backdrop-blur-sm border border-yellow-400/30'
                          : 'text-blue-100 hover:text-yellow-200 hover:bg-yellow-400/10 backdrop-blur-sm'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden lg:block">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Connection Status */}
            <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-md px-1 py-1">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-xs text-blue-100 font-medium hidden sm:block">
                {connected ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 focus:outline-none"
              >
                <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-medium text-xs">
                    {user?.upiID ? user.upiID.charAt(0).toUpperCase() : ''}
                  </span>
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-white font-medium text-xs">{user?.upiID}</div>
                  <div className="text-xs text-blue-200">{user?.role}</div>
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-xl py-2 z-50 border border-white/20">
                  <div className="px-3 py-2 text-sm border-b border-gray-100">
                    <div className="font-medium text-gray-900 text-sm">{user?.upiID}</div>
                    <div className="text-gray-500 text-xs">{user?.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors duration-200"
                  >
                    <FaSignOutAlt className="mr-2 text-red-500" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-md text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 focus:outline-none"
            >
              {isMenuOpen ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-b from-blue-600 to-indigo-700 border-t border-blue-500">
            {/* Main Navigation */}
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-blue-100 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="inline-block w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              );
            })}

            {/* Admin Navigation */}
            {isAdmin && (
              <>
                <div className="border-t border-white/20 pt-3 mt-3">
                  <div className="px-3 py-1 text-xs font-semibold text-yellow-200 uppercase tracking-wider">
                    Admin
                  </div>
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                          isActive(item.path)
                            ? 'bg-yellow-400/20 text-yellow-200 shadow-lg backdrop-blur-sm border border-yellow-400/30'
                            : 'text-blue-100 hover:text-yellow-200 hover:bg-yellow-400/10 backdrop-blur-sm'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="inline-block w-4 h-4 mr-2" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            {/* User Info and Logout */}
            <div className="border-t border-white/20 pt-3 mt-3">
              <div className="px-3 py-2 text-sm bg-white/10 backdrop-blur-sm rounded-md mb-2">
                <div className="font-medium text-white text-sm">{user?.upiID}</div>
                <div className="text-blue-200 text-xs">{user?.role}</div>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-red-200 hover:text-white hover:bg-red-500/20 backdrop-blur-sm rounded-md flex items-center transition-all duration-300"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
