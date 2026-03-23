import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const DebugAuth = () => {
  const { user, token, login, logout, forceReset, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResult, setTestResult] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    updateDebugInfo();
  }, [user, token]);

  const updateDebugInfo = () => {
    const info = {
      isAuthenticated,
      hasUser: !!user,
      hasToken: !!token,
      localStorageToken: localStorage.getItem('token'),
      axiosHeaders: axios.defaults.headers.common['Authorization'],
      userInfo: user ? {
        upiID: user.upiID,
        role: user.role,
        id: user.id
      } : null
    };
    setDebugInfo(info);
  };

  const testTransfer = async () => {
    try {
      setTestResult('Testing transfer...');
      const response = await axios.post('/api/transactions/transfer', {
        toUPIID: 'user@bank2',
        amount: 10,
        deviceID: 'device001'
      });
      setTestResult(`✅ Transfer successful: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setTestResult(`❌ Transfer failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      setTestResult('Testing login...');
      const result = await login({
        upiID: 'user@bank1',
        password: 'password123',
        deviceID: 'device001'
      });
      if (result.success) {
        setTestResult('✅ Login successful');
        updateDebugInfo();
      } else {
        setTestResult(`❌ Login failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Login error: ${error.message}`);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    setTestResult('🗑️ LocalStorage cleared');
    updateDebugInfo();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Debug Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Is Authenticated:</span>
                <span className={debugInfo.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.isAuthenticated ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Has User:</span>
                <span className={debugInfo.hasUser ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.hasUser ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Has Token:</span>
                <span className={debugInfo.hasToken ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.hasToken ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>LocalStorage Token:</span>
                <span className={debugInfo.localStorageToken ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.localStorageToken ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Axios Headers:</span>
                <span className={debugInfo.axiosHeaders ? 'text-green-600' : 'text-red-600'}>
                  {debugInfo.axiosHeaders ? '✅ Set' : '❌ Not Set'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">User Information</h2>
            {debugInfo.userInfo ? (
              <div className="space-y-2 text-sm">
                <div><strong>UPI ID:</strong> {debugInfo.userInfo.upiID}</div>
                <div><strong>Role:</strong> {debugInfo.userInfo.role}</div>
                <div><strong>ID:</strong> {debugInfo.userInfo.id}</div>
              </div>
            ) : (
              <div className="text-red-600">No user information</div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Test Login
            </button>
            <button
              onClick={testTransfer}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Test Transfer
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
            <button
              onClick={clearStorage}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Clear Storage
            </button>
            <button
              onClick={forceReset}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Force Reset
            </button>
            <button
              onClick={updateDebugInfo}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Refresh Debug Info
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Test Results</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="text-sm whitespace-pre-wrap">{testResult || 'No test results yet'}</pre>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Raw Debug Data</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="text-xs whitespace-pre-wrap overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;
