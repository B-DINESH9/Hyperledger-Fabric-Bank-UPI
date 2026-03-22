import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaMobile, FaLock, FaUser, FaCreditCard, FaBuilding } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    upiID: '',
    accountNumber: '',
    bankCode: '',
    password: '',
    confirmPassword: '',
    deviceID: '',
    initialBalance: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
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
    } else if (formData.upiID.length < 3) {
      newErrors.upiID = 'UPI ID must be at least 3 characters';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (formData.accountNumber.length < 10) {
      newErrors.accountNumber = 'Account number must be at least 10 characters';
    }

    if (!formData.bankCode.trim()) {
      newErrors.bankCode = 'Bank code is required';
    } else if (formData.bankCode.length < 3) {
      newErrors.bankCode = 'Bank code must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.deviceID.trim()) {
      newErrors.deviceID = 'Device ID is required';
    }

    if (!formData.initialBalance) {
      newErrors.initialBalance = 'Initial balance is required';
    } else if (parseFloat(formData.initialBalance) < 0) {
      newErrors.initialBalance = 'Initial balance must be positive';
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
      const result = await register({
        upiID: formData.upiID,
        accountNumber: formData.accountNumber,
        bankCode: formData.bankCode,
        password: formData.password,
        deviceID: formData.deviceID,
        initialBalance: parseFloat(formData.initialBalance)
      });
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            sign in to your existing account
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

            {/* Account Number Field */}
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
                Account Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="accountNumber"
                  name="accountNumber"
                  type="text"
                  autoComplete="off"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.accountNumber ? 'border-danger-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your account number"
                  value={formData.accountNumber}
                  onChange={handleChange}
                />
              </div>
              {errors.accountNumber && (
                <p className="mt-2 text-sm text-danger-600">{errors.accountNumber}</p>
              )}
            </div>

            {/* Bank Code Field */}
            <div>
              <label htmlFor="bankCode" className="block text-sm font-medium text-gray-700">
                Bank Code
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBuilding className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="bankCode"
                  name="bankCode"
                  type="text"
                  autoComplete="off"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.bankCode ? 'border-danger-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your bank code"
                  value={formData.bankCode}
                  onChange={handleChange}
                />
              </div>
              {errors.bankCode && (
                <p className="mt-2 text-sm text-danger-600">{errors.bankCode}</p>
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
                  autoComplete="new-password"
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.confirmPassword ? 'border-danger-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-danger-600">{errors.confirmPassword}</p>
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

            {/* Initial Balance Field */}
            <div>
              <label htmlFor="initialBalance" className="block text-sm font-medium text-gray-700">
                Initial Balance (INR)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">₹</span>
                </div>
                <input
                  id="initialBalance"
                  name="initialBalance"
                  type="number"
                  step="0.01"
                  min="0"
                  autoComplete="off"
                  required
                  className={`appearance-none block w-full pl-8 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.initialBalance ? 'border-danger-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter initial balance"
                  value={formData.initialBalance}
                  onChange={handleChange}
                />
              </div>
              {errors.initialBalance && (
                <p className="mt-2 text-sm text-danger-600">{errors.initialBalance}</p>
              )}
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
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Demo Account Info */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Account</span>
              </div>
            </div>
            <div className="mt-4 bg-gray-50 rounded-md p-4">
              <p className="text-xs text-gray-600 mb-2">
                You can use these values for testing:
              </p>
              <div className="space-y-1 text-xs">
                <p><strong>UPI ID:</strong> user@bank1</p>
                <p><strong>Account Number:</strong> 1234567890</p>
                <p><strong>Bank Code:</strong> BANK1</p>
                <p><strong>Device ID:</strong> device001</p>
                <p><strong>Initial Balance:</strong> 10000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
