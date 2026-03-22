import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaExchangeAlt, FaUser, FaMobile, FaRupeeSign, FaCheck, FaTimes, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Transfer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    toUPIID: '',
    amount: '',
    description: '',
    deviceID: user?.deviceID || ''
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [errors, setErrors] = useState({});
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear recipient info when UPI ID changes
    if (name === 'toUPIID') {
      setRecipientInfo(null);
    }
  };

  const validateUPI = async () => {
    if (!formData.toUPIID.trim()) {
      setErrors(prev => ({ ...prev, toUPIID: 'UPI ID is required' }));
      return;
    }

    setValidating(true);
    try {
      const response = await axios.post('/api/transactions/validate-upi', {
        upiID: formData.toUPIID
      });
      
      if (response.data.valid) {
        setRecipientInfo(response.data.account);
        toast.success('UPI ID validated successfully!');
      } else {
        setErrors(prev => ({ ...prev, toUPIID: 'Invalid UPI ID' }));
        setRecipientInfo(null);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, toUPIID: 'Failed to validate UPI ID' }));
      setRecipientInfo(null);
    } finally {
      setValidating(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.toUPIID.trim()) {
      newErrors.toUPIID = 'Recipient UPI ID is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > 100000) {
      newErrors.amount = 'Amount cannot exceed ₹1,00,000';
    }

    if (!formData.deviceID || !formData.deviceID.trim()) {
      newErrors.deviceID = 'Device ID is required. Please log in again.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!recipientInfo) {
      toast.error('Please validate the recipient UPI ID first');
      return;
    }

    // Step 1: Initiate to get MFA challenge
    setLoading(true);
    try {
      const resp = await axios.post('/api/transactions/transfer/initiate', {
        toUPIID: formData.toUPIID,
        amount: parseFloat(formData.amount),
        deviceID: formData.deviceID
      });
      setChallenge(resp.data.challenge);
      toast.success('Security check required. Please answer the challenge.');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to initiate transfer';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!challenge?.challengeID) {
      toast.error('No active challenge. Please initiate again.');
      return;
    }
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }
    setVerifying(true);
    try {
      const resp = await axios.post('/api/transactions/transfer/verify', {
        toUPIID: formData.toUPIID,
        amount: parseFloat(formData.amount),
        deviceID: formData.deviceID,
        challengeID: challenge.challengeID,
        answer: answer.trim()
      });
      toast.success('Transfer completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      const data = error.response?.data;
      const message = data?.error || 'Verification failed';
      toast.error(message);
      if (data?.code === 'WRONG_ANSWER' && typeof data?.attemptsLeft === 'number') {
        toast.error(`Incorrect answer. Attempts left: ${data.attemptsLeft}`);
      }
      if (data?.code === 'EXPIRED' || data?.code === 'NOT_FOUND' || data?.code === 'CONTEXT_MISMATCH') {
        setChallenge(null);
        setAnswer('');
      }
    } finally {
      setVerifying(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <FaExchangeAlt className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">Send Money</h1>
            <p className="text-gray-600">Transfer money to any UPI ID securely</p>
          </div>
        </div>
      </div>

      {/* Transfer Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient UPI ID */}
          <div>
            <label htmlFor="toUPIID" className="block text-sm font-medium text-gray-700">
              Recipient UPI ID
            </label>
            <div className="mt-1 flex space-x-2">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="toUPIID"
                  name="toUPIID"
                  type="text"
                  required
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.toUPIID ? 'border-danger-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter recipient UPI ID"
                  value={formData.toUPIID}
                  onChange={handleChange}
                />
              </div>
              <button
                type="button"
                onClick={validateUPI}
                disabled={validating || !formData.toUPIID.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validating ? 'Validating...' : 'Validate'}
              </button>
            </div>
            {errors.toUPIID && (
              <p className="mt-2 text-sm text-danger-600">{errors.toUPIID}</p>
            )}
          </div>

          {/* Recipient Info */}
          {recipientInfo && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <div className="flex items-center">
                <FaCheck className="w-5 h-5 text-success-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-success-800">
                    Recipient verified: {recipientInfo.upiID}
                  </p>
                  <p className="text-xs text-success-600">
                    Bank: {recipientInfo.bankCode} | Status: {recipientInfo.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (INR)
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaRupeeSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="1"
                max="100000"
                required
                className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.amount ? 'border-danger-300' : 'border-gray-300'
                }`}
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
            {errors.amount && (
              <p className="mt-2 text-sm text-danger-600">{errors.amount}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Maximum transfer limit: ₹1,00,000
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaRupeeSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="description"
                name="description"
                type="text"
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter transfer description (optional)"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Optional description for the transfer
            </p>
          </div>

          {/* Device ID */}
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
                required
                className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.deviceID ? 'border-danger-300' : 'border-gray-300'
                }`}
                placeholder="Device ID from your session"
                value={formData.deviceID}
                onChange={handleChange}
              />
            </div>
            {errors.deviceID && (
              <p className="mt-2 text-sm text-danger-600">{errors.deviceID}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Device ID from your login session. You can edit if needed.
            </p>
          </div>

          {/* Transfer Summary */}
          {formData.amount && recipientInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Transfer Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">From:</span>
                  <span className="font-medium">{user?.upiID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium">{formData.toUPIID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-primary-600">
                    {formatCurrency(parseFloat(formData.amount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-medium">{recipientInfo.bankCode}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!challenge && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Initiating...' : 'Continue'}
            </button>
          )}

          {/* Challenge Section */}
          {challenge && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center">
                <FaShieldAlt className="w-5 h-5 text-primary-600 mr-2" />
                <p className="text-sm font-medium text-primary-800">Security Challenge</p>
              </div>
              <p className="text-gray-800 text-sm">{challenge.question}</p>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your answer"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={verifying}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? 'Verifying...' : 'Verify & Pay'}
                </button>
                <button
                  type="button"
                  onClick={() => { setChallenge(null); setAnswer(''); }}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-gray-500">This confirms you recognize the transaction details. Challenge expires in 2 minutes.</p>
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading || !recipientInfo || !formData.amount || !formData.deviceID}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="loading-spinner mr-2"></div>
                  Processing Transfer...
                </div>
              ) : (
                'Send Money'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <FaCheck className="w-6 h-6 text-blue-600 mt-1 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Security Features</h3>
            <ul className="text-blue-700 mt-2 space-y-1 text-sm">
              <li>• Blockchain-verified transactions</li>
              <li>• Real-time fraud detection</li>
              <li>• Device verification</li>
              <li>• Immutable transaction records</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;
