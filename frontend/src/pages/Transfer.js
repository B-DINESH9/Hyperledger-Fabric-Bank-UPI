import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { FaArrowRight, FaCheckCircle, FaLock, FaShieldAlt, FaMagic, FaTimesCircle } from 'react-icons/fa';

const getDeviceID = () => {
  let id = localStorage.getItem('deviceID');
  if (!id) {
    id = 'device-' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('deviceID', id);
  }
  return id;
};

const Transfer = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Transfer State
  const [step, setStep] = useState(1);
  const [toUPIID, setToUPIID] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Recipient Verification State
  const [verifyingUser, setVerifyingUser] = useState(false);
  const [recipientValid, setRecipientValid] = useState(null); // null, true, or false

  // MFA State
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState('');

  // Result State
  const [transaction, setTransaction] = useState(null);

  const verifyRecipient = async (e) => {
    e.preventDefault();
    if (!toUPIID) {
      toast.error('Please enter a UPI ID first.');
      return;
    }
    
    try {
      setVerifyingUser(true);
      const response = await axios.post('/api/transactions/validate-upi', { upiID: toUPIID });
      if (response.data.valid) {
        setRecipientValid(true);
        toast.success('UPI ID Validated & Trusted!');
      } else {
        setRecipientValid(false);
        toast.error('UPI ID not found or may be fraudulent.');
      }
    } catch (error) {
      console.error(error);
      setRecipientValid(false);
      toast.error('Recipient is invalid or flagged.');
    } finally {
      setVerifyingUser(false);
    }
  };

  const handleInitiate = async (e) => {
    e.preventDefault();
    if (!recipientValid) {
      toast.error('Please verify the recipient first.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    try {
      setLoading(true);
      const deviceID = user?.deviceID || getDeviceID();
      const response = await axios.post('/api/transactions/transfer/initiate', {
        toUPIID,
        amount: Number(amount),
        deviceID
      });

      setChallenge(response.data.challenge);
      setStep(2);
      toast.success('Security Challenge Generated');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || error.message || 'Failed to initiate transfer.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!answer) {
      toast.error('Please enter the verification answer.');
      return;
    }

    try {
      setLoading(true);
      const deviceID = user?.deviceID || getDeviceID();
      const response = await axios.post('/api/transactions/transfer/verify', {
        toUPIID,
        amount: Number(amount),
        deviceID,
        challengeID: challenge.challengeID,
        answer
      });

      setTransaction(response.data.transaction);
      setStep(3);
      refreshUser(); // Refresh balance
      toast.success('Transfer successful!');
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.error || 'Verification failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Test Mode Auto-Solver for the complex dynamic authentication questions!
  const autoSolve = () => {
    let ans = '';
    if (!challenge) return;
    
    if (challenge.type === 'AMOUNT_DIGIT_SUM') {
      const digits = String(amount).split('.')[0].replace(/\D/g, '');
      ans = String(digits.split('').reduce((s, d) => s + parseInt(d, 10), 0));
    } else if (challenge.type === 'RECIPIENT_NAME_PREFIX') {
      const name = toUPIID.split('@')[0].replace(/[^a-zA-Z]/g, '');
      ans = name.substring(0, challenge.n).toLowerCase();
    } else if (challenge.type === 'UPI_ID_LAST_DIGITS') {
      const digits = toUPIID.replace(/\D/g, '');
      ans = digits.slice(-challenge.n);
      if (!ans) { // edge case fallback if no digits in UPI
        const amoDigits = String(amount).split('.')[0].replace(/\D/g, '');
        ans = String(amoDigits.split('').reduce((s, d) => s + parseInt(d, 10), 0));
      }
    }
    
    setAnswer(ans);
    toast.success('Code Automatically Calculated!');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fadeIn mt-10">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 px-6 py-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4 shadow-lg ring-4 ring-white/10">
            <FaShieldAlt className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Secure Multi-Step Transfer</h1>
          <p className="text-primary-100 mt-2 text-sm opacity-90">Blockchain Verified Authentication</p>
        </div>

        <div className="p-6 md:p-8">
          
          {/* Step Indicators */}
          <div className="flex items-center justify-center mb-8 relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -z-10"></div>
            <div className="flex justify-between w-full max-w-xs">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-colors ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-colors ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-colors ${step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
            </div>
          </div>

          {/* Step 1: Input Details with Recipient Verification */}
          {step === 1 && (
            <form onSubmit={handleInitiate} className="space-y-6">
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Step 1: Verify Recipient</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 transition-colors outline-none"
                    placeholder="Recipient UPI ID (e.g. user@bank)"
                    value={toUPIID}
                    onChange={(e) => {
                      setToUPIID(e.target.value);
                      setRecipientValid(null); // Reset when typing
                    }}
                    disabled={loading || verifyingUser}
                  />
                  <button
                    type="button"
                    onClick={verifyRecipient}
                    disabled={verifyingUser || !toUPIID || recipientValid}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      recipientValid ? 'bg-green-500 text-white' : 'bg-gray-800 text-white hover:bg-gray-900'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {verifyingUser ? 'Checking...' : (recipientValid ? 'Verified' : 'Verify')}
                  </button>
                </div>
                
                {/* Validation Status */}
                {recipientValid === false && (
                  <div className="mt-3 flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
                    <FaTimesCircle className="mr-2" /> Warning: Recipient invalid or flagged for fraud.
                  </div>
                )}
                {recipientValid === true && (
                  <div className="mt-3 flex items-center text-sm text-green-600 bg-green-50 p-2 rounded">
                    <FaCheckCircle className="mr-2" /> Trust Status: Safe & Verified
                  </div>
                )}
              </div>
              
              <div className={`transition-opacity duration-300 ${recipientValid ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Step 2: Transfer Amount</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-bold">₹</span>
                  <input
                    type="number"
                    required={recipientValid}
                    min="1"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 transition-colors"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <p className="mt-3 text-sm text-gray-500 text-right">
                  Available Balance: <span className="font-semibold text-gray-900">₹{user?.balance || '0.00'}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !recipientValid}
                className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-primary-700 hover:shadow-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Preparing Challenge...' : 'Proceed to Authentication'}</span>
                {!loading && <FaArrowRight />}
              </button>
            </form>
          )}

          {/* Step 2: MFA Verification */}
          {step === 2 && challenge && (
            <form onSubmit={handleVerify} className="space-y-6 text-center animate-fadeIn">
              <h2 className="text-xl font-bold text-gray-900">Authentication Challenge</h2>
              <p className="text-gray-500 text-sm">
                Transferring <strong className="text-gray-900">₹{amount}</strong> to <strong className="text-gray-900">{toUPIID}</strong>.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10">
                  <FaLock className="w-24 h-24 text-amber-500" />
                </div>
                <p className="text-sm font-bold text-amber-800 mb-3 text-left">
                  Answer the security question to continue:
                </p>
                
                {/* The dynamic Question from backend */}
                <div className="bg-white px-4 py-3 rounded-lg border border-amber-200 shadow-sm mb-4">
                  <p className="font-medium text-gray-800">{challenge.question}</p>
                </div>

                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full px-4 py-3 text-center text-lg font-bold rounded-lg border-2 border-amber-300 focus:ring-none focus:border-amber-500 transition-colors outline-none"
                  placeholder="Enter your answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                
                {/* EASY MODE AUTO-SOLVER BUTTON */}
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={autoSolve}
                    className="inline-flex items-center gap-2 text-sm text-primary-600 font-semibold hover:text-primary-800 bg-primary-50 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <FaMagic className="text-yellow-500" /> Auto-Solve (Easy Mode)
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !answer}
                  className="flex-1 bg-amber-500 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Authenticate & Transfer'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success Screen */}
          {step === 3 && transaction && (
            <div className="text-center space-y-6 animate-fadeIn">
              <div className="mx-auto w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <FaCheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Transfer Successful!</h2>
              
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden text-left shadow-sm">
                <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</span>
                  <span className="font-mono text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded shadow-sm">
                    {transaction.transactionID.substring(0, 18)}...
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Sent to</span>
                    <span className="text-sm font-medium text-gray-900">{transaction.toUPIID}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-sm font-bold text-gray-900">₹{transaction.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => {
                    setToUPIID('');
                    setAmount('');
                    setAnswer('');
                    setChallenge(null);
                    setTransaction(null);
                    setRecipientValid(null);
                    setStep(1);
                  }}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 shadow-md transition-colors"
                >
                  New Transfer
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Transfer;