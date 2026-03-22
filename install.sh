#!/bin/bash

# 🔗 Blockchain UPI - Automated Installation Script
# This script automatically sets up the complete Blockchain UPI system on any system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}🔗 Blockchain UPI Auto-Install${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_step "Checking Node.js installation..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        print_warning "Installing Node.js..."
        
        # Detect OS and install Node.js
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install node
            else
                print_error "Please install Homebrew first: https://brew.sh/"
                exit 1
            fi
        elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
            # Windows
            print_error "Please install Node.js from https://nodejs.org/"
            exit 1
        else
            print_error "Unsupported OS. Please install Node.js manually."
            exit 1
        fi
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16 or higher is required!"
        print_warning "Current version: $(node --version)"
        exit 1
    fi
    
    print_status "Node.js $(node --version) is installed ✓"
}

# Check if npm is installed
check_npm() {
    print_step "Checking npm installation..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
        exit 1
    fi
    
    print_status "npm $(npm --version) is installed ✓"
}

# Install backend dependencies
setup_backend() {
    print_step "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating backend .env file..."
        cat > .env << EOF
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-$(date +%s)
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
EOF
        print_status "Backend .env file created ✓"
    else
        print_warning "Backend .env file already exists"
    fi
    
    cd ..
}

# Install frontend dependencies
setup_frontend() {
    print_step "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating frontend .env file..."
        cat > .env << EOF
REACT_APP_API_URL=http://localhost:5001
REACT_APP_SOCKET_URL=http://localhost:5001
EOF
        print_status "Frontend .env file created ✓"
    else
        print_warning "Frontend .env file already exists"
    fi
    
    cd ..
}

# Create start scripts
create_start_scripts() {
    print_step "Creating start scripts..."
    
    # Create start-backend.sh
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Blockchain UPI Backend..."
cd backend
npm start
EOF
    chmod +x start-backend.sh
    
    # Create start-frontend.sh
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Blockchain UPI Frontend..."
cd frontend
npm start
EOF
    chmod +x start-frontend.sh
    
    # Create start-all.sh
    cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Blockchain UPI System..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping all processes..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

echo "Starting backend..."
cd backend
npm start &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo "Starting frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ Both services started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for both processes
wait
EOF
    chmod +x start-all.sh
    
    print_status "Start scripts created ✓"
}

# Create test script
create_test_script() {
    print_step "Creating test script..."
    
    cat > test-system.sh << 'EOF'
#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing Blockchain UPI System...${NC}"

# Test backend health
echo "Testing backend health..."
if curl -s http://localhost:5001/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not responding${NC}"
    echo -e "${YELLOW}Make sure backend is running: ./start-backend.sh${NC}"
    exit 1
fi

# Test login
echo "Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"upiID": "testuser1@bank1", "password": "test123", "deviceID": "test002"}')

if echo "$LOGIN_RESPONSE" | grep -q "Login successful"; then
    echo -e "${GREEN}✓ Login test passed${NC}"
else
    echo -e "${RED}✗ Login test failed${NC}"
    echo "$LOGIN_RESPONSE"
fi

echo -e "${GREEN}🎉 System test completed!${NC}"
echo -e "${YELLOW}Visit http://localhost:3000 to access the application${NC}"
EOF
    chmod +x test-system.sh
    
    print_status "Test script created ✓"
}

# Create build script
create_build_script() {
    print_step "Creating build script..."
    
    cat > build-production.sh << 'EOF'
#!/bin/bash

echo "🏗️ Building Blockchain UPI for production..."

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

# Install production dependencies for backend
echo "Installing production backend dependencies..."
cd backend
npm install --production
cd ..

echo "✅ Production build completed!"
echo "📁 Frontend build: frontend/build/"
echo "📁 Backend ready: backend/"
EOF
    chmod +x build-production.sh
    
    print_status "Build script created ✓"
}

# Create quick start script
create_quick_start() {
    print_step "Creating quick start script..."
    
    cat > quick-start.sh << 'EOF'
#!/bin/bash

echo "⚡ Quick Start - Blockchain UPI"

# Check if backend is running
if ! curl -s http://localhost:5001/health > /dev/null; then
    echo "Starting backend..."
    ./start-backend.sh &
    sleep 5
fi

# Check if frontend is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "Starting frontend..."
    ./start-frontend.sh &
    sleep 3
fi

echo "✅ System is ready!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "Demo Accounts:"
echo "👑 Admin: testadmin@npci / test123 / test001"
echo "👤 User: testuser1@bank1 / test123 / test002"
echo "💸 Transfer: testuser2@bank2 / test123 / test003"
EOF
    chmod +x quick-start.sh
    
    print_status "Quick start script created ✓"
}

# Display demo accounts
show_demo_accounts() {
    echo ""
    echo -e "${BLUE}👥 Demo Accounts${NC}"
    echo -e "${BLUE}===============${NC}"
    echo ""
    echo -e "${YELLOW}👑 Admin Account${NC}"
    echo "UPI ID: testadmin@npci"
    echo "Password: test123"
    echo "Device ID: test001"
    echo "Balance: ₹700"
    echo ""
    echo -e "${CYAN}👤 Regular User${NC}"
    echo "UPI ID: testuser1@bank1"
    echo "Password: test123"
    echo "Device ID: test002"
    echo "Balance: ₹5,100"
    echo ""
    echo -e "${GREEN}💸 Transfer Test${NC}"
    echo "UPI ID: testuser2@bank2"
    echo "Password: test123"
    echo "Device ID: test003"
    echo "Balance: ₹4,200"
    echo ""
}

# Display next steps
show_next_steps() {
    echo ""
    echo -e "${BLUE}🚀 Quick Start Commands${NC}"
    echo -e "${BLUE}=====================${NC}"
    echo ""
    echo "1. Start everything at once:"
    echo "   ./start-all.sh"
    echo ""
    echo "2. Or start separately:"
    echo "   ./start-backend.sh  (Terminal 1)"
    echo "   ./start-frontend.sh (Terminal 2)"
    echo ""
    echo "3. Quick start (smart):"
    echo "   ./quick-start.sh"
    echo ""
    echo "4. Test the system:"
    echo "   ./test-system.sh"
    echo ""
    echo "5. Build for production:"
    echo "   ./build-production.sh"
    echo ""
    echo -e "${GREEN}🌐 Access the application: http://localhost:3000${NC}"
    echo ""
}

# Create package.json scripts
update_package_json() {
    print_step "Updating package.json scripts..."
    
    # Update the scripts section in package.json
    cat > package.json << 'EOF'
{
  "name": "blockchain-upi-system",
  "version": "1.0.0",
  "description": "A secure, blockchain-based UPI payment system with fraud detection and real-time monitoring",
  "main": "index.js",
  "scripts": {
    "install": "./install.sh",
    "start": "./start-all.sh",
    "start:backend": "./start-backend.sh",
    "start:frontend": "./start-frontend.sh",
    "quick": "./quick-start.sh",
    "test": "./test-system.sh",
    "build": "./build-production.sh",
    "install:backend": "cd backend && npm install",
    "install:frontend": "cd frontend && npm install",
    "install:all": "npm run install:backend && npm run install:frontend",
    "dev": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
    "clean": "rm -rf backend/node_modules frontend/node_modules frontend/build"
  },
  "keywords": [
    "blockchain",
    "upi",
    "payment",
    "fraud-detection",
    "react",
    "nodejs"
  ],
  "author": "Blockchain UPI Team",
  "license": "MIT",
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
EOF
    
    print_status "Package.json updated ✓"
}

# Main setup function
main() {
    print_header
    
    # Check prerequisites
    check_nodejs
    check_npm
    
    # Setup backend and frontend
    setup_backend
    setup_frontend
    
    # Create utility scripts
    create_start_scripts
    create_test_script
    create_build_script
    create_quick_start
    
    # Update package.json
    update_package_json
    
    # Show demo accounts and next steps
    show_demo_accounts
    show_next_steps
    
    echo -e "${GREEN}🎉 Blockchain UPI installation completed successfully!${NC}"
    echo -e "${YELLOW}Run './quick-start.sh' to start the system immediately!${NC}"
}

# Run main function
main "$@"
