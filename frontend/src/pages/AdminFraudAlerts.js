import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaSearch, FaFilter } from 'react-icons/fa';
import axios from 'axios';

const AdminFraudAlerts = () => {
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchFraudAlerts();
  }, []);

  const fetchFraudAlerts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching fraud alerts...');
      const response = await axios.get('/api/admin/fraud-alerts');
      console.log('🔍 Fraud alerts response:', response.data);
      setFraudAlerts(response.data.alerts || []);
      console.log('🔍 Set fraud alerts:', response.data.alerts || []);
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      setFraudAlerts([]);
    } finally {
      setLoading(false);
    }
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

  const filteredAlerts = (fraudAlerts || []).filter(alert => {
    if (!alert) return false;
    
    const matchesSearch = (alert.transactionID || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (alert.fromUPIID || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (alert.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' ||
                         (filter === 'high' && alert.severity === 'HIGH') ||
                         (filter === 'medium' && alert.severity === 'MEDIUM') ||
                         (filter === 'low' && alert.severity === 'LOW');

    return matchesSearch && matchesFilter;
  });

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
          <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
            <FaExclamationTriangle className="w-6 h-6 text-danger-600" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Fraud Alerts</h1>
            <p className="text-gray-600">Monitor and manage fraud detection alerts</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search fraud alerts..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fraud Alerts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <FaExclamationTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No fraud alerts found</p>
            <p className="text-sm text-gray-500 mt-1">System is running securely</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.alertID}
                className="border border-red-200 rounded-lg p-4 bg-red-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <FaExclamationTriangle className="w-5 h-5 text-red-600 mr-2" />
                      <h3 className="text-lg font-semibold text-red-800">
                        Fraud Alert - {alert.severity} Severity
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Transaction ID:</p>
                        <p className="font-medium text-gray-900">{alert.transactionID}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">From UPI ID:</p>
                        <p className="font-medium text-gray-900">{alert.fromUPIID}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">To UPI ID:</p>
                        <p className="font-medium text-gray-900">{alert.toUPIID}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Amount:</p>
                        <p className="font-medium text-gray-900">₹{alert.amount}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-gray-600">Reason:</p>
                      <p className="text-red-800 font-medium">{alert.reason}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-600">Detected:</p>
                      <p className="text-gray-900">{formatDate(alert.timestamp)}</p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      alert.severity === 'HIGH'
                        ? 'bg-red-100 text-red-800'
                        : alert.severity === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFraudAlerts;
