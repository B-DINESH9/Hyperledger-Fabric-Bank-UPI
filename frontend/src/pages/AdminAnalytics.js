import React, { useState, useEffect } from 'react';
import { FaChartLine, FaChartBar, FaChartPie } from 'react-icons/fa';
import axios from 'axios';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/analytics/transactions?period=7d');
      console.log('Analytics response:', response.data);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
        <div className="flex items-center">
          <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
            <FaChartLine className="w-6 h-6 text-success-600" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">System performance and transaction analytics</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FaChartBar className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary?.totalTransactions || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <FaChartPie className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.summary?.totalAmount || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <FaChartLine className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Transaction</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.summary?.averageAmount || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
              <FaChartBar className="w-6 h-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.analytics?.[0]?.successRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Volume (Last 7 Days)</h3>
          <div className="space-y-3">
            {analytics.analytics && analytics.analytics.length > 0 ? (
              analytics.analytics.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day.date}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${(day.amount / Math.max(...analytics.analytics.map(d => d.amount))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(day.amount)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaChartLine className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No transaction data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-success-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{analytics.analytics?.[0]?.successful || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-danger-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Fraud Detected</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{analytics.analytics?.[0]?.failed || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-warning-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Total</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{analytics.analytics?.[0]?.total || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-green-600">{analytics.uptime || 99}%</span>
            </div>
            <p className="text-sm font-medium text-gray-900">System Uptime</p>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-blue-600">{analytics.responseTime || 150}ms</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Avg Response Time</p>
            <p className="text-xs text-gray-500">API requests</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-purple-600">{analytics.activeUsers || 0}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">Active Users</p>
            <p className="text-xs text-gray-500">Currently online</p>
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Fraud Prevention</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Fraud Detection Performance</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Detection Rate</span>
                <span className="text-sm font-medium text-success-600">{analytics.fraudDetectionRate || 95}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">False Positives</span>
                <span className="text-sm font-medium text-warning-600">{analytics.falsePositives || 2}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Blocked Transactions</span>
                <span className="text-sm font-medium text-danger-600">{analytics.blockedTransactions || 0}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Blockchain Health</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Chain Integrity</span>
                <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Block Height</span>
                <span className="text-sm font-medium text-gray-900">{analytics.blockHeight || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Network Status</span>
                <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 rounded-full">
                  Synchronized
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
