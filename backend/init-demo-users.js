const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Demo users data
const demoUsers = [
  {
    upiID: 'testadmin@npci',
    password: 'test123',
    deviceID: 'test001',
    accountNumber: '1111111111',
    bankCode: 'NPCI',
    role: 'admin',
    balance: 700
  },
  {
    upiID: 'testuser1@bank1',
    password: 'test123',
    deviceID: 'test002',
    accountNumber: '2222222222',
    bankCode: 'BANK1',
    role: 'user',
    balance: 4100
  },
  {
    upiID: 'testuser2@bank2',
    password: 'test123',
    deviceID: 'test003',
    accountNumber: '3333333333',
    bankCode: 'BANK2',
    role: 'user',
    balance: 4200
  }
];

async function initializeDemoUsers() {
  console.log('Initializing demo users...');
  
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
      
      console.log(`Created user: ${userData.upiID} (${userData.role})`);
      
      // In a real application, you would save this to the user store
      // For now, we'll just log the user data
      console.log(`User data for ${userData.upiID}:`, {
        upiID: user.upiID,
        password: userData.password, // Original password for reference
        deviceID: user.deviceID,
        role: user.role
      });
      
    } catch (error) {
      console.error(`Error creating user ${userData.upiID}:`, error);
    }
  }
  
  console.log('\nDemo users initialization complete!');
  console.log('\nYou can now use these credentials to login:');
  console.log('1. Admin: testadmin@npci / test123 / test001');
  console.log('2. User 1: testuser1@bank1 / test123 / test002');
  console.log('3. User 2: testuser2@bank2 / test123 / test003');
}

// Run the initialization
initializeDemoUsers().catch(console.error);
