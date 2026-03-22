# 🚀 Blockchain UPI - Complete Deployment Guide

## 📋 Overview

This guide covers multiple deployment methods for the Blockchain UPI system:

1. **Local Development Setup** - For development and testing
2. **Hostinger Deployment** - For production hosting
3. **Docker Deployment** - For containerized environments
4. **Manual Setup** - For custom configurations

## 🛠️ Method 1: Local Development Setup

### Quick Start (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd "Block Chain UPI"

# Run automated setup
./setup.sh

# Start the system
./start-all.sh
```

### Manual Setup
```bash
# Install backend dependencies
cd backend
npm install
cp .env.example .env  # Configure environment variables
cd ..

# Install frontend dependencies
cd frontend
npm install
cp .env.example .env  # Configure environment variables
cd ..

# Start services
npm run dev  # Uses concurrently to start both services
```

**Access**: http://localhost:3000

## 🐳 Method 2: Docker Deployment

### Prerequisites
- Docker
- Docker Compose

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd "Block Chain UPI"

# Run Docker setup
./docker-setup.sh
```

### Manual Docker Setup
```bash
# Build and start containers
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

**Access**: http://localhost:3000

## 🌐 Method 3: Hostinger Deployment

### Prerequisites
- Hostinger account with:
  - Web hosting (for frontend)
  - VPS or Node.js hosting (for backend)
  - Domain name

### Step-by-Step Process

#### 1. Prepare for Deployment
```bash
# Build frontend for production
cd frontend
npm run build

# Prepare backend
cd ../backend
npm install --production
```

#### 2. Upload Files
- **Frontend**: Upload `frontend/build/` contents to `public_html/`
- **Backend**: Upload `backend/` folder to VPS

#### 3. Configure Environment
```bash
# Backend .env (on VPS)
PORT=5001
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com

# Frontend .env.production
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

#### 4. Start Backend Server
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "blockchain-upi"
pm2 save
pm2 startup
```

#### 5. Configure Domain
- **Frontend**: `yourdomain.com` → Web hosting
- **Backend**: `api.yourdomain.com` → VPS IP

#### 6. SSL Certificate
```bash
# Install Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

**Access**: https://yourdomain.com

## 🔧 Method 4: Manual Setup

### System Requirements
- Node.js v16+
- npm v8+
- Git

### Detailed Steps

#### 1. Environment Setup
```bash
# Backend environment
cd backend
cat > .env << EOF
PORT=5001
JWT_SECRET=your-secret-key-$(date +%s)
NODE_ENV=development
EOF

# Frontend environment
cd ../frontend
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5001
REACT_APP_SOCKET_URL=http://localhost:5001
EOF
```

#### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 3. Start Services
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🧪 Testing Your Deployment

### Health Check
```bash
curl http://localhost:5001/health
```

### Login Test
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"upiID": "testuser1@bank1", "password": "test123", "deviceID": "test002"}'
```

### Demo Accounts
- **Admin**: `testadmin@npci` / `test123` / `test001`
- **User**: `testuser1@bank1` / `test123` / `test002`
- **Transfer**: `testuser2@bank2` / `test123` / `test003`

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | 5001 | No |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `NODE_ENV` | Environment mode | development | No |
| `CORS_ORIGIN` | CORS allowed origins | * | No |
| `REACT_APP_API_URL` | Frontend API URL | http://localhost:5001 | No |
| `REACT_APP_SOCKET_URL` | Frontend Socket URL | http://localhost:5001 | No |

### Production Configuration
```bash
# Backend production settings
NODE_ENV=production
JWT_SECRET=your-super-secure-production-secret
CORS_ORIGIN=https://yourdomain.com

# Frontend production settings
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

## 🚨 Troubleshooting

### Common Issues

#### Frontend Not Loading
- Check if backend is running
- Verify API URL in environment variables
- Clear browser cache

#### Backend Connection Failed
- Check if port 5001 is open
- Verify firewall settings
- Check environment variables

#### Docker Issues
- Ensure Docker and Docker Compose are installed
- Check container logs: `docker-compose logs`
- Verify port mappings in docker-compose.yml

#### Hostinger Issues
- Check VPS firewall settings
- Verify domain DNS configuration
- Ensure SSL certificate is valid

### Debug Commands

#### Local Development
```bash
# Check backend status
curl http://localhost:5001/health

# View backend logs
cd backend && npm start

# View frontend logs
cd frontend && npm start
```

#### Docker
```bash
# View container logs
docker-compose logs -f

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# Restart containers
docker-compose restart
```

#### Production
```bash
# Check PM2 status
pm2 status
pm2 logs blockchain-upi

# Check systemd service
sudo systemctl status blockchain-upi
sudo journalctl -u blockchain-upi -f
```

## 📊 Monitoring

### Local Development
- Backend logs in terminal
- Frontend logs in terminal
- Browser developer tools

### Docker
```bash
# Monitor containers
docker-compose ps
docker-compose logs -f

# Resource usage
docker stats
```

### Production
```bash
# PM2 monitoring
pm2 monit
pm2 logs

# System monitoring
htop
df -h
free -h
```

## 🔄 Updates and Maintenance

### Local Development
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm run install:all

# Restart services
npm run dev
```

### Docker
```bash
# Update and restart
docker-compose pull
docker-compose up --build -d
```

### Production
```bash
# Update application
git pull origin main
npm install
pm2 restart blockchain-upi
```

## 📁 Project Structure

```
Block Chain UPI/
├── backend/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── middleware/         # Custom middleware
│   ├── Dockerfile          # Backend container
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── App.js          # Main app component
│   ├── public/             # Static files
│   └── Dockerfile          # Frontend container
├── docker-compose.yml      # Docker orchestration
├── setup.sh               # Local setup script
├── docker-setup.sh        # Docker setup script
├── package.json           # Root package.json
├── README.md              # Main documentation
├── DEPLOYMENT.md          # This file
└── deploy-hostinger.md    # Hostinger specific guide
```

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code tested locally
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Build process successful

### Local Development
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] API endpoints accessible
- [ ] Demo accounts functional

### Docker Deployment
- [ ] Docker images built successfully
- [ ] Containers start without errors
- [ ] Port mappings correct
- [ ] Services communicate properly

### Production Deployment
- [ ] SSL certificate installed
- [ ] Domain configured correctly
- [ ] Firewall settings appropriate
- [ ] Monitoring configured
- [ ] Backup strategy in place

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the demo accounts
3. Verify environment configuration
4. Test with provided commands

---

**🎉 Choose the deployment method that best fits your needs and follow the corresponding guide!**
