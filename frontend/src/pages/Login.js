import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaMobile, FaLock, FaUser } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    upiID: '',
    password: '',
    deviceID: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.upiID.trim()) {
      newErrors.upiID = 'UPI ID is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (!formData.deviceID.trim()) {
      newErrors.deviceID = 'Device ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(formData);
      if (result.success) {
        // Check if the logged-in user is an admin by checking the form data
        // Admin UPI ID pattern: testadmin@npci
        if (formData.upiID === 'testadmin@npci') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">U</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* UPI ID Field */}
            <div>
              <label htmlFor="upiID" className="block text-sm font-medium text-gray-700">
                UPI ID
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="upiID"
                  name="upiID"
                  type="text"
                  autoComplete="username"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.upiID ? 'border-danger-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your UPI ID"
                  value={formData.upiID}
                  onChange={handleChange}
                />
              </div>
              {errors.upiID && (
                <p className="mt-2 text-sm text-danger-600">{errors.upiID}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.password ? 'border-danger-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-danger-600">{errors.password}</p>
              )}
            </div>

            {/* Device ID Field */}
            <div>
              <label htmlFor="deviceID" className="block text-sm font-medium text-gray-700">
                Device ID
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMobile className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="deviceID"
                  name="deviceID"
                  type="text"
                  autoComplete="off"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.deviceID ? 'border-danger-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your device ID"
                  value={formData.deviceID}
                  onChange={handleChange}
                />
              </div>
              {errors.deviceID && (
                <p className="mt-2 text-sm text-danger-600">{errors.deviceID}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                This helps verify your device for secure transactions
              </p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="loading-spinner mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
              </div>
            </div>
            <div className="mt-4 bg-gray-50 rounded-md p-4">
              <p className="text-xs text-gray-600 mb-2">
                Use these credentials for testing:
              </p>
              <div className="space-y-3">
                {/* Admin Account */}
                <div className="border-l-4 border-yellow-400 pl-3">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">👑 Admin Account</p>
                  <div className="space-y-1 text-xs text-gray-700">
                    <p><strong>UPI ID:</strong> testadmin@npci</p>
                    <p><strong>Password:</strong> test123</p>
                    <p><strong>Device ID:</strong> test001</p>
                    <p className="text-xs text-gray-500">Balance: ₹700 | Access: Admin Panel</p>
                  </div>
                </div>
                
                {/* Regular User Account */}
                <div className="border-l-4 border-blue-400 pl-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">👤 Regular User</p>
                  <div className="space-y-1 text-xs text-gray-700">
                    <p><strong>UPI ID:</strong> testuser1@bank1</p>
                    <p><strong>Password:</strong> test123</p>
                    <p><strong>Device ID:</strong> test002</p>
                    <p className="text-xs text-gray-500">Balance: ₹5,100 | Access: User Dashboard</p>
                  </div>
                </div>
                
                {/* Test Transfer Account */}
                <div className="border-l-4 border-green-400 pl-3">
                  <p className="text-xs font-semibold text-green-700 mb-1">💸 Transfer Test</p>
                  <div className="space-y-1 text-xs text-gray-700">
                    <p><strong>UPI ID:</strong> testuser2@bank2</p>
                    <p><strong>Password:</strong> test123</p>
                    <p><strong>Device ID:</strong> test003</p>
                    <p className="text-xs text-gray-500">Balance: ₹4,200 | For: Money Transfers</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  💡 <strong>Tip:</strong> Try transferring ₹100 between accounts to test the system!
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  🛡️ <strong>Security:</strong> Try ₹4,500+ transfers to see fraud detection in action!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
