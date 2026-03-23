const express = require('express');
const { blockchainService } = require('../services/blockchainService');

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get all transactions (admin view)
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, fraudDetected } = req.query;
    const allTransactions = await blockchainService.getAllTransactions();

    // Filter transactions based on query parameters
    let filteredTransactions = allTransactions;

    if (status) {
      filteredTransactions = filteredTransactions.filter(txn => txn.status === status);
    }

    if (fraudDetected !== undefined) {
      const fraudBool = fraudDetected === 'true';
      filteredTransactions = filteredTransactions.filter(txn => txn.fraudDetected === fraudBool);
    }

    // Sort by timestamp (newest first)
    filteredTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    res.json({
      transactions: paginatedTransactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredTransactions.length / limit),
        totalTransactions: filteredTransactions.length,
        hasNextPage: endIndex < filteredTransactions.length,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get fraud alerts
router.get('/fraud-alerts', async (req, res) => {
  try {
    const { status, severity } = req.query;
    const allAlerts = await blockchainService.getFraudAlerts();

    // Filter alerts based on query parameters
    let filteredAlerts = allAlerts;

    if (status) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }

    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }

    // Sort by timestamp (newest first)
    filteredAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      alerts: filteredAlerts,
      total: filteredAlerts.length,
      activeAlerts: filteredAlerts.filter(alert => alert.status === 'ACTIVE').length
    });

  } catch (error) {
    console.error('Get fraud alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get admin dashboard overview
router.get('/dashboard', async (req, res) => {
  try {
    const allTransactions = await blockchainService.getAllTransactions();
    const allAlerts = await blockchainService.getFraudAlerts();
    const allAccounts = await blockchainService.getAllAccounts();

    // Calculate dashboard statistics
    const totalTransactions = allTransactions.length;
    const successfulTransactions = allTransactions.filter(txn => txn.status === 'COMPLETED').length;
    const failedTransactions = allTransactions.filter(txn => txn.status === 'FAILED').length;
    const fraudDetected = allTransactions.filter(txn => txn.fraudDetected).length;
    
    const totalAmount = allTransactions
      .filter(txn => txn.status === 'COMPLETED')
      .reduce((sum, txn) => sum + txn.amount, 0);
    
    const fraudAmount = allTransactions
      .filter(txn => txn.fraudDetected)
      .reduce((sum, txn) => sum + txn.amount, 0);

    const activeAlerts = allAlerts.filter(alert => alert.status === 'ACTIVE').length;
    const highSeverityAlerts = allAlerts.filter(alert => alert.severity === 'HIGH').length;

    res.json({
      dashboard: {
        overview: {
          totalAccounts: allAccounts.length,
          totalTransactions,
          successfulTransactions,
          failedTransactions,
          fraudDetected,
          totalAmount: totalAmount.toFixed(2),
          fraudAmount: fraudAmount.toFixed(2),
          successRate: totalTransactions > 0 ? ((successfulTransactions / totalTransactions) * 100).toFixed(1) : 0,
          activeAlerts,
          highSeverityAlerts
        },
        recentActivity: {
          transactions24h: allTransactions.filter(txn => 
            new Date(txn.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ).length,
          alerts24h: allAlerts.filter(alert => 
            new Date(alert.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ).length
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system statistics
router.get('/stats/system', async (req, res) => {
  try {
    const allTransactions = await blockchainService.getAllTransactions();
    const allAlerts = await blockchainService.getFraudAlerts();

    // Calculate system statistics
    const totalTransactions = allTransactions.length;
    const successfulTransactions = allTransactions.filter(txn => txn.status === 'COMPLETED').length;
    const failedTransactions = allTransactions.filter(txn => txn.status === 'FRAUD_DETECTED').length;
    const pendingTransactions = allTransactions.filter(txn => txn.status === 'PENDING').length;

    const totalAmount = allTransactions
      .filter(txn => txn.status === 'COMPLETED')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const fraudAmount = allTransactions
      .filter(txn => txn.fraudDetected)
      .reduce((sum, txn) => sum + txn.amount, 0);

    const activeAlerts = allAlerts.filter(alert => alert.status === 'ACTIVE').length;
    const highSeverityAlerts = allAlerts.filter(alert => alert.severity === 'HIGH').length;

    // Calculate success rate
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions * 100).toFixed(2) : 0;

    // Get recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTransactions = allTransactions.filter(txn => new Date(txn.timestamp) > oneDayAgo);
    const recentAlerts = allAlerts.filter(alert => new Date(alert.timestamp) > oneDayAgo);

    res.json({
      systemStats: {
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        pendingTransactions,
        totalAmount: totalAmount.toFixed(2),
        fraudAmount: fraudAmount.toFixed(2),
        successRate: parseFloat(successRate),
        activeAlerts,
        highSeverityAlerts
      },
      recentActivity: {
        transactions24h: recentTransactions.length,
        alerts24h: recentAlerts.length
      }
    });

  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction analytics
router.get('/analytics/transactions', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    const allTransactions = await blockchainService.getAllTransactions();

    // Calculate period in days
    const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Filter transactions for the period
    const periodTransactions = allTransactions.filter(txn => new Date(txn.timestamp) > startDate);

    // Group by date
    const dailyStats = {};
    periodTransactions.forEach(txn => {
      const date = new Date(txn.timestamp).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          total: 0,
          successful: 0,
          failed: 0,
          amount: 0
        };
      }
      dailyStats[date].total++;
      dailyStats[date].amount += txn.amount;
      if (txn.status === 'COMPLETED') {
        dailyStats[date].successful++;
      } else if (txn.status === 'FRAUD_DETECTED') {
        dailyStats[date].failed++;
      }
    });

    // Convert to array format for charts
    const analyticsData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      total: stats.total,
      successful: stats.successful,
      failed: stats.failed,
      amount: parseFloat(stats.amount.toFixed(2)),
      successRate: stats.total > 0 ? (stats.successful / stats.total * 100).toFixed(2) : 0
    }));

    res.json({
      period,
      analytics: analyticsData,
      summary: {
        totalTransactions: periodTransactions.length,
        totalAmount: periodTransactions.reduce((sum, txn) => sum + txn.amount, 0).toFixed(2),
        averageAmount: periodTransactions.length > 0 ? 
          (periodTransactions.reduce((sum, txn) => sum + txn.amount, 0) / periodTransactions.length).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Get transaction analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify blockchain integrity
router.get('/verify-integrity', async (req, res) => {
  try {
    const result = await blockchainService.verifyChainIntegrity();
    
    res.json({
      integrity: result[0],
      message: result[1],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Verify integrity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get account details (admin view)
router.get('/accounts/:upiID', async (req, res) => {
  try {
    const { upiID } = req.params;
    const account = await blockchainService.getAccount(upiID);
    
    // Get account's transaction history
    const allTransactions = await blockchainService.getAllTransactions();
    const accountTransactions = allTransactions.filter(txn => 
      txn.fromUPIID === upiID || txn.toUPIID === upiID
    );

    // Calculate account statistics
    const totalSent = accountTransactions
      .filter(txn => txn.fromUPIID === upiID && txn.status === 'COMPLETED')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const totalReceived = accountTransactions
      .filter(txn => txn.toUPIID === upiID && txn.status === 'COMPLETED')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const fraudAttempts = accountTransactions.filter(txn => txn.fraudDetected).length;

    res.json({
      account,
      statistics: {
        totalSent: totalSent.toFixed(2),
        totalReceived: totalReceived.toFixed(2),
        totalTransactions: accountTransactions.length,
        fraudAttempts
      },
      recentTransactions: accountTransactions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)
    });

  } catch (error) {
    console.error('Get account details error:', error);
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update account status
router.put('/accounts/:upiID/status', async (req, res) => {
  try {
    const { upiID } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }

    await blockchainService.updateAccountStatus(upiID, isActive);

    res.json({
      message: `Account ${isActive ? 'activated' : 'deactivated'} successfully`,
      upiID,
      isActive
    });

  } catch (error) {
    console.error('Update account status error:', error);
    if (error.message.includes('does not exist')) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system health
router.get('/health', async (req, res) => {
  try {
    // Check blockchain connection
    const integrityResult = await blockchainService.verifyChainIntegrity();
    
    // Get basic system stats
    const allTransactions = await blockchainService.getAllTransactions();
    const allAlerts = await blockchainService.getFraudAlerts();

    const healthStatus = {
      blockchain: {
        connected: true,
        integrity: integrityResult[0],
        message: integrityResult[1]
      },
      system: {
        totalTransactions: allTransactions.length,
        activeAlerts: allAlerts.filter(alert => alert.status === 'ACTIVE').length,
        uptime: process.uptime()
      },
      timestamp: new Date().toISOString()
    };

    res.json(healthStatus);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      blockchain: {
        connected: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
