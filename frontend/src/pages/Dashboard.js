import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  FaSync, FaMoneyBillWave, FaPaperPlane, FaUserAlt, 
  FaArrowUp, FaArrowDown, FaCheckCircle, FaTimesCircle, FaClock
} from 'react-icons/fa';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      await refreshUser();
      
      // Fetch stats and recent history concurrently
      const [statsRes, historyRes] = await Promise.all([
        axios.get('/api/transactions/stats/user').catch(() => ({ data: { stats: null } })),
        axios.get('/api/transactions/history/recent').catch(() => ({ data: { transactions: [] } }))
      ]);

      if (statsRes.data.stats) setStats(statsRes.data.stats);
      if (historyRes.data.transactions) setRecentTransactions(historyRes.data.transactions);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.upiID}! 👋</h1>
          <p className="text-gray-500 mt-1 text-sm">Here is your financial overview for today.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="mt-4 md:mt-0 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50 font-medium text-sm shadow-sm"
        >
          <FaSync className={`w-4 h-4 ${loading ? 'animate-spin text-primary-600' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* TOP SECTION: Balance & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Current Balance Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
            <FaMoneyBillWave className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <p className="text-primary-100 font-medium mb-1">Available Balance</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
              ₹{(user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
            
            <div className="flex flex-wrap gap-4">
              <Link
                to="/transfer"
                className="inline-flex items-center space-x-2 bg-white text-primary-700 px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
              >
                <FaPaperPlane />
                <span>Send Money</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Snapshot Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <FaUserAlt className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Profile Details</h3>
          </div>
          
          <div className="space-y-4 flex-grow">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">UPI ID</p>
              <p className="font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{user?.upiID}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Account Number</p>
              <p className="font-mono text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{user?.accountNumber || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Bank</p>
                <p className="font-semibold text-gray-800 text-sm">{user?.bankCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Status</p>
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span> Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: Transaction States & Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500">Total Sent</p>
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <FaArrowUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{stats.totalSent.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500">Total Received</p>
              <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                <FaArrowDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{stats.totalReceived.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500">Successful Txns</p>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <FaCheckCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.successfulTransactions}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500">Fraud Blocked</p>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                <FaTimesCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.failedTransactions}</p>
          </div>
        </div>
      )}

      {/* BOTTOM SECTION: Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaClock className="text-gray-400" /> Recent Transactions
          </h3>
          <Link to="/transactions" className="text-sm font-semibold text-primary-600 hover:text-primary-800 transition-colors">
            View All History &rarr;
          </Link>
        </div>
        
        <div className="divide-y divide-gray-100">
          {loading && recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading history...
            </div>
          ) : recentTransactions.length > 0 ? (
            recentTransactions.map((txn) => {
              const isSender = txn.fromUPIID === user?.upiID;
              const isFraud = txn.status === 'FRAUD_DETECTED';
              
              return (
                <div key={txn.transactionID} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                      isFraud ? 'bg-red-100 text-red-600' : 
                      (isSender ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600')
                    }`}>
                      {isSender ? <FaArrowUp /> : <FaArrowDown />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {isSender ? `To: ${txn.toUPIID}` : `From: ${txn.fromUPIID}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-medium">
                          {format(new Date(txn.timestamp), 'MMM dd, yyyy • hh:mm a')}
                        </span>
                        {isFraud && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">ATTEMPT BLOCKED</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      isFraud ? 'text-gray-400 line-through' : (isSender ? 'text-gray-900' : 'text-green-600')
                    }`}>
                      {isSender ? '-' : '+'}₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs font-mono text-gray-400 group-hover:text-gray-500 mt-1 transition-colors">
                      {txn.transactionID.substring(0, 12)}...
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center text-gray-400">
              <FaMoneyBillWave className="w-12 h-12 mx-auto text-gray-200 mb-3" />
              <p className="font-medium text-gray-600">No recent transactions found.</p>
              <p className="text-sm mt-1">Your transfer history will appear here.</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
