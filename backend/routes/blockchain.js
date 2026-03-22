const express = require('express');
const { blockchainService } = require('../services/blockchainService');

const router = express.Router();

// Get blockchain status
router.get('/status', async (req, res) => {
  try {
    const integrityResult = await blockchainService.verifyChainIntegrity();
    
    res.json({
      status: 'connected',
      integrity: integrityResult[0],
      message: integrityResult[1],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get blockchain status error:', error);
    res.status(500).json({
      status: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all transactions from blockchain
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await blockchainService.getAllTransactions();
    
    res.json({
      transactions,
      total: transactions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get blockchain transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get fraud alerts from blockchain
router.get('/fraud-alerts', async (req, res) => {
  try {
    const alerts = await blockchainService.getFraudAlerts();
    
    res.json({
      alerts,
      total: alerts.length,
      activeAlerts: alerts.filter(alert => alert.status === 'ACTIVE').length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get fraud alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify chain integrity
router.get('/verify', async (req, res) => {
  try {
    const result = await blockchainService.verifyChainIntegrity();
    
    res.json({
      verified: result[0],
      message: result[1],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Verify chain integrity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
