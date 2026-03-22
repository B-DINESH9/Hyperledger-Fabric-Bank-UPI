const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { blockchainService } = require('../services/blockchainService');

const router = express.Router();

// In-memory user store (in production, use a database)
const users = new Map();

// Initialize demo users
const initializeDemoUsers = async () => {
  const demoUsers = [
    {
      upiID: 'testadmin@npci',
      password: 'test123',
      deviceID: 'test001',
      accountNumber: '1111111111',
      bankCode: 'NPCI',
      role: 'admin'
    },
    {
      upiID: 'testuser1@bank1',
      password: 'test123',
      deviceID: 'test002',
      accountNumber: '2222222222',
      bankCode: 'BANK1',
      role: 'user'
    },
    {
      upiID: 'testuser2@bank2',
      password: 'test123',
      deviceID: 'test003',
      accountNumber: '3333333333',
      bankCode: 'BANK2',
      role: 'user'
    }
  ];

  for (const userData of demoUsers) {
    try {
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // Create user object
      const user = {
        id: uuidv4(),
        upiID: userData.upiID,
        accountNumber: userData.accountNumber,
        bankCode: userData.bankCode,
        password: hashedPassword,
        deviceID: userData.deviceID,
        role: userData.role,
        createdAt: new Date(),
        isActive: true
      };
      
      // Store user in memory
      users.set(userData.upiID, user);
      console.log(`Demo user initialized: ${userData.upiID} (${userData.role})`);
    } catch (error) {
      console.error(`Error initializing demo user ${userData.upiID}:`, error);
    }
  }
};

// Initialize demo users when the module loads
initializeDemoUsers();

// Register new user
router.post('/register', [
  body('upiID').isLength({ min: 3 }).withMessage('UPI ID must be at least 3 characters'),
  body('accountNumber').isLength({ min: 10 }).withMessage('Account number must be at least 10 characters'),
  body('bankCode').isLength({ min: 3 }).withMessage('Bank code must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('deviceID').notEmpty().withMessage('Device ID is required'),
  body('initialBalance').isFloat({ min: 0 }).withMessage('Initial balance must be a positive number')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { upiID, accountNumber, bankCode, password, deviceID, initialBalance } = req.body;

    // Check if user already exists
    if (users.has(upiID)) {
      return res.status(400).json({ error: 'User with this UPI ID already exists' });
    }

    // Check if account exists on blockchain
    const accountExists = await blockchainService.accountExists(upiID);
    if (accountExists) {
      return res.status(400).json({ error: 'Account with this UPI ID already exists on blockchain' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const user = {
      id: uuidv4(),
      upiID,
      accountNumber,
      bankCode,
      password: hashedPassword,
      deviceID,
      role: 'user',
      createdAt: new Date(),
      isActive: true
    };

    // Store user in memory
    users.set(upiID, user);

    // Create account on blockchain
    await blockchainService.createAccount(upiID, accountNumber, bankCode, deviceID, initialBalance);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, upiID: user.upiID, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        upiID: user.upiID,
        accountNumber: user.accountNumber,
        bankCode: user.bankCode,
        role: user.role,
        deviceID: user.deviceID
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', [
  body('upiID').notEmpty().withMessage('UPI ID is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('deviceID').notEmpty().withMessage('Device ID is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { upiID, password, deviceID } = req.body;

    // Check if user exists
    const user = users.get(upiID);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify device ID
    if (user.deviceID !== deviceID) {
      return res.status(401).json({ error: 'Device verification failed' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, upiID: user.upiID, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        upiID: user.upiID,
        accountNumber: user.accountNumber,
        bankCode: user.bankCode,
        role: user.role,
        deviceID: user.deviceID
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = users.get(decoded.upiID);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get account details from blockchain
    const account = await blockchainService.getAccount(decoded.upiID);

    res.json({
      user: {
        id: user.id,
        upiID: user.upiID,
        accountNumber: user.accountNumber,
        bankCode: user.bankCode,
        role: user.role,
        deviceID: user.deviceID,
        balance: account.balance,
        isActive: account.isActive
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = users.get(decoded.upiID);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    users.set(decoded.upiID, user);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Temporary endpoint to set admin role (for demo purposes)
router.post('/set-admin', (req, res) => {
  try {
    const { upiID } = req.body;
    const user = users.get(upiID);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.role = 'admin';
    users.set(upiID, user);
    
    res.json({ message: 'User role updated to admin', user: { upiID: user.upiID, role: user.role } });
  } catch (error) {
    console.error('Set admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
