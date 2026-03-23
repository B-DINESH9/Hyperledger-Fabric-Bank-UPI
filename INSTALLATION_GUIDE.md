# 📦 Blockchain UPI System - Complete Installation Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Installation](#detailed-installation)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Deployment](#deployment)

---

## 🔧 Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 2GB free space

### Software Installation

#### 1. Node.js Installation
```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Or use package manager:

# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# macOS (using Homebrew)
brew install node

# Windows
# Download installer from https://nodejs.org/
```

#### 2. Git Installation
```bash
# Check if Git is installed
git --version

# If not installed:

# Ubuntu/Debian
sudo apt install git

# macOS
brew install git

# Windows
# Download from https://git-scm.com/
```

---

## 🚀 Quick Start

### Automated Installation (Recommended)

#### Step 1: Clone Repository
```bash
# Clone the repository
git clone <repository-url>
cd "Block Chain UPI"

# Or download and extract the ZIP file
```

#### Step 2: Run Automated Installer
```bash
# Make installer executable
chmod +x install.sh

# Run automated installation
./install.sh
```

#### Step 3: Start the System
```bash
# Quick start (recommended)
./quick-start.sh

# Or start manually
./start-all.sh
```

#### Step 4: Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Admin Panel**: http://localhost:3000/admin

---

## 📋 Detailed Installation

### Manual Installation Process

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Backend Environment Configuration (.env)**
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Database Configuration (if using external database)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blockchain_upi
DB_USER=username
DB_PASSWORD=password

# Blockchain Configuration
BLOCKCHAIN_NETWORK=testnet
BLOCKCHAIN_CONTRACT_ADDRESS=your-contract-address

# Security Configuration
BCRYPT_SALT_ROUNDS=10
SESSION_SECRET=your-session-secret

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

#### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Frontend Environment Configuration (.env)**
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5001
REACT_APP_SOCKET_URL=http://localhost:5001

# Application Configuration
REACT_APP_NAME=Blockchain UPI System
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_DEBUG_MODE=false

# External Services
REACT_APP_GOOGLE_ANALYTICS_ID=your-ga-id
REACT_APP_SENTRY_DSN=your-sentry-dsn
```

#### 3. Blockchain Network Setup

```bash
# Navigate to blockchain directory (if exists)
cd blockchain-network

# Install blockchain dependencies
npm install

# Start blockchain network
./startNetwork.sh

# Deploy smart contracts
./deployChaincode.sh
```

---

## ⚙️ Configuration

### 1. Database Configuration

#### SQLite (Default - No Setup Required)
The system uses SQLite by default, which requires no additional setup.

#### PostgreSQL (Optional)
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb blockchain_upi

# Create user
sudo -u postgres createuser --interactive

# Update backend .env file
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blockchain_upi
DB_USER=your_username
DB_PASSWORD=your_password
```

#### MySQL (Optional)
```bash
# Install MySQL
sudo apt install mysql-server

# Create database
mysql -u root -p
CREATE DATABASE blockchain_upi;
CREATE USER 'blockchain_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON blockchain_upi.* TO 'blockchain_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. SSL Certificate Setup

#### Development (Self-Signed)
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update backend configuration
SSL_KEY_PATH=./key.pem
SSL_CERT_PATH=./cert.pem
```

#### Production (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update configuration
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

### 3. Email Configuration

```env
# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### 4. Payment Gateway Integration

```env
# Payment Gateway Configuration
PAYMENT_GATEWAY=stripe
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

---

## 🧪 Testing

### 1. System Health Check

```bash
# Test backend health
curl http://localhost:5001/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. API Testing

```bash
# Test login endpoint
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "upiID": "testuser1@bank1",
    "password": "test123",
    "deviceID": "test002"
  }'

# Expected response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "upiID": "testuser1@bank1",
    "balance": 5100,
    "isActive": true
  }
}
```

### 3. Frontend Testing

```bash
# Navigate to frontend directory
cd frontend

# Run tests
npm test

# Run test coverage
npm run test:coverage
```

### 4. Integration Testing

```bash
# Run system integration tests
./test-system.sh

# Test specific features
npm run test:integration
```

### 5. Demo Accounts

Use these demo accounts for testing:

#### Admin Account
- **UPI ID**: `testadmin@npci`
- **Password**: `test123`
- **Device ID**: `test001`
- **Balance**: ₹700

#### Regular User
- **UPI ID**: `testuser1@bank1`
- **Password**: `test123`
- **Device ID**: `test002`
- **Balance**: ₹5,100

#### Transfer Test Account
- **UPI ID**: `testuser2@bank2`
- **Password**: `test123`
- **Device ID**: `test003`
- **Balance**: ₹4,200

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :5001
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different ports
PORT=5002 npm start  # Backend
PORT=3001 npm start  # Frontend
```

#### 2. Node.js Version Issues
```bash
# Check Node.js version
node --version

# Install correct version using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 16
nvm use 16
```

#### 3. Permission Issues
```bash
# Fix file permissions
chmod +x *.sh
chmod 755 backend/
chmod 755 frontend/

# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config
```

#### 4. Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Update npm
npm install -g npm@latest
```

#### 5. Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql
sudo systemctl status mysql

# Restart database service
sudo systemctl restart postgresql
sudo systemctl restart mysql
```

#### 6. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in cert.pem -text -noout

# Regenerate certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### Debug Mode

#### Enable Debug Logging
```bash
# Backend debug mode
DEBUG=* npm start

# Frontend debug mode
REACT_APP_ENABLE_DEBUG_MODE=true npm start
```

#### Check Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend logs (browser console)
# Open browser developer tools (F12)
```

---

## 🚀 Deployment

### 1. Production Build

#### Frontend Build
```bash
# Navigate to frontend
cd frontend

# Create production build
npm run build

# Build will be created in build/ directory
```

#### Backend Build
```bash
# Navigate to backend
cd backend

# Install production dependencies
npm install --production

# Set production environment
NODE_ENV=production npm start
```

### 2. Docker Deployment

#### Using Docker Compose
```bash
# Build and start containers
docker-compose up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Manual Docker Build
```bash
# Build backend image
docker build -t blockchain-upi-backend ./backend

# Build frontend image
docker build -t blockchain-upi-frontend ./frontend

# Run containers
docker run -d -p 5001:5001 blockchain-upi-backend
docker run -d -p 3000:3000 blockchain-upi-frontend
```

### 3. Cloud Deployment

#### Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy to Railway
railway up
```

#### Render Deployment
```bash
# Connect GitHub repository to Render
# Render will automatically deploy on push

# Or deploy manually
render deploy
```

#### Heroku Deployment
```bash
# Install Heroku CLI
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Deploy to Heroku
git push heroku main
```

### 4. VPS Deployment

#### Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx

# Install SSL certificate
sudo apt install certbot python3-certbot-nginx
```

#### Application Deployment
```bash
# Clone repository
git clone <repository-url>
cd "Block Chain UPI"

# Install dependencies
./install.sh

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/blockchain-upi
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### SSL Setup
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/blockchain-upi /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 Monitoring and Maintenance

### 1. System Monitoring

#### PM2 Monitoring
```bash
# Check application status
pm2 status

# Monitor logs
pm2 logs

# Monitor resources
pm2 monit
```

#### System Monitoring
```bash
# Check system resources
htop
df -h
free -h

# Check application ports
netstat -tulpn | grep :5001
netstat -tulpn | grep :3000
```

### 2. Backup and Recovery

#### Database Backup
```bash
# SQLite backup
cp backend/database.sqlite backup/database_$(date +%Y%m%d_%H%M%S).sqlite

# PostgreSQL backup
pg_dump blockchain_upi > backup/database_$(date +%Y%m%d_%H%M%S).sql
```

#### Application Backup
```bash
# Create backup
tar -czf backup/app_$(date +%Y%m%d_%H%M%S).tar.gz backend/ frontend/

# Restore from backup
tar -xzf backup/app_20240101_120000.tar.gz
```

### 3. Updates and Maintenance

#### Application Updates
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
./install.sh

# Restart application
pm2 restart all
```

#### System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js
nvm install 16
nvm use 16

# Update npm packages
npm update -g
```

---

## 📞 Support

### Getting Help

#### Documentation
- **Project Documentation**: `PROJECT_DOCUMENTATION.md`
- **API Documentation**: `API_DOCUMENTATION.md`
- **Deployment Guide**: `DEPLOYMENT.md`

#### Community Support
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Community discussions and Q&A
- **Wiki**: Community-maintained documentation

#### Contact Information
- **Email**: [your-email@domain.com]
- **GitHub**: [github-username]
- **Website**: [project-website]

---

## 🎯 Conclusion

This installation guide provides comprehensive instructions for setting up the Blockchain UPI System. The automated installation script (`install.sh`) handles most of the complexity, making it easy to get started quickly.

For production deployments, follow the deployment section and ensure proper security configurations are in place.

**Happy coding! 🚀**
