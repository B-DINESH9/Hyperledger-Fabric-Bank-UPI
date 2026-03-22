import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaHistory, FaArrowUp, FaArrowDown, FaSearch, FaFilter } from 'react-icons/fa';
import axios from 'axios';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/transactions/history/user');
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.transactionID.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.fromUPIID.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.toUPIID.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' ||
                         (filter === 'sent' && transaction.fromUPIID === user?.upiID) ||
                         (filter === 'received' && transaction.toUPIID === user?.upiID) ||
                         (filter === 'completed' && transaction.status === 'COMPLETED') ||
                         (filter === 'fraud' && transaction.status === 'FRAUD_DETECTED');

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
          <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
            <FaHistory className="w-6 h-6 text-success-600" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600">View all your UPI transactions</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="sent">Sent</option>
              <option value="received">Received</option>
              <option value="completed">Completed</option>
              <option value="fraud">Fraud Detected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <FaHistory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No transactions found</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || filter !== 'all' ? 'Try adjusting your search or filter' : 'Start by making your first transaction'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.transactionID}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
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
                      <p className="text-xs text-gray-400">
                        ID: {transaction.transactionID}
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
                
                {transaction.fraudDetected && (
                  <div className="mt-3 p-3 bg-danger-50 border border-danger-200 rounded-md">
                    <p className="text-sm text-danger-800">
                      <strong>Fraud Alert:</strong> {transaction.fraudReason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
