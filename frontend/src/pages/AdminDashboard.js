import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaChartLine, FaExclamationTriangle, FaUsers, FaMoneyBillWave, FaUser } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState({
    systemStats: {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      totalAmount: "0.00",
      fraudAmount: "0.00",
      successRate: 0,
      activeAlerts: 0,
      highSeverityAlerts: 0
    },
    recentActivity: {
      transactions24h: 0,
      alerts24h: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
    console.log('Admin Dashboard - User data:', user);
    console.log('Admin Dashboard - User balance:', user?.balance);
    console.log('Admin Dashboard - User status:', user?.isActive);
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/stats/system');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const result = await refreshUser();
      if (result.success) {
        console.log('User data refreshed successfully');
      } else {
        console.error('Failed to refresh user data:', result.error);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
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
            <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
              <FaShieldAlt className="w-6 h-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">System overview and management</p>
            </div>
          </div>
          
          {/* Admin Account Info */}
          <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <FaUser className="w-4 h-4 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-primary-900">{user?.upiID}</p>
                  <p className="text-lg font-bold text-primary-700">{formatCurrency(user?.balance || 0)}</p>
                  <p className="text-xs text-primary-600">
                    Admin Account Balance • Status: {user?.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <button
                onClick={refreshUserData}
                className="ml-4 px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/transactions"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FaMoneyBillWave className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
              <p className="text-gray-600">View and manage transactions</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/fraud-alerts"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
              <FaExclamationTriangle className="w-6 h-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Fraud Alerts</h3>
              <p className="text-gray-600">Monitor fraud detection</p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/analytics"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <FaChartLine className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
              <p className="text-gray-600">System performance metrics</p>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <FaUsers className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <p className="text-gray-600">Manage user accounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-semibold text-gray-900">{stats.systemStats?.totalTransactions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Successful</span>
              <span className="font-semibold text-success-600">{stats.systemStats?.successfulTransactions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Failed</span>
              <span className="font-semibold text-danger-600">{stats.systemStats?.failedTransactions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-semibold text-primary-600">{stats.systemStats?.successRate || 0}%</span>
            </div>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Volume</span>
              <span className="font-semibold text-gray-900">{formatCurrency(stats.systemStats?.totalAmount || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Fraud Amount</span>
              <span className="font-semibold text-danger-600">{formatCurrency(stats.systemStats?.fraudAmount || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Today's Transactions</span>
              <span className="font-semibold text-success-600">{stats.recentActivity?.transactions24h || 0}</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Alerts</span>
              <span className="font-semibold text-danger-600">{stats.systemStats?.activeAlerts || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">High Severity Alerts</span>
              <span className="font-semibold text-danger-600">{stats.systemStats?.highSeverityAlerts || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">System Status</span>
              <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-green-800">System running normally</p>
              <p className="text-xs text-green-600">All services operational</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-blue-800">Fraud detection active</p>
              <p className="text-xs text-blue-600">Monitoring transactions in real-time</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-purple-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-purple-800">Blockchain sync</p>
              <p className="text-xs text-purple-600">All nodes synchronized</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
