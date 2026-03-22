# 🌐 Hostinger Deployment Guide

## 📋 Prerequisites

1. **Hostinger Account** with:
   - Web Hosting (for frontend)
   - VPS or Node.js hosting (for backend)
   - Domain name

2. **Local Setup Complete**:
   - Project working locally
   - All dependencies installed

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Frontend for Production

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create production environment file
echo "REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com" > .env.production

# Build for production
npm run build
```

### Step 2: Prepare Backend for Production

```bash
# Navigate to backend directory
cd backend

# Install production dependencies
npm install --production

# Create production environment file
echo "PORT=5001
JWT_SECRET=your-super-secure-production-jwt-secret-key-2024
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com" > .env
```

### Step 3: Upload to Hostinger

#### Frontend Upload (Web Hosting)
1. **Login** to Hostinger control panel
2. **Go to** File Manager
3. **Navigate** to `public_html` folder
4. **Upload** all contents of `frontend/build/` folder
5. **Create** `.htaccess` file in root with:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### Backend Upload (VPS/Node.js)
1. **Connect** to your VPS via SSH
2. **Create** project directory:
   ```bash
   mkdir -p /var/www/blockchain-upi
   cd /var/www/blockchain-upi
   ```
3. **Upload** backend files using SFTP or Git
4. **Set permissions**:
   ```bash
   chown -R www-data:www-data /var/www/blockchain-upi
   chmod -R 755 /var/www/blockchain-upi
   ```

### Step 4: Configure Domain

#### Frontend Domain
- **Point** your main domain to the web hosting
- **Example**: `yourdomain.com` → Frontend files

#### Backend Domain
- **Create** subdomain for API
- **Example**: `api.yourdomain.com` → Backend server
- **Configure** DNS A record pointing to VPS IP

### Step 5: Start Backend Server

#### Option 1: PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Navigate to backend directory
cd /var/www/blockchain-upi/backend

# Start with PM2
pm2 start server.js --name "blockchain-upi"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Option 2: Systemd Service
```bash
# Create service file
sudo nano /etc/systemd/system/blockchain-upi.service
```

Add content:
```ini
[Unit]
Description=Blockchain UPI Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/blockchain-upi/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable blockchain-upi
sudo systemctl start blockchain-upi
```

### Step 6: Configure Nginx (Optional)

If using Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 7: SSL Certificate

#### Using Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

## 🔧 Environment Configuration

### Frontend Environment Variables
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

### Backend Environment Variables
```env
PORT=5001
JWT_SECRET=your-super-secure-production-jwt-secret-key-2024
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

## 🧪 Testing Deployment

### 1. Test Frontend
- Visit: `https://yourdomain.com`
- Should load the React app
- Check if login page appears

### 2. Test Backend API
```bash
curl https://api.yourdomain.com/health
```

### 3. Test Authentication
```bash
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"upiID": "testuser1@bank1", "password": "test123", "deviceID": "test002"}'
```

### 4. Test Complete Flow
1. **Login** with demo credentials
2. **Test** money transfer
3. **Verify** fraud detection
4. **Check** admin panel

## 🚨 Troubleshooting

### Common Issues

#### Frontend Not Loading
- Check file permissions in `public_html`
- Verify `.htaccess` file exists
- Clear browser cache

#### Backend Connection Failed
- Verify VPS firewall settings
- Check if port 5001 is open
- Confirm domain DNS settings

#### SSL Certificate Issues
- Ensure domain points to correct IP
- Wait for DNS propagation
- Check Let's Encrypt logs

### Debug Commands

#### Check Backend Status
```bash
# If using PM2
pm2 status
pm2 logs blockchain-upi

# If using systemd
sudo systemctl status blockchain-upi
sudo journalctl -u blockchain-upi -f
```

#### Check Network
```bash
# Test port accessibility
netstat -tlnp | grep :5001

# Test firewall
sudo ufw status
```

## 📊 Monitoring

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart blockchain-upi
```

### System Monitoring
```bash
# Check system resources
htop

# Monitor disk usage
df -h

# Check memory usage
free -h
```

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Restart application
pm2 restart blockchain-upi
```

### Backup Strategy
```bash
# Backup application files
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/blockchain-upi

# Backup environment files
cp /var/www/blockchain-upi/backend/.env /backup/env-backup-$(date +%Y%m%d)
```

## ✅ Deployment Checklist

- [ ] Frontend built successfully
- [ ] Backend dependencies installed
- [ ] Environment variables configured
- [ ] Files uploaded to hosting
- [ ] Domain DNS configured
- [ ] SSL certificate installed
- [ ] Backend server started
- [ ] Frontend accessible
- [ ] API endpoints working
- [ ] Demo accounts functional
- [ ] Money transfers working
- [ ] Fraud detection active
- [ ] Admin panel accessible

---

**🎉 Your Blockchain UPI system is now live on Hostinger!**
