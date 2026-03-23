const express = require('express');
const { blockchainService } = require('../services/blockchainService');

const router = express.Router();

// Get account details
router.get('/profile', async (req, res) => {
  try {
    const upiID = req.user.upiID;
    const account = await blockchainService.getAccount(upiID);
    
    res.json({
      account: {
        upiID: account.upiID,
        accountNumber: account.accountNumber,
        bankCode: account.bankCode,
        balance: account.balance,
        isActive: account.isActive,
        createdAt: account.createdAt,
        lastTransaction: account.lastTransaction
      }
    });

  } catch (error) {
    console.error('Get account profile error:', error);
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get account balance
router.get('/balance', async (req, res) => {
  try {
    const upiID = req.user.upiID;
    const balance = await blockchainService.getAccountBalance(upiID);
    
    res.json({
      upiID,
      balance: parseFloat(balance.toFixed(2)),
      currency: 'INR',
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get account balance error:', error);
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get account transaction summary
router.get('/summary', async (req, res) => {
  try {
    const upiID = req.user.upiID;
    const account = await blockchainService.getAccount(upiID);
    const allTransactions = await blockchainService.getAllTransactions();

    // Filter transactions for this account
    const accountTransactions = allTransactions.filter(txn => 
      txn.fromUPIID === upiID || txn.toUPIID === upiID
    );

    // Calculate summary statistics
    const totalSent = accountTransactions
      .filter(txn => txn.fromUPIID === upiID && txn.status === 'COMPLETED')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const totalReceived = accountTransactions
      .filter(txn => txn.toUPIID === upiID && txn.status === 'COMPLETED')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const totalTransactions = accountTransactions.length;
    const successfulTransactions = accountTransactions.filter(txn => txn.status === 'COMPLETED').length;
    const failedTransactions = accountTransactions.filter(txn => txn.status === 'FRAUD_DETECTED').length;

    // Get recent activity (last 7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentTransactions = accountTransactions.filter(txn => new Date(txn.timestamp) > oneWeekAgo);

    res.json({
      account: {
        upiID: account.upiID,
        balance: account.balance,
        isActive: account.isActive,
        createdAt: account.createdAt,
        lastTransaction: account.lastTransaction
      },
      summary: {
        totalSent: totalSent.toFixed(2),
        totalReceived: totalReceived.toFixed(2),
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions * 100).toFixed(2) : 0,
        recentActivity: recentTransactions.length
      }
    });

  } catch (error) {
    console.error('Get account summary error:', error);
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if account exists
router.get('/exists/:upiID', async (req, res) => {
  try {
    const { upiID } = req.params;
    const exists = await blockchainService.accountExists(upiID);
    
    if (exists) {
      const account = await blockchainService.getAccount(upiID);
      res.json({
        exists: true,
        account: {
          upiID: account.upiID,
          bankCode: account.bankCode,
          isActive: account.isActive
        }
      });
    } else {
      res.json({
        exists: false,
        message: 'Account not found'
      });
    }

  } catch (error) {
    console.error('Check account exists error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
