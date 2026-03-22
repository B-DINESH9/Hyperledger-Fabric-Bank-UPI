const express = require('express');
const { body, validationResult } = require('express-validator');
const { blockchainService } = require('../services/blockchainService');
const { createChallenge, verifyChallenge } = require('../services/mfaService');
const winston = require('winston');

const router = express.Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'blockchain-upi-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: winston.format.simple() }));
}

function sanitizeBody(body = {}) {
  const clone = { ...body };
  const sensitive = ['password', 'newPassword', 'currentPassword', 'token'];
  for (const k of sensitive) if (k in clone) clone[k] = '[REDACTED]';
  return clone;
}

// Initiate transfer - Step 1: create MFA challenge
router.post('/transfer/initiate', [
  body('toUPIID').notEmpty().withMessage('Recipient UPI ID is required'),
  body('amount').isFloat({ min: 1, max: 100000 }).withMessage('Amount must be between 1 and 100000'),
  body('deviceID').notEmpty().withMessage('Device ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Initiate validation failed', { path: req.originalUrl, method: req.method, errors: errors.array(), body: sanitizeBody(req.body), user: req.user?.upiID });
      return res.status(400).json({ errors: errors.array() });
    }

    const { toUPIID, amount, deviceID } = req.body;
    const fromUPIID = req.user.upiID;
    const ipAddress = req.ip || req.connection.remoteAddress;

    logger.info('Initiate transfer requested', { fromUPIID, toUPIID, amount: Number(amount), deviceID, ipAddress });

    // Basic checks
    const recipientExists = await blockchainService.accountExists(toUPIID);
    if (!recipientExists) {
      logger.warn('Recipient does not exist', { toUPIID });
      return res.status(400).json({ error: 'Recipient account does not exist' });
    }
    if (fromUPIID === toUPIID) {
      logger.warn('Self-transfer attempt blocked', { upiID: fromUPIID });
      return res.status(400).json({ error: 'Cannot transfer to your own account' });
    }

    // Generate context-aware MFA challenge
    const challenge = await createChallenge({ fromUPIID, toUPIID, amount, deviceID, ipAddress });
    logger.info('MFA challenge created', { challengeID: challenge.challengeID, type: challenge.type, n: challenge.n, expiresAt: challenge.expiresAt, fromUPIID, toUPIID });

    return res.json({
      message: 'MFA challenge created',
      challenge
    });
  } catch (error) {
    logger.error('Initiate transfer error', { message: error.message, stack: error.stack, body: sanitizeBody(req.body), user: req.user?.upiID });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify transfer - Step 2: verify MFA and execute transfer
router.post('/transfer/verify', [
  body('toUPIID').notEmpty().withMessage('Recipient UPI ID is required'),
  body('amount').isFloat({ min: 1, max: 100000 }).withMessage('Amount must be between 1 and 100000'),
  body('deviceID').notEmpty().withMessage('Device ID is required'),
  body('challengeID').notEmpty().withMessage('Challenge ID is required'),
  body('answer').notEmpty().withMessage('Challenge answer is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Verify validation failed', { path: req.originalUrl, method: req.method, errors: errors.array(), body: sanitizeBody(req.body), user: req.user?.upiID });
      return res.status(400).json({ errors: errors.array() });
    }

    const { toUPIID, amount, deviceID, challengeID, answer } = req.body;
    const fromUPIID = req.user.upiID;
    const ipAddress = req.ip || req.connection.remoteAddress;

    logger.info('Verify transfer requested', { fromUPIID, toUPIID, amount: Number(amount), deviceID, challengeID, ipAddress });

    // Validate recipient again to ensure no tampering between steps
    const recipientExists = await blockchainService.accountExists(toUPIID);
    if (!recipientExists) {
      logger.warn('Recipient does not exist at verify', { toUPIID });
      return res.status(400).json({ error: 'Recipient account does not exist' });
    }
    if (fromUPIID === toUPIID) {
      logger.warn('Self-transfer attempt at verify', { upiID: fromUPIID });
      return res.status(400).json({ error: 'Cannot transfer to your own account' });
    }

    // Verify MFA challenge bound to the context
    const result = verifyChallenge({
      challengeID,
      answer,
      context: { fromUPIID, toUPIID, amount, deviceID, ipAddress }
    });

    if (!result.ok) {
      logger.warn('MFA verification failed', { challengeID, code: result.code, message: result.message, attemptsLeft: result.attemptsLeft, fromUPIID, toUPIID });
      const status = (result.code === 'NOT_FOUND' || result.code === 'EXPIRED' || result.code === 'CONTEXT_MISMATCH') ? 410 : 400;
      return res.status(status).json({ error: result.message, code: result.code, attemptsLeft: result.attemptsLeft });
    }

    // Perform transfer after successful MFA
    const transaction = await blockchainService.transfer(fromUPIID, toUPIID, amount, deviceID, ipAddress);
    logger.info('Transfer executed', { transactionID: transaction.transactionID, status: transaction.status, fraudDetected: transaction.fraudDetected, fromUPIID, toUPIID, amount: Number(amount) });

    if (transaction.fraudDetected) {
      logger.warn('Transaction blocked due to fraud detection', { transactionID: transaction.transactionID, reason: transaction.fraudReason });
      return res.status(400).json({
        error: 'Transaction blocked due to fraud detection',
        fraudReason: transaction.fraudReason,
        transactionID: transaction.transactionID
      });
    }

    return res.json({
      message: 'Transfer completed successfully',
      transaction: {
        transactionID: transaction.transactionID,
        fromUPIID: transaction.fromUPIID,
        toUPIID: transaction.toUPIID,
        amount: transaction.amount,
        status: transaction.status,
        timestamp: transaction.timestamp
      }
    });
  } catch (error) {
    logger.error('Verify transfer error', { message: error.message, stack: error.stack, body: sanitizeBody(req.body), user: req.user?.upiID });
    if ((error.message || '').toLowerCase().includes('insufficient balance')) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    if ((error.message || '').toLowerCase().includes('device verification failed')) {
      return res.status(400).json({ error: 'Device verification failed' });
    }
    if ((error.message || '').toLowerCase().includes('fraud detected')) {
      return res.status(400).json({ error: 'Transaction blocked due to fraud detection', details: error.message });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Perform UPI transfer (legacy direct transfer)
router.post('/transfer', [
  body('toUPIID').notEmpty().withMessage('Recipient UPI ID is required'),
  body('amount').isFloat({ min: 1, max: 100000 }).withMessage('Amount must be between 1 and 100000'),
  body('deviceID').notEmpty().withMessage('Device ID is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { toUPIID, amount, deviceID } = req.body;
    const fromUPIID = req.user.upiID;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Check if recipient account exists
    const recipientExists = await blockchainService.accountExists(toUPIID);
    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient account does not exist' });
    }

    // Check if sender and recipient are the same
    if (fromUPIID === toUPIID) {
      return res.status(400).json({ error: 'Cannot transfer to your own account' });
    }

    // Perform transfer
    const transaction = await blockchainService.transfer(fromUPIID, toUPIID, amount, deviceID, ipAddress);

    // Check if fraud was detected
    if (transaction.fraudDetected) {
      return res.status(400).json({
        error: 'Transaction blocked due to fraud detection',
        fraudReason: transaction.fraudReason,
        transactionID: transaction.transactionID
      });
    }

    res.json({
      message: 'Transfer completed successfully',
      transaction: {
        transactionID: transaction.transactionID,
        fromUPIID: transaction.fromUPIID,
        toUPIID: transaction.toUPIID,
        amount: transaction.amount,
        status: transaction.status,
        timestamp: transaction.timestamp
      }
    });

  } catch (error) {
    console.error('Transfer error:', error);
    
    // Handle specific blockchain errors
    if (error.message.includes('insufficient balance')) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    if (error.message.includes('device verification failed')) {
      return res.status(400).json({ error: 'Device verification failed' });
    }
    if (error.message.includes('fraud detected')) {
      return res.status(400).json({ 
        error: 'Transaction blocked due to fraud detection',
        details: error.message
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction by ID
router.get('/:transactionID', async (req, res) => {
  try {
    const { transactionID } = req.params;
    const transaction = await blockchainService.getTransaction(transactionID);

    // Check if user has permission to view this transaction
    if (transaction.fromUPIID !== req.user.upiID && transaction.toUPIID !== req.user.upiID) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ transaction });

  } catch (error) {
    console.error('Get transaction error:', error);
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's transaction history
router.get('/history/user', async (req, res) => {
  try {
    const upiID = req.user.upiID;
    const allTransactions = await blockchainService.getAllTransactions();

    // Filter transactions for the current user
    const userTransactions = allTransactions.filter(txn => 
      txn.fromUPIID === upiID || txn.toUPIID === upiID
    );

    // Sort by timestamp (newest first)
    userTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      transactions: userTransactions,
      total: userTransactions.length
    });

  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent transactions (last 10)
router.get('/history/recent', async (req, res) => {
  try {
    const upiID = req.user.upiID;
    const allTransactions = await blockchainService.getAllTransactions();

    // Filter transactions for the current user
    const userTransactions = allTransactions.filter(txn => 
      txn.fromUPIID === upiID || txn.toUPIID === upiID
    );

    // Sort by timestamp and get last 10
    userTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentTransactions = userTransactions.slice(0, 10);

    res.json({
      transactions: recentTransactions,
      total: recentTransactions.length
    });

  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction statistics
router.get('/stats/user', async (req, res) => {
  try {
    const upiID = req.user.upiID;
    const allTransactions = await blockchainService.getAllTransactions();

    // Filter transactions for the current user
    const userTransactions = allTransactions.filter(txn => 
      txn.fromUPIID === upiID || txn.toUPIID === upiID
    );

    // Calculate statistics
    const totalSent = userTransactions
      .filter(txn => txn.fromUPIID === upiID && txn.status === 'COMPLETED')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const totalReceived = userTransactions
      .filter(txn => txn.toUPIID === upiID && txn.status === 'COMPLETED')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const totalTransactions = userTransactions.length;
    const successfulTransactions = userTransactions.filter(txn => txn.status === 'COMPLETED').length;
    const failedTransactions = userTransactions.filter(txn => txn.status === 'FRAUD_DETECTED').length;

    res.json({
      stats: {
        totalSent,
        totalReceived,
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate UPI ID
router.post('/validate-upi', [
  body('upiID').notEmpty().withMessage('UPI ID is required')
  // .matches(/^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+$/).withMessage('Invalid UPI ID format') // optional stricter validation
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation error on /validate-upi', {
        requestId: res.locals.requestId,
        errors: errors.array(),
        body: sanitizeBody(req.body)
      });
      return res.status(400).json({ errors: errors.array(), requestId: res.locals.requestId });
    }

    const { upiID } = req.body;
    logger.info('Validate UPI requested', {
      requestId: res.locals.requestId,
      upiID
    });

    const exists = await blockchainService.accountExists(upiID);
    logger.info('Account existence checked', {
      requestId: res.locals.requestId,
      upiID,
      exists
    });

    if (exists) {
      const account = await blockchainService.getAccount(upiID);
      logger.info('Account details fetched', {
        requestId: res.locals.requestId,
        upiID,
        isActive: account?.isActive,
        bankCode: account?.bankCode
      });
      return res.json({
        valid: true,
        account: {
          upiID: account.upiID,
          bankCode: account.bankCode,
          isActive: account.isActive
        },
        requestId: res.locals.requestId
      });
    } else {
      logger.warn('UPI ID not found', {
        requestId: res.locals.requestId,
        upiID
      });
      return res.json({
        valid: false,
        message: 'UPI ID not found',
        requestId: res.locals.requestId
      });
    }

  } catch (error) {
    logger.error('Validate UPI error', {
      requestId: res.locals.requestId,
      body: sanitizeBody(req.body),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack
      }
    });
    return next(error);
  }
});

module.exports = router;
