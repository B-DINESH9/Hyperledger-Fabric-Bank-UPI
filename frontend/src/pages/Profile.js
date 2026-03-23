import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaWallet, FaShieldAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa'; // eslint-disable-line no-unused-vars
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth(); // eslint-disable-line no-unused-vars
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    deviceID: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/accounts/profile');
      setAccountData(response.data.account);
      setFormData({ deviceID: response.data.account.deviceID });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put('/api/auth/profile', formData);
      setAccountData(prev => ({ ...prev, deviceID: formData.deviceID }));
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <FaUser className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">Manage your account settings</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-danger-600 text-white rounded-md hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-500"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">UPI ID</label>
              <p className="mt-1 text-sm text-gray-900 font-medium">{accountData?.upiID}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Number</label>
              <p className="mt-1 text-sm text-gray-900">{accountData?.accountNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Code</label>
              <p className="mt-1 text-sm text-gray-900">{accountData?.bankCode}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Status</label>
              <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                accountData?.isActive 
                  ? 'bg-success-100 text-success-800' 
                  : 'bg-danger-100 text-danger-800'
              }`}>
                {accountData?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Balance and Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance & Activity</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Balance</label>
              <p className="mt-1 text-2xl font-bold text-primary-600">
                {formatCurrency(accountData?.balance || 0)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Created</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(accountData?.createdAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Transaction</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(accountData?.lastTransaction)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Device Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Device Settings</h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <FaEdit className="w-4 h-4 mr-1" />
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center px-3 py-1 text-sm bg-success-600 text-white rounded-md hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500"
              >
                <FaSave className="w-4 h-4 mr-1" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({ deviceID: accountData.deviceID });
                }}
                className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <FaTimes className="w-4 h-4 mr-1" />
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Device ID</label>
          {editing ? (
            <input
              type="text"
              name="deviceID"
              value={formData.deviceID}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter device ID"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900">{accountData?.deviceID}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This device ID is used for transaction verification and security
          </p>
        </div>
      </div>

      {/* Security Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <FaShieldAlt className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Security Information</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-green-800">Blockchain Protection</p>
              <p className="text-xs text-green-600">All transactions are secured by blockchain technology</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-blue-800">Fraud Detection</p>
              <p className="text-xs text-blue-600">Real-time fraud detection and prevention</p>
            </div>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-purple-800">Device Verification</p>
              <p className="text-xs text-purple-600">Device ID verification for secure transactions</p>
            </div>
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
