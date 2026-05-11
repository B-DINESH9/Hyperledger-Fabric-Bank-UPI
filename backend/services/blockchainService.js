const fs = require('fs');
const path = require('path');

class BlockchainService {
  constructor() {
    this.isConnected = false;
    this.mockData = {
      accounts: new Map(),
      transactions: [],
      fraudAlerts: []
    };
  }

  async initialize() {
    try {
      // Simulate blockchain connection
      console.log('Initializing mock blockchain service...');
      
      // Load mock data if exists
      const mockDataPath = path.join(__dirname, '../data/mock-data.json');
      if (fs.existsSync(mockDataPath)) {
        const data = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));
        // Convert accounts array back to Map
        this.mockData.accounts = new Map(data.accounts || []);
        this.mockData.transactions = data.transactions || [];
        this.mockData.fraudAlerts = data.fraudAlerts || [];
      }
      
      this.isConnected = true;
      console.log('Mock blockchain service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  async createAccount(upiID, accountNumber, bankCode, deviceID, initialBalance) {
    try {
      const account = {
        upiID,
        accountNumber,
        bankCode,
        balance: parseFloat(initialBalance),
        createdAt: new Date().toISOString(),
        lastTransaction: new Date().toISOString(),
        deviceID,
        isActive: true
      };
      
      this.mockData.accounts.set(upiID, account);
      this.saveMockData();
      
      return account;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  async transfer(fromUPIID, toUPIID, amount, deviceID, ipAddress) {
    try {
      const fromAccount = this.mockData.accounts.get(fromUPIID);
      const toAccount = this.mockData.accounts.get(toUPIID);
      
      if (!fromAccount || !toAccount) {
        throw new Error('Account not found');
      }
      
      if (fromAccount.balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      if (fromAccount.deviceID !== deviceID) {
        throw new Error('Device verification failed');
      }
      
      // Check for fraud (re-enabled for testing)
      const fraudDetected = this.detectFraud(fromUPIID, amount);
      
      const transaction = {
        transactionID: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromUPIID,
        toUPIID,
        amount: parseFloat(amount),
        timestamp: new Date().toISOString(),
        status: fraudDetected ? 'FRAUD_DETECTED' : 'COMPLETED',
        deviceID,
        ipAddress,
        fraudDetected,
        fraudReason: fraudDetected ? 'Suspicious transaction pattern detected' : null
      };
      
      if (!fraudDetected) {
        // Update balances
        fromAccount.balance -= amount;
        fromAccount.lastTransaction = new Date().toISOString();
        toAccount.balance += amount;
        toAccount.lastTransaction = new Date().toISOString();
        
        this.mockData.accounts.set(fromUPIID, fromAccount);
        this.mockData.accounts.set(toUPIID, toAccount);
      }
      
      this.mockData.transactions.push(transaction);
      
      // Create fraud alert if fraud was detected
      if (fraudDetected) {
        const fraudAlert = {
          alertID: `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          transactionID: transaction.transactionID,
          fromUPIID,
          toUPIID,
          amount: parseFloat(amount),
          timestamp: new Date().toISOString(),
          status: 'ACTIVE',
          severity: 'HIGH',
          reason: 'Suspicious transaction pattern detected',
          deviceID,
          ipAddress
        };
        
        this.mockData.fraudAlerts.push(fraudAlert);
      }
      
      this.saveMockData();
      
      return transaction;
    } catch (error) {
      console.error('Error performing transfer:', error);
      throw error;
    }
  }

  async getAccount(upiID) {
    try {
      const account = this.mockData.accounts.get(upiID);
      if (!account) {
        throw new Error(`Account ${upiID} does not exist`);
      }
      return account;
    } catch (error) {
      console.error('Error getting account:', error);
      throw error;
    }
  }

  async getAccountBalance(upiID) {
    try {
      const account = this.mockData.accounts.get(upiID);
      if (!account) {
        throw new Error(`Account ${upiID} does not exist`);
      }
      return account.balance;
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }

  async getTransaction(transactionID) {
    try {
      const transaction = this.mockData.transactions.find(t => t.transactionID === transactionID);
      if (!transaction) {
        throw new Error(`Transaction ${transactionID} does not exist`);
      }
      return transaction;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  async getAllTransactions() {
    try {
      return this.mockData.transactions;
    } catch (error) {
      console.error('Error getting all transactions:', error);
      throw error;
    }
  }

  async getFraudAlerts() {
    try {
      return this.mockData.fraudAlerts;
    } catch (error) {
      console.error('Error getting fraud alerts:', error);
      throw error;
    }
  }

  async verifyChainIntegrity() {
    try {
      return [true, 'Chain integrity verified'];
    } catch (error) {
      console.error('Error verifying chain integrity:', error);
      throw error;
    }
  }

  async updateAccountStatus(upiID, isActive) {
    try {
      const account = this.mockData.accounts.get(upiID);
      if (!account) {
        throw new Error(`Account ${upiID} does not exist`);
      }
      
      account.isActive = isActive;
      this.mockData.accounts.set(upiID, account);
      this.saveMockData();
      
      return account;
    } catch (error) {
      console.error('Error updating account status:', error);
      throw error;
    }
  }

  async accountExists(upiID) {
    try {
      return this.mockData.accounts.has(upiID);
    } catch (error) {
      console.error('Error checking account existence:', error);
      throw error;
    }
  }

  async getAllAccounts() {
    try {
      return Array.from(this.mockData.accounts.values());
    } catch (error) {
      console.error('Error getting all accounts:', error);
      throw error;
    }
  }

  detectFraud(upiID, amount) {
    // Simple fraud detection logic
    const account = this.mockData.accounts.get(upiID);
    if (!account) return false;
    
    // Check for extremely high amount
    if (amount > 1000000) {
      return true;
    }
    
    return false;
  }

  saveMockData() {
    try {
      const dataDir = path.join(__dirname, '../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const mockDataPath = path.join(dataDir, 'mock-data.json');
      const dataToSave = {
        accounts: Array.from(this.mockData.accounts.entries()),
        transactions: this.mockData.transactions,
        fraudAlerts: this.mockData.fraudAlerts
      };
      
      fs.writeFileSync(mockDataPath, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.error('Error saving mock data:', error);
    }
  }

  disconnect() {
    this.isConnected = false;
    console.log('Mock blockchain service disconnected');
  }
}

// Singleton instance
const blockchainService = new BlockchainService();

// Initialize function
async function initializeBlockchain() {
  await blockchainService.initialize();
}

module.exports = {
  blockchainService,
  initializeBlockchain
};
