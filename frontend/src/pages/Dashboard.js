import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaExchangeAlt, 
  FaHistory, 
  FaUser, 
  FaWallet, 
  FaShieldAlt,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaBell, // eslint-disable-line no-unused-vars
  FaSync
} from 'react-icons/fa';
import axios from 'axios';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [accountData, setAccountData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Refresh user data first
      await refreshUser();
      
      // Fetch account data
      const accountResponse = await axios.get('/api/auth/profile');
      setAccountData(accountResponse.data.user);
      
      // Fetch recent transactions
      const transactionsResponse = await axios.get('/api/transactions/history/recent');
      setRecentTransactions(transactionsResponse.data.transactions);
      
      // Fetch transaction stats
      const statsResponse = await axios.get('/api/transactions/stats/user');
      setStats(statsResponse.data.stats);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.upiID}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your account today
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
            >
              <FaSync className="w-4 h-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-sm text-gray-500">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/transfer"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FaExchangeAlt className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Send Money</h3>
              <p className="text-gray-600">Transfer to any UPI ID</p>
            </div>
          </div>
        </Link>

        <Link
          to="/transactions"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <FaHistory className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
              <p className="text-gray-600">View all transactions</p>
            </div>
          </div>
        </Link>

        <Link
          to="/profile"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <FaUser className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
              <p className="text-gray-600">Manage your account</p>
            </div>
          </div>
        </Link>

        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
                <FaShieldAlt className="w-6 h-6 text-danger-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
                <p className="text-gray-600">System management</p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Balance</h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {formatCurrency(accountData?.balance || user?.balance || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FaWallet className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Account Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                (accountData?.isActive !== undefined ? accountData.isActive : user?.isActive) 
                  ? 'bg-success-100 text-success-800' 
                  : 'bg-danger-100 text-danger-800'
              }`}>
                {(accountData?.isActive !== undefined ? accountData.isActive : user?.isActive) ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaArrowUp className="w-4 h-4 text-success-600 mr-2" />
                <span className="text-gray-600">Total Sent</span>
              </div>
              <span className="font-semibold text-gray-900">
                {formatCurrency(stats.totalSent || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaArrowDown className="w-4 h-4 text-primary-600 mr-2" />
                <span className="text-gray-600">Total Received</span>
              </div>
              <span className="font-semibold text-gray-900">
                {formatCurrency(stats.totalReceived || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaChartLine className="w-4 h-4 text-warning-600 mr-2" />
                <span className="text-gray-600">Success Rate</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.successRate || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-semibold text-gray-900">
                {stats.totalTransactions || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Successful</span>
              <span className="font-semibold text-success-600">
                {stats.successfulTransactions || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Failed</span>
              <span className="font-semibold text-danger-600">
                {stats.failedTransactions || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <Link
            to="/transactions"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <FaHistory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-1">Start by sending money to someone</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.transactionID}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.fromUPIID === user?.upiID
                      ? 'bg-danger-100 text-danger-600'
                      : 'bg-success-100 text-success-600'
                  }`}>
                    {transaction.fromUPIID === user?.upiID ? (
                      <FaArrowUp className="w-4 h-4" />
                    ) : (
                      <FaArrowDown className="w-4 h-4" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">
                      {transaction.fromUPIID === user?.upiID
                        ? `Sent to ${transaction.toUPIID}`
                        : `Received from ${transaction.fromUPIID}`
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.fromUPIID === user?.upiID
                      ? 'text-danger-600'
                      : 'text-success-600'
                  }`}>
                    {transaction.fromUPIID === user?.upiID ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    transaction.status === 'COMPLETED'
                      ? 'bg-success-100 text-success-800'
                      : transaction.status === 'FRAUD_DETECTED'
                      ? 'bg-danger-100 text-danger-800'
                      : 'bg-warning-100 text-warning-800'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <FaShieldAlt className="w-6 h-6 text-blue-600 mt-1 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Security Notice</h3>
            <p className="text-blue-700 mt-1">
              Your transactions are protected by blockchain technology with fraud detection. 
              Never share your UPI ID or device ID with anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
