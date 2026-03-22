# 🚀 Blockchain UPI - Quick Start Guide

## ⚡ One-Command Setup

### **For Any System (Linux, macOS, Windows)**

```bash
# 1. Clone or download the project
git clone <repository-url>
cd "Block Chain UPI"

# 2. Run the automated installer
./install.sh

# 3. Start the system
./quick-start.sh
```

### **That's it!** 🎉

Your Blockchain UPI system will be running at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5001

---

## 👥 Demo Accounts

### **👑 Admin Account**
- **UPI ID**: `testadmin@npci`
- **Password**: `test123`
- **Device ID**: `test001`
- **Balance**: ₹700

### **👤 Regular User**
- **UPI ID**: `testuser1@bank1`
- **Password**: `test123`
- **Device ID**: `test002`
- **Balance**: ₹5,100

### **💸 Transfer Test**
- **UPI ID**: `testuser2@bank2`
- **Password**: `test123`
- **Device ID**: `test003`
- **Balance**: ₹4,200

---

## 🔧 Available Commands

### **Start Commands**
```bash
./quick-start.sh    # Smart start (recommended)
./start-all.sh      # Start both services
./start-backend.sh  # Start backend only
./start-frontend.sh # Start frontend only
```

### **Test Commands**
```bash
./test-system.sh    # Test if everything works
```

### **Build Commands**
```bash
./build-production.sh  # Build for production
```

### **NPM Commands**
```bash
npm start           # Start both services
npm run quick       # Quick start
npm test           # Test system
npm run build      # Build for production
```

---

## 🧪 Testing Features

### **Test Money Transfers**
1. Login with `testuser1@bank1`
2. Send ₹100 to `testuser2@bank2`
3. Check both accounts for updated balances

### **Test Fraud Detection**
1. Login with `testuser1@bank1`
2. Try sending ₹4,500+ to any account
3. See fraud detection block the transaction

### **Test Admin Features**
1. Login with `testadmin@npci`
2. Access admin panel
3. View system analytics

---

## 🚨 Troubleshooting

### **If Node.js is not installed**
The installer will automatically install Node.js for you on Linux and macOS.

### **If installation fails**
```bash
# Clean and retry
npm run clean
./install.sh
```

### **If services don't start**
```bash
# Check if ports are available
lsof -i :3000
lsof -i :5001

# Kill processes if needed
kill -9 <PID>
```

### **If backend is not responding**
```bash
# Check backend logs
cd backend && npm start
```

---

## 📁 Project Structure

```
Block Chain UPI/
├── backend/           # Node.js backend
├── frontend/          # React frontend
├── install.sh         # Automated installer
├── quick-start.sh     # Smart start script
├── start-all.sh       # Start both services
├── test-system.sh     # System test
├── build-production.sh # Production build
└── README.md          # Main documentation
```

---

## 🌟 Features

- ✅ **Automated Installation** - One command setup
- ✅ **Cross-Platform** - Works on Linux, macOS, Windows
- ✅ **Smart Start** - Automatically detects and starts services
- ✅ **Demo Accounts** - Ready-to-use test accounts
- ✅ **Fraud Detection** - AI-powered security
- ✅ **Real-time Updates** - Live transaction monitoring
- ✅ **Admin Panel** - Comprehensive analytics
- ✅ **Responsive UI** - Mobile-friendly interface

---

**🎉 Ready to use! Just run `./install.sh` and then `./quick-start.sh`!**
