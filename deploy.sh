#!/bin/bash

# 🚀 AI Feature Builder - Deployment Script
# Automated deployment for multiple platforms

set -e  # Exit on any error

echo "🚀 AI Feature Builder - Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    cd frontend
    
    if [ ! -f "package.json" ]; then
        print_error "Frontend package.json not found"
        exit 1
    fi
    
    npm ci
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "Frontend build failed - dist directory not found"
        exit 1
    fi
    
    cd ..
    print_success "Frontend built successfully"
}

# Prepare backend
prepare_backend() {
    print_status "Preparing backend..."
    cd backend
    
    if [ ! -f "package.json" ]; then
        print_error "Backend package.json not found"
        exit 1
    fi
    
    npm ci --only=production
    cd ..
    print_success "Backend prepared successfully"
}

# Deploy to Vercel (Frontend)
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Deploy frontend to Vercel
    cd frontend
    vercel --prod
    cd ..
    
    print_success "Frontend deployed to Vercel"
}

# Deploy to Railway (Backend)
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Please install it manually:"
        echo "npm install -g @railway/cli"
        echo "Then run: railway login && railway deploy"
        return 1
    fi
    
    railway deploy
    print_success "Backend deployed to Railway"
}

# Deploy with Docker
deploy_docker() {
    print_status "Building Docker image..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    docker build -t ai-feature-builder .
    
    print_success "Docker image built successfully"
    print_status "To run locally: docker run -p 3001:3001 -e OPENAI_API_KEY=your_key ai-feature-builder"
}

# Main deployment function
main() {
    echo "Select deployment option:"
    echo "1) Quick Deploy (Vercel + Railway) - Recommended"
    echo "2) Docker Build"
    echo "3) Local Development Setup"
    echo "4) Full Build Only"
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            print_status "Starting quick deployment..."
            check_dependencies
            build_frontend
            prepare_backend
            deploy_vercel
            deploy_railway
            print_success "🎉 Deployment completed!"
            print_status "Your app should be available at:"
            print_status "Frontend: Check Vercel dashboard for URL"
            print_status "Backend: Check Railway dashboard for URL"
            ;;
        2)
            print_status "Building Docker image..."
            check_dependencies
            build_frontend
            prepare_backend
            deploy_docker
            ;;
        3)
            print_status "Setting up local development..."
            check_dependencies
            cd frontend && npm install && cd ..
            cd backend && npm install && cd ..
            print_success "Local setup completed!"
            print_status "Run 'npm run dev' in both frontend and backend directories"
            ;;
        4)
            print_status "Building application..."
            check_dependencies
            build_frontend
            prepare_backend
            print_success "Build completed!"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

# Environment setup
setup_env() {
    print_status "Setting up environment variables..."
    
    if [ ! -f "backend/.env" ]; then
        print_warning "Backend .env file not found. Creating template..."
        cat > backend/.env << EOF
# AI Feature Builder - Environment Configuration
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGIN=https://your-frontend-domain.vercel.app
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
        print_warning "Please edit backend/.env with your actual values"
    fi
    
    if [ ! -f "frontend/.env" ]; then
        print_warning "Frontend .env file not found. Creating template..."
        cat > frontend/.env << EOF
# Frontend Environment Configuration
VITE_API_BASE_URL=https://your-backend-domain.railway.app
VITE_APP_NAME=AI Feature Builder
VITE_APP_VERSION=1.0.0
EOF
        print_warning "Please edit frontend/.env with your actual values"
    fi
}

# Check if this is the first run
if [ "$1" = "--setup" ]; then
    setup_env
    exit 0
fi

# Run main deployment
main